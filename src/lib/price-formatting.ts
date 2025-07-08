/**
 * Helper utilities for formatting and managing registration prices
 */

// More flexible type for price formatting that works with various registration types
export interface PriceFormattingRegistration {
  price: number | string;
  earlyBirdPrice?: number | string;
  earlyBirdDeadline?: string;
  type: string;
}

/**
 * Price display information structure
 */
export interface PriceDisplay {
  /**
   * The primary price to be displayed (formatted as string with currency symbol)
   */
  displayPrice: string;
  
  /**
   * The original price to be displayed (formatted with strike-through if early bird applies)
   */
  originalPrice?: string;
  
  /**
   * CSS classes for the primary price
   */
  priceClasses: string;
  
  /**
   * Additional text to display alongside the price (e.g. "Early Bird")
   */
  priceLabel?: string;
  
  /**
   * Deadline information for early bird pricing if applicable
   */
  deadlineInfo?: string;
  
  /**
   * Whether this is an early bird price
   */
  isEarlyBird: boolean;
  
  /**
   * Raw numeric value of the price (useful for calculations)
   */
  numericValue: number;
}

/**
 * Normalize a price value to a number
 * @param price The price value which could be a number or string
 * @returns The normalized numeric price value
 */
export function normalizePrice(price: string | number | undefined): number {
  if (price === undefined) return 0;
  if (typeof price === 'number') return price;
  return parseFloat(price.replace(/[^0-9.]/g, '')) || 0;
}

/**
 * Format a numeric price for display
 * @param price The numeric price to format
 * @returns The formatted price string
 */
export function formatPrice(price: number): string {
  return `$${new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price)}`;
}

/**
 * Get formatted price display information for a registration item
 * @param registration The registration item
 * @returns Price display information
 */
export function getPriceDisplay(registration: PriceFormattingRegistration): PriceDisplay {
  // Check for early bird pricing
  const now = new Date();
  const hasEarlyBird = !!(registration.earlyBirdPrice && registration.earlyBirdDeadline);
  const earlyBirdActive = hasEarlyBird && registration.earlyBirdDeadline ? now < new Date(registration.earlyBirdDeadline) : false;
  
  // Process different price types
  let displayPrice = '';
  let originalPrice: string | undefined;
  let priceClasses = '';
  let priceLabel: string | undefined;
  let deadlineInfo: string | undefined;
  let numericValue = 0;
  
  // Handle free or complimentary registrations
  if (registration.type === 'free' || registration.type === 'complimentary') {
    displayPrice = typeof registration.price === 'string' ? registration.price : 'Complimentary';
    priceClasses = 'text-indigo-600';
    numericValue = 0;
  } 
  // Handle early bird pricing
  else if (earlyBirdActive) {
    const earlyBirdNumeric = normalizePrice(registration.earlyBirdPrice);
    const regularNumeric = normalizePrice(registration.price);
    
    displayPrice = formatPrice(earlyBirdNumeric);
    originalPrice = formatPrice(regularNumeric);
    priceClasses = 'text-green-600';
    priceLabel = 'Early Bird';
    numericValue = earlyBirdNumeric;
    
    if (registration.earlyBirdDeadline) {
      const deadline = new Date(registration.earlyBirdDeadline);
      deadlineInfo = `Early bird pricing ends ${deadline.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}`;
    }
  } 
  // Handle string-based prices (like "Contact us")
  else if (typeof registration.price === 'string') {
    displayPrice = registration.price;
    priceClasses = 'text-indigo-600';
    numericValue = 0;
  } 
  // Handle regular numeric prices
  else {
    displayPrice = formatPrice(registration.price);
    priceClasses = 'text-indigo-800';
    numericValue = registration.price;
  }
  
  return {
    displayPrice,
    originalPrice,
    priceClasses,
    priceLabel,
    deadlineInfo,
    isEarlyBird: earlyBirdActive,
    numericValue
  };
}
