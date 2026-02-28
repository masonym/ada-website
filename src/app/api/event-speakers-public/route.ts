import { NextRequest, NextResponse } from 'next/server'
import { getEventSpeakersPublic } from '@/lib/sanity'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')

    if (!eventId) {
      return NextResponse.json({ error: 'eventId required' }, { status: 400 })
    }

    const result = await getEventSpeakersPublic(parseInt(eventId))
    
    if (!result) {
      return NextResponse.json({ speakers: [] })
    }

    // combine speakers and keynote speakers
    const allSpeakers = [...result.speakers, ...result.keynoteSpeakers]
    
    return NextResponse.json({ speakers: allSpeakers })
  } catch (error) {
    console.error('Error fetching event speakers:', error)
    return NextResponse.json({ error: 'Failed to fetch speakers' }, { status: 500 })
  }
}
