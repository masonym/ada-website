import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

import { EVENTS } from '@/constants/events';
import { REGISTRATION_TYPES } from '@/constants/registrations';
import { SPONSORSHIP_TYPES } from '@/constants/sponsorships';
import { EXHIBITOR_TYPES } from '@/constants/exhibitors';
import { FAQs } from '@/constants/faqs';
import { EVENT_NAVS } from '@/constants/eventNavs';
import { LODGING_INFO } from '@/constants/lodging';
import { EVENT_SPONSORS } from '@/constants/eventSponsors';
import { SPECIAL_FEATURES } from '@/constants/specialFeatures';
import { EVENT_METRICS_CONFIGS } from '@/constants/eventMetrics';
import { SCHEDULES } from '@/constants/schedules';
import { HIGHLIGHTS } from '@/constants/highlights';
import { EVENT_RECAPS } from '@/constants/eventRecaps';
import { EVENT_MATCHMAKING_SPONSORS } from '@/constants/matchmaking-sponsors';
import { eventNavPaths, eventPageUrl, type EventNavItem } from '@/lib/event-nav-path';

/**
 * Cross-file integrity for event data. Offline - no network, no credentials.
 *
 * An event is not one object: it is a numeric id repeated across a dozen
 * separate registries, and nothing in the type system checks that they agree.
 * Launching an event means editing every one of them and finding out what you
 * missed by clicking around the site. This spec turns that into a test failure.
 *
 * When a gap is deliberate, add it to KNOWN_ABSENT with a reason. The point is
 * not that every event appears everywhere - it is that "intentional" and
 * "forgotten" stop looking identical.
 */

const eventIds = EVENTS.map(e => e.id);
const eventById = new Map(EVENTS.map(e => [e.id, e]));

/** Registries an event is expected to have an entry in. */
const CORE_REGISTRIES = {
  REGISTRATION_TYPES: (REGISTRATION_TYPES as Array<{ id: number }>).map(x => x.id),
  SPONSORSHIP_TYPES: (SPONSORSHIP_TYPES as Array<{ id: number }>).map(x => x.id),
  EXHIBITOR_TYPES: (EXHIBITOR_TYPES as Array<{ id: number }>).map(x => x.id),
  FAQs: (FAQs as Array<{ id: number }>).map(x => x.id),
  EVENT_NAVS: (EVENT_NAVS as Array<{ eventId: number }>).map(x => x.eventId),
  SCHEDULES: (SCHEDULES as Array<{ id: number }>).map(x => x.id),
  LODGING_INFO: (LODGING_INFO as Array<{ eventId: number }>).map(x => x.eventId),
  EVENT_SPONSORS: (EVENT_SPONSORS as Array<{ id: number }>).map(x => x.id),
} as const;

/**
 * Registries that are genuinely per-event extras. Absence needs no excuse, but
 * an entry pointing at an event that does not exist is still a bug.
 */
const OPTIONAL_REGISTRIES = {
  SPECIAL_FEATURES: (SPECIAL_FEATURES as Array<{ id: number }>).map(x => x.id),
  EVENT_METRICS_CONFIGS: (EVENT_METRICS_CONFIGS as Array<{ eventId: number }>).map(x => x.eventId),
  HIGHLIGHTS: Object.keys(HIGHLIGHTS).map(Number),
} as const;

/**
 * Deliberate gaps, as of August 2026. Each entry is a claim that the event does
 * not need that registry - delete an entry and the test will tell you if that
 * stopped being true.
 */
const KNOWN_ABSENT: Record<keyof typeof CORE_REGISTRIES, Partial<Record<number, string>>> = {
  REGISTRATION_TYPES: {},
  SPONSORSHIP_TYPES: {},
  EXHIBITOR_TYPES: {
    3: '2025DTIOS was a partner event with no exhibit floor',
    9: '2026DIU has no exhibit floor - no Exhibitor Opportunities at this event',
  },
  FAQs: {
    3: '2025DTIOS used the partner organisation\'s own FAQ page',
    // Not a deliberate gap: the nav has an FAQs item and the page renders its
    // empty state. Awaiting copy from the events team.
    9: '2026DIU FAQ copy has not been written yet',
  },
  EVENT_NAVS: {},
  SCHEDULES: {
    8: '2027NMCPC agenda is not published yet',
  },
  LODGING_INFO: {
    1: '2025DIF was a single-day event with no room block',
    9: '2026DIU is a single-day event with no room block',
  },
  EVENT_SPONSORS: {
    1: '2025DIF sponsor logos were never backfilled after the event',
    7: '2026AFSFPC sponsors are managed in Sanity, not this file',
    8: '2027NMCPC has no sponsors signed yet',
    9: '2026DIU has no sponsors signed yet',
  },
};

test.describe('event data integrity', () => {
  test('event ids, slugs and shorthands are unique', () => {
    const dupes = (values: unknown[]) =>
      values.filter((v, i) => values.indexOf(v) !== i);

    expect(dupes(eventIds), 'duplicate event ids').toEqual([]);
    expect(dupes(EVENTS.map(e => e.slug)), 'duplicate slugs').toEqual([]);
    expect(dupes(EVENTS.map(e => e.eventShorthand)), 'duplicate shorthands').toEqual([]);
  });

  test('every event appears in each core registry, or is listed as a known gap', () => {
    const problems: string[] = [];

    for (const [name, ids] of Object.entries(CORE_REGISTRIES)) {
      const present = new Set(ids);
      const allowed = KNOWN_ABSENT[name as keyof typeof CORE_REGISTRIES];

      for (const event of EVENTS) {
        if (present.has(event.id)) continue;
        if (allowed[event.id]) continue;
        problems.push(
          `${name} has no entry for event ${event.id} (${event.eventShorthand}). ` +
            `Add one, or record why it is absent in KNOWN_ABSENT.`
        );
      }
    }

    expect(problems, `\n  ${problems.join('\n  ')}\n`).toEqual([]);
  });

  test('KNOWN_ABSENT does not list gaps that have since been filled', () => {
    const stale: string[] = [];

    for (const [name, ids] of Object.entries(CORE_REGISTRIES)) {
      const present = new Set(ids);
      const allowed = KNOWN_ABSENT[name as keyof typeof CORE_REGISTRIES];

      for (const key of Object.keys(allowed)) {
        const id = Number(key);
        if (present.has(id)) {
          stale.push(`${name}: event ${id} now has an entry - remove it from KNOWN_ABSENT`);
        }
        if (!eventById.has(id)) {
          stale.push(`${name}: KNOWN_ABSENT names event ${id}, which does not exist`);
        }
      }
    }

    expect(stale, `\n  ${stale.join('\n  ')}\n`).toEqual([]);
  });

  test('no registry entry points at an event that does not exist', () => {
    const orphans: string[] = [];
    const known = new Set(eventIds);

    for (const [name, ids] of Object.entries({ ...CORE_REGISTRIES, ...OPTIONAL_REGISTRIES })) {
      for (const id of ids) {
        if (!known.has(id)) orphans.push(`${name} has an entry for unknown event id ${id}`);
      }
    }

    // These two are keyed by shorthand and slug rather than id, which is its own
    // hazard - a typo silently produces a section that never renders.
    const shorthands = new Set(EVENTS.map(e => e.eventShorthand));
    for (const recap of EVENT_RECAPS) {
      if (!shorthands.has(recap.eventShorthand)) {
        orphans.push(`EVENT_RECAPS references unknown shorthand "${recap.eventShorthand}"`);
      }
    }

    const slugs = new Set(EVENTS.map(e => e.slug));
    for (const slug of Object.keys(EVENT_MATCHMAKING_SPONSORS)) {
      if (!slugs.has(slug)) {
        orphans.push(`EVENT_MATCHMAKING_SPONSORS references unknown slug "${slug}"`);
      }
    }

    expect(orphans, `\n  ${orphans.join('\n  ')}\n`).toEqual([]);
  });

  test('cross-references between events resolve', () => {
    const broken: string[] = [];
    const slugs = new Set(EVENTS.map(e => e.slug));

    for (const event of EVENTS) {
      const label = `event ${event.id} (${event.eventShorthand})`;

      if (event.relatedEventId !== undefined && !eventById.has(event.relatedEventId)) {
        broken.push(`${label}: relatedEventId ${event.relatedEventId} does not exist`);
      }

      if (
        event.testimonialsFromEventId !== undefined &&
        !eventById.has(event.testimonialsFromEventId)
      ) {
        broken.push(
          `${label}: testimonialsFromEventId ${event.testimonialsFromEventId} does not exist`
        );
      }

      for (const link of event.links ?? []) {
        if (!link.hrefOverride && !slugs.has(link.targetSlug)) {
          broken.push(`${label}: links targetSlug "${link.targetSlug}" does not exist`);
        }
      }
    }

    expect(broken, `\n  ${broken.join('\n  ')}\n`).toEqual([]);
  });

  test('every nav item points at a route that exists', () => {
    // Nav labels are turned into URL segments by string-mangling, so renaming a
    // label silently changes live URLs. Until the path is stored in the data
    // (MAINT-04), at least verify the result resolves to a page on disk.
    //
    // This walks eventNavPaths(), the same function the navbar links with and
    // the sitemap advertises - so a route this test cannot find is a route
    // neither of them can reach either.
    const eventRoot = path.join(process.cwd(), 'src', 'app', 'events', '[slug]');

    const routeExists = (segments: string) => {
      const dir = path.join(eventRoot, ...segments.split('/'));
      return fs.existsSync(path.join(dir, 'page.tsx')) || fs.existsSync(path.join(dir, 'page.jsx'));
    };

    const missing: string[] = [];

    for (const nav of EVENT_NAVS as Array<{ eventId: number; items: EventNavItem[] }>) {
      const event = eventById.get(nav.eventId);
      const label = `event ${nav.eventId}${event ? ` (${event.eventShorthand})` : ''}`;

      for (const navPath of eventNavPaths(nav.items)) {
        if (!routeExists(navPath)) {
          missing.push(`${label}: /${navPath}`);
        }
      }
    }

    expect(missing, `nav items with no matching route:\n  ${missing.join('\n  ')}\n`).toEqual([]);
  });

  test('nav and sitemap URLs are well formed', () => {
    // The navbar and app/sitemap.ts once derived sub-page segments with two
    // different transforms; they now share navGroupPath, so divergence is
    // structurally impossible rather than merely unobserved.
    //
    // What is still worth asserting is the slash handling. Nav entries are
    // inconsistent about leading slashes - event 2 writes 'venue-and-lodging',
    // events 4-8 write '/venue-and-lodging' - and interpolating those naively
    // produced /events/<slug>//venue-and-lodging, which answered 308 on five
    // events and was the form the sitemap advertised.
    const malformed: string[] = [];

    for (const nav of EVENT_NAVS as Array<{ eventId: number; items: EventNavItem[] }>) {
      const event = eventById.get(nav.eventId);
      if (!event) continue;

      const urls = [
        eventPageUrl(event.slug),
        ...nav.items.map(item => eventPageUrl(event.slug, item.path)),
        ...eventNavPaths(nav.items).map(navPath => eventPageUrl(event.slug, navPath)),
      ];

      for (const url of urls) {
        if (url.includes('//') || url.endsWith('/')) {
          malformed.push(`event ${nav.eventId} (${event.eventShorthand}): ${url}`);
        }
      }
    }

    expect(
      malformed,
      `URLs that would redirect rather than resolve:\n  ${malformed.join('\n  ')}\n`
    ).toEqual([]);
  });

  test('events that are still selling have something to sell', () => {
    const now = new Date();
    const problems: string[] = [];

    for (const event of EVENTS) {
      const upcoming = new Date(event.timeEnd) >= now;
      if (!upcoming || event.shown === false) continue;

      const registrations = (REGISTRATION_TYPES as Array<{ id: number; registrations: unknown[] }>)
        .find(r => r.id === event.id);

      if (!registrations || registrations.registrations.length === 0) {
        problems.push(
          `event ${event.id} (${event.eventShorthand}) is upcoming and visible but has no registration options`
        );
      }
    }

    expect(problems, `\n  ${problems.join('\n  ')}\n`).toEqual([]);
  });
});
