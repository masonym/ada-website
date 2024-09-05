// app/sitemap.ts
import { MetadataRoute } from 'next';
import { EVENTS } from '@/constants/events';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.americandefensealliance.org';

  // List of sub-pages for each event slug
  const eventSubPages = ['about', 'sponsor', 'agenda', 'speakers', 'venue', 'faqs', 'event-recap'];

  // Generate URLs for each event and its sub-pages
  const eventUrls = EVENTS.flatMap((event) => {
    // Base URL for the main event page
    const urls = [
      {
        url: `${baseUrl}/events/${event.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      },
    ];

    // Add URLs for each sub-page under the event
    const subPageUrls = eventSubPages.map((subPage) => ({
      url: `${baseUrl}/events/${event.slug}/${subPage}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    return [...urls, ...subPageUrls];
  });

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact-us`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    // Add other static pages if necessary...
    ...eventUrls,
  ];
}
