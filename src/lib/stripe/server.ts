import Stripe from 'stripe';
import { getEnv } from '../env';

const env = getEnv();

// Initialize Stripe with the server-side secret key
export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-04-30.basil', // Match Stripe's expected API version
  typescript: true,
});

/**
 * Creates a payment intent with Stripe.
 * @param amount Amount in cents (integer)
 * @param metadata Optional metadata to attach to the payment intent
 * @param captureMethod 'automatic' (default) or 'manual' - determines if payment is automatically captured
 * @param statementDescriptorSuffix Optional suffix for statement descriptor (for card payments)
 * @returns Object containing the payment intent client secret and ID
 */
export async function createPaymentIntent(
  amount: number,
  metadata: Record<string, any> = {},
  captureMethod: 'automatic' | 'manual' = 'automatic',
  statementDescriptorSuffix?: string
) {
  try {
    // Ensure amount is an integer
    if (!Number.isInteger(amount)) {
      console.warn('Payment amount was not an integer, rounding:', amount);
      amount = Math.round(amount);
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata,
      capture_method: captureMethod,
      automatic_payment_methods: {
        enabled: true,
      },
      // statement_descriptor_suffix: statementDescriptorSuffix,
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw new Error(`Failed to create payment intent: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function capturePayment(paymentIntentId: string) {
  try {
    return await stripe.paymentIntents.capture(paymentIntentId);
  } catch (error) {
    console.error('Error capturing payment:', error);
    throw new Error('Failed to capture payment');
  }
}

export async function cancelPayment(paymentIntentId: string) {
  try {
    return await stripe.paymentIntents.cancel(paymentIntentId);
  } catch (error) {
    console.error('Error canceling payment:', error);
    throw new Error('Failed to cancel payment');
  }
}

export async function createPromotionCode(
  couponId: string,
  code: string,
  options: Omit<Stripe.PromotionCodeCreateParams, 'coupon' | 'code'> = {}
) {
  try {
    return await stripe.promotionCodes.create({
      coupon: couponId,
      code,
      // Spread remaining options, ensuring we don't overwrite coupon and code
      ...options,
    });
  } catch (error) {
    console.error('Error creating promotion code:', error);
    throw new Error(`Failed to create promotion code: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function validatePromoCode(code: string) {
  try {
    const promotionCodes = await stripe.promotionCodes.list({
      code,
      active: true,
      limit: 1, // Only need one match
    });

    if (promotionCodes.data.length === 0) {
      return { valid: false, error: 'Promo code not found' };
    }

    const promotionCode = promotionCodes.data[0];
    const now = Math.floor(Date.now() / 1000);

    // Check if promo code is expired
    if (promotionCode.expires_at && promotionCode.expires_at < now) {
      return { valid: false, error: 'Promo code has expired' };
    }

    // Check if promo code has max redemptions
    if (
      promotionCode.max_redemptions &&
      promotionCode.times_redeemed >= promotionCode.max_redemptions
    ) {
      return { valid: false, error: 'Promo code has reached maximum redemptions' };
    }

    // Expand coupon data if needed
    let couponData = promotionCode.coupon;
    if (typeof couponData === 'string') {
      try {
        const couponDetails = await stripe.coupons.retrieve(couponData);
        couponData = couponDetails;
      } catch (couponError) {
        console.error('Error fetching coupon details:', couponError);
        // Continue with string coupon ID if retrieval fails
      }
    }

    return {
      valid: true,
      promotionCode,
      coupon: typeof couponData === 'object' ? couponData : null,
    };
  } catch (error) {
    console.error('Error validating promo code:', error);
    return { valid: false, error: 'Error validating promo code' };
  }
}

/**
 * Handles Stripe webhook events
 * @param body Raw request body (string)
 * @param signature Stripe signature from request header
 * @returns The parsed Stripe event if signature verification succeeds
 */
export async function handleWebhook(body: string, signature: string) {
  try {
    // Verify the webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;
      // Add other event types as needed
    }

    return event;
  } catch (error) {
    console.error('Error handling webhook:', error);
    throw new Error(`Webhook error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Handles successful payment intents
 * @param paymentIntent The payment intent object from Stripe
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Extract metadata from the payment intent
    const { eventId, orderType, email } = paymentIntent.metadata;

    console.log(`Payment succeeded for ${orderType} with ID: ${paymentIntent.id}`);
    console.log(`Event: ${eventId}, Email: ${email}`);

    // Here you would typically:
    // 1. Update your database to mark the order as paid
    // 2. Send confirmation emails
    // 3. Generate tickets or update inventory
    
    // This function is called by the webhook handler, so any
    // post-payment processing should happen here
  } catch (error) {
    console.error('Error processing successful payment:', error);
  }
}

/**
 * Handles failed payment intents
 * @param paymentIntent The payment intent object from Stripe
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Extract metadata from the payment intent
    const { eventId, orderType, email } = paymentIntent.metadata;

    console.log(`Payment failed for ${orderType} with ID: ${paymentIntent.id}`);
    console.log(`Event: ${eventId}, Email: ${email}`);
    console.log(`Failure reason: ${paymentIntent.last_payment_error?.message || 'Unknown'}`);

    // Here you would typically:
    // 1. Update your database to mark the payment as failed
    // 2. Send notification emails to customer and/or admin
    // 3. Log the failure for review
  } catch (error) {
    console.error('Error processing failed payment:', error);
  }
}
