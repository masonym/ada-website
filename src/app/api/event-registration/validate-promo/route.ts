import { NextResponse } from 'next/server';
import { validatePromoCode, isEligibleForPromoDiscount } from '@/lib/promo-codes';
import { validatePromoCodeFromSanity } from '@/lib/sanity';

// In-memory cache for promo codes
const promoCodeCache = new Map<string, { valid: boolean; promoDetails?: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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

    const eventIdNum = typeof eventId === 'string' ? parseInt(eventId) : eventId;

    // Create cache key that includes event ID for event-specific validation
    const cacheKey = `${promoCode.toUpperCase()}-${eventId}`;
    
    // Check cache first (with TTL)
    const cachedPromo = promoCodeCache.get(cacheKey);
    if (cachedPromo && (Date.now() - cachedPromo.timestamp) < CACHE_TTL) {
      if (cachedPromo.valid && cachedPromo.promoDetails) {
        // Check if the cached promo is expired
        const now = new Date();
        const expDate = new Date(cachedPromo.promoDetails.expirationDate);
        if (now > expDate) {
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

    // Try Sanity first, then fall back to legacy
    let validationResult = await validatePromoCodeFromSanity(promoCode, eventIdNum);
    
    // If not found in Sanity, try legacy promo codes
    if (!validationResult.valid && validationResult.reason === 'invalid') {
      const legacyResult = validatePromoCode(promoCode, eventId);
      if (legacyResult.valid && legacyResult.promoDetails) {
        validationResult = {
          valid: true,
          promoDetails: {
            _id: 'legacy',
            code: legacyResult.promoDetails.code,
            discountPercentage: legacyResult.promoDetails.discountPercentage,
            eligibleTicketTypes: legacyResult.promoDetails.eligibleTicketTypes,
            eligibleEventIds: legacyResult.promoDetails.eligibleEventIds.map(id => typeof id === 'string' ? parseInt(id) : id),
            expirationDate: legacyResult.promoDetails.expirationDate.toISOString(),
            description: legacyResult.promoDetails.description,
            isActive: legacyResult.promoDetails.isActive,
            autoApply: legacyResult.promoDetails.autoApply || false,
          }
        };
      } else if (!legacyResult.valid) {
        validationResult = { valid: false, reason: legacyResult.reason };
      }
    }
    
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
    
    // Cache the promo code validation (with event-specific key)
    promoCodeCache.set(cacheKey, {
      valid: true,
      promoDetails,
      timestamp: Date.now()
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
