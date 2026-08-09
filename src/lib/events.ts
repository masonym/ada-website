import { EVENTS } from '@/constants/events';
import { EVENT_NAVS } from '@/constants/eventNavs';
import { FAQs } from '@/constants/faqs';
import { LODGING_INFO } from '@/constants/lodging';
import { SCHEDULES } from '@/constants/schedules';
import { SPECIAL_FEATURES } from '@/constants/specialFeatures';
import { EVENT_METRICS_CONFIGS } from '@/constants/eventMetrics';
import { HIGHLIGHTS } from '@/constants/highlights';
import {
  getRegistrationsForEvent,
  getSponsorshipsForEvent,
  getExhibitorsForEvent,
  AdapterModalRegistrationType,
} from '@/lib/registration-adapters';
import { Event } from '@/types/events';

/**
 * One place to ask about an event.
 *
 * An event is currently a numeric id repeated across a dozen registries in
 * src/constants, each of which every page had to import and search separately.
 * That is what makes launching an event a thirteen-file edit, and what makes it
 * expensive to change the shape of event data at all.
 *
 * `getEventBundle` is the seam: pages consume the bundle, and the registries
 * become an implementation detail behind this module. Moving a slice into Sanity
 * or re-keying on `eventShorthand` then means changing this file, not every
 * page - which is the whole point of putting it here first.
 *
 * Server-side by intent. Client components should receive what they need as
 * props rather than importing this module, or they pull the entire constants
 * graph into the browser bundle (see PERF-02).
 */

// ---------------------------------------------------------------------------
// Lookups
// ---------------------------------------------------------------------------

export function getEventBySlug(slug: string): Event | undefined {
  return EVENTS.find(event => event.slug === slug);
}

export function getEventById(eventId: string | number): Event | undefined {
  const id = Number(eventId);
  return EVENTS.find(event => event.id === id);
}

export function getEventByShorthand(shorthand: string): Event | undefined {
  return EVENTS.find(event => event.eventShorthand === shorthand);
}

export function getAllEvents(): Event[] {
  return EVENTS;
}

/**
 * Events that have not finished yet, soonest first.
 *
 * Reads `timeEnd`, which is a real ISO timestamp. The previous implementation
 * parsed the human-readable `date` field with `new Date()`, which silently
 * produced nonsense for the ranges this site uses:
 *
 *   new Date("March 11-12, 2025")  ->  March 11 *2012*
 *   new Date("July 29-30, 2025")   ->  July 29 *2030*
 *
 * Nothing imported it, so nothing was broken - but it sat in the obvious place
 * to reach for. Where a display string genuinely has to be parsed, use
 * parseEventStartDate() from utils/event-callout.
 */
export function getUpcomingEvents(now: Date = new Date()): Event[] {
  return EVENTS.filter(event => event.timeEnd && new Date(event.timeEnd) >= now).sort(
    (a, b) => new Date(a.timeStart).getTime() - new Date(b.timeStart).getTime()
  );
}

/** Events that have finished, most recent first. */
export function getPastEvents(now: Date = new Date()): Event[] {
  return EVENTS.filter(event => event.timeEnd && new Date(event.timeEnd) < now).sort(
    (a, b) => new Date(b.timeStart).getTime() - new Date(a.timeStart).getTime()
  );
}

/**
 * Minimal shape for the site header's events dropdown.
 *
 * The header is a client component on every page. Handing it this instead of
 * letting it import EVENTS keeps eight events' worth of marketing prose, JSX and
 * topical-coverage lists out of the shared browser bundle.
 */
export type EventLinkSummary = {
  id: number;
  title: string;
  slug: string;
  timeStart: string;
};

export function getUpcomingEventLinks(now: Date = new Date()): EventLinkSummary[] {
  return getUpcomingEvents(now)
    .filter(event => event.shown !== false)
    .map(({ id, title, slug, timeStart }) => ({ id, title, slug, timeStart }));
}

// ---------------------------------------------------------------------------
// The bundle
// ---------------------------------------------------------------------------

type NavItem = {
  label: string;
  path?: string;
  subItems?: Array<{ label: string; path: string }>;
};

export type EventBundle = {
  event: Event;

  /** Purchasable options, already normalised by the registration adapters. */
  registrations: AdapterModalRegistrationType[];
  sponsorships: AdapterModalRegistrationType[];
  exhibitors: AdapterModalRegistrationType[];

  navItems: NavItem[];
  faqs: Array<{ question: string; answer: string }>;
  lodging: (typeof LODGING_INFO)[number] | undefined;
  schedule: (typeof SCHEDULES)[number] | undefined;
  specialFeatures: (typeof SPECIAL_FEATURES)[number] | undefined;
  metrics: (typeof EVENT_METRICS_CONFIGS)[number] | undefined;
  highlights: (typeof HIGHLIGHTS)[number] | undefined;
};

/**
 * Assembles everything the event pages need for one event.
 *
 * Every lookup is an in-memory array scan over at most a few dozen entries, so
 * doing them together costs nothing measurable and saves each page from knowing
 * which file holds what.
 */
export function getEventBundle(slug: string): EventBundle | undefined {
  const event = getEventBySlug(slug);
  if (!event) return undefined;

  return getEventBundleForEvent(event);
}

/** Same, when the caller already has the event (avoids a second lookup). */
export function getEventBundleForEvent(event: Event): EventBundle {
  const id = event.id;

  return {
    event,

    registrations: getRegistrationsForEvent(id),
    sponsorships: getSponsorshipsForEvent(id),
    exhibitors: getExhibitorsForEvent(id),

    navItems: (EVENT_NAVS as Array<{ eventId: number; items: NavItem[] }>).find(
      nav => nav.eventId === id
    )?.items ?? [],

    faqs:
      (FAQs as Array<{ id: number; faqs: Array<{ question: string; answer: string }> }>).find(
        entry => entry.id === id
      )?.faqs ?? [],

    lodging: LODGING_INFO.find(entry => entry.eventId === id),
    schedule: (SCHEDULES as Array<{ id: number }>).find(entry => entry.id === id) as
      | (typeof SCHEDULES)[number]
      | undefined,
    specialFeatures: SPECIAL_FEATURES.find(entry => entry.id === id),
    metrics: EVENT_METRICS_CONFIGS.find(entry => entry.eventId === id),
    highlights: HIGHLIGHTS[id],
  };
}
