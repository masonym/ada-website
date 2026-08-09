/**
 * One-time migration script to import speakers from constants/speakers.ts to Sanity CMS
 * 
 * Usage:
 *   npx ts-node scripts/migrate-speakers-to-sanity.ts
 * 
 * Prerequisites:
 *   - Deploy the speaker schema to Sanity first (sanity deploy in ada-sponsor-cms)
 *   - Ensure SANITY_API_TOKEN env var is set with write permissions
 */

const { createClient } = require('@sanity/client')
const fs = require('fs')
const path = require('path')

const SANITY_PROJECT_ID = 'nc4xlou0'
const SANITY_DATASET = 'production'
const SANITY_API_VERSION = '2024-11-30'

// get token from environment
const SANITY_TOKEN = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN

if (!SANITY_TOKEN) {
  console.error('Error: SANITY_WRITE_TOKEN environment variable is required')
  console.error('Set it in your .env.local file or export it')
  process.exit(1)
}

const client = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: SANITY_API_VERSION,
  token: SANITY_TOKEN,
  useCdn: false,
})

const SPEAKERS_IMAGE_DIR = path.join(__dirname, '..', 'public', 'speakers')

// import speakers data inline to avoid module resolution issues
const { SPEAKERS, EVENT_SPEAKERS } = require('../src/constants/speakers')

// event slug mapping (eventId -> eventSlug)
// from src/constants/events.tsx
const EVENT_SLUGS: { [key: number]: string } = {
  1: '2025-defense-industry-forecast',
  2: '2025-southeast-defense-procurement-conference',
  3: 'driving-the-industrialization-of-space',
  4: '2025-navy-marine-corps-procurement-conference',
  5: '2026-defense-technology-aerospace-procurement-conference',
  6: '2026-navy-marine-corps-procurement-conference',
}

// keynote speakers per event (from events.tsx)
const KEYNOTE_SPEAKERS: { [key: number]: Array<{ speakerId: string; headerText: string }> } = {
  1: [
    { speakerId: 'michael-waltz', headerText: 'Congressional Keynote Speaker' },
    { speakerId: 'honorable-john-p-sean-coffey', headerText: 'Defense Department Keynote Speaker' },
  ],
  2: [
    { speakerId: 'representative-rob-wittman', headerText: 'Congressional Keynote Speaker' },
    { speakerId: 'neal-dunn', headerText: 'Congressional Keynote Speaker' },
    { speakerId: 'brandon-cockrell', headerText: 'United States Army Keynote Speaker' },
  ],
  4: [
    { speakerId: 'erica-h-plath', headerText: 'U.S. Navy Keynote Speaker' },
    { speakerId: 'christopher-m-haar', headerText: 'U.S. Marine Corps Keynote Speaker' },
  ],
}

async function uploadImage(imageName: string): Promise<string | null> {
  const imagePath = path.join(SPEAKERS_IMAGE_DIR, imageName)
  
  if (!fs.existsSync(imagePath)) {
    console.warn(`  Warning: Image not found: ${imagePath}`)
    return null
  }

  try {
    const imageBuffer = fs.readFileSync(imagePath)
    const asset = await client.assets.upload('image', imageBuffer, {
      filename: imageName,
    })
    return asset._id
  } catch (error) {
    console.error(`  Error uploading image ${imageName}:`, error)
    return null
  }
}

async function migrateSpeakersDatabase() {
  console.log('=== PHASE 1: Migrating Speaker Database ===\n')
  
  const speakerEntries = Object.entries(SPEAKERS)
  console.log(`Found ${speakerEntries.length} speakers to migrate\n`)

  let successCount = 0
  let skipCount = 0
  let errorCount = 0
  const speakerIdMap: { [slug: string]: string } = {}

  for (const [slug, speaker] of speakerEntries as [string, any][]) {
    console.log(`Processing: ${speaker.name} (${slug})`)

    // check if speaker already exists
    const existing = await client.fetch(
      `*[_type == "speaker" && slug.current == $slug][0]{ _id }`,
      { slug }
    )

    if (existing) {
      console.log(`  Skipping: Already exists in Sanity`)
      speakerIdMap[slug] = existing._id
      skipCount++
      continue
    }

    try {
      // upload image first
      let imageAssetId: string | null = null
      if (speaker.image) {
        console.log(`  Uploading image: ${speaker.image}`)
        imageAssetId = await uploadImage(speaker.image)
      }

      // create speaker document
      const doc: any = {
        _type: 'speaker',
        name: speaker.name,
        slug: { _type: 'slug', current: slug },
        position: speaker.position || '',
        company: speaker.company || '',
        bio: speaker.bio || '',
        isVisible: true,
        priority: 0,
      }

      if (imageAssetId) {
        doc.image = {
          _type: 'image',
          asset: { _type: 'reference', _ref: imageAssetId },
        }
      }

      const created = await client.create(doc)
      speakerIdMap[slug] = created._id
      console.log(`  Created successfully (${created._id})`)
      successCount++
    } catch (error) {
      console.error(`  Error creating speaker:`, error)
      errorCount++
    }
  }

  console.log('\n--- Speaker Database Migration Complete ---')
  console.log(`Success: ${successCount}`)
  console.log(`Skipped (already exists): ${skipCount}`)
  console.log(`Errors: ${errorCount}`)
  
  return speakerIdMap
}

async function migrateEventSpeakers(speakerIdMap: { [slug: string]: string }) {
  console.log('\n=== PHASE 2: Migrating Event-Speaker Assignments ===\n')

  for (const [eventIdStr, speakerEntries] of Object.entries(EVENT_SPEAKERS) as [string, any[]][]) {
    const eventId = parseInt(eventIdStr)
    const eventSlug = EVENT_SLUGS[eventId]
    
    if (!eventSlug) {
      console.log(`Skipping event ${eventId}: No slug mapping`)
      continue
    }

    console.log(`\nProcessing event: ${eventSlug} (ID: ${eventId})`)

    // check if event speakers doc already exists
    const existing = await client.fetch(
      `*[_type == "eventSpeakers" && eventId == $eventId][0]{ _id }`,
      { eventId }
    )

    if (existing) {
      console.log(`  Skipping: Event speakers already configured`)
      continue
    }

    // get keynote config for this event
    const keynotes = KEYNOTE_SPEAKERS[eventId] || []
    const keynoteMap = new Map(keynotes.map((k, i) => [k.speakerId, { ...k, order: i }]))

    // build speakers array
    const speakers: any[] = []
    
    for (const entry of speakerEntries) {
      const speakerId = typeof entry === 'string' ? entry : entry.id
      const label = typeof entry === 'object' ? entry.label : undefined
      
      // get sanity speaker ID
      let sanitySpeakerId = speakerIdMap[speakerId]
      
      if (!sanitySpeakerId) {
        // try to fetch from sanity
        const found = await client.fetch(
          `*[_type == "speaker" && slug.current == $slug][0]{ _id }`,
          { slug: speakerId }
        )
        if (found) {
          sanitySpeakerId = found._id
        } else {
          console.log(`  Warning: Speaker not found: ${speakerId}`)
          continue
        }
      }

      const keynoteInfo = keynoteMap.get(speakerId)
      
      speakers.push({
        _type: 'eventSpeakerEntry',
        _key: speakerId,
        speaker: { _type: 'reference', _ref: sanitySpeakerId },
        isVisible: true,
        isKeynote: !!keynoteInfo,
        keynoteHeaderText: keynoteInfo?.headerText || '',
        label: label || '',
        sortOrder: keynoteInfo?.order ?? 0,
      })
    }

    try {
      await client.create({
        _type: 'eventSpeakers',
        eventSlug,
        eventId,
        speakers,
      })
      console.log(`  Created event speakers doc with ${speakers.length} speakers`)
    } catch (error) {
      console.error(`  Error creating event speakers:`, error)
    }
  }

  console.log('\n--- Event-Speaker Migration Complete ---')
}

async function main() {
  console.log('Starting speaker migration to Sanity CMS...\n')
  
  const speakerIdMap = await migrateSpeakersDatabase()
  await migrateEventSpeakers(speakerIdMap)
  
  console.log('\n=== Migration Complete ===')
}

main().catch(console.error)
