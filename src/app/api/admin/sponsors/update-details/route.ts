import { NextRequest, NextResponse } from 'next/server'
import { updateSponsorDetails, getSponsorDetails } from '@/lib/sanity-admin'

// get sponsor details for editing
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sponsorId = searchParams.get('sponsorId')

    if (!sponsorId) {
      return NextResponse.json({ error: 'Sponsor ID is required' }, { status: 400 })
    }

    const sponsor = await getSponsorDetails(sponsorId)

    if (!sponsor) {
      return NextResponse.json({ error: 'Sponsor not found' }, { status: 404 })
    }

    return NextResponse.json({ sponsor })
  } catch (error) {
    console.error('Error fetching sponsor details:', error)
    return NextResponse.json({ error: 'Failed to fetch sponsor details' }, { status: 500 })
  }
}

// update sponsor details
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sponsorId, name, website, description } = body

    if (!sponsorId) {
      return NextResponse.json({ error: 'Sponsor ID is required' }, { status: 400 })
    }

    await updateSponsorDetails(sponsorId, { name, website, description })

    return NextResponse.json({ 
      success: true, 
      message: 'Sponsor details updated successfully'
    })
  } catch (error) {
    console.error('Error updating sponsor details:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to update sponsor details' 
    }, { status: 500 })
  }
}
