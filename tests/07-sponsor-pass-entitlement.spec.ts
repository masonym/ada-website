import { test, expect } from '@playwright/test';
import { config } from './helpers/config';
import { getOrderCatalogue, resolveOrderPricing } from '@/lib/event-registration/order';
import { COMP_SPONSOR_PASS_ID } from '@/lib/event-registration/pass-ids';
import {
  countGrantedPasses,
  countUsedPasses,
  planCompPassClaims,
  readEntitlement,
} from '@/lib/event-registration/sponsor-pass-entitlement';
import { TicketSelection } from '@/types/event-registration/registration';

/**
 * Offline checks on complimentary sponsor pass entitlement. No network, no
 * DynamoDB.
 *
 * The atomic decrement itself is a conditional UpdateItem and can only be proved
 * against a real table, but everything that decides *whether* to decrement - how
 * many passes an order was granted, how many it spent, and whether a submitted
 * line item is allowed to claim any - is pure, and is what these cover.
 */
for (const eventId of config.targetEventIds) {
  test.describe(`event ${eventId} - sponsor pass entitlement`, () => {
    const catalogue = getOrderCatalogue(eventId);
    const sponsorships = [...catalogue.values()].filter(
      (item) => item.category === 'sponsorship' && (item.sponsorPasses ?? 0) > 0
    );

    test('the comped pass is offered exactly when some tier grants passes', () => {
      expect(catalogue.has(COMP_SPONSOR_PASS_ID)).toBe(sponsorships.length > 0);
    });

    test('the comped pass resolves to $0 without trusting the client', () => {
      test.skip(!catalogue.has(COMP_SPONSOR_PASS_ID), 'event grants no sponsor passes');

      const result = resolveOrderPricing(
        eventId,
        [{ ticketId: COMP_SPONSOR_PASS_ID, quantity: 2 }],
        { clientPrices: { [COMP_SPONSOR_PASS_ID]: 395 } }
      );

      expect(result.ok, result.ok ? '' : result.error).toBe(true);
      if (!result.ok) return;

      expect(result.items[0].unitPrice).toBe(0);
      expect(result.subtotal).toBe(0);
    });

    test('a sponsorship grants its configured passes and spends the ones it named', () => {
      const sponsorship = sponsorships[0];
      test.skip(!sponsorship, 'event grants no sponsor passes');

      const passes = sponsorship.sponsorPasses ?? 0;

      // Betty's order: a sponsorship with N passes, only the buyer named.
      const oneNamed: TicketSelection[] = [
        {
          ticketId: sponsorship.id,
          ticketName: sponsorship.title,
          ticketPrice: sponsorship.price,
          quantity: 1,
          category: 'sponsorship',
          attendeeInfo: [{} as never],
        },
      ];

      expect(countGrantedPasses(eventId, oneNamed)).toBe(passes);
      expect(countUsedPasses(eventId, oneNamed)).toBe(1);

      // The same order with every pass named at checkout leaves nothing to claim.
      const allNamed: TicketSelection[] = [
        ...oneNamed,
        {
          ticketId: `${sponsorship.id}-additional-pass`,
          ticketName: 'Additional Sponsor Attendee Pass',
          ticketPrice: 'Complimentary',
          quantity: passes - 1,
          isIncludedWithSponsorship: true,
          sponsorshipId: sponsorship.id,
        },
      ];

      expect(countGrantedPasses(eventId, allNamed)).toBe(passes);
      expect(countUsedPasses(eventId, allNamed)).toBe(passes);
    });

    test('a claim order does not count against its own entitlement', () => {
      test.skip(!catalogue.has(COMP_SPONSOR_PASS_ID), 'event grants no sponsor passes');

      const claimOrder: TicketSelection[] = [
        {
          ticketId: COMP_SPONSOR_PASS_ID,
          ticketName: 'Complimentary Additional Sponsor Attendee Pass',
          ticketPrice: 0,
          quantity: 1,
          category: 'sponsorship',
          attendeeInfo: [{} as never],
        },
      ];

      expect(countGrantedPasses(eventId, claimOrder)).toBe(0);
      expect(countUsedPasses(eventId, claimOrder)).toBe(0);
    });

    test('a plain attendee order grants nothing', () => {
      // `item.id` is checked because the oldest events declare registration types
      // with no id at all, which the catalogue keys under `undefined`.
      const ticket = [...catalogue.values()].find(
        (item) => item.category === 'ticket' && !!item.id
      );
      test.skip(!ticket, 'event has no plain tickets');

      const tickets: TicketSelection[] = [
        {
          ticketId: ticket!.id,
          ticketName: ticket!.title,
          ticketPrice: ticket!.price,
          quantity: 2,
          category: 'ticket',
        },
      ];

      expect(countGrantedPasses(eventId, tickets)).toBe(0);
      expect(countUsedPasses(eventId, tickets)).toBe(0);
    });
  });
}

test.describe('sponsor pass entitlement - order counters', () => {
  test('an order confirmed before the counters existed reads as unknown', () => {
    // Not as "nothing remaining": the sponsor is owed passes we cannot count, so
    // the modal says so instead of refusing them.
    expect(readEntitlement({ id: 'pi_old' })).toMatchObject({ known: false, remaining: 0 });
    expect(readEntitlement(null)).toMatchObject({ known: false });
    expect(readEntitlement({ sponsorPassesGranted: 2 })).toMatchObject({ known: false });
  });

  test('remaining is what was granted less what was spent, floored at zero', () => {
    expect(
      readEntitlement({ sponsorPassesGranted: 2, sponsorPassesUsed: 1 })
    ).toMatchObject({ known: true, remaining: 1 });

    expect(
      readEntitlement({ sponsorPassesGranted: 2, sponsorPassesUsed: 2 })
    ).toMatchObject({ known: true, remaining: 0 });

    expect(
      readEntitlement({ sponsorPassesGranted: 2, sponsorPassesUsed: 5 })
    ).toMatchObject({ known: true, remaining: 0 });
  });
});

test.describe('sponsor pass entitlement - claim planning', () => {
  const compLine = { ticketId: COMP_SPONSOR_PASS_ID, quantity: 1 };

  const validation = (orderId: string) => ({
    ticketId: COMP_SPONSOR_PASS_ID,
    ticketName: 'Complimentary Additional Sponsor Attendee Pass',
    validatedOrderId: orderId,
    validatedOrderCompany: 'Duluth Travel',
    validatedOrderEmail: 'betty@example.com',
    validatedOrderCreatedAt: '2026-01-01T00:00:00.000Z',
  });

  test('an order with no comped passes plans no claims', () => {
    const plan = planCompPassClaims([{ ticketId: 'lanyard-sponsor', quantity: 1 }], []);
    expect(plan.ok).toBe(true);
    if (plan.ok) expect(plan.claims).toHaveLength(0);
  });

  test('a comped pass without a verified order is refused', () => {
    // The line is priced at 0 by the resolver like any complimentary item, so
    // this refusal is the only thing between a crafted POST and free passes.
    expect(planCompPassClaims([compLine], []).ok).toBe(false);
    expect(
      planCompPassClaims([compLine], [{ ...validation(''), validatedOrderId: '   ' }]).ok
    ).toBe(false);
    expect(
      planCompPassClaims([compLine], [{ ...validation('pi_x'), ticketId: 'something-else' }]).ok
    ).toBe(false);
  });

  test('a verified comped pass claims against the order that unlocked it', () => {
    const plan = planCompPassClaims([compLine], [validation('pi_betty')]);
    expect(plan.ok).toBe(true);
    if (!plan.ok) return;

    expect(plan.claims).toEqual([{ orderId: 'pi_betty', count: 1 }]);
  });

  test('repeated lines against one order become a single claim', () => {
    // Two conditional updates for the same order could interleave and oversell
    // it; one update for the total cannot.
    const plan = planCompPassClaims(
      [compLine, { ticketId: COMP_SPONSOR_PASS_ID, quantity: 2 }],
      [validation('pi_betty')]
    );

    expect(plan.ok).toBe(true);
    if (!plan.ok) return;

    expect(plan.claims).toEqual([{ orderId: 'pi_betty', count: 3 }]);
  });
});
