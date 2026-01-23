import { NextRequest, NextResponse } from 'next/server'
import { removeSponsorFromEventTiers } from '@/lib/sanity-admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { sponsorId, eventId, tierIds, removeFromAllTiers } = body as {
      sponsorId: string
      eventId: number
      tierIds?: string[]
      removeFromAllTiers?: boolean
    }

    if (!sponsorId) {
      return NextResponse.json({ error: 'Sponsor is required' }, { status: 400 })
    }

    if (!eventId) {
      return NextResponse.json({ error: 'Event is required' }, { status: 400 })
    }

    if (!removeFromAllTiers && (!tierIds || tierIds.length === 0)) {
      return NextResponse.json({ error: 'Select at least one tier (or remove from all tiers)' }, { status: 400 })
    }

    const result = await removeSponsorFromEventTiers({
      sponsorId,
      eventId,
      tierIds,
      removeFromAllTiers,
    })

    return NextResponse.json({
      success: true,
      removedFromTiers: result.removedFromTiers,
      message: `Removed sponsor from ${result.removedFromTiers} tier(s)`,
    })
  } catch (error) {
    console.error('Error removing sponsor from tiers:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to remove sponsor' },
      { status: 500 }
    )
  }
}
