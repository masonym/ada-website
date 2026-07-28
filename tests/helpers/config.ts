import path from 'path';
import dotenv from 'dotenv';

// Load env files the same way Next does, most specific first.
// dotenv never overrides an already-set variable, so this order is the precedence order.
for (const file of ['.env.test.local', '.env.local', '.env']) {
  dotenv.config({ path: path.resolve(process.cwd(), file) });
}

/**
 * Every row these tests create is tagged with this prefix so it can be found and
 * deleted again. Rows are tagged either in the Company column (tickets that collect
 * attendee info) or in the "Validated against" column (line items that don't).
 */
export const TEST_ROW_MARKER = 'ADA QA TEST';

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}. See tests/README.md for the setup steps.`
    );
  }
  return value;
}

/** Short, sortable id that ties every artifact of one run together. */
export const RUN_ID = `${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random()
  .toString(36)
  .slice(2, 7)
  .toUpperCase()}`;

export const config = {
  /** The app under test. Point this at the test environment, not production. */
  baseUrl: (
    process.env.TEST_BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'http://localhost:3000'
  ).replace(/\/$/, ''),

  /** Event id from src/constants/registrations.ts - the event being launched. */
  get eventId(): string {
    return required('TEST_EVENT_ID');
  },

  /** Only used in the Stripe payment description, so a placeholder is fine. */
  eventTitle: process.env.TEST_EVENT_TITLE || `Test Event ${process.env.TEST_EVENT_ID}`,

  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',

  /**
   * How payment_intent.succeeded reaches the app:
   *  - 'direct' (default): the test signs the event with STRIPE_WEBHOOK_SECRET and posts
   *    it to /api/webhooks/stripe itself. No extra setup, works against localhost.
   *  - 'stripe': the test only confirms the payment and waits, relying on a real Stripe
   *    delivery (`stripe listen --forward-to ...` or a registered endpoint on the test
   *    environment). Use this to prove the webhook plumbing itself is wired up.
   */
  webhookMode: (process.env.TEST_WEBHOOK_MODE || 'direct') as 'direct' | 'stripe',

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN || '',
  },

  /** Domains used for generated attendee emails. Nothing is expected to be delivered. */
  emailDomain: process.env.TEST_EMAIL_DOMAIN || 'ada-qa.example.com',
  govEmailDomain: process.env.TEST_GOV_EMAIL_DOMAIN || 'ada-qa.example.gov',

  /** Delete the rows this run wrote to the sheet when the run finishes. */
  cleanupSheetRows: process.env.TEST_CLEANUP_SHEET_ROWS !== 'false',

  /** Optional: set to also exercise the promo code discount path. */
  promoCode: process.env.TEST_PROMO_CODE || '',

  /** How long to wait for a registration to show up in the sheet. */
  sheetTimeoutMs: Number(process.env.TEST_SHEET_TIMEOUT_MS || 90_000),

  runId: RUN_ID,
};

export function isTestModeStripeKey(key: string): boolean {
  return key.startsWith('sk_test_');
}
