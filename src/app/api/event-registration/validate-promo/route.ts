import { NextResponse } from 'next/server';

// Define promo code type to match frontend
interface PromoCode {
  code: string;
  discountPercentage: number;
  eligibleTicketTypes: string[];
  expirationDate: Date;
  description?: string;
}

// In-memory cache for promo codes (in a real app, use a database or cache like Redis)
const promoCodeCache = new Map<string, { valid: boolean; promoDetails?: PromoCode }>();

// Define available promo codes - MUST MATCH THE FRONTEND DEFINITIONS
const PROMO_CODES: PromoCode[] = [
  {
    code: 'ACEC15',
    discountPercentage: 15,
    eligibleTicketTypes: ['attendee-pass', 'vip-attendee-pass', 'Attendee Pass', 'VIP Attendee Pass'],
    expirationDate: new Date('2025-12-31'),
    description: 'ACEC15 - 15% off Attendee and VIP Attendee passes'
  },
  {
    code: 'ADA20',
    discountPercentage: 20,
    eligibleTicketTypes: ['attendee-pass', 'vip-attendee-pass', 'Attendee Pass', 'VIP Attendee Pass'],
    expirationDate: new Date('2025-12-31'),
    description: 'ADA20 - 20% off Attendee and VIP Attendee passes'
  },
  {
    code: 'EARLY10',
    discountPercentage: 10,
    eligibleTicketTypes: ['attendee-pass', 'vip-attendee-pass', 'Attendee Pass', 'VIP Attendee Pass'],
    expirationDate: new Date('2025-08-01'),
    description: 'EARLY10 - 10% off all passes and Basic Exhibitor Package'
  }
];

// Function to validate the promo code - similar to frontend
const isValidPromoCode = (code: string): { valid: boolean; reason?: string; promoDetails?: PromoCode } => {
  // Find the promo code in our list
  const promoCode = PROMO_CODES.find(promo => promo.code === code);
  
  // Check if code exists
  if (!promoCode) {
    return { valid: false, reason: 'invalid' };
  }
  
  // Check if code is expired
  const now = new Date();
  if (now > promoCode.expirationDate) {
    return { valid: false, reason: 'expired' };
  }
  
  // If we reach here, the code is valid
  return { valid: true, promoDetails: promoCode };
};

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
      if (cachedPromo.valid && cachedPromo.promoDetails) {
        // Check if the cached promo is expired
        const now = new Date();
        if (now > cachedPromo.promoDetails.expirationDate) {
          promoCodeCache.delete(promoCode);
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

    // Validate the promo code using same logic as frontend
    const validationResult = isValidPromoCode(promoCode);
    
    if (!validationResult.valid) {
      return NextResponse.json({
        valid: false,
        error: validationResult.reason === 'invalid' ? 'Invalid promo code' : 'Promo code has expired',
      }, { status: 400 });
    }
    
    // At this point, we know the promo code is valid
    const promoDetails = validationResult.promoDetails!;
    
    // Check if the tickets are eligible for this promo code
    if (tickets && tickets.length > 0) {
      let hasEligibleTicket = false;
      
      for (const ticket of tickets) {
        if (promoDetails.eligibleTicketTypes.includes(ticket.ticketId)) {
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
    
    // Cache the promo code validation for 1 hour
    promoCodeCache.set(promoCode, {
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
