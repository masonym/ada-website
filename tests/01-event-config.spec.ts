import { test, expect } from '@playwright/test';
import { config } from './helpers/config';
import { getTestableItems, effectivePrice } from './helpers/tickets';

/**
 * Offline checks on the event's registration configuration. These need no network,
 * no Stripe and no sheet - run them as soon as the constants for a new event are in.
 */
for (const eventId of config.targetEventIds) {
test.describe(`event ${eventId} - registration config`, () => {
  const items = getTestableItems(eventId);
  const now = new Date();

  test('every registration option has a unique id and title', () => {
    const ids = items.map((i) => i.id);
    const titles = items.map((i) => i.title);

    expect(new Set(ids).size, `duplicate ids: ${ids.join(', ')}`).toBe(ids.length);
    // The sheet logs the title, so duplicates make registrations indistinguishable.
    expect(new Set(titles).size, `duplicate titles: ${titles.join(', ')}`).toBe(titles.length);
  });

  test('paid options resolve to a positive price today', () => {
    const problems = items
      .filter((i) => !i.isComplimentary && !i.skipReason)
      .filter((i) => !(i.expectedPrice > 0))
      .map((i) => `${i.id} -> ${JSON.stringify(i.raw.price)}`);

    expect(problems, `these options are not priced: ${problems.join(', ')}`).toHaveLength(0);
  });

  test('early bird and tiered pricing is coherent', () => {
    for (const item of items) {
      if (item.isComplimentary) continue;
      const raw = item.raw;

      if (raw.priceTiers?.length) {
        for (const tier of raw.priceTiers) {
          expect(Number.isNaN(Date.parse(tier.endDate)), `${item.id}: bad tier date ${tier.endDate}`).toBe(false);
          expect(Number(tier.price), `${item.id}: tier price must be positive`).toBeGreaterThan(0);
        }

        const sorted = [...raw.priceTiers].sort(
          (a, b) => Date.parse(a.endDate) - Date.parse(b.endDate)
        );
        const prices = sorted.map((t) => Number(t.price));
        const ascending = prices.every((p, i) => i === 0 || p >= prices[i - 1]);
        expect(ascending, `${item.id}: tier prices should climb over time, got ${prices.join(' -> ')}`).toBe(true);
        expect(
          Number(raw.price),
          `${item.id}: the base price should be the highest tier`
        ).toBeGreaterThanOrEqual(prices[prices.length - 1]);
      }

      if (raw.earlyBirdPrice !== undefined && !raw.priceTiers?.length) {
        expect(raw.earlyBirdDeadline, `${item.id}: earlyBirdPrice with no earlyBirdDeadline`).toBeTruthy();
        expect(
          Number.isNaN(Date.parse(raw.earlyBirdDeadline as string)),
          `${item.id}: bad earlyBirdDeadline ${raw.earlyBirdDeadline}`
        ).toBe(false);
        expect(
          Number(raw.earlyBirdPrice),
          `${item.id}: early bird price is not below the standard price`
        ).toBeLessThan(Number(raw.price));
      }
    }
  });

  test('the price will still resolve after the current early bird window ends', () => {
    // Guards the case where every tier lapses and the item falls back to a broken base price.
    const afterAllDeadlines = new Date(now.getTime() + 5 * 365 * 24 * 60 * 60 * 1000);

    for (const item of items) {
      if (item.isComplimentary || item.skipReason) continue;
      const later = effectivePrice(item.raw, afterAllDeadlines);
      expect(later, `${item.id}: no valid price once early bird pricing lapses`).toBeGreaterThan(0);
      expect(
        later,
        `${item.id}: still charging the early bird price after every deadline has passed`
      ).toBe(Number(item.raw.price));
    }
  });

  test('at least one option is on sale right now', () => {
    const live = items.filter((i) => !i.skipReason);
    const skipped = items.filter((i) => i.skipReason).map((i) => `${i.id} (${i.skipReason})`);

    if (skipped.length) console.log(`  not on sale: ${skipped.join(', ')}`);
    expect(live.length, 'nothing is purchasable for this event today').toBeGreaterThan(0);
  });
});
}
