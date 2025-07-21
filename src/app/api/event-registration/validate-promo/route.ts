import { NextResponse } from 'next/server';
import { validatePromoCode, isEligibleForPromoDiscount } from '@/lib/promo-codes';

// In-memory cache for promo codes (in a real app, use a database or cache like Redis)
const promoCodeCache = new Map<string, { valid: boolean; promoDetails?: any }>();

export async function POST(request: Request) {
  try {
    const { promoCode, eventId, tickets } = await request.json();
    
    if (!promoCode) {
      return NextResponse.json(
        { valid: false, error: 'Promo code is required' },
        { status: 400 }
      );
    }

    if (!eventId) {
      return NextResponse.json(
        { valid: false, error: 'Event ID is required' },
        { status: 400 }
      );
    }

    // Create cache key that includes event ID for event-specific validation
    const cacheKey = `${promoCode}-${eventId}`;
    
    // Check cache first
    const cachedPromo = promoCodeCache.get(cacheKey);
    if (cachedPromo) {
      if (cachedPromo.valid && cachedPromo.promoDetails) {
        // Check if the cached promo is expired
        const now = new Date();
        if (now > cachedPromo.promoDetails.expirationDate) {
          promoCodeCache.delete(cacheKey);
          return NextResponse.json({
            valid: false,
            error: 'Promo code has expired',
          });
        }
        
        return NextResponse.json({
          valid: true,
          discountPercentage: cachedPromo.promoDetails.discountPercentage,
          eligibleTicketTypes: cachedPromo.promoDetails.eligibleTicketTypes,
          description: cachedPromo.promoDetails.description
        });
      }
    }

    // Validate the promo code for this specific event
    const validationResult = validatePromoCode(promoCode, eventId);
    
    if (!validationResult.valid) {
      let errorMessage = 'Invalid promo code';
      if (validationResult.reason === 'expired') {
        errorMessage = 'Promo code has expired';
      } else if (validationResult.reason === 'not_valid_for_event') {
        errorMessage = 'This promo code is not valid for this event';
      }
      
      return NextResponse.json({
        valid: false,
        error: errorMessage,
      }, { status: 400 });
    }
    
    // At this point, we know the promo code is valid for this event
    const promoDetails = validationResult.promoDetails!;
    
    // Check if the tickets are eligible for this promo code
    if (tickets && tickets.length > 0) {
      let hasEligibleTicket = false;
      
      for (const ticket of tickets) {
        if (isEligibleForPromoDiscount(ticket.ticketId, promoDetails.eligibleTicketTypes)) {
          hasEligibleTicket = true;
          break;
        }
      }
      
      if (!hasEligibleTicket) {
        return NextResponse.json({
          valid: false,
          error: 'This promo code is not applicable to any of the selected tickets',
        }, { status: 400 });
      }
    }
    
    // Cache the promo code validation for 1 hour (with event-specific key)
    promoCodeCache.set(cacheKey, {
      valid: true,
      promoDetails
    });
    
    return NextResponse.json({
      valid: true,
      discountPercentage: promoDetails.discountPercentage,
      eligibleTicketTypes: promoDetails.eligibleTicketTypes,
      description: promoDetails.description
    });

  } catch (error) {
    console.error('Error validating promo code:', error);
    return NextResponse.json(
      { valid: false, error: 'An error occurred while validating the promo code' },
      { status: 500 }
    );
  }
}
