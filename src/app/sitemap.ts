import { MetadataRoute } from 'next';
import { getAllEvents, getEventBundleForEvent } from '@/lib/events';
import { eventNavPaths } from '@/lib/event-nav-path';

/**
 * The site's sitemap.
 *
 * This is now the only generator. next-sitemap used to run as a postbuild step
 * and write public/sitemap.xml, and static files in public/ take precedence over
 * App Router route handlers - so this file was dead code and Google was being
 * served the generated one instead: 32 URLs with no event sub-pages, /admin and
 * /dev/email-preview included, and /robots.txt listed as an indexable page.
 *
 * Sub-page URLs are derived from EVENT_NAVS through the same helper the navbar
 * links with, so the sitemap cannot advertise a URL the navigation does not
 * produce. tests/03-event-data-integrity.spec.ts checks those resolve to real
 * routes on disk.
 */

const BASE_URL = 'https://www.americandefensealliance.org';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const eventUrls = getAllEvents()
    // `shown: false` is how an event is staged before announcement. Advertising
    // it to a crawler is exactly what that flag exists to prevent.
    .filter(event => event.shown !== false)
    .flatMap(event => {
      const { navItems } = getEventBundleForEvent(event);
      const hasFinished = Boolean(event.timeEnd) && new Date(event.timeEnd) < now;

      // Finished events keep their pages - recaps, photos and agendas are what
      // ranks for "2025 Navy & Marine Corps Procurement Conference" and is the
      // evidence a prospective sponsor looks for. They are demoted rather than
      // dropped, and crawled rarely, because the content stops changing.
      const priority = hasFinished ? 0.4 : 0.8;
      const changeFrequency = hasFinished ? ('yearly' as const) : ('weekly' as const);

      return [
        {
          url: `${BASE_URL}/events/${event.slug}`,
          lastModified: now,
          changeFrequency,
          priority,
        },
        ...eventNavPaths(navItems).map(path => ({
          url: `${BASE_URL}/events/${event.slug}/${path}`,
          lastModified: now,
          changeFrequency,
          priority: priority - 0.2,
        })),
      ];
    });

  return [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/contact-us`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/events`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    ...eventUrls,
  ];
}
