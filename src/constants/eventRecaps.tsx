// constants/eventRecaps.tsx
import { EventRecap } from '@/types/eventRecap';
import React from 'react';

// Example event recap data
export const EVENT_RECAPS: EventRecap[] = [
  {
    eventShorthand: '2025SDPC', // This should match the event.eventShorthand
    introduction: (
      <>
        <p className="text-lg mb-4">
          The American Defense Alliance 2023 brought together industry leaders, government officials, 
          and defense experts for a day of insightful discussions and networking.
        </p>
      </>
    ),
    sections: [
      {
        id: 'featured',
        title: 'Event Highlights',
        description: (
          <p className="text-base text-gray-600 mb-6">
            Key moments from throughout the day showcasing speakers, attendees, and special presentations.
          </p>
        ),
        layout: 'featured',
        images: [
          {
            src: 'events/ada-2023/photos/highlight-1.webp',
            alt: 'Keynote speaker addressing the audience',
            width: 1280,
            height: 960,
            caption: 'General James Smith delivering the keynote address on emerging defense technologies',
            featured: true,
            people: ['General James Smith'],
            tags: ['keynote', 'speaker']
          },
          // Additional featured images would be added here
        ]
      },
      {
        id: 'speakers',
        title: 'Speakers & Presentations',
        layout: 'grid',
        images: [
          {
            src: 'events/2025SDPC/photos/speaker-1.webp',
            alt: 'Panel discussion on cybersecurity',
            width: 1280,
            height: 960,
            caption: 'Panel discussion: "The Future of Cybersecurity in Defense"',
            people: ['Dr. Sarah Johnson', 'Colonel Robert Davis', 'Maria Chen'],
            tags: ['panel', 'cybersecurity']
          },
          // Additional speaker images would be added here
        ]
      },
      {
        id: 'exhibitors',
        title: 'Exhibitors & Technology Showcase',
        layout: 'masonry',
        images: [
          {
            src: 'events/2025SDPC/photos/2025_SDPC_-_Speakers_38.webp',
            alt: 'Advanced drone technology display',
            width: 1280,
            height: 960,
            caption: 'NextGen Defense Systems showcasing their latest drone technology',
            tags: ['exhibitor', 'technology']
          },
          // Additional exhibitor images would be added here
        ]
      },
      {
        id: 'networking',
        title: 'Networking & Connections',
        layout: 'carousel',
        images: [
          {
            src: 'events/2025SDPC/photos/2025_SDPC_-_Speakers_38.webp',
            alt: 'Attendees networking during break',
            width: 1280,
            height: 960,
            caption: 'Industry professionals connecting during the afternoon networking session',
            tags: ['networking']
          },
          // Additional networking images would be added here
        ]
      }
    ]
  },
  // Additional event recaps would be added here
];

/**
 * Get recap data for a specific event
 * @param eventShorthand The shorthand identifier for the event
 * @returns The event recap data or undefined if not found
 */
export function getEventRecap(eventShorthand: string): EventRecap | undefined {
  return EVENT_RECAPS.find(recap => recap.eventShorthand === eventShorthand);
}
