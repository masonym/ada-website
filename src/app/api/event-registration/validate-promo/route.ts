import { NextResponse } from 'next/server';
import { validatePromoCodeForOrder } from '@/lib/promo-codes/validate';

/**
 * Promo-code check for the registration modal.
 *
 * The logic lives in lib/promo-codes/validate so the register handler can call
 * it in-process instead of making an HTTP request to this route. The in-memory
 * TTL cache that used to sit here has been dropped: on Workers and Lambda the
 * module scope is per-isolate and cold far more often than warm, so it rarely
 * hit, and Sanity's own CDN already fronts the query.
 */
export async function POST(request: Request) {
  try {
    const { promoCode, eventId, tickets } = await request.json();

    const result = await validatePromoCodeForOrder(promoCode, eventId, tickets);

    if (!result.valid) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error validating promo code:', error);
    return NextResponse.json(
      { valid: false, error: 'An error occurred while validating the promo code' },
      { status: 500 }
    );
  }
}
