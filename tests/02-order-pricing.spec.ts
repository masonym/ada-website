import { test, expect } from '@playwright/test';
import { config } from './helpers/config';
import { getTestableItems, effectivePrice } from './helpers/tickets';
import {
  resolveOrderPricing,
  applyPromoDiscount,
  getOrderCatalogue,
} from '@/lib/event-registration/order';

/**
 * Offline checks on server-side order pricing. No network, no Stripe, no sheet.
 *
 * These cover what tests/README.md used to list under "Known gaps": the register
 * endpoint preferred `body.ticketPrices[ticketId]` over the configured price, so
 * a tampered request could name its own amount. The route now resolves every
 * price from the constants and only uses the client's numbers as a cross-check,
 * and the cases below are what keep it that way.
 */
for (const eventId of config.targetEventIds) {
test.describe(`event ${eventId} - order pricing`, () => {
  const items = getTestableItems(eventId);
  const purchasable = items.filter((i) => !i.skipReason && !i.isComplimentary);

  test('the catalogue covers tickets, sponsorships and exhibits', () => {
    const catalogue = getOrderCatalogue(eventId);
    expect(catalogue.size, 'no purchasable options resolved for this event').toBeGreaterThan(0);

    const missing = items.filter((i) => !catalogue.has(i.id)).map((i) => i.id);
    expect(missing, `options the order resolver cannot price: ${missing.join(', ')}`).toHaveLength(0);
  });

  test('resolved prices match the configured price for every option', () => {
    for (const item of purchasable) {
      const result = resolveOrderPricing(eventId, [
        { ticketId: item.id, quantity: 1 },
      ]);

      expect(result.ok, `${item.id}: ${result.ok ? '' : result.error}`).toBe(true);
      if (!result.ok) continue;

      expect(result.items[0].unitPrice, `${item.id}: wrong resolved price`).toBe(
        item.expectedPrice
      );
      expect(result.subtotal, `${item.id}: wrong subtotal`).toBe(item.expectedPrice);
    }
  });

  test('a tampered client price is ignored, not charged', () => {
    const item = purchasable[0];
    test.skip(!item, 'no purchasable option to test against');

    const result = resolveOrderPricing(
      eventId,
      [{ ticketId: item.id, quantity: 1 }],
      { clientPrices: { [item.id]: 0.5 } }
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.items[0].unitPrice, 'client price leaked into the charge').toBe(
      item.expectedPrice
    );
    expect(result.subtotal).toBe(item.expectedPrice);
    // The disagreement is still surfaced so a genuine mid-checkout tier change is visible.
    expect(result.mismatches).toEqual([
      { ticketId: item.id, clientPrice: 0.5, serverPrice: item.expectedPrice },
    ]);
  });

  test('zeroing every client price does not produce a free order', () => {
    const selection = purchasable.slice(0, 3);
    test.skip(selection.length === 0, 'no purchasable options to test against');

    const clientPrices = Object.fromEntries(selection.map((i) => [i.id, 0]));
    const result = resolveOrderPricing(
      eventId,
      selection.map((i) => ({ ticketId: i.id, quantity: 1 })),
      { clientPrices }
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const expected = selection.reduce((sum, i) => sum + i.expectedPrice, 0);
    expect(result.subtotal, 'zeroed client prices reached the total').toBe(expected);
    expect(result.subtotal).toBeGreaterThan(0);
  });

  test('an unknown ticket id is rejected rather than priced at zero', () => {
    const result = resolveOrderPricing(
      eventId,
      [{ ticketId: 'not-a-real-ticket', quantity: 1 }],
      { clientPrices: { 'not-a-real-ticket': 1 } }
    );

    expect(result.ok, 'invented ticket ids must not be purchasable').toBe(false);
    if (result.ok) return;
    expect(result.error).toContain('not-a-real-ticket');
  });

  test('quantity limits are enforced server-side', () => {
    const limited = purchasable.find(
      (i) => typeof i.raw.maxQuantityPerOrder === 'number' && i.raw.maxQuantityPerOrder > 0
    );
    test.skip(!limited, 'no option on this event sets maxQuantityPerOrder');
    if (!limited) return;

    const max = limited.raw.maxQuantityPerOrder as number;

    const atLimit = resolveOrderPricing(eventId, [
      { ticketId: limited.id, quantity: max },
    ]);
    expect(atLimit.ok, `${limited.id}: ${max} should be allowed`).toBe(true);

    const overLimit = resolveOrderPricing(eventId, [
      { ticketId: limited.id, quantity: max + 1 },
    ]);
    expect(overLimit.ok, `${limited.id}: ${max + 1} exceeds the per-order limit`).toBe(false);
  });

  test('invalid quantities are rejected', () => {
    const item = purchasable[0];
    test.skip(!item, 'no purchasable option to test against');

    for (const quantity of [0, -1, 1.5, Number.NaN]) {
      const result = resolveOrderPricing(eventId, [
        { ticketId: item.id, quantity },
      ]);
      expect(result.ok, `quantity ${quantity} should be rejected`).toBe(false);
    }
  });

  test('complimentary sponsor passes require the sponsorship in the same order', () => {
    const catalogue = getOrderCatalogue(eventId);
    const sponsorship = [...catalogue.values()].find(
      (i) => i.category === 'sponsorship' && (i.sponsorPasses ?? 0) > 1
    );
    test.skip(!sponsorship, 'no sponsorship on this event bundles attendee passes');
    if (!sponsorship) return;

    const passId = `${sponsorship.id}-additional-pass`;

    // Free passes on their own would be a way to mint attendee registrations.
    const orphaned = resolveOrderPricing(eventId, [
      { ticketId: passId, quantity: 1, isIncludedWithSponsorship: true, sponsorshipId: sponsorship.id },
    ]);
    expect(orphaned.ok, 'complimentary passes bought without the sponsorship').toBe(false);

    // With the sponsorship present they are free and allowed.
    const bundled = resolveOrderPricing(eventId, [
      { ticketId: sponsorship.id, quantity: 1 },
      { ticketId: passId, quantity: 1, isIncludedWithSponsorship: true, sponsorshipId: sponsorship.id },
    ]);
    expect(bundled.ok, bundled.ok ? '' : bundled.error).toBe(true);
    if (!bundled.ok) return;

    const pass = bundled.items.find((i) => i.ticketId === passId);
    expect(pass?.unitPrice, 'bundled passes must be free').toBe(0);

    // ...but only up to the number the tier actually includes.
    const tooMany = resolveOrderPricing(eventId, [
      { ticketId: sponsorship.id, quantity: 1 },
      {
        ticketId: passId,
        quantity: (sponsorship.sponsorPasses ?? 0) + 5,
        isIncludedWithSponsorship: true,
        sponsorshipId: sponsorship.id,
      },
    ]);
    expect(tooMany.ok, 'more complimentary passes than the tier includes').toBe(false);
  });

  test('promo discounts apply to the resolved prices, never the client ones', () => {
    // Sponsorships and exhibit spaces are capped at 1 per order, so pick
    // something that can genuinely be bought twice.
    const item =
      purchasable.find((i) => (i.raw.maxQuantityPerOrder ?? 0) >= 2) ?? purchasable[0];
    test.skip(!item, 'no purchasable option to test against');
    if (!item) return;

    const quantity = (item.raw.maxQuantityPerOrder ?? 0) >= 2 ? 2 : 1;

    const result = resolveOrderPricing(
      eventId,
      [{ ticketId: item.id, quantity }],
      { clientPrices: { [item.id]: 1 } }
    );
    expect(result.ok, result.ok ? '' : result.error).toBe(true);
    if (!result.ok) return;

    const { subtotal, discount, total } = applyPromoDiscount(result.items, {
      discountPercentage: 50,
    });

    expect(subtotal).toBe(item.expectedPrice * quantity);
    expect(discount).toBeCloseTo(subtotal / 2, 2);
    expect(total).toBeCloseTo(subtotal / 2, 2);
  });

  test('a discount larger than the order does not produce a negative total', () => {
    const item = purchasable[0];
    test.skip(!item, 'no purchasable option to test against');

    const result = resolveOrderPricing(eventId, [{ ticketId: item.id, quantity: 1 }]);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const { total } = applyPromoDiscount(result.items, {
      discountAmount: item.expectedPrice * 10,
    });
    expect(total).toBe(0);
  });

  test('pricing is resolved as of a given time, matching the modal', () => {
    // saleEndTime is enforced against `at` too, so an item whose sale window
    // closes would be rejected in the far future for an unrelated reason.
    const tiered = purchasable.find(
      (i) => (i.raw.priceTiers?.length || i.raw.earlyBirdDeadline) && !i.raw.saleEndTime
    );
    test.skip(!tiered, 'no open-ended option on this event uses early bird or tiered pricing');
    if (!tiered) return;

    const farFuture = new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000);
    const result = resolveOrderPricing(
      eventId,
      [{ ticketId: tiered.id, quantity: 1 }],
      { at: farFuture }
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    // Once every deadline has lapsed the base price stands - same rule the
    // config spec asserts for the display path.
    expect(result.items[0].unitPrice).toBe(effectivePrice(tiered.raw, farFuture));
    expect(result.items[0].isEarlyBird).toBe(false);
  });
});
}
