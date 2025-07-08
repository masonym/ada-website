import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';

// In-memory cache for promo codes (in a real app, use a database or cache like Redis)
const promoCodeCache = new Map<string, { valid: boolean; discountAmount?: number; discountPercentage?: number; expiresAt?: number }>();

export async function POST(request: Request) {
  try {
    const { promoCode, eventId, tickets } = await request.json();
    
    if (!promoCode) {
      return NextResponse.json(
        { valid: false, error: 'Promo code is required' },
        { status: 400 }
      );
    }

    // Check cache first
    const cachedPromo = promoCodeCache.get(promoCode);
    if (cachedPromo) {
      // Check if the cached promo is expired
      if (cachedPromo.expiresAt && cachedPromo.expiresAt < Date.now()) {
        promoCodeCache.delete(promoCode);
        return NextResponse.json({
          valid: false,
          error: 'Promo code has expired',
        });
      }
      
      return NextResponse.json({
        valid: true,
        discountAmount: cachedPromo.discountAmount,
        discountPercentage: cachedPromo.discountPercentage,
      });
    }

    // In a real app, you would validate the promo code against your database
    // For this example, we'll use a simple hardcoded promo code
    const validPromoCodes = [
      {
        code: 'EARLYBIRD',
        discountPercentage: 20, // 20% off
        expiresAt: new Date('2024-12-31T23:59:59Z').getTime(),
        minTickets: 1,
      },
      {
        code: 'GROUP10',
        discountPercentage: 10, // 10% off for groups of 5 or more
        minTickets: 5,
      },
      {
        code: 'FREEPASS',
        discountAmount: 100000, // $1000 off (effectively free for most events)
        maxUses: 10,
        uses: 0, // Track usage
      },
    ];

    const promo = validPromoCodes.find(p => p.code === promoCode);
    
    if (!promo) {
      return NextResponse.json(
        { valid: false, error: 'Invalid promo code' },
        { status: 400 }
      );
    }

    // Check if promo code has expired
    if (promo.expiresAt && promo.expiresAt < Date.now()) {
      return NextResponse.json({
        valid: false,
        error: 'Promo code has expired',
      });
    }

    // Check minimum ticket requirement
    if (promo.minTickets) {
      const totalTickets = tickets.reduce((sum: number, t: any) => sum + t.quantity, 0);
      if (totalTickets < promo.minTickets) {
        return NextResponse.json({
          valid: false,
          error: `This promo code requires a minimum of ${promo.minTickets} tickets`,
        });
      }
    }

    // Check max uses for the promo code
    if (promo.maxUses !== undefined && promo.uses !== undefined && promo.uses >= promo.maxUses) {
      return NextResponse.json({
        valid: false,
        error: 'This promo code has reached its maximum number of uses',
      });
    }

    // Cache the promo code validation for 1 hour
    promoCodeCache.set(promoCode, {
      valid: true,
      discountAmount: promo.discountAmount,
      discountPercentage: promo.discountPercentage,
      expiresAt: promo.expiresAt || Date.now() + 3600000, // 1 hour from now
    });

    // Increment uses if tracking
    if (promo.uses !== undefined) {
      promo.uses += 1;
    }

    return NextResponse.json({
      valid: true,
      discountAmount: promo.discountAmount,
      discountPercentage: promo.discountPercentage,
    });

  } catch (error) {
    console.error('Error validating promo code:', error);
    return NextResponse.json(
      { 
        valid: false, 
        error: 'An error occurred while validating the promo code',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
