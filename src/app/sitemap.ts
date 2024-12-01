// app/sitemap.ts
import { MetadataRoute } from 'next';
import { EVENTS } from '@/constants/events';
import { EVENT_NAVS } from '@/constants/eventNavs';

// Helper function to extract paths from nav items
function getEventPaths(eventId: number) {
  const eventNav = EVENT_NAVS.find(nav => nav.eventId === eventId);
  if (!eventNav) return [];

  const paths: string[] = [];
  
  eventNav.items.forEach(item => {
    if (item.path && item.path !== '/') {
      paths.push(item.path);
    }
    if (item.subItems) {
      item.subItems.forEach(subItem => {
        // Convert parent label to URL-friendly format and use as prefix
        const parentPath = item.label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        paths.push(`${parentPath}/${subItem.path}`);
      });
    }
  });

  return paths;
}
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.americandefensealliance.org';

  // Generate URLs for each event and its sub-pages
  const eventUrls = EVENTS.flatMap((event) => {
    const eventPaths = getEventPaths(event.id);
    
    // Base event URL
    const urls = [{
      url: `${baseUrl}/events/${event.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }];

    // Add URLs for each path from navigation
    const subPageUrls = eventPaths.map(path => ({
      url: `${baseUrl}/events/${event.slug}/${path}`,
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
    ...eventUrls,
  ];
}
