import { createClient } from '@sanity/client'
import { createImageUrlBuilder } from '@sanity/image-url'
export const client = createClient({
  projectId: 'nc4xlou0',
  dataset: 'production',
  useCdn: true, // use cdn for performance, revalidation handles freshness
  apiVersion: '2024-11-30',
})

// revalidate sponsor data every 5 minutes (300 seconds)
const REVALIDATE_SECONDS = 500

const builder = createImageUrlBuilder(client)

export function urlFor(source: any) {
  return builder.image(source)
}

// Sponsor types matching Sanity schema
export type SanitySponsor = {
  _id: string
  name: string
  slug: { current: string }
  logo: {
    asset: {
      _ref: string
      _type: string
    }
  }
  website?: string
  description?: string
  width?: number
  height?: number
  priority?: boolean
  size?: 'xs' | 'small' | 'medium' | 'large'
}

export type SanityEventSponsor = {
  _id: string
  eventId: number
  title?: string
  description?: string
  tiers: Array<{
    id: string
    name: string
    description?: string
    style?: string
    topTier?: boolean
    sponsors: Array<{
      _type: 'reference'
      _ref: string
    }>
  }>
}

// API functions to replace static imports
export async function getAllSponsors(): Promise<Record<string, SanitySponsor>> {
  const sponsors = await client.fetch<SanitySponsor[]>(`
    *[_type == "sponsor"] {
      _id,
      name,
      slug,
      logo,
      website,
      description,
      width,
      height,
      priority,
      size
    }
  `)
  
  return sponsors.reduce((acc, sponsor) => {
    acc[sponsor._id] = sponsor
    return acc
  }, {} as Record<string, SanitySponsor>)
}

export async function getEventSponsors(eventId: number): Promise<SanityEventSponsor | null> {
  return await client.fetch<SanityEventSponsor | null>(
    `*[_type == "eventSponsor" && eventId == $eventId][0] {
      _id,
      eventId,
      title,
      description,
      tiers[] {
        id,
        name,
        description,
        style,
        topTier,
        sponsors[] {
          _type,
          _ref
        }
      }
    }`,
    { eventId },
    { next: { revalidate: REVALIDATE_SECONDS } }
  )
}

export async function getEventTierSponsors(eventId: number, tierId: string): Promise<SanitySponsor[]> {
  const event = await getEventSponsors(eventId)
  if (!event) return []
  
  const tier = event.tiers.find(t => t.id === tierId)
  if (!tier) return []
  
  return await client.fetch<SanitySponsor[]>(
    `*[_type == "sponsor" && _id in $sponsorIds] {
      _id,
      name,
      slug,
      logo,
      website,
      description,
      width,
      height,
      priority,
      size
    }`,
    { sponsorIds: tier.sponsors.map(s => s._ref) },
    { next: { revalidate: REVALIDATE_SECONDS } }
  )
}

// matchmaking sponsors types
export type SanityMatchmakingSponsorEntry = {
  sponsor: {
    _type: 'reference'
    _ref: string
  }
  note?: string
}

export type SanityEventMatchmakingSponsors = {
  _id: string
  eventSlug: string
  title?: string
  description?: string
  sponsors: SanityMatchmakingSponsorEntry[]
}

export type MatchmakingSponsorWithNote = {
  sponsor: SanitySponsor
  note?: string
}

// legacy fallback imports
import { 
  EVENT_MATCHMAKING_SPONSORS, 
  getEventMatchmakingSponsors as getLegacyMatchmakingSponsors,
  getEventMatchmakingMetadata as getLegacyMatchmakingMetadata
} from '@/constants/matchmaking-sponsors'

export async function getEventMatchmakingSponsors(eventSlug: string): Promise<{
  sponsors: MatchmakingSponsorWithNote[]
  title?: string
  description?: string
} | null> {
  try {
    const rawData = await client.fetch(
      `*[_type == "eventMatchmakingSponsors" && eventSlug == $eventSlug][0]`,
      { eventSlug }
    )

    if (!rawData || !rawData.sponsors || rawData.sponsors.length === 0) {
      // fallback to legacy data if sanity has no data
      return getLegacyMatchmakingData(eventSlug)
    }

    // extract sponsor refs - handle both possible structures
    const sponsorIds = rawData.sponsors.map((s: any) => {
      // could be s.sponsor._ref or s._ref depending on schema
      if (s.sponsor && s.sponsor._ref) return s.sponsor._ref
      if (s._ref) return s._ref
      return null
    }).filter(Boolean)
    const sponsorsData = await client.fetch<SanitySponsor[]>(
      `*[_type == "sponsor" && _id in $sponsorIds] {
        _id,
        name,
        slug,
        logo,
        website,
        description,
        width,
        height,
        priority,
        size
      }`,
      { sponsorIds }
    )

    // create a map for quick lookup
    const sponsorMap = new Map(sponsorsData.map(s => [s._id, s]))

    // preserve order from rawData.sponsors and include notes
    const sponsorsWithNotes: MatchmakingSponsorWithNote[] = rawData.sponsors
      .map((entry: any) => {
        // handle both possible structures
        const sponsorRef = entry.sponsor?._ref || entry._ref
        const sponsor = sponsorMap.get(sponsorRef)
        if (!sponsor) return null
        return {
          sponsor,
          note: entry.note
        }
      })
      .filter((s: any): s is NonNullable<typeof s> => s !== null)

    return {
      sponsors: sponsorsWithNotes,
      title: rawData.title,
      description: rawData.description
    }
  } catch (error) {
    console.error('Error fetching matchmaking sponsors:', error)
    // fallback to legacy data on error
    return getLegacyMatchmakingData(eventSlug)
  }
}

// helper to convert legacy data format to sanity format
function getLegacyMatchmakingData(eventSlug: string): {
  sponsors: MatchmakingSponsorWithNote[]
  title?: string
  description?: string
} | null {
  const legacySponsors = getLegacyMatchmakingSponsors(eventSlug)
  const legacyMetadata = getLegacyMatchmakingMetadata(eventSlug)
  
  if (legacySponsors.length === 0) {
    return null
  }

  // convert legacy Sponsor type to SanitySponsor-like format
  const sponsors: MatchmakingSponsorWithNote[] = legacySponsors.map(item => ({
    sponsor: {
      _id: item.sponsor.id,
      name: item.sponsor.name,
      slug: { current: item.sponsor.id },
      logo: {
        asset: {
          _ref: item.sponsor.logo, // this is a path, urlFor won't work but we handle it in the component
          _type: 'reference'
        }
      },
      website: item.sponsor.website,
      description: item.sponsor.description,
      width: item.sponsor.width,
      height: item.sponsor.height,
      priority: item.sponsor.priority,
      size: item.sponsor.size
    } as SanitySponsor,
    note: item.note
  }))

  return {
    sponsors,
    title: legacyMetadata.title,
    description: legacyMetadata.description
  }
}
