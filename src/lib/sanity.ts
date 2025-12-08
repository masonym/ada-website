import { createClient } from '@sanity/client'
import { createImageUrlBuilder } from '@sanity/image-url'
export const client = createClient({
  projectId: 'nc4xlou0',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2024-11-30',
})

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
  return await client.fetch<SanityEventSponsor | null>(`
    *[_type == "eventSponsor" && eventId == $eventId][0] {
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
    }
  `, { eventId })
}

export async function getEventTierSponsors(eventId: number, tierId: string): Promise<SanitySponsor[]> {
  const event = await getEventSponsors(eventId)
  if (!event) return []
  
  const tier = event.tiers.find(t => t.id === tierId)
  if (!tier) return []
  
  return await client.fetch<SanitySponsor[]>(`
    *[_type == "sponsor" && _id in $sponsorIds] {
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
  `, { sponsorIds: tier.sponsors.map(s => s._ref) })
}
