import { NextRequest, NextResponse } from 'next/server'
import {
  getAllSpeakers,
  getEventSpeakers,
  createEventSpeakersDoc,
  addSpeakerToEvent,
  removeSpeakerFromEvent,
  toggleEventSpeakerVisibility,
  updateEventSpeaker,
} from '@/lib/sanity-admin'

// get event speakers or all speakers (for dropdown)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')
    const allSpeakers = searchParams.get('allSpeakers')

    // return all speakers for the "add speaker" dropdown
    if (allSpeakers === 'true') {
      const speakers = await getAllSpeakers()
      return NextResponse.json({ speakers })
    }

    // return event speakers
    if (eventId) {
      const eventSpeakers = await getEventSpeakers(parseInt(eventId))
      return NextResponse.json({ eventSpeakers })
    }

    return NextResponse.json({ error: 'eventId or allSpeakers param required' }, { status: 400 })
  } catch (error) {
    console.error('Error fetching event speakers:', error)
    return NextResponse.json({ error: 'Failed to fetch event speakers' }, { status: 500 })
  }
}

// handle all event speaker mutations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'create-doc') {
      const { eventId, eventSlug } = body
      if (!eventId || !eventSlug) {
        return NextResponse.json({ error: 'eventId and eventSlug required' }, { status: 400 })
      }
      const doc = await createEventSpeakersDoc(eventId, eventSlug)
      return NextResponse.json({ success: true, doc })
    }

    if (action === 'add-speaker') {
      const { docId, speakerId, isKeynote, keynoteHeaderText, label, sortOrder } = body
      if (!docId || !speakerId) {
        return NextResponse.json({ error: 'docId and speakerId required' }, { status: 400 })
      }
      await addSpeakerToEvent(docId, speakerId, { isKeynote, keynoteHeaderText, label, sortOrder })
      return NextResponse.json({ success: true, message: 'Speaker added to event' })
    }

    if (action === 'remove-speaker') {
      const { docId, speakerKey } = body
      if (!docId || !speakerKey) {
        return NextResponse.json({ error: 'docId and speakerKey required' }, { status: 400 })
      }
      await removeSpeakerFromEvent(docId, speakerKey)
      return NextResponse.json({ success: true, message: 'Speaker removed from event' })
    }

    if (action === 'toggle-visibility') {
      const { docId, speakerKey, isVisible } = body
      if (!docId || !speakerKey || isVisible === undefined) {
        return NextResponse.json({ error: 'docId, speakerKey, and isVisible required' }, { status: 400 })
      }
      await toggleEventSpeakerVisibility(docId, speakerKey, isVisible)
      return NextResponse.json({ success: true, message: `Speaker ${isVisible ? 'shown' : 'hidden'}` })
    }

    if (action === 'update-speaker') {
      const { docId, speakerKey, isKeynote, keynoteHeaderText, label, sortOrder } = body
      if (!docId || !speakerKey) {
        return NextResponse.json({ error: 'docId and speakerKey required' }, { status: 400 })
      }
      await updateEventSpeaker(docId, speakerKey, { isKeynote, keynoteHeaderText, label, sortOrder })
      return NextResponse.json({ success: true, message: 'Speaker updated' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error processing event speakers request:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to process request',
    }, { status: 500 })
  }
}
