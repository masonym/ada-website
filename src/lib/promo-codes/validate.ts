import { validatePromoCode, isEligibleForPromoDiscount } from '@/lib/promo-codes';
import { validatePromoCodeFromSanity } from '@/lib/sanity';

/**
 * Shared promo-code validation.
 *
 * Extracted from the /api/event-registration/validate-promo route so the
 * register handler can call it directly. It previously issued an HTTP request to
 * the app's own URL mid-checkout, which added a round-trip through the CDN and
 * broke whenever NEXT_PUBLIC_SITE_URL didn't match where the code was actually
 * running (preview deploys, the Cloudflare staging worker, local pointed at
 * production config).
 */
export type PromoValidation =
  | {
      valid: true;
      discountPercentage?: number;
      eligibleTicketTypes?: string[];
      description?: string;
    }
  | { valid: false; error: string };

export async function validatePromoCodeForOrder(
  promoCode: string,
  eventId: number | string,
  tickets?: Array<{ ticketId: string }>
): Promise<PromoValidation> {
  if (!promoCode) return { valid: false, error: 'Promo code is required' };
  if (!eventId) return { valid: false, error: 'Event ID is required' };

  const eventIdNum = typeof eventId === 'string' ? parseInt(eventId, 10) : eventId;

  // Sanity is the current source of truth; the legacy table is still consulted
  // for codes that predate the migration.
  let result = await validatePromoCodeFromSanity(promoCode, eventIdNum);

  if (!result.valid && (result.reason === 'invalid' || result.reason === 'error')) {
    const legacy = validatePromoCode(promoCode, eventId);
    if (legacy.valid && legacy.promoDetails) {
      result = {
        valid: true,
        promoDetails: {
          _id: 'legacy',
          code: legacy.promoDetails.code,
          discountPercentage: legacy.promoDetails.discountPercentage,
          eligibleTicketTypes: legacy.promoDetails.eligibleTicketTypes,
          eligibleEventIds: legacy.promoDetails.eligibleEventIds.map(id =>
            typeof id === 'string' ? parseInt(id, 10) : id
          ),
          expirationDate: legacy.promoDetails.expirationDate.toISOString(),
          description: legacy.promoDetails.description,
          isActive: legacy.promoDetails.isActive,
          autoApply: legacy.promoDetails.autoApply || false,
        },
      };
    } else if (!legacy.valid) {
      result = { valid: false, reason: legacy.reason };
    }
  }

  if (!result.valid) {
    const message =
      result.reason === 'expired'
        ? 'Promo code has expired'
        : result.reason === 'not_valid_for_event'
          ? 'This promo code is not valid for this event'
          : 'Invalid promo code';
    return { valid: false, error: message };
  }

  const promoDetails = result.promoDetails!;

  if (tickets && tickets.length > 0) {
    const hasEligibleTicket = tickets.some(ticket =>
      isEligibleForPromoDiscount(ticket.ticketId, promoDetails.eligibleTicketTypes)
    );

    if (!hasEligibleTicket) {
      return {
        valid: false,
        error: 'This promo code is not applicable to any of the selected tickets',
      };
    }
  }

  return {
    valid: true,
    discountPercentage: promoDetails.discountPercentage,
    eligibleTicketTypes: promoDetails.eligibleTicketTypes,
    description: promoDetails.description,
  };
}
