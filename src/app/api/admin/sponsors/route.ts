import { NextRequest, NextResponse } from 'next/server'
import { 
  createSponsor, 
  uploadImage, 
  addSponsorToEventTiers, 
  getEventsWithTiers,
  getAllSponsorsAdmin,
  getAllMatchmakingSponsors,
  addSponsorToMatchmaking
} from '@/lib/sanity-admin'
import { EVENTS } from '@/constants/events'

// map event IDs to their actual names
const EVENT_NAMES: Record<number, string> = EVENTS.reduce((acc, event) => {
  acc[event.id] = event.title
  return acc
}, {} as Record<number, string>)

// get events and tiers for the form
export async function GET() {
  try {
    const [events, sponsors, matchmakingDocs] = await Promise.all([
      getEventsWithTiers(),
      getAllSponsorsAdmin(),
      getAllMatchmakingSponsors()
    ])
    
    // deduplicate by eventId (keep first occurrence) and enrich with actual names
    const seenEventIds = new Set<number>()
    const enrichedEvents = events
      .filter(event => {
        if (seenEventIds.has(event.eventId)) return false
        seenEventIds.add(event.eventId)
        return true
      })
      .map(event => ({
        ...event,
        eventName: EVENT_NAMES[event.eventId] || event.title || `Event ${event.eventId}`
      }))

    // enrich matchmaking docs with event names from slugs
    const enrichedMatchmaking = (matchmakingDocs || []).map(doc => {
      const event = EVENTS.find(e => e.slug === doc.eventSlug)
      return {
        _id: doc._id,
        eventSlug: doc.eventSlug,
        eventName: event?.title || doc.eventSlug
      }
    })
    
    return NextResponse.json({ events: enrichedEvents, sponsors, matchmakingDocs: enrichedMatchmaking })
  } catch (error) {
    console.error('Error fetching data:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}

// create sponsor and optionally add to event tiers and/or matchmaking
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const name = formData.get('name') as string
    const website = formData.get('website') as string | null
    const description = formData.get('description') as string | null
    const logo = formData.get('logo') as File | null
    const eventId = formData.get('eventId') as string | null
    const tierIds = formData.getAll('tierIds') as string[]
    const matchmakingDocId = formData.get('matchmakingDocId') as string | null
    const matchmakingNote = formData.get('matchmakingNote') as string | null

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    if (!logo) {
      return NextResponse.json({ error: 'Logo is required' }, { status: 400 })
    }

    // if event is provided, tiers are required
    if (eventId && tierIds.length === 0) {
      return NextResponse.json({ error: 'At least one tier is required when adding to an event' }, { status: 400 })
    }

    // upload the logo
    const logoBuffer = Buffer.from(await logo.arrayBuffer())
    const imageAsset = await uploadImage(logoBuffer, logo.name)

    // create the sponsor
    const sponsor = await createSponsor(
      { name, website: website || undefined, description: description || undefined },
      imageAsset._id
    )

    const actions: string[] = [`Created "${name}"`]

    // optionally add to event tiers
    if (eventId && tierIds.length > 0) {
      await addSponsorToEventTiers({
        sponsorId: sponsor._id,
        eventId: parseInt(eventId),
        tierIds
      })
      actions.push(`added to ${tierIds.length} tier(s)`)
    }

    // optionally add to matchmaking
    if (matchmakingDocId) {
      await addSponsorToMatchmaking(matchmakingDocId, sponsor._id, matchmakingNote || undefined)
      actions.push('added to matchmaking')
    }

    return NextResponse.json({ 
      success: true, 
      sponsor: { _id: sponsor._id, name: sponsor.name },
      message: actions.join(' and ')
    })
  } catch (error) {
    console.error('Error creating sponsor:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to create sponsor' 
    }, { status: 500 })
  }
}
