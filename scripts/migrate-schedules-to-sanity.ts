import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

dotenv.config()
dotenv.config({ path: '.env.local' })

require('ts-node/register/transpile-only')

const client = createClient({
  projectId: 'nc4xlou0',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-11-30',
  token: process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN,
})

type LegacySpeaker = {
  speakerId?: string
  name?: string
  title?: string
  affiliation?: string
  photo?: string
  presentation?: string
  videoId?: string
  videoStartTime?: number
  sponsor?: string
  sponsorStyle?: string
}

type LegacyScheduleItem = {
  time: string
  title: string
  location?: string
  duration?: string
  speakers?: LegacySpeaker[]
  description?: string
  sponsorLogo?: string
}

type LegacySchedule = {
  id: number
  schedule: Array<{
    date: string
    items: LegacyScheduleItem[]
  }>
}

type SpeakerLookup = Record<string, string>
type EventSlugLookup = Record<number, string>

const isWriteMode = process.argv.includes('--write')
const eventArg = process.argv.find((arg) => arg.startsWith('--eventId='))
const requestedEventId = eventArg ? parseInt(eventArg.split('=')[1], 10) : null

function createKey(prefix: string, parts: Array<string | number>) {
  return `${prefix}-${parts.join('-')}`.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 120)
}

function getEventSlugLookup(): EventSlugLookup {
  const eventsFilePath = path.join(process.cwd(), 'src', 'constants', 'events.tsx')
  const source = fs.readFileSync(eventsFilePath, 'utf8')
  const lookup: EventSlugLookup = {}
  const eventBlockRegex = /\{[\s\S]*?id:\s*(\d+),[\s\S]*?slug:\s*["']([^"']+)["'][\s\S]*?\}/g
  let match: RegExpExecArray | null

  while ((match = eventBlockRegex.exec(source)) !== null) {
    lookup[parseInt(match[1], 10)] = match[2]
  }

  return lookup
}

async function getSpeakerLookup(): Promise<SpeakerLookup> {
  const speakers = await client.fetch<Array<{ _id: string; slug?: { current?: string } }>>(`
    *[_type == "speaker"] {
      _id,
      slug
    }
  `)

  return speakers.reduce<SpeakerLookup>((acc, speaker) => {
    if (speaker.slug?.current) {
      acc[speaker.slug.current] = speaker._id
    }
    return acc
  }, {})
}

function toScheduleSpeaker(speaker: LegacySpeaker, speakerLookup: SpeakerLookup, context: string) {
  const speakerDocId = speaker.speakerId ? speakerLookup[speaker.speakerId] : undefined

  if (speaker.speakerId && !speakerDocId) {
    console.warn(`  WARN: No Sanity speaker found for slug "${speaker.speakerId}" in ${context}; keeping manual/media fields only`)
  }

  return {
    _type: 'scheduleSpeaker',
    _key: createKey('speaker', [context, speaker.speakerId || speaker.name || 'manual']),
    ...(speakerDocId ? { speaker: { _type: 'reference', _ref: speakerDocId } } : {}),
    name: speaker.name || '',
    title: speaker.title || '',
    affiliation: speaker.affiliation || '',
    photo: speaker.photo || '',
    presentation: speaker.presentation || '',
    videoId: speaker.videoId || '',
    videoStartTime: speaker.videoStartTime ?? undefined,
    sponsor: speaker.sponsor || '',
    sponsorStyle: speaker.sponsorStyle || '',
  }
}

function toEventScheduleDoc(schedule: LegacySchedule, eventSlug: string, speakerLookup: SpeakerLookup) {
  return {
    _type: 'eventSchedule',
    eventId: schedule.id,
    eventSlug,
    days: schedule.schedule.map((day, dayIndex) => ({
      _type: 'scheduleDay',
      _key: createKey('day', [schedule.id, dayIndex, day.date]),
      date: day.date,
      items: day.items.map((item, itemIndex) => ({
        _type: 'scheduleItem',
        _key: createKey('item', [schedule.id, dayIndex, itemIndex, item.time, item.title]),
        time: item.time,
        title: item.title,
        location: item.location || '',
        duration: item.duration || '',
        description: item.description || '',
        sponsorLogo: item.sponsorLogo || '',
        speakers: (item.speakers || []).map((speaker, speakerIndex) => toScheduleSpeaker(
          speaker,
          speakerLookup,
          `${schedule.id}-${dayIndex}-${itemIndex}-${speakerIndex}`
        )),
      })),
    })),
  }
}

async function migrateSchedules() {
  if (isWriteMode && !client.config().token) {
    console.error('ERROR: SANITY_WRITE_TOKEN or SANITY_API_TOKEN is required for --write')
    process.exit(1)
  }

  const { SCHEDULES } = require('../src/constants/schedules') as { SCHEDULES: LegacySchedule[] }
  const eventSlugs = getEventSlugLookup()
  const speakerLookup = await getSpeakerLookup()
  const schedules = requestedEventId ? SCHEDULES.filter((schedule) => schedule.id === requestedEventId) : SCHEDULES

  console.log(`${isWriteMode ? 'WRITE' : 'DRY RUN'}: Migrating ${schedules.length} schedule(s)`)
  console.log(`Found ${Object.keys(speakerLookup).length} Sanity speaker slug(s)`)

  let created = 0
  let updated = 0
  let skipped = 0

  for (const schedule of schedules) {
    const eventSlug = eventSlugs[schedule.id]

    if (!eventSlug) {
      console.warn(`SKIP: Event ${schedule.id} has no slug in src/constants/events.tsx`)
      skipped++
      continue
    }

    const doc = toEventScheduleDoc(schedule, eventSlug, speakerLookup)
    const existing = await client.fetch<{ _id: string } | null>(`*[_type == "eventSchedule" && eventId == $eventId][0]{ _id }`, { eventId: schedule.id })
    const sessionCount = doc.days.reduce((count, day) => count + day.items.length, 0)
    const speakerCount = doc.days.reduce((count, day) => count + day.items.reduce((itemCount, item) => itemCount + item.speakers.length, 0), 0)

    console.log(`${existing ? 'UPDATE' : 'CREATE'}: Event ${schedule.id} (${eventSlug}) - ${doc.days.length} day(s), ${sessionCount} session(s), ${speakerCount} speaker assignment(s)`)

    if (!isWriteMode) {
      continue
    }

    if (existing) {
      await client.patch(existing._id).set({ eventSlug: doc.eventSlug, days: doc.days }).commit()
      updated++
    } else {
      await client.create(doc)
      created++
    }
  }

  console.log('\n--- Schedule Migration Complete ---')
  console.log(`Created: ${created}`)
  console.log(`Updated: ${updated}`)
  console.log(`Skipped: ${skipped}`)
  console.log(`Mode: ${isWriteMode ? 'write' : 'dry-run'}`)
}

migrateSchedules().catch((error) => {
  console.error(error)
  process.exit(1)
})
