import {
  getRegistrationsForEvent,
  getSponsorshipsForEvent,
  getExhibitorsForEvent,
  AdapterModalRegistrationType,
} from '@/lib/registration-adapters';
import { resolveEarlyBird } from '@/lib/pricing-tiers';

export interface TestableItem {
  id: string;
  title: string;
  category: 'ticket' | 'exhibit' | 'sponsorship';
  type: AdapterModalRegistrationType['type'];
  /** Price the checkout should charge right now (early-bird / live tier resolved). */
  expectedPrice: number;
  requiresAttendeeInfo: boolean;
  /** Additional passes reference a previous order id; mirrored into orderValidations. */
  requiresValidation: boolean;
  isComplimentary: boolean;
  /** Set when the item exists but is not purchasable today. */
  skipReason?: string;
  raw: AdapterModalRegistrationType;
}

/**
 * Mirrors RegistrationModal.getEffectivePrice - the price the modal would post for
 * this item today, with tiered / early-bird pricing resolved.
 */
export function effectivePrice(item: AdapterModalRegistrationType, at: Date = new Date()): number {
  const { earlyBirdPrice, earlyBirdDeadline } = resolveEarlyBird(item, at);
  const isEarlyBird = Boolean(earlyBirdDeadline && at < new Date(earlyBirdDeadline));
  const displayPrice = isEarlyBird && earlyBirdPrice !== undefined ? earlyBirdPrice : item.price;

  return typeof displayPrice === 'string'
    ? parseFloat(displayPrice.replace(/[^0-9.]/g, '')) || 0
    : displayPrice;
}

function describe(item: AdapterModalRegistrationType, at: Date): TestableItem {
  const isComplimentary = item.type === 'complimentary' || item.type === 'free';
  const price = effectivePrice(item, at);

  let skipReason: string | undefined;
  if (item.isSoldOut) {
    skipReason = 'marked sold out';
  } else if (item.isActive === false) {
    skipReason = 'not active';
  } else if (item.saleEndTime && new Date(item.saleEndTime) < at) {
    skipReason = `sale ended ${item.saleEndTime}`;
  } else if (!isComplimentary && !(price > 0)) {
    skipReason = `no numeric price (price: ${JSON.stringify(item.price)})`;
  }

  return {
    id: item.id,
    title: item.title,
    category: item.category,
    type: item.type,
    expectedPrice: isComplimentary ? 0 : price,
    requiresAttendeeInfo: item.requiresAttendeeInfo !== false,
    requiresValidation: Boolean(item.requiresValidation),
    isComplimentary,
    skipReason,
    raw: item,
  };
}

/**
 * Every registration, exhibitor and sponsorship option configured for an event,
 * in the same shape the registration modal sees them.
 */
export function getTestableItems(eventId: string | number, at: Date = new Date()): TestableItem[] {
  return [
    ...getRegistrationsForEvent(eventId),
    ...getExhibitorsForEvent(eventId),
    ...getSponsorshipsForEvent(eventId),
  ]
    .filter((item) => Boolean(item?.id)) // legacy entries with no id are display-only
    .map((item) => describe(item, at));
}

export function getPurchasableItems(eventId: string | number, at: Date = new Date()): TestableItem[] {
  return getTestableItems(eventId, at).filter((item) => !item.skipReason && !item.isComplimentary);
}

export function getComplimentaryItems(eventId: string | number, at: Date = new Date()): TestableItem[] {
  return getTestableItems(eventId, at).filter((item) => !item.skipReason && item.isComplimentary);
}

/**
 * The per-attendee dollar figure the sheet logs, net of the payment processing fee.
 * Must stay in sync with logRegistration() in src/lib/google-sheets/index.ts.
 */
export function expectedNetAmount(ticketPrice: number, discountRatio = 0): number {
  const discounted = ticketPrice > 0 ? ticketPrice * (1 - discountRatio) : ticketPrice;
  return Math.max(discounted * 0.971 - 0.3, 0);
}
