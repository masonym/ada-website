import {
  getRegistrationsForEvent,
  getSponsorshipsForEvent,
  getExhibitorsForEvent,
  AdapterModalRegistrationType,
} from '@/lib/registration-adapters';
import { resolveEarlyBird } from '@/lib/pricing-tiers';

/**
 * Authoritative, server-side pricing for a registration order.
 *
 * The register route used to take `body.ticketPrices[ticketId]` from the browser
 * and prefer it over the configured price, so a crafted POST could name its own
 * amount - or send zeros, drop the total to 0, and take the free-registration
 * branch (confirmation emails, a sheet row, no payment). It also only looked in
 * REGISTRATION_TYPES, so every sponsorship and exhibit line item fell through to
 * the client price by default.
 *
 * Everything here is derived from the constants files. The client's numbers are
 * accepted only as a cross-check (see `mismatches`), never as an input to the
 * charge.
 */

/** A ticket as the browser submits it. Prices are deliberately absent. */
export type SubmittedTicket = {
  ticketId: string;
  quantity: number;
  isIncludedWithSponsorship?: boolean;
  sponsorshipId?: string;
};

export type ResolvedLineItem = {
  ticketId: string;
  name: string;
  quantity: number;
  /** Per-unit price in dollars, after early-bird/tier resolution. */
  unitPrice: number;
  /** Per-unit price before early-bird, for receipts that show a saving. */
  listPrice: number;
  isEarlyBird: boolean;
  type: 'paid' | 'free' | 'complimentary' | 'sponsor';
  lineTotal: number;
};

export type ResolveOrderSuccess = {
  ok: true;
  items: ResolvedLineItem[];
  subtotal: number;
  /**
   * Ticket ids where the browser's price disagreed with ours. Never affects the
   * charge - it exists so a genuine mid-checkout price change (a tier rolling
   * over while the modal is open) is visible in the logs rather than silent.
   */
  mismatches: Array<{ ticketId: string; clientPrice: number; serverPrice: number }>;
};

export type ResolveOrderFailure = {
  ok: false;
  field: string;
  error: string;
};

export type ResolveOrderResult = ResolveOrderSuccess | ResolveOrderFailure;

/** Every purchasable line item for an event, across all three catalogues. */
export function getOrderCatalogue(
  eventId: number | string
): Map<string, AdapterModalRegistrationType> {
  const all = [
    ...getRegistrationsForEvent(eventId),
    ...getSponsorshipsForEvent(eventId),
    ...getExhibitorsForEvent(eventId),
  ];

  return new Map(all.map(item => [item.id, item]));
}

/** Coerce a configured price to a number. Strings like "$1,295" are tolerated. */
function toPrice(value: number | string | undefined): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string') return null;

  const cleaned = value.replace(/[^0-9.]/g, '');
  if (cleaned === '') return null;

  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

const FREE_TYPES = new Set(['free', 'complimentary']);

/**
 * Resolves the price of one catalogue item at a point in time, mirroring the
 * modal's getEffectivePrice so the customer is charged what they were shown.
 */
function priceItem(
  item: AdapterModalRegistrationType,
  at: Date
): { unitPrice: number; listPrice: number; isEarlyBird: boolean } | null {
  if (FREE_TYPES.has(item.type)) {
    return { unitPrice: 0, listPrice: 0, isEarlyBird: false };
  }

  const listPrice = toPrice(item.price);
  if (listPrice === null) return null;

  const { earlyBirdPrice, earlyBirdDeadline } = resolveEarlyBird(item, at);
  const earlyBird = toPrice(earlyBirdPrice);

  if (earlyBird !== null && earlyBirdDeadline && at < new Date(earlyBirdDeadline)) {
    return { unitPrice: earlyBird, listPrice, isEarlyBird: true };
  }

  return { unitPrice: listPrice, listPrice, isEarlyBird: false };
}

/**
 * Complimentary passes bundled with a sponsorship arrive as
 * `<sponsorshipId>-additional-pass`. They are free, so they have to be tied back
 * to a sponsorship actually being bought in the same order - otherwise anyone
 * can mint free attendee passes by inventing the id.
 */
function validateSponsorPass(
  ticket: SubmittedTicket,
  catalogue: Map<string, AdapterModalRegistrationType>,
  submitted: SubmittedTicket[]
): ResolveOrderFailure | null {
  const sponsorshipId =
    ticket.sponsorshipId ?? ticket.ticketId.replace(/-additional-pass$/, '');

  const sponsorship = catalogue.get(sponsorshipId);
  if (!sponsorship || sponsorship.category !== 'sponsorship') {
    return {
      ok: false,
      field: 'tickets',
      error: `Complimentary pass "${ticket.ticketId}" does not belong to a sponsorship for this event.`,
    };
  }

  const purchased = submitted.find(t => t.ticketId === sponsorshipId);
  if (!purchased || purchased.quantity < 1) {
    return {
      ok: false,
      field: 'tickets',
      error: `Complimentary passes for "${sponsorship.title}" require that sponsorship to be part of the same order.`,
    };
  }

  // The first included pass rides on the sponsorship line itself, so the
  // separate line can only cover the remainder.
  const included = (sponsorship.sponsorPasses ?? 0) * purchased.quantity;
  const allowed = Math.max(0, included - purchased.quantity);
  if (ticket.quantity > allowed) {
    return {
      ok: false,
      field: 'tickets',
      error: `"${sponsorship.title}" includes ${allowed} additional complimentary pass(es); ${ticket.quantity} requested.`,
    };
  }

  return null;
}

export function resolveOrderPricing(
  eventId: number | string,
  tickets: SubmittedTicket[],
  options: { at?: Date; clientPrices?: Record<string, unknown> } = {}
): ResolveOrderResult {
  const at = options.at ?? new Date();
  const catalogue = getOrderCatalogue(eventId);

  if (catalogue.size === 0) {
    return { ok: false, field: 'eventId', error: 'No registration options are configured for this event.' };
  }

  if (!Array.isArray(tickets) || tickets.length === 0) {
    return { ok: false, field: 'tickets', error: 'No tickets selected.' };
  }

  const items: ResolvedLineItem[] = [];
  const mismatches: ResolveOrderSuccess['mismatches'] = [];

  for (const ticket of tickets) {
    const quantity = Number(ticket.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) {
      return { ok: false, field: 'tickets', error: `Invalid quantity for "${ticket.ticketId}".` };
    }

    // Complimentary sponsor passes are not catalogue entries of their own.
    const isSponsorPass =
      ticket.isIncludedWithSponsorship === true ||
      ticket.ticketId.endsWith('-additional-pass');

    if (isSponsorPass) {
      const failure = validateSponsorPass(ticket, catalogue, tickets);
      if (failure) return failure;

      items.push({
        ticketId: ticket.ticketId,
        name: 'Additional Sponsor Attendee Pass',
        quantity,
        unitPrice: 0,
        listPrice: 0,
        isEarlyBird: false,
        type: 'complimentary',
        lineTotal: 0,
      });
      continue;
    }

    const item = catalogue.get(ticket.ticketId);
    if (!item) {
      // Previously this fell through to the client-supplied price, or to 0.
      return {
        ok: false,
        field: 'tickets',
        error: `"${ticket.ticketId}" is not available for this event.`,
      };
    }

    if (item.isActive === false) {
      return { ok: false, field: 'tickets', error: `"${item.title}" is no longer available.` };
    }

    if (item.saleEndTime && at > new Date(item.saleEndTime)) {
      return { ok: false, field: 'tickets', error: `Sales for "${item.title}" have closed.` };
    }

    const max = item.maxQuantityPerOrder;
    if (typeof max === 'number' && max > 0 && quantity > max) {
      return {
        ok: false,
        field: 'tickets',
        error: `"${item.title}" is limited to ${max} per order; ${quantity} requested.`,
      };
    }

    const priced = priceItem(item, at);
    if (!priced) {
      // A paid item whose configured price is not a number is a data error, not
      // a customer error - refuse rather than guess.
      console.error(
        `[order] Event ${eventId}: ticket "${item.id}" has an unusable price:`,
        item.price
      );
      return {
        ok: false,
        field: 'tickets',
        error: `"${item.title}" is not currently priced for online purchase.`,
      };
    }

    const clientPrice = options.clientPrices?.[ticket.ticketId];
    if (typeof clientPrice === 'number' && clientPrice !== priced.unitPrice) {
      mismatches.push({
        ticketId: ticket.ticketId,
        clientPrice,
        serverPrice: priced.unitPrice,
      });
    }

    items.push({
      ticketId: item.id,
      name: item.title || item.name,
      quantity,
      unitPrice: priced.unitPrice,
      listPrice: priced.listPrice,
      isEarlyBird: priced.isEarlyBird,
      type: item.type,
      lineTotal: priced.unitPrice * quantity,
    });
  }

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);

  return { ok: true, items, subtotal, mismatches };
}

/**
 * Applies a validated promo code to already-resolved line items.
 *
 * Split from resolveOrderPricing so the discount can never influence which
 * prices were used, only what comes off the total.
 */
export function applyPromoDiscount(
  items: ResolvedLineItem[],
  promo?: {
    discountAmount?: number;
    discountPercentage?: number;
    eligibleTicketTypes?: string[];
  } | null
): { subtotal: number; discount: number; total: number } {
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);

  if (!promo) return { subtotal, discount: 0, total: subtotal };

  const base = promo.eligibleTicketTypes
    ? items
        .filter(item => promo.eligibleTicketTypes!.includes(item.ticketId))
        .reduce((sum, item) => sum + item.lineTotal, 0)
    : subtotal;

  let discount = 0;
  if (promo.discountAmount) {
    discount = Math.min(promo.discountAmount, base);
  } else if (promo.discountPercentage) {
    discount = base * (promo.discountPercentage / 100);
  }

  // Round to cents so the Stripe amount and the receipt agree.
  discount = Math.round(discount * 100) / 100;

  return { subtotal, discount, total: Math.max(0, subtotal - discount) };
}
