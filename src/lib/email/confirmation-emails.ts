import { ModalRegistrationType } from '../registration-adapters';
import { Event } from '@/types/events';
import { sendEmail } from './index';
import { 
  attendeePassTemplate, 
  vipAttendeePassTemplate, 
  exhibitorTemplate, 
  sponsorTemplate, 
  OrderSummary, 
  generateOrderSummaryHtml 
} from './templates';

// Define ticket tiers in order of priority (highest to lowest)
export enum TicketTier {
  PLATINUM_SPONSOR = 6,
  GOLD_SPONSOR = 5,
  SILVER_SPONSOR = 4,
  BRONZE_SPONSOR = 3,
  EXHIBITOR = 2,
  VIP_ATTENDEE = 1,
  STANDARD_ATTENDEE = 0
}

interface TicketInfo {
  tier: TicketTier;
  registration: ModalRegistrationType;
}

/**
 * Determines the tier of a registration type
 * @param registration The registration type to check
 * @returns The ticket tier
 */
export function determineTicketTier(registration: ModalRegistrationType): TicketTier {
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
export function findHighestTierRegistration(registrations: ModalRegistrationType[]): TicketInfo | null {
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
  attachments = []
}: {
  email: string;
  firstName: string;
  event: Event;
  registrations: ModalRegistrationType[];
  orderId: string;
  orderSummary?: OrderSummary;
  attendeePasses?: number;
  attachments?: any[];
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
  const hotelInfo = `https://americandefensealliance.org/events/${event.slug}/about/venue-and-lodging`;

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
          eventUrl,
          orderId,
          sponsorshipLevel: registration.title,
          sponsorshipPerks: registration.perks || [],
          attendeePasses: registration.sponsorPasses || attendeePasses || 0,
          eventImage: event.image,
          orderSummaryHtml,
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
          eventUrl,
          orderId,
          exhibitorType: registration.title,
          exhibitorInstructions: `
            <p>Setup time: Day before event, 2-5pm or day of event 7-8am</p>
            <p>Teardown: After event conclusion</p>
            <p>Each exhibit space includes one 6' table and two chairs.</p>
            <p>Please bring your own tablecloth, signage, and promotional materials.</p>
          `,
          eventImage: event.image,
          orderSummaryHtml,
        }),
        attachments: emailAttachments,
      });
      
    case TicketTier.VIP_ATTENDEE:
      return sendEmail({
        to: email,
        subject: `Your VIP Registration for ${event.title}`,
        html: vipAttendeePassTemplate({
          firstName,
          eventName: event.title,
          eventDate,
          eventLocation,
          eventUrl,
          orderId,
          vipPerks: registration.perks || [
            'Priority seating',
            'Access to VIP reception',
            'Exclusive networking opportunities',
            'Special gift bag'
          ],
          eventImage: event.image,
          orderSummaryHtml,
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
          eventUrl,
          orderId,
          hotelInfo: hotelInfo,
          eventImage: event.image,
          orderSummaryHtml,
        })
      });
  }
}
