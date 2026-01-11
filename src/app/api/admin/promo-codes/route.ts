import { NextRequest, NextResponse } from 'next/server'
import {
  getAllPromoCodes,
  getPromoCodesForEvent,
  createPromoCode,
  updatePromoCode,
  togglePromoCodeActive,
  deletePromoCode,
} from '@/lib/sanity-admin'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const eventId = searchParams.get('eventId')

  try {
    if (eventId) {
      const promoCodes = await getPromoCodesForEvent(parseInt(eventId))
      return NextResponse.json({ promoCodes })
    } else {
      const promoCodes = await getAllPromoCodes()
      return NextResponse.json({ promoCodes })
    }
  } catch (error) {
    console.error('Error fetching promo codes:', error)
    return NextResponse.json({ error: 'Failed to fetch promo codes' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'create') {
      const { code, discountPercentage, eligibleTicketTypes, eligibleEventIds, expirationDate, description, isActive, autoApply } = body
      
      if (!code || !discountPercentage || !eligibleTicketTypes || !eligibleEventIds || !expirationDate) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
      }

      const promoCode = await createPromoCode({
        code,
        discountPercentage,
        eligibleTicketTypes,
        eligibleEventIds,
        expirationDate,
        description,
        isActive,
        autoApply,
      })
      return NextResponse.json({ success: true, promoCode })
    }

    if (action === 'update') {
      const { promoCodeId, updates } = body
      if (!promoCodeId) {
        return NextResponse.json({ error: 'promoCodeId required' }, { status: 400 })
      }
      const promoCode = await updatePromoCode(promoCodeId, updates)
      return NextResponse.json({ success: true, promoCode })
    }

    if (action === 'toggle') {
      const { promoCodeId, isActive } = body
      if (!promoCodeId || isActive === undefined) {
        return NextResponse.json({ error: 'promoCodeId and isActive required' }, { status: 400 })
      }
      await togglePromoCodeActive(promoCodeId, isActive)
      return NextResponse.json({ success: true, message: `Promo code ${isActive ? 'activated' : 'deactivated'}` })
    }

    if (action === 'delete') {
      const { promoCodeId } = body
      if (!promoCodeId) {
        return NextResponse.json({ error: 'promoCodeId required' }, { status: 400 })
      }
      await deletePromoCode(promoCodeId)
      return NextResponse.json({ success: true, message: 'Promo code deleted' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error managing promo code:', error)
    return NextResponse.json({ error: 'Failed to manage promo code' }, { status: 500 })
  }
}
