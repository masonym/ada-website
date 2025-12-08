import { createClient } from '@sanity/client'

// admin client with write access - only use server-side
export const adminClient = createClient({
  projectId: 'nc4xlou0',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-11-30',
  token: process.env.SANITY_WRITE_TOKEN,
})

export type CreateSponsorInput = {
  name: string
  website?: string
  description?: string
}

export type AddSponsorToEventInput = {
  sponsorId: string
  eventId: number
  tierIds: string[] // can add to multiple tiers at once
}

// create a sponsor document
export async function createSponsor(input: CreateSponsorInput, imageAssetId: string) {
  const slug = input.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  return adminClient.create({
    _type: 'sponsor',
    name: input.name,
    slug: { _type: 'slug', current: slug },
    logo: {
      _type: 'image',
      asset: { _type: 'reference', _ref: imageAssetId }
    },
    website: input.website || undefined,
    description: input.description || undefined,
  })
}

// upload an image asset
export async function uploadImage(file: Buffer, filename: string) {
  return adminClient.assets.upload('image', file, { filename })
}

// add sponsor to event tiers
export async function addSponsorToEventTiers(input: AddSponsorToEventInput) {
  // first, get the current event sponsor document
  const eventSponsor = await adminClient.fetch<{ _id: string; tiers: Array<{ id: string; sponsors: Array<{ _ref: string }> }> } | null>(`
    *[_type == "eventSponsor" && eventId == $eventId][0] {
      _id,
      tiers[] {
        id,
        sponsors[] {
          _ref
        }
      }
    }
  `, { eventId: input.eventId })

  if (!eventSponsor) {
    throw new Error(`No event sponsor document found for event ${input.eventId}`)
  }

  // build patches for each tier
  for (const tierId of input.tierIds) {
    const tierIndex = eventSponsor.tiers.findIndex(t => t.id === tierId)
    if (tierIndex === -1) {
      console.warn(`Tier ${tierId} not found in event ${input.eventId}`)
      continue
    }

    // check if sponsor already exists in this tier
    const existingSponsors = eventSponsor.tiers[tierIndex].sponsors || []
    if (existingSponsors.some(s => s._ref === input.sponsorId)) {
      console.log(`Sponsor ${input.sponsorId} already in tier ${tierId}`)
      continue
    }

    // add sponsor to the tier
    await adminClient
      .patch(eventSponsor._id)
      .insert('after', `tiers[${tierIndex}].sponsors[-1]`, [{
        _type: 'reference',
        _ref: input.sponsorId,
        _key: `${input.sponsorId}-${Date.now()}`
      }])
      .commit()
  }

  return { success: true }
}

// get all events with their tiers for the form dropdown
export async function getEventsWithTiers() {
  return adminClient.fetch<Array<{
    _id: string
    eventId: number
    title: string
    tiers: Array<{ id: string; name: string }>
  }>>(`
    *[_type == "eventSponsor"] | order(eventId desc) {
      _id,
      eventId,
      title,
      tiers[] {
        id,
        name
      }
    }
  `)
}

// get all sponsors for reference
export async function getAllSponsorsAdmin() {
  return adminClient.fetch<Array<{
    _id: string
    name: string
    slug: { current: string }
  }>>(`
    *[_type == "sponsor"] | order(name asc) {
      _id,
      name,
      slug
    }
  `)
}

// add a new tier to an event
export async function addTierToEvent(eventId: number, tier: { id: string; name: string; style?: string }) {
  const eventSponsor = await adminClient.fetch<{ _id: string } | null>(`
    *[_type == "eventSponsor" && eventId == $eventId][0] { _id }
  `, { eventId })

  if (!eventSponsor) {
    throw new Error(`No event sponsor document found for event ${eventId}`)
  }

  await adminClient
    .patch(eventSponsor._id)
    .insert('after', 'tiers[-1]', [{
      _key: `tier-${Date.now()}`,
      id: tier.id,
      name: tier.name,
      style: tier.style || '',
      sponsors: []
    }])
    .commit()

  return { success: true }
}
