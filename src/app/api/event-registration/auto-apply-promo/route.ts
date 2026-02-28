import { NextResponse } from 'next/server';
import { getAutoApplyPromoCodesFromSanity } from '@/lib/sanity';
import { getAutoApplyPromoCodesForEvent } from '@/lib/promo-codes';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get('eventId');

  if (!eventId) {
    return NextResponse.json({ error: 'eventId required' }, { status: 400 });
  }

  const eventIdNum = parseInt(eventId);

  try {
    // Try Sanity first
    let autoApplyCodes = await getAutoApplyPromoCodesFromSanity(eventIdNum);
    
    // Fall back to legacy if no Sanity codes found
    if (autoApplyCodes.length === 0) {
      const legacyCodes = getAutoApplyPromoCodesForEvent(eventIdNum);
      autoApplyCodes = legacyCodes.map(code => ({
        _id: 'legacy',
        code: code.code,
        discountPercentage: code.discountPercentage,
        eligibleTicketTypes: code.eligibleTicketTypes,
        eligibleEventIds: code.eligibleEventIds.map(id => typeof id === 'string' ? parseInt(id) : id),
        expirationDate: code.expirationDate.toISOString(),
        description: code.description,
        isActive: code.isActive,
        autoApply: code.autoApply || false,
      }));
    }

    return NextResponse.json({ codes: autoApplyCodes });
  } catch (error) {
    console.error('Error fetching auto-apply promo codes:', error);
    return NextResponse.json({ codes: [] });
  }
}
