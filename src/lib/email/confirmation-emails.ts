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
import { getConfirmedRegistration } from '@/lib/aws/dynamodb';
import {
  OrderValidation,
  RegistrationFormData,
} from '@/types/event-registration/registration';
import {
  LinkedOrderTicket,
  LinkedPackage,
  resolveLinkedPackage,
} from './additional-pass';

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
 * The sponsorship or exhibit space an additional attendee pass was bought
 * against, for an order that contains nothing else.
 *
 * The link is the order id the buyer entered to unlock the discounted pass
 * (/api/validate-order). The modal now sends that order's ticket lines along
 * with the validation, but orders placed before it did - and any that only
 * recorded the id - are resolved by reading the original registration back.
 * Returns null when there is nothing to name (a pass comped with the master
 * key), leaving the email on its generic wording.
 */
export async function resolveLinkedPackageForOrder(
  eventId: number | string,
  passTicketId: string,
  orderValidations: OrderValidation[] | undefined
): Promise<LinkedPackage | null> {
  if (!orderValidations || orderValidations.length === 0) return null;

  const validation =
    orderValidations.find(v => v.ticketId === passTicketId) ?? orderValidations[0];
  if (!validation?.validatedOrderId) return null;

  let tickets: LinkedOrderTicket[] = validation.validatedOrderTickets ?? [];

  if (tickets.length === 0) {
    try {
      const original = await getConfirmedRegistration(validation.validatedOrderId);
      tickets = (original?.tickets ?? []).map(t => ({
        ticketId: t.ticketId,
        ticketName: t.ticketName,
      }));
    } catch (error) {
      // A confirmation email is worth sending without the linked package block.
      console.error('Failed to load the order an additional pass was validated against:', error);
      return null;
    }
  }

  return resolveLinkedPackage(eventId, {
    tickets,
    company: validation.validatedOrderCompany,
    orderId: validation.validatedOrderId,
  });
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

  // Resolved once per order rather than per recipient: it can cost a read of
  // the sponsorship order the pass was validated against.
  const highestTier = findHighestTierRegistration(registrations);
  const linkedPackage =
    highestTier?.tier === TicketTier.ADDITIONAL_PASS
      ? await resolveLinkedPackageForOrder(
          event.id,
          highestTier.registration.id,
          registrationData.orderValidations
        )
      : null;


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
      attendees: allAttendees,
      linkedPackage
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
  attendees = [],
  linkedPackage = null
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
  /** The package an additional attendee pass belongs to, when there is one. */
  linkedPackage?: LinkedPackage | null;
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
    linkedPackage,
  });

  return sendEmail({
    to: email,
    subject,
    html,
    attachments: emailAttachments,
  });
}
