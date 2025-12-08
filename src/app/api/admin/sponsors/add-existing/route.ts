import { NextRequest, NextResponse } from 'next/server'
import { addSponsorToEventTiers } from '@/lib/sanity-admin'

// add an existing sponsor to event tiers
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { sponsorId, eventId, tierIds } = body as {
      sponsorId: string
      eventId: number
      tierIds: string[]
    }

    if (!sponsorId) {
      return NextResponse.json({ error: 'Sponsor is required' }, { status: 400 })
    }

    if (!eventId) {
      return NextResponse.json({ error: 'Event is required' }, { status: 400 })
    }

    if (!tierIds || tierIds.length === 0) {
      return NextResponse.json({ error: 'At least one tier is required' }, { status: 400 })
    }

    await addSponsorToEventTiers({ sponsorId, eventId, tierIds })

    return NextResponse.json({ 
      success: true, 
      message: `Added sponsor to ${tierIds.length} tier(s)`
    })
  } catch (error) {
    console.error('Error adding sponsor to tiers:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to add sponsor' 
    }, { status: 500 })
  }
}
