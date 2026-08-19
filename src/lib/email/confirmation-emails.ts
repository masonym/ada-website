import { AdapterModalRegistrationType } from '../registration-adapters';
import { Event } from '@/types/events';
import { sendEmail } from './index';
import {
  OrderSummary,
  AttendeeDetails,
} from './templates';
import {
  TicketTier,
  determineTicketTier,
  findHighestTierRegistration,
  renderConfirmationEmail,
} from './render-confirmation';
import { listEventFiles } from '@/lib/s3/event-documents';
import { RegistrationFormData } from '@/types/event-registration/registration';

// Tier detection and template selection live in ./render-confirmation, which is
// free of I/O so /dev/email-preview can render exactly what we send. Re-exported
// here because this module is the historical home of both.
export { TicketTier, determineTicketTier, findHighestTierRegistration };

/**
 * Collects unique email addresses from a registration form data
 * @param registrationData The complete registration form data
 * @returns Array of unique email addresses
 */
export function collectUniqueEmails(registrationData: RegistrationFormData): string[] {
  const uniqueEmails = new Set<string>();

  // Add billing email
  uniqueEmails.add(registrationData.email.toLowerCase().trim());

  // Add all attendee emails
  registrationData.tickets.forEach(ticket => {
    if (ticket.attendeeInfo && Array.isArray(ticket.attendeeInfo)) {
      ticket.attendeeInfo.forEach(attendee => {
        if (attendee.email && typeof attendee.email === 'string') {
          uniqueEmails.add(attendee.email.toLowerCase().trim());
        }
      });
    }
  });

  // add events @ ada to unique emails to create a notification email
  uniqueEmails.add('events@americandefensealliance.org');

  return Array.from(uniqueEmails);
}

/**
 * Sends confirmation emails to all unique attendee emails
 * @param registrationData Complete registration form data
 * @param event Event information
 * @param registrations Array of registrations in the order
 * @param orderId Order ID (payment intent ID)
 * @returns Results of email sending operations
 */
export async function sendRegistrationConfirmationEmails({
  registrationData,
  event,
  registrations,
  orderId,
  orderSummary,
  attendeePasses = 0,
  attachments = []
}: {
  registrationData: RegistrationFormData;
  event: Event;
  registrations: AdapterModalRegistrationType[];
  orderId: string;
  orderSummary?: OrderSummary;
  attendeePasses?: number;
  attachments?: any[];
}) {
  const uniqueEmails = collectUniqueEmails(registrationData);
  const results: Array<{ email: string; result: any }> = [];


  // Collect all attendees to create attendee details
  const allAttendees: AttendeeDetails[] = [];
  registrationData.tickets.forEach(ticket => {
    if (ticket.attendeeInfo && Array.isArray(ticket.attendeeInfo)) {
      ticket.attendeeInfo.forEach(attendee => {
        if (attendee) {
          allAttendees.push({
            firstName: attendee.firstName,
            lastName: attendee.lastName,
            email: attendee.email,
            company: attendee.company,
            jobTitle: attendee.jobTitle,
            phone: attendee.phone,
            website: attendee.website,
            businessSize: attendee.businessSize,
            sbaIdentification: attendee.sbaIdentification,
            industry: attendee.industry
          });
        }
      });
    }
  });

  // Helper function to create a delay
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  for (const [index, email] of uniqueEmails.entries()) {
    // Find the attendee info for this email to get the correct first name
    let firstName = registrationData.firstName; // Default to billing contact's first name

    // Try to find a matching attendee
    for (const ticket of registrationData.tickets) {
      if (ticket.attendeeInfo) {
        const matchingAttendee = ticket.attendeeInfo.find(attendee =>
          attendee.email.toLowerCase().trim() === email.toLowerCase().trim());
        if (matchingAttendee) {
          firstName = matchingAttendee.firstName;
          break;
        }
      }
    }

    // Add delay between email sends to avoid rate limiting (except for the first email)
    if (index > 0) {
      // Wait 1200ms between sends to stay under the rate limit of 2 requests per second
      await delay(1200);
    }

    // Send the confirmation email
    const result = await sendRegistrationConfirmationEmail({
      email,
      firstName,
      event,
      registrations,
      orderId,
      orderSummary,
      attendeePasses,
      attachments,
      attendees: allAttendees
    });

    results.push({ email, result });
  }

  return {
    success: results.every(r => r.result.success),
    results
  };
}

/**
 * Sends a confirmation email based on the highest tier registration in an order
 * @param email Recipient email address
 * @param firstName Recipient first name
 * @param event Event information
 * @param registrations Array of registrations in the order
 * @param orderId Order ID (payment intent ID)
 * @returns Result of email sending operation
 */
export async function sendRegistrationConfirmationEmail({
  email,
  firstName,
  event,
  registrations,
  orderId,
  orderSummary,
  attendeePasses = 0,
  attachments = [],
  attendees = []
}: {
  email: string;
  firstName: string;
  event: Event;
  registrations: AdapterModalRegistrationType[];
  orderId: string;
  orderSummary?: OrderSummary;
  attendeePasses?: number;
  attachments?: any[];
  attendees?: AttendeeDetails[];
}) {
  const highestTierInfo = findHighestTierRegistration(registrations);

  if (!highestTierInfo) {
    console.error('No registrations found for confirmation email');
    return { success: false, error: 'No registrations found' };
  }

  const { tier, registration } = highestTierInfo;

  const bucketFiles = await listEventFiles(event.eventShorthand);
  const exhibitorInstructions = bucketFiles.find(name => name.includes("Instructions"));

  // Get any ticket-specific attachments
  let ticketAttachments: Array<{
    filename: string;
    content?: string | Buffer;
    path?: string;
    contentType?: string;
  }> = [];

  // For example, sponsors might get a sponsorship guide PDF
  if (tier === TicketTier.PLATINUM_SPONSOR ||
    tier === TicketTier.GOLD_SPONSOR ||
    tier === TicketTier.SILVER_SPONSOR ||
    tier === TicketTier.BRONZE_SPONSOR) {
    // Add sponsor-specific attachments if available
    if (event.sponsorProspectusPath) {
      // This would be implemented to fetch the actual file
      // ticketAttachments.push({
      //   filename: `${event.title} - Sponsor Guide.pdf`,
      //   path: event.sponsorProspectusPath,
      // });
    }
  }

  // Combine any provided attachments with ticket-specific ones
  const emailAttachments = [...attachments, ...ticketAttachments];

  const { subject, html } = renderConfirmationEmail({
    firstName,
    event,
    tier,
    registration,
    orderId,
    orderSummary,
    attendees,
    attendeePasses,
    exhibitorInstructions: exhibitorInstructions || '',
  });

  return sendEmail({
    to: email,
    subject,
    html,
    attachments: emailAttachments,
  });
}
