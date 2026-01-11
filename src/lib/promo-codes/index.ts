// Centralized promo code management system
// This replaces the hardcoded promo codes in RegistrationModal.tsx and validate-promo/route.ts

export interface PromoCode {
  code: string;
  discountPercentage: number;
  eligibleTicketTypes: string[];
  eligibleEventIds: (string | number)[];
  expirationDate: Date;
  description?: string;
  isActive: boolean; // Allow enabling/disabling codes
  autoApply?: boolean; // Optional: automatically apply this promo code for eligible events
}

// Legacy promo codes removed - now managed in Sanity CMS
// See /admin/promo-codes to manage promo codes
// The functions below are kept for fallback compatibility but will return empty results
export const PROMO_CODES: PromoCode[] = [];

// Function to validate promo code for a specific event
export const validatePromoCode = (
  code: string,
  eventId: string | number
): { valid: boolean; reason?: string; promoDetails?: PromoCode } => {
  // Find the promo code in our list
  const promoCode = PROMO_CODES.find(promo =>
    promo.code.toLowerCase() === code.toLowerCase() && promo.isActive
  );

  // Check if code exists
  if (!promoCode) {
    return { valid: false, reason: 'invalid' };
  }

  // Check if code is expired
  if (new Date() > promoCode.expirationDate) {
    return { valid: false, reason: 'expired' };
  }

  // Check if code is valid for this specific event
  const eventIdToCheck = typeof eventId === 'string' ? parseInt(eventId) : eventId;
  if (!promoCode.eligibleEventIds.includes(eventIdToCheck)) {
    return { valid: false, reason: 'not_valid_for_event' };
  }

  return { valid: true, promoDetails: promoCode };
};

// Function to check if a registration type is eligible for a specific promo discount
export const isEligibleForPromoDiscount = (
  registrationId: string,
  eligibleTicketTypes: string[]
): boolean => {
  return eligibleTicketTypes.includes(registrationId);
};

// Function to get all active promo codes for a specific event
export const getActivePromoCodesForEvent = (eventId: string | number): PromoCode[] => {
  const eventIdToCheck = typeof eventId === 'string' ? parseInt(eventId) : eventId;
  return PROMO_CODES.filter(promo =>
    promo.isActive &&
    promo.eligibleEventIds.includes(eventIdToCheck) &&
    new Date() <= promo.expirationDate
  );
};

// Function to get promo codes that should be automatically applied for a specific event
export const getAutoApplyPromoCodesForEvent = (eventId: string | number): PromoCode[] => {
  const eventIdToCheck = typeof eventId === 'string' ? parseInt(eventId) : eventId;
  return PROMO_CODES.filter(promo =>
    promo.isActive &&
    promo.autoApply === true &&
    promo.eligibleEventIds.includes(eventIdToCheck) &&
    new Date() <= promo.expirationDate
  );
};
