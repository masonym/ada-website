import Stripe from 'stripe';
import { getEnv } from '../env';

const env = getEnv();

// Initialize Stripe with the server-side secret key
export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16', // Use the latest API version
  typescript: true,
});

export async function createPaymentIntent(amount: number, metadata: Record<string, any> = {}) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata,
      // Ensure that the payment is captured later after all validations
      capture_method: 'manual',
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw new Error('Failed to create payment intent');
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
  options: Stripe.PromotionCodeCreateParams = {}
) {
  try {
    return await stripe.promotionCodes.create({
      coupon: couponId,
      code,
      ...options,
    });
  } catch (error) {
    console.error('Error creating promotion code:', error);
    throw new Error('Failed to create promotion code');
  }
}

export async function validatePromoCode(code: string) {
  try {
    const promotionCodes = await stripe.promotionCodes.list({
      code,
      active: true,
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

    return { 
      valid: true, 
      promotionCode,
      coupon: typeof promotionCode.coupon === 'object' ? promotionCode.coupon : null,
    };
  } catch (error) {
    console.error('Error validating promo code:', error);
    return { valid: false, error: 'Error validating promo code' };
  }
}
