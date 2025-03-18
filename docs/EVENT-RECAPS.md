# Event Recaps System

This document explains the enhanced event recap system that allows for structured photo galleries with captions, people tags, and different layout sections.

## Overview

The event recap system provides a flexible way to display event photos with rich metadata:

- **Captions**: Add descriptive text to each image
- **People Tags**: Identify individuals in photos
- **Custom Sections**: Group photos into meaningful categories (speakers, exhibitors, etc.)
- **Multiple Layouts**: Choose from different display layouts for each section

## Data Structure

Event recaps are defined in `src/constants/eventRecaps.tsx` using the following structure:

```typescript
interface EventRecap {
  eventShorthand: string; // Matches event.eventShorthand
  title?: string; // Optional custom title
  introduction?: ReactNode; // Optional introduction text
  sections: RecapSection[];
}

interface RecapSection {
  id: string; // Unique identifier for the section
  title: string;
  description?: ReactNode;
  layout: 'grid' | 'masonry' | 'carousel' | 'featured';
  images: RecapImage[];
}

interface RecapImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
  featured?: boolean;
  people?: string[]; // Names of people in the image
  tags?: string[]; // For filtering/categorizing
}
```

## Available Layouts

The system supports four different layout types:

1. **Featured** (`featured`): A prominent grid layout for highlighted images
2. **Grid** (`grid`): A standard responsive grid layout
3. **Masonry** (`masonry`): A Pinterest-style layout with varying heights
4. **Carousel** (`carousel`): A horizontal scrolling carousel

## How to Add a New Event Recap

1. Upload photos to the S3 bucket at `events/[eventShorthand]/photos/`
2. Add a new entry to the `EVENT_RECAPS` array in `src/constants/eventRecaps.tsx`
3. Define sections and add images with appropriate metadata

Example:

```tsx
{
  eventShorthand: 'ada-2023',
  introduction: (
    <p className="text-lg mb-4">
      The American Defense Alliance 2023 brought together industry leaders and experts.
    </p>
  ),
  sections: [
    {
      id: 'featured',
      title: 'Event Highlights',
      layout: 'featured',
      images: [
        {
          src: 'events/ada-2023/photos/highlight-1.webp',
          alt: 'Keynote speaker addressing the audience',
          width: 1280,
          height: 960,
          caption: 'General James Smith delivering the keynote address',
          featured: true,
          people: ['General James Smith']
        },
        // More images...
      ]
    },
    // More sections...
  ]
}
```

## Admin Interface

An admin interface is available at `/admin/event-recaps` to help manage event recaps. This page shows:

1. Events with configured recaps
2. Events that need recaps to be configured
3. Links to view the recaps on the live site

## Migration Utility

A utility function is available to help migrate from the old system:

```typescript
import { generateBasicRecap } from '@/utils/recapUtils';

// Generate a basic recap structure from existing S3 images
const basicRecap = await generateBasicRecap(event);
```

## Best Practices

1. **Image Optimization**: All images should be in WebP format for optimal performance
2. **Meaningful Captions**: Write descriptive captions that provide context
3. **Consistent Sections**: Use similar section structures across events
4. **Responsive Testing**: Test all layouts on different screen sizes
5. **Accessibility**: Provide meaningful alt text for all images
