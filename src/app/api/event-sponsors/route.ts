import { NextRequest, NextResponse } from 'next/server'
import { getEventSponsors } from '@/lib/sanity'

// returns tier sponsor counts for an event from sanity
// used by client components to check sold-out status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const eventIdParam = searchParams.get('eventId')

  if (!eventIdParam) {
    return NextResponse.json({ error: 'eventId is required' }, { status: 400 })
  }

  const eventId = parseInt(eventIdParam, 10)
  if (isNaN(eventId)) {
    return NextResponse.json({ error: 'eventId must be a number' }, { status: 400 })
  }

  try {
    const eventSponsors = await getEventSponsors(eventId)

    if (!eventSponsors) {
      return NextResponse.json({ tiers: [] })
    }

    // return a lightweight shape: tier id -> sponsor count
    const tiers = eventSponsors.tiers.map(tier => ({
      id: tier.id,
      sponsorCount: tier.sponsors?.length ?? 0,
    }))

    return NextResponse.json({ tiers })
  } catch (error) {
    console.error('Error fetching event sponsors:', error)
    return NextResponse.json({ error: 'Failed to fetch event sponsors' }, { status: 500 })
  }
}
