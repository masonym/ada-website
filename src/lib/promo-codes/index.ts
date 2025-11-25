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

// Centralized promo code definitions
export const PROMO_CODES: PromoCode[] = [
  {
    code: 'ACEC15',
    discountPercentage: 15,
    eligibleTicketTypes: ['attendee-pass', 'vip-attendee-pass'],
    eligibleEventIds: [4], // Only valid for 2025NMCPC
    expirationDate: new Date('2025-12-31'),
    description: 'ACEC15 - 15% off Attendee and VIP Attendee passes for Navy & Marine Corps Conference',
    isActive: true
  },
  {
    code: 'ADA20',
    discountPercentage: 20,
    eligibleTicketTypes: [
      'attendee-pass',
      'vip-attendee-pass',
      'exhibit',
      'platinum-sponsor',
      'gold-sponsor',
      'silver-sponsor',
      'bronze-sponsor',
      'vip-networking-reception-sponsor',
      'networking-luncheon-sponsor',
      'small-business-sponsor',
      'small-business-sponsor-without-exhibit-space'
    ],
    eligibleEventIds: [4, 5, 6], // Valid for both 2025NMCPC and 2025DTAPC and 2026NMCPC
    expirationDate: new Date('2025-12-31'),
    description: 'ADA20 - 20% off eligible passes and sponsorships for Navy & Marine Corps and Defense Technology conferences',
    isActive: true
  },
  {
    code: 'ADA10',
    discountPercentage: 10,
    eligibleTicketTypes: [
      'attendee-pass',
      'vip-attendee-pass',
      'exhibit',
      'platinum-sponsor',
      'gold-sponsor',
      'silver-sponsor',
      'bronze-sponsor',
      'vip-networking-reception-sponsor',
      'networking-luncheon-sponsor',
      'small-business-sponsor',
      'small-business-sponsor-without-exhibit-space'
    ],
    eligibleEventIds: [4, 5, 6], // Valid for both 2025NMCPC and 2025DTAPC and 2026NMCPC
    expirationDate: new Date('2026-12-31'),
    description: 'ADA10 - 10% off eligible passes and sponsorships for Navy & Marine Corps and Defense Technology conferences',
    isActive: true
  },
  {
    code: 'EARLY10',
    discountPercentage: 10,
    eligibleTicketTypes: [
      'attendee-pass',
      'vip-attendee-pass',
      'exhibit',
      'platinum-sponsor',
      'gold-sponsor',
      'silver-sponsor',
      'bronze-sponsor',
      'vip-networking-reception-sponsor',
      'networking-luncheon-sponsor',
      'small-business-sponsor',
      'small-business-sponsor-without-exhibit-space'
      // Excludes: additional-exhibitor-attendee-pass, additional-sponsor-attendee-pass
    ],
    eligibleEventIds: [5, 6], // 2025DTAPC and 2026NMCPC
    expirationDate: new Date('2025-08-18T04:00:00Z'),
    description: 'EARLY10 - 10% off eligible tickets for event (excludes additional passes)',
    isActive: true,
    autoApply: true // Automatically apply this promo code for event ID 6
  },
  {
    code: 'NSIC10',
    discountPercentage: 10,
    eligibleTicketTypes: [
      'attendee-pass',
      'vip-attendee-pass',
      'exhibit',
      'platinum-sponsor',
      'gold-sponsor',
      'silver-sponsor',
      'bronze-sponsor',
      'vip-networking-reception-sponsor',
      'networking-luncheon-sponsor',
      'small-business-sponsor',
      'small-business-sponsor-without-exhibit-space'
      // Excludes: additional-exhibitor-attendee-pass, additional-sponsor-attendee-pass
    ],
    eligibleEventIds: [5], // 2025DTAPC
    expirationDate: new Date('2025-11-18T04:00:00Z'),
    description: 'NSIC10 - 10% off eligible tickets for event (excludes additional passes)',
    isActive: true,
    autoApply: false
  },
  {
    code: 'BLACKFRIDAY',
    discountPercentage: 15,
    eligibleTicketTypes: [
      'attendee-pass',
      'vip-attendee-pass',
      'exhibit',
      'platinum-sponsor',
      'gold-sponsor',
      'silver-sponsor',
      'bronze-sponsor',
      'vip-networking-reception-sponsor',
      'networking-luncheon-sponsor',
      'small-business-sponsor',
      'small-business-sponsor-without-exhibit-space'
    ],
    eligibleEventIds: [5, 6], // 2026DTAPC and 2026NMCPC
    expirationDate: new Date('2025-12-02T05:00:00Z'), // Dec 2, 2025 12:00 AM EST in UTC
    description: 'BLACKFRIDAY - 15% off eligible passes and sponsorships for 2026 Defense Technology & Aerospace and Navy & Marine Corps conferences',
    isActive: true
  },
  {
    code: 'KDM10',
    discountPercentage: 10,
    eligibleTicketTypes: [
      'attendee-pass',
      'vip-attendee-pass',
      'exhibit',
      'platinum-sponsor',
      'gold-sponsor',
      'silver-sponsor',
      'bronze-sponsor',
      'vip-networking-reception-sponsor',
      'networking-luncheon-sponsor',
      'small-business-sponsor',
      'small-business-sponsor-without-exhibit-space'
    ],
    eligibleEventIds: [5, 6], // 2026DTAPC and 2026NMCPC
    expirationDate: new Date('2035-12-02T05:00:00Z'), // Dec 2, 2025 12:00 AM EST in UTC
    description: 'KDM10 - 10% off eligible passes and sponsorships for 2026 Defense Technology & Aerospace and Navy & Marine Corps conferences',
    isActive: true
  },
];

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
