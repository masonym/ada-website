import { test, expect } from '@playwright/test';

import {
  STRIPE_METADATA_VALUE_LIMIT,
  fitStripeMetadata,
  fitsStripeMetadata,
} from '@/lib/stripe/metadata';

/**
 * Offline - no network, no credentials.
 *
 * Stripe 400s the entire paymentIntents.create call when any one metadata value
 * runs past 500 characters, so an oversized value takes checkout down instead of
 * degrading. That is exactly what happened when a promo code was made eligible
 * for every ticket type on an event: the serialized list came to 501 characters
 * and every registration using that code failed.
 */

test.describe('fitStripeMetadata', () => {
  test('passes values at the limit through untouched', () => {
    const atLimit = 'x'.repeat(STRIPE_METADATA_VALUE_LIMIT);
    expect(fitsStripeMetadata(atLimit)).toBe(true);
    expect(fitStripeMetadata({ atLimit })).toEqual({ atLimit });
  });

  test('empties an over-limit value rather than truncating it', () => {
    const overLimit = 'x'.repeat(STRIPE_METADATA_VALUE_LIMIT + 1);
    expect(fitsStripeMetadata(overLimit)).toBe(false);

    // Truncating a JSON value would only move the failure to JSON.parse in the
    // webhook, so the field is dropped entirely.
    const fitted = fitStripeMetadata({ eligibleTicketTypes: overLimit });
    expect(fitted.eligibleTicketTypes).toBe('');
  });

  test('keeps the other keys when one is dropped', () => {
    const fitted = fitStripeMetadata({
      pendingRegistrationId: 'abc-123',
      blob: 'x'.repeat(STRIPE_METADATA_VALUE_LIMIT + 1),
      eventId: '17',
    });

    expect(fitted).toEqual({
      pendingRegistrationId: 'abc-123',
      blob: '',
      eventId: '17',
    });
  });
});

test.describe('eligible ticket types carried in metadata', () => {
  // The full list from the failing order, verbatim from the Stripe error.
  const allTicketTypes = [
    'attendee-pass',
    'vip-attendee-pass',
    'exhibit',
    'platinum-sponsor',
    'gold-sponsor',
    'silver-sponsor',
    'bronze-sponsor',
    'cybersecurity-cmmc-sponsor',
    'vip-networking-reception-sponsor',
    'coffee-station-sponsor',
    'small-business-sponsor',
    'major-panel-sponsor-navy-shipbuilding-fleet-readiness',
    'major-panel-sponsor-how-to-do-business-with-the-primes',
    'major-panel-sponsor-advanced-battlespace-technologies',
    'major-panel-sponsor-military-base-construction-energy',
    'small-business-sponsor-without-exhibit-space',
  ];

  test('the whole eligibility list is what broke the limit', () => {
    expect(JSON.stringify(allTicketTypes).length).toBe(501);
  });

  test('narrowing to the tickets in the order fits comfortably', () => {
    // What the register route now stores: only the ordered tickets that the
    // promo covers, which is all the webhook ever compares against.
    const orderedTicketIds = new Set(['attendee-pass', 'vip-attendee-pass']);
    const eligibleInOrder = allTicketTypes.filter(id => orderedTicketIds.has(id));

    expect(eligibleInOrder).toEqual(['attendee-pass', 'vip-attendee-pass']);
    expect(fitsStripeMetadata(JSON.stringify(eligibleInOrder))).toBe(true);
  });
});
