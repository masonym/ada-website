import { NextRequest, NextResponse } from 'next/server'
import {
  getAllSpeakers,
  getSpeakerById,
  createSpeaker,
  updateSpeakerDetails,
  updateSpeakerImage,
  toggleSpeakerVisibility,
  deleteSpeaker,
  uploadImageToSanity,
} from '@/lib/sanity-admin'

// get all speakers or a single speaker by ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const speakerId = searchParams.get('speakerId')

    if (speakerId) {
      const speaker = await getSpeakerById(speakerId)
      if (!speaker) {
        return NextResponse.json({ error: 'Speaker not found' }, { status: 404 })
      }
      return NextResponse.json({ speaker })
    }

    const speakers = await getAllSpeakers()
    return NextResponse.json({ speakers })
  } catch (error) {
    console.error('Error fetching speakers:', error)
    return NextResponse.json({ error: 'Failed to fetch speakers' }, { status: 500 })
  }
}

// handle all speaker mutations
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''

    // handle form data (for image uploads)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const action = formData.get('action') as string

      if (action === 'create') {
        const name = formData.get('name') as string
        const position = formData.get('position') as string
        const company = formData.get('company') as string
        const bio = formData.get('bio') as string
        const priority = parseInt(formData.get('priority') as string) || 0
        const image = formData.get('image') as File | null

        if (!name) {
          return NextResponse.json({ error: 'Name is required' }, { status: 400 })
        }

        let imageAssetId: string | undefined
        if (image) {
          const imageBuffer = Buffer.from(await image.arrayBuffer())
          const asset = await uploadImageToSanity(imageBuffer, image.name)
          imageAssetId = asset._id
        }

        const speaker = await createSpeaker({
          name,
          position,
          company,
          bio,
          priority,
          imageAssetId,
        })

        return NextResponse.json({
          success: true,
          message: 'Speaker created successfully',
          speaker,
        })
      }

      if (action === 'update-image') {
        const speakerId = formData.get('speakerId') as string
        const image = formData.get('image') as File

        if (!speakerId || !image) {
          return NextResponse.json({ error: 'Speaker ID and image are required' }, { status: 400 })
        }

        const imageBuffer = Buffer.from(await image.arrayBuffer())
        const asset = await uploadImageToSanity(imageBuffer, image.name)
        await updateSpeakerImage(speakerId, asset._id)

        return NextResponse.json({
          success: true,
          message: 'Speaker image updated successfully',
        })
      }
    }

    // handle JSON data
    const body = await request.json()
    const { action } = body

    if (action === 'update') {
      const { speakerId, name, position, company, bio, priority } = body

      if (!speakerId) {
        return NextResponse.json({ error: 'Speaker ID is required' }, { status: 400 })
      }

      await updateSpeakerDetails(speakerId, { name, position, company, bio, priority })

      return NextResponse.json({
        success: true,
        message: 'Speaker updated successfully',
      })
    }

    if (action === 'toggle-visibility') {
      const { speakerId, isVisible } = body

      if (!speakerId || isVisible === undefined) {
        return NextResponse.json({ error: 'Speaker ID and visibility are required' }, { status: 400 })
      }

      await toggleSpeakerVisibility(speakerId, isVisible)

      return NextResponse.json({
        success: true,
        message: `Speaker ${isVisible ? 'shown' : 'hidden'} successfully`,
      })
    }

    if (action === 'delete') {
      const { speakerId } = body

      if (!speakerId) {
        return NextResponse.json({ error: 'Speaker ID is required' }, { status: 400 })
      }

      await deleteSpeaker(speakerId)

      return NextResponse.json({
        success: true,
        message: 'Speaker deleted successfully',
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error processing speaker request:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to process request',
    }, { status: 500 })
  }
}
