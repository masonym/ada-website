import { getOrderCatalogue } from './order';
import { COMP_SPONSOR_PASS_ID, isCompSponsorPassId } from './pass-ids';
import { OrderValidation, TicketSelection } from '@/types/event-registration/registration';

/**
 * How many complimentary attendee passes an order was granted, and how many of
 * them have been used.
 *
 * A sponsorship includes N attendee passes (`sponsorPasses` in the constants),
 * but the buyer rarely knows all N names at checkout - the modal's attendee-count
 * step lets them register fewer and told them to contact us for the rest. These
 * counters are what let them come back later and claim the remainder themselves,
 * by entering the original order id.
 *
 * The counters are written onto the confirmed registration at save time and then
 * only ever moved by `claimSponsorPasses`, whose conditional update is the thing
 * that stops the same pass being claimed twice from two browser tabs. Nothing
 * recomputes them from the constants afterwards: a tier's `sponsorPasses` can be
 * edited between the purchase and the claim, and the buyer is entitled to what
 * they bought.
 *
 * Orders confirmed before this existed carry no counters. They are reported as
 * `known: false` rather than as zero remaining, so the caller can say "we can't
 * tell" instead of wrongly refusing a sponsor - those are handled by hand with a
 * 100%-off promo code against the paid Additional Sponsor Attendee Pass.
 */

export { COMP_SPONSOR_PASS_ID, isCompSponsorPassId };

/** DynamoDB attribute names, shared by the writer and the conditional update. */
export const GRANTED_ATTR = 'sponsorPassesGranted';
export const USED_ATTR = 'sponsorPassesUsed';

export interface SponsorPassEntitlement {
  /** False for orders confirmed before the counters existed. */
  known: boolean;
  granted: number;
  used: number;
  remaining: number;
}

export const UNKNOWN_ENTITLEMENT: SponsorPassEntitlement = {
  known: false,
  granted: 0,
  used: 0,
  remaining: 0,
};

function quantityOf(ticket: TicketSelection): number {
  const quantity = Number(ticket.quantity);
  return Number.isFinite(quantity) && quantity > 0 ? Math.floor(quantity) : 0;
}

/** The sponsorship a `<sponsorshipId>-additional-pass` line belongs to. */
function sponsorshipIdForPassLine(ticket: TicketSelection): string {
  return ticket.sponsorshipId ?? ticketIdOf(ticket).replace(/-additional-pass$/, '');
}

/**
 * Tolerates a line with no ticket id. The oldest events have registration types
 * declared without one, and these functions run on the way into the permanent
 * table - a throw here would fail the save of an otherwise good registration.
 */
function ticketIdOf(ticket: TicketSelection): string {
  return typeof ticket?.ticketId === 'string' ? ticket.ticketId : '';
}

function isBundledPassLine(ticket: TicketSelection): boolean {
  return (
    ticket.isIncludedWithSponsorship === true ||
    ticketIdOf(ticket).endsWith('-additional-pass')
  );
}

/**
 * Total attendee passes the sponsorships on an order come with.
 *
 * Pooled across every sponsorship on the order rather than tracked per tier. An
 * order with two different sponsorships is vanishingly rare, and pooling means a
 * claim only has to name the order, not which sponsorship it hangs off.
 */
export function countGrantedPasses(
  eventId: number | string,
  tickets: TicketSelection[] = []
): number {
  const catalogue = getOrderCatalogue(eventId);
  let granted = 0;

  for (const ticket of tickets) {
    if (isBundledPassLine(ticket)) continue;

    const item = catalogue.get(ticketIdOf(ticket));
    if (!item || item.category !== 'sponsorship') continue;

    granted += (item.sponsorPasses ?? 0) * quantityOf(ticket);
  }

  return granted;
}

/**
 * Attendee passes already spent on an order: the people whose details were given
 * at checkout.
 *
 * The modal puts the first attendee on the sponsorship line itself and the rest
 * on a `<sponsorshipId>-additional-pass` line, so both are counted. A sponsorship
 * line that somehow stored no attendee still spends one pass per unit - the buyer
 * is registered whether or not their details rode along.
 */
export function countUsedPasses(
  eventId: number | string,
  tickets: TicketSelection[] = []
): number {
  const catalogue = getOrderCatalogue(eventId);
  let used = 0;

  for (const ticket of tickets) {
    if (isBundledPassLine(ticket)) {
      const sponsorship = catalogue.get(sponsorshipIdForPassLine(ticket));
      if (sponsorship?.category === 'sponsorship') {
        used += quantityOf(ticket);
      }
      continue;
    }

    const item = catalogue.get(ticketIdOf(ticket));
    if (!item || item.category !== 'sponsorship') continue;
    if (!(item.sponsorPasses ?? 0)) continue;

    used += Math.max(quantityOf(ticket), ticket.attendeeInfo?.length ?? 0);
  }

  return used;
}

/** Reads the counters off a stored order, without recomputing them. */
export function readEntitlement(
  order: Record<string, unknown> | null | undefined
): SponsorPassEntitlement {
  if (!order) return UNKNOWN_ENTITLEMENT;

  const granted = order[GRANTED_ATTR];
  const used = order[USED_ATTR];

  if (typeof granted !== 'number' || typeof used !== 'number') {
    return UNKNOWN_ENTITLEMENT;
  }

  return {
    known: true,
    granted,
    used,
    remaining: Math.max(0, granted - used),
  };
}

export interface CompPassClaim {
  /** Order id of the sponsorship purchase the passes are being taken from. */
  orderId: string;
  count: number;
}

export type CompPassClaimPlan =
  | { ok: true; claims: CompPassClaim[] }
  | { ok: false; error: string };

/**
 * Works out which orders a submission wants to spend complimentary passes from.
 *
 * The $0 pass is a real catalogue entry, so a hand-rolled POST could ask for ten
 * of them; what makes it safe is that every one has to name an order the browser
 * verified through /api/validate-order, and the claim against that order is then
 * checked and decremented server-side. A line with no matching validation is
 * refused here rather than quietly priced at zero.
 *
 * Claims are grouped by order id so two lines against the same order take one
 * conditional update between them, not two that can interleave.
 */
export function planCompPassClaims(
  items: Array<{ ticketId: string; quantity: number }>,
  orderValidations: OrderValidation[] = []
): CompPassClaimPlan {
  const byOrderId = new Map<string, number>();

  for (const item of items) {
    if (!isCompSponsorPassId(item.ticketId)) continue;

    const validation = orderValidations.find(v => v?.ticketId === item.ticketId);
    const orderId = validation?.validatedOrderId?.trim();

    if (!orderId) {
      return {
        ok: false,
        error:
          'A complimentary Additional Sponsor Attendee Pass requires the order ID of your sponsorship purchase. Please verify it and try again.',
      };
    }

    byOrderId.set(orderId, (byOrderId.get(orderId) ?? 0) + item.quantity);
  }

  return {
    ok: true,
    claims: [...byOrderId].map(([orderId, count]) => ({ orderId, count })),
  };
}
