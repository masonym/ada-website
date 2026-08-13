import { NextRequest, NextResponse } from 'next/server'
import { getSheetData } from '@/lib/google-sheets'
import { getSpreadsheetConfigForEvent } from '@/lib/google-sheets/spreadsheet-mapping'
import { getAllSponsors, getEventSponsors } from '@/lib/sanity'

/**
 * Company names to caption an event's sponsor and exhibitor photos with.
 *
 * Two sources, because neither is complete on its own. Measured against the 2026
 * NMCPC recap, whose sponsors-and-exhibitors gallery names 49 companies:
 *
 *  - Sanity event sponsors covers 38 of them.
 *  - The event's registration sheet, restricted to exhibit and sponsorship
 *    registration types, covers 47 - it is the only place the booth-only
 *    exhibitors appear.
 *
 * Not sourced from exhibitors.ts, which describes booth packages rather than the
 * companies that bought them. Attendee rows are excluded deliberately: they add a
 * few hundred names that are almost never captioned, and drag in the scratch rows
 * the sheet accumulates.
 *
 * Note that per-event GOOGLE_SHEETS_SPREADSHEET_ID_* variables have to be set for
 * the sheet half to be event-specific; without them every event falls back to the
 * default spreadsheet.
 *
 * Admin-gated by src/middleware.ts, which matches /api/admin.
 */

export interface EventOrganization {
  name: string
}

const COMPANY_HEADER = 'company'
const TYPE_HEADER = 'registration type'
const BOOTH_TYPE_PATTERN = /exhib|sponsor/i
/** How many leading rows to search for the header before giving up. */
const HEADER_SEARCH_DEPTH = 15

/** Case- and punctuation-insensitive, so "Craft, Inc." and "Craft Inc" collapse. */
function normalise(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '')
}

/** Located by header text - column order in the sheet has changed before. */
function findColumn(header: string[], needle: string): number {
  return header.findIndex(cell => (cell ?? '').toLowerCase().includes(needle))
}

async function readRegistrationSheet(eventId: number): Promise<EventOrganization[]> {
  const config = getSpreadsheetConfigForEvent(eventId)
  // The tab name carries spaces and emoji, so it has to be quoted in the range.
  const rows = await getSheetData(
    config.spreadsheetId,
    `'${config.registrationSheetName}'!A:Z`
  )

  if (rows.length < 2) return []

  // The live sheet opens with blank and banner rows rather than the header, so
  // find the header instead of assuming row one.
  const headerRowIndex = rows
    .slice(0, HEADER_SEARCH_DEPTH)
    .findIndex(row => findColumn(row.map(cell => String(cell ?? '')), COMPANY_HEADER) !== -1)
  if (headerRowIndex === -1) return []

  const header = rows[headerRowIndex].map(cell => String(cell ?? ''))
  const companyIndex = findColumn(header, COMPANY_HEADER)
  const typeIndex = findColumn(header, TYPE_HEADER)

  // Only companies holding a booth or sponsorship. Attendee rows are the bulk of
  // the sheet and almost never get photographed as a company - including them
  // buried the useful names under a few hundred others, and dragged in the
  // scratch rows the sheet accumulates.
  if (typeIndex === -1) return []

  const byName = new Map<string, EventOrganization>()

  for (const row of rows.slice(headerRowIndex + 1)) {
    const name = String(row[companyIndex] ?? '').trim()
    if (!name) continue
    if (!BOOTH_TYPE_PATTERN.test(String(row[typeIndex] ?? ''))) continue

    const key = normalise(name)
    if (key) byName.set(key, { name })
  }

  return Array.from(byName.values())
}

/** Sponsors configured in Sanity, which may include names that never hit the sheet. */
async function readSanitySponsors(eventId: number): Promise<EventOrganization[]> {
  const eventSponsors = await getEventSponsors(eventId)
  if (!eventSponsors) return []

  const referencedIds = new Set(
    eventSponsors.tiers.flatMap(tier => (tier.sponsors ?? []).map(sponsor => sponsor._ref))
  )
  if (referencedIds.size === 0) return []

  const allSponsors = await getAllSponsors()

  return Array.from(referencedIds)
    .map(id => allSponsors[id]?.name)
    .filter((name): name is string => typeof name === 'string' && name.trim() !== '')
    .map(name => ({ name: name.trim() }))
}

export async function GET(request: NextRequest) {
  const eventIdParam = request.nextUrl.searchParams.get('eventId')
  if (!eventIdParam) {
    return NextResponse.json({ error: 'eventId is required' }, { status: 400 })
  }

  const eventId = parseInt(eventIdParam, 10)
  if (Number.isNaN(eventId)) {
    return NextResponse.json({ error: 'eventId must be a number' }, { status: 400 })
  }

  // Either source failing on its own should still leave the other usable - this
  // only feeds an autocomplete list, and the operator can always type a name.
  const [sheetResult, sponsorResult] = await Promise.allSettled([
    readRegistrationSheet(eventId),
    readSanitySponsors(eventId),
  ])

  const warnings: string[] = []
  const collected: EventOrganization[] = []

  if (sheetResult.status === 'fulfilled') {
    collected.push(...sheetResult.value)
  } else {
    console.error('Could not read the registration sheet:', sheetResult.reason)
    warnings.push('Could not read the registration sheet for this event.')
  }

  if (sponsorResult.status === 'fulfilled') {
    collected.push(...sponsorResult.value)
  } else {
    console.error('Could not read sponsors from Sanity:', sponsorResult.reason)
    warnings.push('Could not read the sponsor list for this event.')
  }

  const merged = new Map<string, EventOrganization>()
  for (const organization of collected) {
    const key = normalise(organization.name)
    if (key && !merged.has(key)) merged.set(key, organization)
  }

  const organizations = Array.from(merged.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  )

  // Report a failed source even when the other one returned names, so a half-empty
  // list does not read as a complete one.
  return NextResponse.json({
    organizations,
    warning: warnings.length > 0 ? warnings.join(' ') : undefined,
  })
}
