import { NextRequest, NextResponse } from 'next/server'
import { 
  getAllMatchmakingSponsors,
  getAllSponsorsAdmin,
  createMatchmakingSponsorsDoc,
  updateMatchmakingSponsorsMetadata,
  addSponsorToMatchmaking,
  updateMatchmakingSponsorNote,
  removeSponsorFromMatchmaking,
  deleteMatchmakingSponsorsDoc
} from '@/lib/sanity-admin'
import { EVENTS } from '@/constants/events'

// get all matchmaking sponsors documents and all sponsors for the form
export async function GET() {
  try {
    const [matchmakingDocs, sponsors] = await Promise.all([
      getAllMatchmakingSponsors(),
      getAllSponsorsAdmin()
    ])
    
    // get event slugs from EVENTS
    const eventSlugs = EVENTS.map(e => ({ slug: e.slug, title: e.title }))
    
    return NextResponse.json({ 
      matchmakingDocs: matchmakingDocs || [], 
      sponsors,
      eventSlugs
    })
  } catch (error) {
    console.error('Error fetching matchmaking data:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}

// create new matchmaking document or add sponsor to existing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'create-doc': {
        const { eventSlug, title, description } = body
        if (!eventSlug) {
          return NextResponse.json({ error: 'Event slug is required' }, { status: 400 })
        }
        const doc = await createMatchmakingSponsorsDoc({ eventSlug, title, description })
        return NextResponse.json({ 
          success: true, 
          doc,
          message: `Created matchmaking document for ${eventSlug}`
        })
      }

      case 'update-metadata': {
        const { docId, title, description } = body
        if (!docId) {
          return NextResponse.json({ error: 'Document ID is required' }, { status: 400 })
        }
        await updateMatchmakingSponsorsMetadata(docId, { title, description })
        return NextResponse.json({ 
          success: true, 
          message: 'Updated metadata'
        })
      }

      case 'add-sponsor': {
        const { docId, sponsorId, note } = body
        if (!docId || !sponsorId) {
          return NextResponse.json({ error: 'Document ID and sponsor ID are required' }, { status: 400 })
        }
        await addSponsorToMatchmaking(docId, sponsorId, note)
        return NextResponse.json({ 
          success: true, 
          message: 'Added sponsor to matchmaking'
        })
      }

      case 'update-note': {
        const { docId, sponsorKey, note } = body
        if (!docId || !sponsorKey) {
          return NextResponse.json({ error: 'Document ID and sponsor key are required' }, { status: 400 })
        }
        await updateMatchmakingSponsorNote(docId, sponsorKey, note)
        return NextResponse.json({ 
          success: true, 
          message: 'Updated sponsor note'
        })
      }

      case 'remove-sponsor': {
        const { docId, sponsorKey } = body
        if (!docId || !sponsorKey) {
          return NextResponse.json({ error: 'Document ID and sponsor key are required' }, { status: 400 })
        }
        await removeSponsorFromMatchmaking(docId, sponsorKey)
        return NextResponse.json({ 
          success: true, 
          message: 'Removed sponsor from matchmaking'
        })
      }

      case 'delete-doc': {
        const { docId } = body
        if (!docId) {
          return NextResponse.json({ error: 'Document ID is required' }, { status: 400 })
        }
        await deleteMatchmakingSponsorsDoc(docId)
        return NextResponse.json({ 
          success: true, 
          message: 'Deleted matchmaking document'
        })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error in matchmaking sponsors API:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to process request' 
    }, { status: 500 })
  }
}
