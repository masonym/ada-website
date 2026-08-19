import { AdapterModalRegistrationType } from '../registration-adapters';
import { Event } from '@/types/events';
import {
  additionalAttendeePassTemplate,
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
import { LinkedPackage, isAdditionalPassRegistration } from './additional-pass';

/**
 * Turning an order into confirmation email HTML, with no I/O of its own.
 *
 * This is deliberately separate from `./confirmation-emails`, which reaches S3
 * for the exhibitor instructions and then sends: keeping the rendering pure
 * lets /dev/email-preview import it directly and show the exact bytes a
 * registrant would receive, instead of a second copy of the template wiring
 * that drifts from the real one.
 */

// Define ticket tiers in order of priority (highest to lowest)
export enum TicketTier {
  PLATINUM_SPONSOR = 8,
  GOLD_SPONSOR = 7,
  SILVER_SPONSOR = 6,
  BRONZE_SPONSOR = 5,
  EXHIBITOR = 4,
  /**
   * The add-on attendee passes. Below every package tier, so an order that
   * contains both a sponsorship and an add-on pass still sends the sponsor
   * email; above the plain ticket tiers, so a pass-only order does not fall
   * through to the standard attendee template.
   */
  ADDITIONAL_PASS = 3,
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
  // The additional attendee passes sit in the sponsorship and exhibit
  // catalogues but are not packages themselves, so they are matched before the
  // category checks - otherwise a pass-only order is treated as a sponsorship
  // whose perks cannot be found.
  if (isAdditionalPassRegistration(registration)) {
    return TicketTier.ADDITIONAL_PASS;
  }

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

export interface RenderedConfirmationEmail {
  subject: string;
  html: string;
}

/**
 * Renders the confirmation email for an order's highest tier registration.
 *
 * Everything the templates show - event details, sponsorship or exhibit perks,
 * the VIP reception, additional-pass pricing - is derived here from `event` and
 * `registration`, so the caller only supplies what is genuinely per-order.
 */
export function renderConfirmationEmail({
  firstName,
  event,
  tier,
  registration,
  orderId,
  orderSummary,
  attendees = [],
  attendeePasses = 0,
  exhibitorInstructions = '',
  linkedPackage = null,
}: {
  firstName: string;
  event: Event;
  tier: TicketTier;
  registration: AdapterModalRegistrationType;
  orderId: string;
  orderSummary?: OrderSummary;
  attendees?: AttendeeDetails[];
  attendeePasses?: number;
  /** Path of the instructions PDF in the event's bucket folder, if one exists. */
  exhibitorInstructions?: string;
  /**
   * For an additional attendee pass bought on its own, the sponsorship or
   * exhibit space it was validated against - resolved by the caller, which is
   * the only part of this that needs the original order.
   */
  linkedPackage?: LinkedPackage | null;
}): RenderedConfirmationEmail {
  const eventUrl = `https://americandefensealliance.org/events/${event.slug}`;
  const eventDate = event.date || 'TBA';
  const eventLocation = event.locationAddress || 'TBA';
  const venueName = event.venueName || 'TBA';
  const hotelInfo = `https://americandefensealliance.org/events/${event.slug}/venue-and-lodging`;
  const vipNetworkingReception = event.vipNetworkingReception;
  const vipNetworkingReceptionUrl = `${eventUrl}/about/vip-networking-reception`;

  const orderSummaryHtml = orderSummary ? generateOrderSummaryHtml(orderSummary) : '';
  const attendeeDetailsHtml =
    attendees && attendees.length > 0 ? generateAttendeeDetailsHtml(attendees) : '';

  const common = {
    firstName,
    eventId: event.id,
    eventName: event.title,
    eventDate,
    eventLocation,
    venueName,
    eventUrl,
    orderId,
    eventImage: event.image,
    hotelInfo,
    orderSummaryHtml,
    attendeeDetailsHtml,
  };

  switch (tier) {
    case TicketTier.PLATINUM_SPONSOR:
    case TicketTier.GOLD_SPONSOR:
    case TicketTier.SILVER_SPONSOR:
    case TicketTier.BRONZE_SPONSOR:
      return {
        subject: `Your ${event.title} Sponsorship Confirmation`,
        html: sponsorTemplate({
          ...common,
          sponsorshipLevel: registration.title,
          // Benefits are rendered from this sponsorship's perks in
          // @/constants/sponsorships, so they always match what was sold.
          sponsorshipId: registration.id,
          attendeePasses: registration.sponsorPasses || attendeePasses || 0,
          vipNetworkingReception,
          matchmakingSessions: event.matchmakingSessions || undefined,
          exhibitorInstructions,
          vipNetworkingReceptionUrl,
        }),
      };

    case TicketTier.EXHIBITOR:
      return {
        subject: `Your ${event.title} Exhibitor Confirmation`,
        html: exhibitorTemplate({
          ...common,
          exhibitorType: registration.title,
          // As with sponsorships, the perks come from @/constants/exhibitors.
          exhibitorId: registration.id,
          exhibitorInstructions,
          vipNetworkingReception,
          vipNetworkingReceptionUrl,
        }),
      };

    case TicketTier.ADDITIONAL_PASS:
      return {
        subject: `Registration Confirmation - ${event.title}`,
        html: additionalAttendeePassTemplate({
          ...common,
          passTitle: registration.title,
          passId: registration.id,
          vipNetworkingReception,
          vipNetworkingReceptionUrl,
          matchmakingSessions: event.matchmakingSessions || undefined,
          exhibitorInstructions,
          linkedPackage,
        }),
      };

    case TicketTier.GOV_MIL_PASS:
      return {
        subject: `Registration Confirmation - ${event.title}`,
        html: govMilPassTemplate({
          ...common,
          orderSummaryHtml: '', // No order summary for free passes
          matchmakingSessions: event.matchmakingSessions || undefined,
        }),
      };

    case TicketTier.VIP_ATTENDEE:
      return {
        subject: `Registration Confirmation - ${event.title}`,
        html: vipAttendeePassTemplate({
          ...common,
          vipNetworkingReception,
          vipNetworkingReceptionUrl,
        }),
      };

    case TicketTier.STANDARD_ATTENDEE:
    default:
      return {
        subject: `Registration Confirmation - ${event.title}`,
        html: attendeePassTemplate(common),
      };
  }
}
