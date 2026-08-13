/**
 * Stripe rejects an entire request if any single metadata value is longer than
 * 500 characters, so an oversized value fails checkout rather than degrading. A
 * promo code eligible for every ticket type on a large event did exactly that:
 * the serialized `eligibleTicketTypes` list came to 501 characters and every
 * registration using it 500'd.
 *
 * Kept free of the Stripe SDK (and therefore of server env) so it can be tested
 * offline.
 */
export const STRIPE_METADATA_VALUE_LIMIT = 500;

export function fitsStripeMetadata(value: string): boolean {
  return value.length <= STRIPE_METADATA_VALUE_LIMIT;
}

/**
 * Drops any metadata value that would blow the limit, leaving an empty string in
 * its place. Dropping rather than truncating keeps JSON-encoded values parseable
 * on the webhook side - a half-a-JSON-array value would only move the failure.
 */
export function fitStripeMetadata(
  metadata: Record<string, string>,
  context = 'stripe'
): Record<string, string> {
  const fitted: Record<string, string> = {};

  for (const [key, value] of Object.entries(metadata)) {
    if (fitsStripeMetadata(value)) {
      fitted[key] = value;
      continue;
    }

    console.warn(
      `[${context}] Dropping metadata "${key}": ${value.length} characters exceeds Stripe's ${STRIPE_METADATA_VALUE_LIMIT}-character limit`
    );
    fitted[key] = '';
  }

  return fitted;
}
