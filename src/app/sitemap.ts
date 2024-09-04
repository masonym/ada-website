// app/sitemap.ts
import { MetadataRoute } from 'next'
import { EVENTS } from '@/constants/events'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.americandefensealliance.org'
  
  const eventUrls = EVENTS.map(event => ({
    url: `${baseUrl}/events/${event.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    // Add other static pages...
    ...eventUrls,
  ]
}