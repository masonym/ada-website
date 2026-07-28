import { test, expect } from '@playwright/test';
import { config } from './helpers/config';
import { buildOrder, submitRegistration, OrderLine } from './helpers/payload';
import { payAndNotify, stripe, confirmPayment, TEST_CARDS } from './helpers/stripe';
import { readRows, rowsForMarker, waitForRows, SheetRow } from './helpers/sheets';
import {
  getPurchasableItems,
  getComplimentaryItems,
  expectedNetAmount,
  TestableItem,
} from './helpers/tickets';

/**
 * End-to-end registration checks for a newly launched event.
 *
 * For every purchasable ticket / exhibit / sponsorship option this:
 *   1. posts the same payload the registration modal posts,
 *   2. checks the PaymentIntent Stripe created has the right amount and metadata,
 *   3. pays it with a Stripe test card,
 *   4. verifies the rows that land in the event's Google Sheet.
 *
 * Rows are tagged with a run marker and removed again by the global teardown.
 */

const eventId = config.eventId;
const purchasable = getPurchasableItems(eventId);
const complimentary = getComplimentaryItems(eventId);

/** Shared per-row assertions. */
function assertRow(
  row: SheetRow,
  expected: { ticketTitle: string; netAmount: number; orderTotal: number; promoCode?: string }
) {
  expect(row.ticketType, 'ticket name logged to the sheet').toBe(expected.ticketTitle);
  expect(row.amountNumber, `net amount for "${expected.ticketTitle}"`).toBeCloseTo(
    expected.netAmount,
    2
  );
  expect(row.orderTotalNumber, 'order total').toBeCloseTo(expected.orderTotal, 2);
  expect(row.promoCode).toBe(expected.promoCode ?? '');
}

async function payFor(lines: OrderLine[], label: string, promoCode?: string) {
  const order = buildOrder(lines, label, promoCode);
  const { status, json } = await submitRegistration(order.body);

  expect(
    status,
    `register endpoint rejected the order: ${JSON.stringify(json.errors ?? json.error ?? json)}`
  ).toBe(200);
  expect(json.success).toBe(true);
  expect(json.clientSecret, 'expected a paid order to return a Stripe client secret').toBeTruthy();

  return { order, result: json };
}

test.describe(`event ${eventId} - paid registrations`, () => {
  for (const item of purchasable) {
    test(`${item.category}: ${item.title} ($${item.expectedPrice})`, async () => {
      const line: OrderLine = { item, quantity: 1 };
      const { order, result } = await payFor([line], item.id);

      await test.step('Stripe charges the configured price', async () => {
        expect(result.amount, 'amount charged does not match the configured price').toBeCloseTo(
          item.expectedPrice,
          2
        );

        const intent = await stripe.paymentIntents.retrieve(result.paymentIntentId);
        expect(intent.amount, 'Stripe payment intent amount (cents)').toBe(
          Math.round(item.expectedPrice * 100)
        );
        expect(intent.currency).toBe('usd');
        expect(intent.metadata.eventId).toBe(String(eventId));
        expect(intent.metadata.orderType).toBe('event-registration');
        expect(intent.metadata.email).toBe(order.buyerEmail);
        expect(
          intent.metadata.pendingRegistrationId,
          'no pending registration was saved - the webhook would have nothing to log'
        ).toBeTruthy();
        expect(intent.receipt_email).toBe(order.buyerEmail);
      });

      await test.step('the payment succeeds with a test card', async () => {
        await payAndNotify(result.paymentIntentId);
      });

      await test.step('the registration reaches the Google Sheet', async () => {
        const rows = await waitForRows(order.marker, line.quantity);
        expect(rows).toHaveLength(line.quantity);

        for (const row of rows) {
          assertRow(row, {
            ticketTitle: item.title,
            netAmount: expectedNetAmount(item.expectedPrice),
            orderTotal: item.expectedPrice,
          });

          if (item.requiresAttendeeInfo) {
            expect(order.attendeeEmails).toContain(row.email);
            expect(row.firstName).toBe('ADA');
            expect(row.phone.replace(/\D/g, ''), 'phone digits').toBe('5550101234');
            expect(row.jobTitle).toBe('Automated Test Account');
            expect(row.industry).toBe('Test Automation');
            expect(row.businessSize).toBe('Small Business');
          } else {
            expect(row.email, 'line items without attendee info log blank attendee columns').toBe('');
            expect(row.validatedAgainst).toContain(order.marker);
          }
        }
      });
    });
  }
});

test.describe(`event ${eventId} - complimentary registrations`, () => {
  for (const item of complimentary) {
    test(`${item.title} is free and logged without a payment`, async () => {
      const order = buildOrder([{ item, quantity: 1 }], item.id);
      const { status, json } = await submitRegistration(order.body);

      expect(
        status,
        `register endpoint rejected the order: ${JSON.stringify(json.errors ?? json.error ?? json)}`
      ).toBe(200);
      expect(json.success).toBe(true);
      expect(json.clientSecret, 'a complimentary ticket must not require payment').toBeFalsy();
      expect(json.paymentStatus).toBe('free');
      expect(json.amountPaid).toBe(0);
      expect(json.orderId).toBeTruthy();

      const rows = await waitForRows(order.marker, 1, 30_000);
      expect(rows).toHaveLength(1);
      assertRow(rows[0], { ticketTitle: item.title, netAmount: 0, orderTotal: 0 });
      expect(order.attendeeEmails).toContain(rows[0].email);
    });

    test(`${item.title} rejects a non gov/mil email`, async () => {
      const order = buildOrder(
        [{ item, quantity: 1, attendeeEmails: [`ada-qa+${config.runId}-nongov@gmail.com`] }],
        `${item.id}-nongov`
      );
      const { status, json } = await submitRegistration(order.body);

      expect(status, 'a commercial email should not be accepted for a gov/mil pass').toBe(400);
      expect(json.success).toBe(false);
      expect(JSON.stringify(json.errors ?? json.error)).toMatch(/gov|mil/i);
    });
  }
});

test.describe(`event ${eventId} - multi-item order`, () => {
  const attendeeItems = purchasable.filter((i) => i.requiresAttendeeInfo);

  test.skip(attendeeItems.length < 2, 'needs at least two attendee ticket types');

  test('multiple ticket types and quantities in one order', async () => {
    const [first, second] = attendeeItems;
    const lines: OrderLine[] = [
      { item: first, quantity: 2 },
      { item: second, quantity: 1 },
    ];
    const expectedTotal = first.expectedPrice * 2 + second.expectedPrice;

    const { order, result } = await payFor(lines, 'multi');
    expect(result.amount).toBeCloseTo(expectedTotal, 2);

    await payAndNotify(result.paymentIntentId);

    const rows = await waitForRows(order.marker, 3);
    expect(rows).toHaveLength(3);

    const byTicket = (title: string) => rows.filter((r) => r.ticketType === title);
    expect(byTicket(first.title), `expected 2 rows for ${first.title}`).toHaveLength(2);
    expect(byTicket(second.title), `expected 1 row for ${second.title}`).toHaveLength(1);

    for (const row of byTicket(first.title)) {
      assertRow(row, {
        ticketTitle: first.title,
        netAmount: expectedNetAmount(first.expectedPrice),
        orderTotal: expectedTotal,
      });
    }
    assertRow(byTicket(second.title)[0], {
      ticketTitle: second.title,
      netAmount: expectedNetAmount(second.expectedPrice),
      orderTotal: expectedTotal,
    });

    const emails = rows.map((r) => r.email);
    expect(new Set(emails).size, 'each attendee should get their own row').toBe(3);
  });
});

test.describe(`event ${eventId} - promo code`, () => {
  test(`${config.promoCode || 'promo code'} discounts the order and the logged amounts`, async () => {
    test.skip(!config.promoCode, 'set TEST_PROMO_CODE to exercise the discount path');

    const item = purchasable.find((i) => i.requiresAttendeeInfo) as TestableItem;
    const { order, result } = await payFor([{ item, quantity: 1 }], 'promo', config.promoCode);

    const discount = item.expectedPrice - result.amount;
    expect(discount, 'the promo code did not reduce the total').toBeGreaterThan(0);

    const intent = await stripe.paymentIntents.retrieve(result.paymentIntentId);
    expect(intent.metadata.promoCode).toBe(config.promoCode);
    expect(Number(intent.metadata.discountAmount)).toBeCloseTo(discount, 2);

    await payAndNotify(result.paymentIntentId);

    const rows = await waitForRows(order.marker, 1);
    // logRegistration spreads the discount across paid tickets by value.
    const discountRatio = discount / item.expectedPrice;
    assertRow(rows[0], {
      ticketTitle: item.title,
      netAmount: expectedNetAmount(item.expectedPrice, discountRatio),
      orderTotal: result.amount,
      promoCode: config.promoCode,
    });
  });

  test('an unknown promo code is rejected', async () => {
    const item = purchasable[0];
    const order = buildOrder([{ item, quantity: 1 }], 'bad-promo', `NOT-A-REAL-CODE-${config.runId}`);
    const { status, json } = await submitRegistration(order.body);

    expect(status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.errors?.promoCode).toBeTruthy();
  });
});

test.describe(`event ${eventId} - failed payment`, () => {
  test('a declined card logs nothing to the sheet', async () => {
    const item = purchasable[0];
    const { order, result } = await payFor([{ item, quantity: 1 }], 'declined');

    await expect(
      confirmPayment(result.paymentIntentId, TEST_CARDS.declined),
      'the declined test card should not produce a successful payment'
    ).rejects.toThrow(/declined/i);

    const intent = await stripe.paymentIntents.retrieve(result.paymentIntentId);
    expect(intent.status).not.toBe('succeeded');

    // Give any stray webhook time to arrive before asserting the sheet stayed clean.
    await new Promise((resolve) => setTimeout(resolve, 10_000));
    const rows = rowsForMarker(await readRows(true), order.marker);
    expect(rows, 'a failed payment must not create registration rows').toHaveLength(0);
  });
});
