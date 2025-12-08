import { NextRequest, NextResponse } from 'next/server'
import { addTierToEvent } from '@/lib/sanity-admin'

// add a new tier to an event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { eventId, tierId, tierName, tierStyle } = body as {
      eventId: number
      tierId: string
      tierName: string
      tierStyle?: string
    }

    if (!eventId) {
      return NextResponse.json({ error: 'Event is required' }, { status: 400 })
    }

    if (!tierId) {
      return NextResponse.json({ error: 'Tier ID is required' }, { status: 400 })
    }

    if (!tierName) {
      return NextResponse.json({ error: 'Tier name is required' }, { status: 400 })
    }

    await addTierToEvent(eventId, {
      id: tierId,
      name: tierName,
      style: tierStyle
    })

    return NextResponse.json({ 
      success: true, 
      message: `Created tier "${tierName}" for event ${eventId}`
    })
  } catch (error) {
    console.error('Error creating tier:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to create tier' 
    }, { status: 500 })
  }
}
