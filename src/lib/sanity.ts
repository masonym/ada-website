import { createClient } from '@sanity/client'
import { createImageUrlBuilder } from '@sanity/image-url'
export const client = createClient({
  projectId: 'nc4xlou0',
  dataset: 'production',
  useCdn: true, // use cdn for performance, revalidation handles freshness
  apiVersion: '2024-11-30',
})

// non-CDN client for real-time data (promo codes, etc.)
// changes are reflected immediately without needing to redeploy
export const realtimeClient = createClient({
  projectId: 'nc4xlou0',
  dataset: 'production',
  useCdn: false, // bypass CDN for immediate updates
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

    // if sanity returned data but no sponsors could be resolved, fall back to legacy
    if (sponsorsWithNotes.length === 0) {
      return getLegacyMatchmakingData(eventSlug)
    }

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

// speaker types and functions

export type SanitySpeakerPublic = {
  _id: string
  name: string
  slug: { current: string }
  image?: { asset: { _ref: string } }
  position?: string
  company?: string
  bio?: string
}

export type EventSpeakerPublic = {
  _key: string
  speakerId: string
  speakerName: string
  speakerSlug: string
  speakerCompany?: string
  speakerPosition?: string
  speakerImage?: { asset: { _ref: string } }
  speakerBio?: string
  isVisible: boolean
  isKeynote: boolean
  keynoteHeaderText?: string
  label?: string
  sortOrder: number
}

// check if we're on staging site (show hidden speakers)
function isStaging(): boolean {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ''
  return siteUrl.includes('staging.')
}

// get speakers for an event (public-facing)
export async function getEventSpeakersPublic(eventId: number): Promise<{
  speakers: EventSpeakerPublic[]
  keynoteSpeakers: EventSpeakerPublic[]
} | null> {
  try {
    const result = await client.fetch(`
      *[_type == "eventSpeakers" && eventId == $eventId][0] {
        speakers[] {
          _key,
          "speakerId": speaker->_id,
          "speakerName": speaker->name,
          "speakerSlug": speaker->slug.current,
          "speakerCompany": speaker->company,
          "speakerPosition": speaker->position,
          "speakerImage": speaker->image,
          "speakerBio": speaker->bio,
          isVisible,
          isKeynote,
          keynoteHeaderText,
          label,
          sortOrder
        }
      }
    `, { eventId })

    if (!result || !result.speakers) {
      return null
    }

    // on staging, show all speakers regardless of visibility
    // on production, only show visible speakers
    const showAll = isStaging()
    const filteredSpeakers = showAll 
      ? result.speakers 
      : result.speakers.filter((s: EventSpeakerPublic) => s.isVisible)

    // separate keynotes and regular speakers
    const keynoteSpeakers = filteredSpeakers
      .filter((s: EventSpeakerPublic) => s.isKeynote)
      .sort((a: EventSpeakerPublic, b: EventSpeakerPublic) => a.sortOrder - b.sortOrder)

    const speakers = filteredSpeakers
      .filter((s: EventSpeakerPublic) => !s.isKeynote)
      .sort((a: EventSpeakerPublic, b: EventSpeakerPublic) => a.speakerName.localeCompare(b.speakerName))

    return { speakers, keynoteSpeakers }
  } catch (error) {
    console.error('Error fetching event speakers:', error)
    return null
  }
}

// get a single speaker by slug (for speaker detail pages if needed)
export async function getSpeakerBySlug(slug: string): Promise<SanitySpeakerPublic | null> {
  try {
    return client.fetch(`
      *[_type == "speaker" && slug.current == $slug][0] {
        _id,
        name,
        slug,
        image,
        position,
        company,
        bio
      }
    `, { slug })
  } catch (error) {
    console.error('Error fetching speaker:', error)
    return null
  }
}

// ============================================
// PROMO CODE VALIDATION (PUBLIC)
// ============================================

export type PromoCodePublic = {
  _id: string
  code: string
  discountPercentage: number
  eligibleTicketTypes: string[]
  eligibleEventIds: number[]
  expirationDate: string
  description?: string
  isActive: boolean
  autoApply: boolean
}

// validate a promo code for a specific event (public-facing)
// uses realtimeClient to bypass CDN cache - changes reflect immediately
export async function validatePromoCodeFromSanity(
  code: string,
  eventId: number
): Promise<{ valid: boolean; reason?: string; promoDetails?: PromoCodePublic }> {
  try {
    const promoCode = await realtimeClient.fetch<PromoCodePublic | null>(`
      *[_type == "promoCode" && code == $code && isActive == true][0] {
        _id,
        code,
        discountPercentage,
        eligibleTicketTypes,
        eligibleEventIds,
        expirationDate,
        description,
        isActive,
        autoApply
      }
    `, { code: code.toUpperCase() })

    if (!promoCode) {
      return { valid: false, reason: 'invalid' }
    }

    // check expiration
    if (new Date() > new Date(promoCode.expirationDate)) {
      return { valid: false, reason: 'expired' }
    }

    // check if valid for this event
    if (!promoCode.eligibleEventIds.includes(eventId)) {
      return { valid: false, reason: 'not_valid_for_event' }
    }

    return { valid: true, promoDetails: promoCode }
  } catch (error) {
    console.error('Error validating promo code:', error)
    return { valid: false, reason: 'error' }
  }
}

// get active promo codes for an event (public-facing)
// uses realtimeClient to bypass CDN cache - changes reflect immediately
export async function getActivePromoCodesForEventFromSanity(eventId: number): Promise<PromoCodePublic[]> {
  try {
    const now = new Date().toISOString()
    return realtimeClient.fetch<PromoCodePublic[]>(`
      *[_type == "promoCode" && isActive == true && $eventId in eligibleEventIds && expirationDate > $now] | order(code asc) {
        _id,
        code,
        discountPercentage,
        eligibleTicketTypes,
        eligibleEventIds,
        expirationDate,
        description,
        isActive,
        autoApply
      }
    `, { eventId, now })
  } catch (error) {
    console.error('Error fetching promo codes:', error)
    return []
  }
}

// get auto-apply promo codes for an event (public-facing)
// uses realtimeClient to bypass CDN cache - changes reflect immediately
export async function getAutoApplyPromoCodesFromSanity(eventId: number): Promise<PromoCodePublic[]> {
  try {
    const now = new Date().toISOString()
    return realtimeClient.fetch<PromoCodePublic[]>(`
      *[_type == "promoCode" && isActive == true && autoApply == true && $eventId in eligibleEventIds && expirationDate > $now] | order(discountPercentage desc) {
        _id,
        code,
        discountPercentage,
        eligibleTicketTypes,
        eligibleEventIds,
        expirationDate,
        description,
        isActive,
        autoApply
      }
    `, { eventId, now })
  } catch (error) {
    console.error('Error fetching auto-apply promo codes:', error)
    return []
  }
}
