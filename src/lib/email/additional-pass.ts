import { AdapterModalRegistrationType } from '../registration-adapters';
import { ExhibitorType } from '@/constants/exhibitors';
import { Sponsorship } from '@/types/sponsorships';
import {
  findSponsorship,
  getSponsorAdditionalPass,
  sponsorshipIncludesExhibitSpace,
} from './sponsor-benefits';
import { findExhibitorType, getExhibitorAdditionalPass } from './exhibitor-benefits';
import { PerkLike, perkText } from './perks';

/**
 * The "Additional Sponsor/Exhibitor Attendee Pass" add-ons, and the sponsorship
 * or exhibit space a separately-purchased one belongs to.
 *
 * These passes are sold to people whose company already bought a package: they
 * either add one to the same cart as the sponsorship, or come back later and
 * unlock it with the original order id (see /api/validate-order). In the second
 * case the order contains nothing but the pass, so the confirmation email used
 * to fall through to the sponsor template with no sponsorship found - a generic
 * "details are on the event website" block, a request for a company logo, and an
 * offer of "(0) complimentary VIP Attendee Passes". The linkage recorded at
 * validation time is what lets us name the real package instead.
 */

/** Catalogue ids the adapters give the two add-on passes. */
export const ADDITIONAL_SPONSOR_PASS_ID = 'vip-discount-sponsor';
export const ADDITIONAL_EXHIBITOR_PASS_ID = 'vip-discount-exhibitor';

const ADDITIONAL_PASS_IDS: string[] = [
  ADDITIONAL_SPONSOR_PASS_ID,
  ADDITIONAL_EXHIBITOR_PASS_ID,
];

export function isAdditionalPassId(ticketId: string | undefined): boolean {
  return !!ticketId && ADDITIONAL_PASS_IDS.includes(ticketId);
}

export function isAdditionalPassRegistration(
  registration: Pick<AdapterModalRegistrationType, 'id'>
): boolean {
  return isAdditionalPassId(registration.id);
}

/** Which of the two add-ons a registration is, for wording and perk lookup. */
export function additionalPassKind(
  ticketId: string | undefined
): 'sponsorship' | 'exhibit' | null {
  if (ticketId === ADDITIONAL_SPONSOR_PASS_ID) return 'sponsorship';
  if (ticketId === ADDITIONAL_EXHIBITOR_PASS_ID) return 'exhibit';
  return null;
}

/** Perks of the add-on pass itself, normalised to the shape `renderPerks` takes. */
export function additionalPassPerks(
  eventId: number | string | undefined,
  kind: 'sponsorship' | 'exhibit'
): PerkLike[] {
  const pass =
    kind === 'sponsorship'
      ? getSponsorAdditionalPass(eventId)
      : getExhibitorAdditionalPass(eventId);

  return (pass?.perks ?? []).map((perk) =>
    typeof perk === 'string' ? { description: perk } : perk
  );
}

/** The package an additional pass was bought against. */
export interface LinkedPackage {
  kind: 'sponsorship' | 'exhibit';
  /** Title as sold, e.g. "Platinum Sponsorship" or "Table-Top Exhibit Space". */
  title: string;
  /** The sponsorship or exhibit definition, when it is still in the constants. */
  sponsorship?: Sponsorship | null;
  exhibitor?: ExhibitorType | null;
  /** Whether the package comes with exhibit space, so setup instructions apply. */
  includesExhibitSpace: boolean;
  /** Company on the original order, when the validation recorded one. */
  company?: string;
  /** Order id of the original sponsorship/exhibit purchase. */
  orderId?: string;
}

/** One line of the original order, as much of it as we stored. */
export interface LinkedOrderTicket {
  ticketId: string;
  ticketName?: string;
}

/**
 * Resolves the sponsorship or exhibit space behind an additional pass from the
 * tickets on the order it was validated against. Sponsorships win over exhibit
 * space when an order has both, matching the tier order the templates use.
 *
 * Returns null when nothing in the order maps to a package we still have data
 * for - a comped pass unlocked with the master key, or a package removed from
 * the constants since - so the caller can fall back to generic wording rather
 * than name the wrong thing.
 */
export function resolveLinkedPackage(
  eventId: number | string | undefined,
  {
    tickets = [],
    company,
    orderId,
  }: { tickets?: LinkedOrderTicket[]; company?: string; orderId?: string }
): LinkedPackage | null {
  const candidates = tickets.filter((t) => t?.ticketId && !isAdditionalPassId(t.ticketId));

  for (const ticket of candidates) {
    const sponsorship = findSponsorship(eventId, ticket.ticketId, ticket.ticketName);
    if (sponsorship) {
      return {
        kind: 'sponsorship',
        title: sponsorship.title,
        sponsorship,
        includesExhibitSpace: sponsorshipIncludesExhibitSpace(
          sponsorship,
          sponsorship.title
        ),
        company,
        orderId,
      };
    }
  }

  for (const ticket of candidates) {
    const exhibitor = findExhibitorType(eventId, ticket.ticketId, ticket.ticketName);
    if (exhibitor) {
      return {
        kind: 'exhibit',
        title: exhibitor.title,
        exhibitor,
        includesExhibitSpace: true,
        company,
        orderId,
      };
    }
  }

  return null;
}

/** Whether the linked package's perks mention matchmaking, for the session list. */
export function linkedPackageHasMatchmaking(linked: LinkedPackage | null): boolean {
  const perks: PerkLike[] | undefined =
    linked?.sponsorship?.perks ?? linked?.exhibitor?.perks;
  return !!perks && /matchmaking/.test(perkText(perks));
}
