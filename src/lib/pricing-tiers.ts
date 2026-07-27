import { PriceTier } from '@/types/registration';

/**
 * Anything that can carry early-bird pricing, in either form.
 */
export interface TieredPricing {
  earlyBirdPrice?: number | string;
  earlyBirdDeadline?: string;
  priceTiers?: PriceTier[];
}

/**
 * Collapses a ladder of early-bird price tiers down to the single
 * `earlyBirdPrice` / `earlyBirdDeadline` pair the rest of the app works with.
 *
 * Tiers are checked earliest-deadline first; the first one that has not yet
 * lapsed at `at` is the live price. When every tier has lapsed the item has no
 * early-bird pricing left and its base `price` stands as the final price.
 *
 * Items without `priceTiers` are passed through untouched, so single-deadline
 * registrations keep behaving exactly as before.
 *
 * Callers that render prices must resolve at render time rather than at build
 * time — event pages are statically generated, so a tier baked in at build
 * would never advance.
 */
export function resolveEarlyBird(
  item: TieredPricing,
  at: Date = new Date()
): { earlyBirdPrice?: number | string; earlyBirdDeadline?: string } {
  if (!item.priceTiers || item.priceTiers.length === 0) {
    return {
      earlyBirdPrice: item.earlyBirdPrice,
      earlyBirdDeadline: item.earlyBirdDeadline,
    };
  }

  const activeTier = [...item.priceTiers]
    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
    .find((tier) => at < new Date(tier.endDate));

  if (!activeTier) return {};

  return {
    earlyBirdPrice: activeTier.price,
    earlyBirdDeadline: activeTier.endDate,
  };
}
