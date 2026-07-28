import { test, expect } from '@playwright/test';
import { config, isTestModeStripeKey } from './helpers/config';
import { stripe, listWebhookEndpoints } from './helpers/stripe';
import { COLUMNS, sheetTarget, sheetsClient } from './helpers/sheets';
import { getTestableItems } from './helpers/tickets';

/**
 * Fails fast, with a clear message, on anything that would make the registration
 * tests fail for environmental reasons rather than real bugs.
 */
test.describe('preflight', () => {
  test('required environment variables are set', () => {
    expect(config.eventId, 'TEST_EVENT_ID must be set').toBeTruthy();
    expect(config.stripeSecretKey, 'STRIPE_SECRET_KEY must be set').toBeTruthy();
    expect(config.stripeWebhookSecret, 'STRIPE_WEBHOOK_SECRET must be set').toBeTruthy();
    expect(config.google.clientId, 'GOOGLE_CLIENT_ID must be set').toBeTruthy();
    expect(config.google.clientSecret, 'GOOGLE_CLIENT_SECRET must be set').toBeTruthy();
    expect(config.google.refreshToken, 'GOOGLE_REFRESH_TOKEN must be set').toBeTruthy();

    console.log(`\n  base URL:      ${config.baseUrl}`);
    console.log(`  event id:      ${config.eventId}`);
    console.log(`  webhook mode:  ${config.webhookMode}`);
    console.log(`  run id:        ${config.runId}`);
    console.log(`  sheet cleanup: ${config.cleanupSheetRows ? 'on' : 'off'}\n`);
  });

  test('Stripe is in test mode and the key works', async () => {
    expect(
      isTestModeStripeKey(config.stripeSecretKey),
      'refusing to run against a live Stripe key'
    ).toBe(true);

    const balance = await stripe.balance.retrieve();
    expect(balance.livemode).toBe(false);
  });

  test('the app is running and the registration endpoints respond', async () => {
    const post = async (path: string, body: string) => {
      try {
        return await fetch(`${config.baseUrl}${path}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
        });
      } catch (error) {
        throw new Error(
          `Could not reach ${config.baseUrl}${path} - is the app running?\n` +
            `  Start it with "npm run dev", or point TEST_BASE_URL at the test environment.\n` +
            `  (${error instanceof Error ? error.message : error})`
        );
      }
    };

    const register = await post('/api/event-registration/register', '{}');
    // An empty body must be rejected by validation, not blow up.
    expect(
      [400, 404].includes(register.status),
      `expected the register endpoint to reject an empty body, got ${register.status}`
    ).toBe(true);

    const webhook = await post('/api/webhooks/stripe', '{}');
    // No stripe-signature header -> 400. Proves the route is reachable.
    expect(webhook.status, 'the Stripe webhook route is not reachable').toBe(400);
  });

  test('the webhook endpoints Stripe delivers to are understood', async () => {
    const endpoints = await listWebhookEndpoints();
    const host = new URL(config.baseUrl).host;
    const others = endpoints.filter((e) => !e.url.includes(host));

    console.log('');
    for (const endpoint of endpoints) console.log(`  Stripe delivers to: ${endpoint.url}`);

    if (config.webhookMode === 'stripe') {
      // Nothing else can deliver the event to the app under test.
      expect(
        endpoints.some((e) => e.url.includes(host)),
        `TEST_WEBHOOK_MODE=stripe but no enabled Stripe webhook endpoint points at ${host}. ` +
          'Register one, run `stripe listen --forward-to <app>/api/webhooks/stripe`, or use ' +
          'the default TEST_WEBHOOK_MODE=direct.'
      ).toBe(true);
    } else if (others.length) {
      console.log(
        `\n  NOTE: ${others.map((e) => e.url).join(', ')} also receives these payments and shares\n` +
          '  the DynamoDB de-duplication table, so it can process a test registration before the\n' +
          `  app under test does and log the row to its own spreadsheet. For the highest-fidelity\n` +
          '  run, point TEST_BASE_URL at that environment and use TEST_WEBHOOK_MODE=stripe.\n'
      );
    }
  });

  test('the event is mapped to a reachable spreadsheet with the expected columns', async () => {
    const target = sheetTarget();
    expect(target.spreadsheetId, 'no spreadsheet id resolved for this event').toBeTruthy();

    const meta = await sheetsClient().spreadsheets.get({
      spreadsheetId: target.spreadsheetId,
      fields: 'properties.title,sheets.properties(title)',
    });

    const tabs = (meta.data.sheets || []).map((s) => s.properties?.title);
    expect(
      tabs,
      `spreadsheet "${meta.data.properties?.title}" has no tab named "${target.registrationSheetName}"`
    ).toContain(target.registrationSheetName);

    const header = await sheetsClient().spreadsheets.values.get({
      spreadsheetId: target.spreadsheetId,
      range: `${target.registrationSheetName}!A1:R1`,
    });
    const headerCells = (header.data.values?.[0] || []) as string[];
    expect(
      headerCells.length,
      `expected ${COLUMNS.length} header columns, found ${headerCells.length}: ${headerCells.join(' | ')}`
    ).toBeGreaterThanOrEqual(COLUMNS.length);

    console.log(`\n  spreadsheet: ${meta.data.properties?.title} (${target.spreadsheetId})`);
    console.log(`  tab:         ${target.registrationSheetName}\n`);
  });

  test('the event has purchasable registration types configured', () => {
    const items = getTestableItems(config.eventId);
    expect(items.length, `no registration types found for event ${config.eventId}`).toBeGreaterThan(0);

    console.log('');
    for (const item of items) {
      const price = item.isComplimentary ? 'complimentary' : `$${item.expectedPrice}`;
      const status = item.skipReason ? `SKIPPED - ${item.skipReason}` : 'testable';
      console.log(`  ${item.id.padEnd(34)} ${price.padEnd(14)} ${status}`);
    }
    console.log('');

    expect(
      items.some((item) => !item.skipReason),
      'every registration type for this event is sold out, inactive or past its sale end time'
    ).toBe(true);
  });
});
