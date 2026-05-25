import { NextRequest, NextResponse } from 'next/server'
import { createEventScheduleDoc, getEventSchedule, saveEventSchedule } from '@/lib/sanity-admin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')

    if (!eventId) {
      return NextResponse.json({ error: 'eventId param required' }, { status: 400 })
    }

    const eventSchedule = await getEventSchedule(parseInt(eventId))
    return NextResponse.json({ eventSchedule })
  } catch (error) {
    console.error('Error fetching event schedule:', error)
    return NextResponse.json({ error: 'Failed to fetch event schedule' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'create-doc') {
      const { eventId, eventSlug } = body
      if (!eventId || !eventSlug) {
        return NextResponse.json({ error: 'eventId and eventSlug required' }, { status: 400 })
      }
      const doc = await createEventScheduleDoc(eventId, eventSlug)
      return NextResponse.json({ success: true, doc })
    }

    if (action === 'save-schedule') {
      const { scheduleId, days } = body
      if (!scheduleId || !Array.isArray(days)) {
        return NextResponse.json({ error: 'scheduleId and days required' }, { status: 400 })
      }
      const doc = await saveEventSchedule(scheduleId, days)
      return NextResponse.json({ success: true, doc })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error processing event schedule request:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to process request',
    }, { status: 500 })
  }
}
