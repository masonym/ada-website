import { AdapterModalRegistrationType } from '../registration-adapters';
import { Event } from '@/types/events';
import { sendEmail } from './index';
import { 
  attendeePassTemplate, 
  vipAttendeePassTemplate, 
  exhibitorTemplate, 
  sponsorTemplate, 
  govMilPassTemplate,
  OrderSummary, 
  generateOrderSummaryHtml,
  AttendeeDetails,
  generateAttendeeDetailsHtml,
} from './templates';
import { fetchFileNamesFromCloud } from '@/lib/s3';
import { RegistrationFormData } from '@/types/event-registration/registration';

// Define ticket tiers in order of priority (highest to lowest)
export enum TicketTier {
  PLATINUM_SPONSOR = 7,
  GOLD_SPONSOR = 6,
  SILVER_SPONSOR = 5,
  BRONZE_SPONSOR = 4,
  EXHIBITOR = 3,
  VIP_ATTENDEE = 2,
  GOV_MIL_PASS = 1,
  STANDARD_ATTENDEE = 0
}

interface TicketInfo {
  tier: TicketTier;
  registration: AdapterModalRegistrationType;
}

/**
 * Determines the tier of a registration type
 * @param registration The registration type to check
 * @returns The ticket tier
 */
export function determineTicketTier(registration: AdapterModalRegistrationType): TicketTier {
  // Check category first
  if (registration.category === 'sponsorship') {
    // Check sponsorship level
    const title = registration.title.toLowerCase();
    if (title.includes('platinum')) {
      return TicketTier.PLATINUM_SPONSOR;
    } else if (title.includes('gold')) {
      return TicketTier.GOLD_SPONSOR;
    } else if (title.includes('silver')) {
      return TicketTier.SILVER_SPONSOR;
    } else {
      // Bronze or other sponsorships
      return TicketTier.BRONZE_SPONSOR;
    }
  } else if (registration.category === 'exhibit') {
    return TicketTier.EXHIBITOR;
  } else {
    // It's a ticket category
    if ('type' in registration && registration.type === 'complimentary') {
      return TicketTier.GOV_MIL_PASS;
    }
    const title = registration.title.toLowerCase();
    if (title.includes('vip')) {
      return TicketTier.VIP_ATTENDEE;
    } else {
      return TicketTier.STANDARD_ATTENDEE;
    }
  }
}

/**
 * Finds the highest tier registration in an order
 * @param registrations Array of registrations in the order
 * @returns The highest tier registration info or null if no registrations
 */
export function findHighestTierRegistration(registrations: AdapterModalRegistrationType[]): TicketInfo | null {
  if (!registrations || registrations.length === 0) {
    return null;
  }

  let highestTier: TicketInfo = {
    tier: TicketTier.STANDARD_ATTENDEE,
    registration: registrations[0]
  };

  for (const registration of registrations) {
    const tier = determineTicketTier(registration);
    if (tier > highestTier.tier) {
      highestTier = { tier, registration };
    }
  }

  return highestTier;
}

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
  const results: Array<{email: string; result: any}> = [];
  
  console.log("uniqueEmails: ", uniqueEmails);

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

  for (const email of uniqueEmails) {
    console.log("email: ", email);
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
  const eventUrl = `https://americandefensealliance.org/events/${event.slug}`;
  const eventDate = event.date || 'TBA';
  const eventLocation = event.locationAddress || 'TBA';
  const venueName = event.venueName || 'TBA';
  const hotelInfo = `https://americandefensealliance.org/events/${event.slug}/about/venue-and-lodging`;
  const vipNetworkingReception = event.vipNetworkingReception;

  const bucketFiles = await fetchFileNamesFromCloud(event.eventShorthand);
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

  const orderSummaryHtml = orderSummary ? generateOrderSummaryHtml(orderSummary) : '';
  const attendeeDetailsHtml = attendees && attendees.length > 0 ? generateAttendeeDetailsHtml(attendees) : '';
  console.log("ATTENDEE DETAILS HTML: ", attendeeDetailsHtml);
  
  // Send appropriate email template based on ticket tier
  switch (tier) {
    case TicketTier.PLATINUM_SPONSOR:
    case TicketTier.GOLD_SPONSOR:
    case TicketTier.SILVER_SPONSOR:
    case TicketTier.BRONZE_SPONSOR:
      return sendEmail({
        to: email,
        subject: `Your ${event.title} Sponsorship Confirmation`,
        html: sponsorTemplate({
          firstName,
          eventName: event.title,
          eventDate,
          eventLocation,
          venueName,
          eventUrl,
          orderId,
          sponsorshipLevel: registration.title,
          attendeePasses: registration.sponsorPasses || attendeePasses || 0,
          eventImage: event.image,
          orderSummaryHtml,
          attendeeDetailsHtml,
          hotelInfo,
          vipNetworkingReception,
          matchmakingSessions: event.matchmakingSessions || undefined,
          exhibitorInstructions: exhibitorInstructions || '',
        }),
        attachments: emailAttachments,
      });
      
    case TicketTier.EXHIBITOR:
      return sendEmail({
        to: email,
        subject: `Your ${event.title} Exhibitor Confirmation`,
        html: exhibitorTemplate({
          firstName,
          eventName: event.title,
          eventDate,
          eventLocation,
          venueName,
          eventUrl,
          orderId,
          exhibitorType: registration.title,
          exhibitorInstructions: exhibitorInstructions || '',
          eventImage: event.image,
          orderSummaryHtml,
          attendeeDetailsHtml,
          hotelInfo,
          vipNetworkingReception,
        }),
        attachments: emailAttachments,
      });
      
    case TicketTier.GOV_MIL_PASS:
      return sendEmail({
        to: email,
        subject: `Registration Confirmation - ${event.title}`,
        html: govMilPassTemplate({
          firstName,
          eventName: event.title,
          eventDate,
          eventLocation,
          venueName,
          eventUrl,
          orderId,
          hotelInfo,
          eventImage: event.image,
          orderSummaryHtml: '', // No order summary for free passes
          attendeeDetailsHtml,
        }),
        attachments: emailAttachments,
      });

    case TicketTier.VIP_ATTENDEE:
      return sendEmail({
        to: email,
        subject: `Registration Confirmation - ${event.title}`,
        html: vipAttendeePassTemplate({
          firstName,
          eventName: event.title,
          eventDate,
          eventLocation,
          venueName,
          eventUrl,
          orderId,
          eventImage: event.image,
          orderSummaryHtml,
          attendeeDetailsHtml,
          hotelInfo,
          vipNetworkingReception,
        }),
        attachments: emailAttachments,
      });
      
    case TicketTier.STANDARD_ATTENDEE:
    default:
      return sendEmail({
        to: email,
        subject: `Registration Confirmation - ${event.title}`,
        html: attendeePassTemplate({
          firstName,
          eventName: event.title,
          eventDate,
          eventLocation,
          venueName,
          eventUrl,
          orderId,
          hotelInfo: hotelInfo,
          eventImage: event.image,
          orderSummaryHtml,
          attendeeDetailsHtml,
        })
      });
  }
}
