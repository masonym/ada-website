import { NextRequest, NextResponse } from 'next/server'
import { addTierToEvent, updateEventTier } from '@/lib/sanity-admin'

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

// update an existing tier on an event
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()

    const { eventId, tierKey, tierId, tierName, tierStyle } = body as {
      eventId: number
      tierKey: string
      tierId?: string
      tierName?: string
      tierStyle?: string
    }

    if (!eventId) {
      return NextResponse.json({ error: 'Event is required' }, { status: 400 })
    }

    if (!tierKey) {
      return NextResponse.json({ error: 'Tier key is required' }, { status: 400 })
    }

    if (tierId !== undefined && !tierId) {
      return NextResponse.json({ error: 'Tier ID cannot be empty' }, { status: 400 })
    }

    if (tierName !== undefined && !tierName) {
      return NextResponse.json({ error: 'Tier name cannot be empty' }, { status: 400 })
    }

    await updateEventTier(eventId, tierKey, {
      id: tierId,
      name: tierName,
      style: tierStyle,
    })

    return NextResponse.json({
      success: true,
      message: `Updated tier "${tierName || tierId}" for event ${eventId}`,
    })
  } catch (error) {
    console.error('Error updating tier:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to update tier'
    }, { status: 500 })
  }
}
