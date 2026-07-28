import Stripe from 'stripe';
import { config, isTestModeStripeKey } from './config';

if (config.stripeSecretKey && !isTestModeStripeKey(config.stripeSecretKey)) {
  throw new Error(
    'STRIPE_SECRET_KEY is not a test-mode key (sk_test_...). These tests create and ' +
      'confirm real payments - refusing to run against live Stripe.'
  );
}

export const stripe = new Stripe(config.stripeSecretKey, {
  apiVersion: '2025-04-30.basil',
  typescript: true,
});

/** Stripe's shared test payment method tokens. */
export const TEST_CARDS = {
  visa: 'pm_card_visa',
  mastercard: 'pm_card_mastercard',
  amex: 'pm_card_amex',
  declined: 'pm_card_chargeDeclined',
} as const;

export async function confirmPayment(
  paymentIntentId: string,
  paymentMethod: string = TEST_CARDS.visa
): Promise<Stripe.PaymentIntent> {
  return stripe.paymentIntents.confirm(paymentIntentId, {
    payment_method: paymentMethod,
    return_url: `${config.baseUrl}/registration-complete`,
  });
}

/**
 * Delivers a signed payment_intent.succeeded event straight to the app's webhook route.
 *
 * Used in the default 'direct' webhook mode so the suite runs without `stripe listen`.
 * The payment itself is a genuine Stripe payment; only the delivery hop is simulated.
 * The handler is idempotent (it checks DynamoDB for an already-confirmed registration),
 * so this is safe even if a real Stripe delivery also arrives.
 */
export async function deliverPaymentSucceededWebhook(
  paymentIntent: Stripe.PaymentIntent
): Promise<Response> {
  if (!config.stripeWebhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is required for TEST_WEBHOOK_MODE=direct');
  }

  const payload = JSON.stringify({
    id: `evt_test_${paymentIntent.id}`,
    object: 'event',
    api_version: '2025-04-30.basil',
    created: Math.floor(Date.now() / 1000),
    livemode: false,
    pending_webhooks: 0,
    request: { id: null, idempotency_key: null },
    type: 'payment_intent.succeeded',
    data: { object: paymentIntent },
  });

  const signature = stripe.webhooks.generateTestHeaderString({
    payload,
    secret: config.stripeWebhookSecret,
  });

  const response = await fetch(`${config.baseUrl}/api/webhooks/stripe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'stripe-signature': signature },
    body: payload,
  });

  if (!response.ok) {
    throw new Error(
      `Webhook route rejected the signed event (${response.status}): ${await response.text()}. ` +
        'Check that STRIPE_WEBHOOK_SECRET matches the one the app is running with.'
    );
  }

  return response;
}

let warmed = false;

/**
 * Compiles / wakes the webhook route before the first payment exists.
 *
 * In 'direct' mode the test is racing Stripe's own delivery to any registered endpoint
 * (see `listWebhookEndpoints`): whichever instance processes the payment first wins,
 * because the handler dedupes on the payment intent id in DynamoDB. A cold Next dev route
 * takes seconds to compile and reliably loses that race.
 */
export async function warmUpWebhookRoute(): Promise<void> {
  if (warmed) return;
  warmed = true;
  try {
    await fetch(`${config.baseUrl}/api/webhooks/stripe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    });
  } catch {
    // Reachability is asserted by the preflight spec; nothing to do here.
  }
}

/** Webhook endpoints Stripe will also deliver to, in this account and mode. */
export async function listWebhookEndpoints(): Promise<{ url: string; status: string }[]> {
  const endpoints = await stripe.webhookEndpoints.list({ limit: 100 });
  return endpoints.data
    .filter((e) => e.status === 'enabled')
    .map((e) => ({ url: e.url ?? '', status: e.status ?? '' }));
}

/**
 * Confirms the payment and makes sure the app has been told about it, in whichever
 * webhook mode is configured.
 */
export async function payAndNotify(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
  if (config.webhookMode === 'direct') await warmUpWebhookRoute();

  const confirmed = await confirmPayment(paymentIntentId);

  if (confirmed.status !== 'succeeded') {
    throw new Error(
      `Payment intent ${paymentIntentId} ended in status "${confirmed.status}" instead of "succeeded".`
    );
  }

  if (config.webhookMode === 'direct') {
    await deliverPaymentSucceededWebhook(confirmed);
  }

  return confirmed;
}
