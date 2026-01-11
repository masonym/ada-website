import { createClient } from '@sanity/client'

// admin client with write access - only use server-side
export const adminClient = createClient({
  projectId: 'nc4xlou0',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-11-30',
  token: process.env.SANITY_WRITE_TOKEN,
})

// upload an image to Sanity and return the asset
export async function uploadImageToSanity(imageBuffer: Buffer, filename: string) {
  return adminClient.assets.upload('image', imageBuffer, { filename })
}

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

// update a sponsor's logo
export async function updateSponsorLogo(sponsorId: string, imageAssetId: string) {
  return adminClient
    .patch(sponsorId)
    .set({
      logo: {
        _type: 'image',
        asset: { _type: 'reference', _ref: imageAssetId }
      }
    })
    .commit()
}

// update sponsor details (name, website, description)
export async function updateSponsorDetails(
  sponsorId: string, 
  details: { name?: string; website?: string; description?: string }
) {
  const patch = adminClient.patch(sponsorId)
  
  if (details.name !== undefined) {
    patch.set({ name: details.name })
    // also update slug if name changes
    const slug = details.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    patch.set({ slug: { _type: 'slug', current: slug } })
  }
  if (details.website !== undefined) {
    patch.set({ website: details.website || undefined })
  }
  if (details.description !== undefined) {
    patch.set({ description: details.description || undefined })
  }
  
  return patch.commit()
}

// get a single sponsor's full details for editing
export async function getSponsorDetails(sponsorId: string) {
  return adminClient.fetch<{
    _id: string
    name: string
    slug: { current: string }
    website?: string
    description?: string
  } | null>(`
    *[_type == "sponsor" && _id == $sponsorId][0] {
      _id,
      name,
      slug,
      website,
      description
    }
  `, { sponsorId })
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

// matchmaking sponsors admin functions

export type MatchmakingSponsorEntry = {
  _key: string
  sponsor: { _type: 'reference'; _ref: string }
  note?: string
}

export type EventMatchmakingSponsorsDoc = {
  _id: string
  eventSlug: string
  title?: string
  description?: string
  sponsors: MatchmakingSponsorEntry[]
}

// get all matchmaking sponsor documents
export async function getAllMatchmakingSponsors() {
  return adminClient.fetch<EventMatchmakingSponsorsDoc[]>(`
    *[_type == "eventMatchmakingSponsors"] | order(eventSlug asc) {
      _id,
      eventSlug,
      title,
      description,
      sponsors[] {
        _key,
        sponsor { _type, _ref },
        note
      }
    }
  `)
}

// get matchmaking sponsors for a specific event
export async function getMatchmakingSponsorsForEvent(eventSlug: string) {
  return adminClient.fetch<EventMatchmakingSponsorsDoc | null>(`
    *[_type == "eventMatchmakingSponsors" && eventSlug == $eventSlug][0] {
      _id,
      eventSlug,
      title,
      description,
      sponsors[] {
        _key,
        sponsor { _type, _ref },
        note
      }
    }
  `, { eventSlug })
}

// create a new matchmaking sponsors document for an event
export async function createMatchmakingSponsorsDoc(input: {
  eventSlug: string
  title?: string
  description?: string
}) {
  return adminClient.create({
    _type: 'eventMatchmakingSponsors',
    eventSlug: input.eventSlug,
    title: input.title || 'Companies Participating in Matchmaking Sessions',
    description: input.description || '',
    sponsors: []
  })
}

// update matchmaking sponsors document metadata
export async function updateMatchmakingSponsorsMetadata(
  docId: string,
  input: { title?: string; description?: string }
) {
  return adminClient
    .patch(docId)
    .set({
      title: input.title,
      description: input.description
    })
    .commit()
}

// add a sponsor to matchmaking
export async function addSponsorToMatchmaking(
  docId: string,
  sponsorId: string,
  note?: string
) {
  return adminClient
    .patch(docId)
    .insert('after', 'sponsors[-1]', [{
      _key: `${sponsorId}-${Date.now()}`,
      sponsor: { _type: 'reference', _ref: sponsorId },
      note: note || undefined
    }])
    .commit()
}

// update a sponsor's note in matchmaking
export async function updateMatchmakingSponsorNote(
  docId: string,
  sponsorKey: string,
  note: string
) {
  return adminClient
    .patch(docId)
    .set({ [`sponsors[_key=="${sponsorKey}"].note`]: note || undefined })
    .commit()
}

// remove a sponsor from matchmaking
export async function removeSponsorFromMatchmaking(
  docId: string,
  sponsorKey: string
) {
  return adminClient
    .patch(docId)
    .unset([`sponsors[_key=="${sponsorKey}"]`])
    .commit()
}

// delete entire matchmaking sponsors document
export async function deleteMatchmakingSponsorsDoc(docId: string) {
  return adminClient.delete(docId)
}

// speaker admin functions

export type SanitySpeaker = {
  _id: string
  name: string
  slug: { current: string }
  image?: {
    asset: {
      _ref: string
      _type: 'reference'
    }
  }
  position?: string
  company?: string
  bio?: string
  isVisible: boolean
  priority: number
}

// get all speakers
export async function getAllSpeakers(): Promise<SanitySpeaker[]> {
  return adminClient.fetch<SanitySpeaker[]>(`
    *[_type == "speaker"] | order(priority desc, name asc) {
      _id,
      name,
      slug,
      image,
      position,
      company,
      bio,
      isVisible,
      priority
    }
  `)
}

// get a single speaker by ID
export async function getSpeakerById(speakerId: string): Promise<SanitySpeaker | null> {
  return adminClient.fetch<SanitySpeaker | null>(`
    *[_type == "speaker" && _id == $speakerId][0] {
      _id,
      name,
      slug,
      image,
      position,
      company,
      bio,
      isVisible,
      priority
    }
  `, { speakerId })
}

// create a new speaker
export async function createSpeaker(data: {
  name: string
  position?: string
  company?: string
  bio?: string
  isVisible?: boolean
  priority?: number
  imageAssetId?: string
}) {
  const slug = data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  const doc: any = {
    _type: 'speaker',
    name: data.name,
    slug: { _type: 'slug', current: slug },
    position: data.position || '',
    company: data.company || '',
    bio: data.bio || '',
    isVisible: data.isVisible !== false,
    priority: data.priority || 0,
  }

  if (data.imageAssetId) {
    doc.image = {
      _type: 'image',
      asset: { _type: 'reference', _ref: data.imageAssetId },
    }
  }

  return adminClient.create(doc)
}

// update speaker details
export async function updateSpeakerDetails(
  speakerId: string,
  details: {
    name?: string
    position?: string
    company?: string
    bio?: string
    isVisible?: boolean
    priority?: number
  }
) {
  const patch = adminClient.patch(speakerId)

  if (details.name !== undefined) {
    patch.set({ name: details.name })
    const slug = details.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    patch.set({ slug: { _type: 'slug', current: slug } })
  }
  if (details.position !== undefined) {
    patch.set({ position: details.position })
  }
  if (details.company !== undefined) {
    patch.set({ company: details.company })
  }
  if (details.bio !== undefined) {
    patch.set({ bio: details.bio })
  }
  if (details.isVisible !== undefined) {
    patch.set({ isVisible: details.isVisible })
  }
  if (details.priority !== undefined) {
    patch.set({ priority: details.priority })
  }

  return patch.commit()
}

// update speaker image
export async function updateSpeakerImage(speakerId: string, imageAssetId: string) {
  return adminClient
    .patch(speakerId)
    .set({
      image: {
        _type: 'image',
        asset: { _type: 'reference', _ref: imageAssetId },
      },
    })
    .commit()
}

// toggle speaker visibility
export async function toggleSpeakerVisibility(speakerId: string, isVisible: boolean) {
  return adminClient
    .patch(speakerId)
    .set({ isVisible })
    .commit()
}

// delete a speaker
export async function deleteSpeaker(speakerId: string) {
  return adminClient.delete(speakerId)
}

// event speakers admin functions

export type EventSpeakerEntry = {
  _key: string
  speaker: {
    _ref: string
    _type: 'reference'
  }
  isVisible: boolean
  isKeynote: boolean
  keynoteHeaderText?: string
  label?: string
  sortOrder: number
}

export type SanityEventSpeakers = {
  _id: string
  eventSlug: string
  eventId: number
  speakers: EventSpeakerEntry[]
}

export type EventSpeakerWithDetails = {
  _key: string
  speakerId: string
  speakerName: string
  speakerCompany?: string
  speakerPosition?: string
  speakerImage?: { asset: { _ref: string } }
  isVisible: boolean
  isKeynote: boolean
  keynoteHeaderText?: string
  label?: string
  sortOrder: number
}

// get event speakers document for an event
export async function getEventSpeakers(eventId: number): Promise<{
  _id: string
  eventSlug: string
  eventId: number
  speakers: EventSpeakerWithDetails[]
} | null> {
  const result = await adminClient.fetch(`
    *[_type == "eventSpeakers" && eventId == $eventId][0] {
      _id,
      eventSlug,
      eventId,
      speakers[] {
        _key,
        "speakerId": speaker->_id,
        "speakerName": speaker->name,
        "speakerCompany": speaker->company,
        "speakerPosition": speaker->position,
        "speakerImage": speaker->image,
        isVisible,
        isKeynote,
        keynoteHeaderText,
        label,
        sortOrder
      }
    }
  `, { eventId })
  return result
}

// create event speakers document
export async function createEventSpeakersDoc(eventId: number, eventSlug: string) {
  return adminClient.create({
    _type: 'eventSpeakers',
    eventId,
    eventSlug,
    speakers: [],
  })
}

// add speaker to event
export async function addSpeakerToEvent(
  eventSpeakersDocId: string,
  speakerId: string,
  options?: {
    isKeynote?: boolean
    keynoteHeaderText?: string
    label?: string
    sortOrder?: number
    isVisible?: boolean
  }
) {
  const key = `speaker-${Date.now()}`
  return adminClient
    .patch(eventSpeakersDocId)
    .append('speakers', [{
      _type: 'eventSpeakerEntry',
      _key: key,
      speaker: { _type: 'reference', _ref: speakerId },
      isVisible: options?.isVisible !== undefined ? options.isVisible : true,
      isKeynote: options?.isKeynote || false,
      keynoteHeaderText: options?.keynoteHeaderText || '',
      label: options?.label || '',
      sortOrder: options?.sortOrder || 0,
    }])
    .commit()
}

// remove speaker from event
export async function removeSpeakerFromEvent(eventSpeakersDocId: string, speakerKey: string) {
  return adminClient
    .patch(eventSpeakersDocId)
    .unset([`speakers[_key=="${speakerKey}"]`])
    .commit()
}

// toggle speaker visibility in event
export async function toggleEventSpeakerVisibility(
  eventSpeakersDocId: string,
  speakerKey: string,
  isVisible: boolean
) {
  return adminClient
    .patch(eventSpeakersDocId)
    .set({ [`speakers[_key=="${speakerKey}"].isVisible`]: isVisible })
    .commit()
}

// update event speaker details (keynote, label, etc.)
export async function updateEventSpeaker(
  eventSpeakersDocId: string,
  speakerKey: string,
  updates: {
    isKeynote?: boolean
    keynoteHeaderText?: string
    label?: string
    sortOrder?: number
  }
) {
  const patch = adminClient.patch(eventSpeakersDocId)
  
  if (updates.isKeynote !== undefined) {
    patch.set({ [`speakers[_key=="${speakerKey}"].isKeynote`]: updates.isKeynote })
  }
  if (updates.keynoteHeaderText !== undefined) {
    patch.set({ [`speakers[_key=="${speakerKey}"].keynoteHeaderText`]: updates.keynoteHeaderText })
  }
  if (updates.label !== undefined) {
    patch.set({ [`speakers[_key=="${speakerKey}"].label`]: updates.label })
  }
  if (updates.sortOrder !== undefined) {
    patch.set({ [`speakers[_key=="${speakerKey}"].sortOrder`]: updates.sortOrder })
  }
  
  return patch.commit()
}
