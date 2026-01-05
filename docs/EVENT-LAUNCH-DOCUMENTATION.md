# Event Launch Documentation

## Overview
This document provides a comprehensive guide for launching a new event on the ADA (American Defense Alliance) website. It outlines all required information, configurations, and steps needed to successfully add and manage a new event.

## Table of Contents
1. [Core Event Information](#core-event-information)
2. [Registration Setup](#registration-setup)
3. [Sponsorship Configuration](#sponsorship-configuration)
4. [Exhibitor Setup](#exhibitor-setup)
5. [Speaker Management](#speaker-management)
6. [Schedule Creation](#schedule-creation)
7. [Venue & Location Details](#venue--location-details)
8. [Navigation Structure](#navigation-structure)
9. [Supporting Content](#supporting-content)
10. [Technical Requirements](#technical-requirements)
11. [Launch Checklist](#launch-checklist)

## Core Event Information

### Required Event Properties
Every event must have the following core properties defined in `src/constants/events.tsx`:

```typescript
{
  id: number,                    // Unique identifier (increment from last event)
  title: string,                 // Event name
  date: string,                  // Display date (e.g., "March 11-12, 2025")
  timeStart: string,             // ISO timestamp (e.g., "2025-03-11T11:30:00Z")
  timeEnd: string,               // ISO timestamp (e.g., "2025-03-12T16:30:00Z")
  description: string,           // Brief event description
  eventText: ReactNode,          // Detailed overview (JSX)
  aboutEventText?: ReactNode,    // About page content (optional)
  image: string,                 // Hero image path
  slug: string,                  // URL path (e.g., "2025-southeast-defense-procurement-conference")
  locationImage: string,         // Venue photo
  locationAddress: string,       // Full address with HTML line breaks
  eventShorthand: string,        // Short code for registrations (e.g., "2025SDPC")
  shown?: boolean,               // Controls visibility in listings (default: true)
}
```

### Optional Event Features
```typescript
{
  // Registration
  password?: string,                    // Event password protection
  registrationTypes?: RegistrationType[],
  registerLink?: string,                // External registration URL
  
  // Content & Branding
  topicalCoverage: Array<{tagline: string; description: string}>,
  featuredTopics?: FeaturedTopicDetail[],
  featuredTopicsTitle?: string,
  featuredTopicsSubtitle?: string,
  testimonials?: EventTestimonial[],
  testimonialsFromEventId?: number,     // Borrow testimonials from another event
  relatedEventId?: number,              // Source content from related event
  
  // Special Features
  expectations?: AudienceExpectations[],
  expectationsText?: string,
  sales?: Sale[],                        // Promotional sales
  vipNetworkingReception?: VipNetworkingReception,
  matchmakingSessions?: MatchmakingSession,
  features?: EventFeatures,             // Component visibility flags
  
  // Location & Logistics
  placeID?: string,                     // Google Maps Place ID
  directions?: Array<{title: string; description: string}>,
  parkingInfo?: Array<{...}>,
  parkingBox?: {text: string; imagePlaceholder: string},
  
  // Visual Customization
  images?: Array<{id: string; src: string; alt: string}>,
  countdownColour?: string,
  
  // Notices & Badges
  registrationClosedTime?: string,       // Custom registration close time
  registrationClosedNotice?: string,     // Custom closed message (HTML)
  eventPageNotice?: string,              // Page banner notice (HTML)
  eventPageNoticeVariant?: 'warning' | 'info' | 'error',
  badge?: {text: string; color: 'green' | 'blue' | 'red' | 'yellow'},
  
  // Related Events
  links?: EventLink[],                   // Links to related events
  
  // Contact & Sponsorship
  contactInfo?: {
    contactText?: string;
    contactEmail?: string;
    contactEmail2?: string;
  };
  sponsorshipInfo?: {
    sponsorSection?: ReactNode;
    customContactText?: ReactNode;
    exhibitorSpacesText?: ReactNode;
  };
  sponsorProspectusPath?: string,        // PDF path
  customFooterText?: ReactNode,
}
```

## Registration Setup

### Registration Types Configuration
In `src/constants/registrations.ts`, create a new registration type object:

```typescript
{
  id: [EVENT_ID],  // Must match event ID
  registrations: [
    {
      id: "unique-id",              // Optional unique identifier
      title: string,                // e.g., "Attendee Pass", "VIP Pass"
      headerImage: string,          // Card header image
      perks: Array<string | {formatted: FormattedPerk[]}>,  // Benefits list
      buttonText: string,           // CTA button text
      type: "paid" | "complimentary" | "sponsor",
      price?: number,               // Standard price
      earlyBirdPrice?: number,      // Discounted price
      earlyBirdDeadline?: string,   // ISO timestamp
      saleEndTime?: string,         // Sale end time
      receptionPrice?: string,      // Optional reception add-on price
      availabilityInfo?: string,    // Availability note
      requiresCode?: boolean,       // Access code requirement
      validationCode?: string,      // Required access code
      maxQuantityPerOrder?: number, // Purchase limit
      isGovtFreeEligible?: boolean, // Free for government
      shownOnRegistrationPage?: boolean,
    }
  ],
  addOns?: [                       // Optional add-ons
    {
      title: string,
      description: string,
      price: string,
    }
  ]
}
```

### Registration Best Practices
1. Always include at least one paid and one government option
2. Use formatted perks for complex benefit lists
3. Set appropriate early bird deadlines (typically 2-3 weeks before event)
4. Include reception pricing separately if applicable
5. Set max quantities for limited availability items

## Sponsorship Configuration

### Sponsorship Tiers
In `src/constants/sponsorships.ts`, define sponsorship packages:

```typescript
{
  id: [EVENT_ID],
  sponsorships: [
    {
      id: "unique-tier-id",
      title: string,                // e.g., "Platinum Sponsorship"
      cost: number,                 // Sponsorship cost
      sponsorPasses: number,        // Number of included passes
      requiresAttendeeInfo: boolean, // Collect attendee details
      slotsPerEvent?: number,       // Limited availability
      perks: Array<Perk>,          // Benefits (use formatted for complex lists)
      colour: string,               // Theme color
      headerImage: string,
      buttonText: string,
      description: string,
      isActive: boolean,
      showRemaining?: boolean,      // Show remaining slots
      saleEndTime?: string,         // Registration deadline
    }
  ],
  // Optional additional passes for existing sponsors
  additionalPass?: {
    name: string,
    title: string,
    description: string,
    price: number,
    headerImage: string,
    buttonText: string,
    maxQuantityPerOrder: number,
    perks: Array<string | {formatted: FormattedPerk[]}>,
  },
  // Optional prime sponsor (exclusive top tier)
  primeSponsor?: { ... }
}
```

### Common Sponsorship Tiers
- Platinum/Premier: $10,000+, 5 passes, 20-minute speaking slot
- Gold: $7,000, 4 passes, 15-minute speaking slot
- Silver: $5,000, 3 passes, 10-minute speaking slot
- Bronze: $3,000, 2 passes, 5-minute speaking slot
- Special Event: VIP Reception, Luncheon, etc.

## Exhibitor Setup

### Exhibitor Packages
In `src/constants/exhibitors.ts`:

```typescript
{
  id: [EVENT_ID],
  exhibitors: [
    {
      id: "exhibit-pass-id",
      title: string,                // e.g., "Table-Top Exhibit Space"
      cost: number,
      earlyBirdPrice?: number,
      earlyBirdDeadline?: string,
      headerImage: string,
      buttonText: string,
      description: string,
      isActive: boolean,
      requiresAttendeeInfo: boolean,
      maxQuantityPerOrder: number,
      slotsPerEvent?: number,       // Total available spaces
      showRemaining?: boolean,
      saleEndTime?: string,
      isGovtFreeEligible?: boolean,
      shownOnRegistrationPage: boolean,
      perks: Array<Perk>,          // Use formatted for detailed lists
      colour?: string,
    }
  ],
  // Additional exhibitor passes
  additionalPass?: {
    name: string,
    title: string,
    description: string,
    price: number,
    headerImage: string,
    buttonText: string,
    maxQuantityPerOrder: number,
    perks: Array<string | {formatted: FormattedPerk[]}>,
  }
}
```

## Speaker Management

### Speaker Database
In `src/constants/speakers.ts`:

```typescript
{
  "speaker-id": {
    image: string,                 // Photo filename
    name: string,                  // Full name with title
    position: string,              // Job title
    company: string,               // Organization
    bio?: string,                  // HTML-formatted biography
  }
}
```

### Speaker Best Practices
1. Use consistent image naming (kebab-case)
2. Include full titles and credentials
3. Write bios in HTML with `<br/><br/>` for paragraphs
4. Keep speaker IDs unique and descriptive
5. Store all speaker photos in `/public/speakers/`

## Schedule Creation

### Event Schedule
In `src/constants/schedules.tsx`:

```typescript
{
  id: [EVENT_ID],
  schedule: [
    {
      date: string,                // e.g., "March 11, 2025"
      items: [
        {
          time: string,            // e.g., "8:30 AM"
          title: string,           // Session title
          location?: string,       // Room/area
          description?: string,    // Additional info
          speakers?: Array<{
            speakerId?: string,    // Reference to speakers.ts
            name?: string,         // Override name
            title?: string,        // Override title
            affiliation?: string,  // Override company
            photo?: string,         // Override photo
            presentation?: string,  // PDF filename
            videoId?: string,      // YouTube video ID
            videoStartTime?: number,// Video start time (seconds)
            sponsor?: string,       // Sponsor label
            sponsorStyle?: string,  // CSS class for sponsor
          }>
        }
      ]
    }
  ]
}
```

### Schedule Tips
1. Include registration, breaks, and networking
2. Use speakerId for known speakers
3. Provide full speaker details for one-offs
4. Add video IDs for recorded sessions
5. Include presentation filenames for downloads

## Venue & Location Details

### Location Information
Required in event object:
- `locationAddress`: Full address with HTML formatting
- `locationImage`: Venue exterior photo
- `placeID`: Google Maps Place ID for maps

### Optional Location Features
```typescript
{
  // Directions from various locations
  directions: [
    {
      title: string,
      description: string,      // HTML with ordered lists
    }
  ],
  
  // Parking information
  parkingInfo: [
    {
      title: string,
      description: string,
      link?: {
        linkText: string,
        href: string,
      }
    }
  ],
  
  // Parking box display
  parkingBox: {
    text: string,
    imagePlaceholder: string,
  }
}
```

### Lodging Configuration
In `src/constants/lodging.ts`:

```typescript
{
  eventId: [EVENT_ID],
  hotels: [
    {
      name: string,
      address: string,
      city?: string,
      state?: string,
      zip?: string,
      phone: string,
      image: string,              // Hotel photo
      link?: {
        href: string,
        label: string,
      }
    }
  ],
  note?: string,                 // HTML with group rate info
}
```

## Navigation Structure

### Event Navigation
In `src/constants/eventNavs.tsx`:

```typescript
{
  eventId: [EVENT_ID],
  items: [
    { label: 'Event Overview', path: '/' },
    {
      label: 'About',
      subItems: [
        { label: 'About the Event', path: 'about-the-event' },
        { label: 'Matchmaking Sessions', path: 'matchmaking-sessions' },
        { label: 'VIP Networking Reception', path: 'vip-networking-reception' },
        { label: 'Location & Parking', path: 'venue' },
        { label: 'Hotel Lodging', path: 'lodging' },
        { label: 'FAQs', path: 'faqs' },
        { label: 'Event Recap', path: 'event-recap' },
      ],
    },
    { label: 'Venue & Lodging', path: 'venue-and-lodging' },
    { label: 'Agenda', path: 'agenda' },
    { label: 'Speakers', path: 'speakers' },
    {
      label: 'Sponsors & Exhibitors',
      subItems: [
        { label: 'Sponsorship Opportunities', path: 'sponsorship-opportunities' },
        { label: 'Exhibitor Opportunities', path: 'exhibitor-opportunities' },
      ],
    },
  ],
}
```

## Supporting Content

### FAQs
In `src/constants/faqs.tsx`:

```typescript
{
  id: [EVENT_ID],
  faqs: [
    {
      question: string,
      answer: string,             // HTML with links allowed
    }
  ]
}
```

### Special Features
In `src/constants/specialFeatures.ts`:

```typescript
{
  id: [EVENT_ID],
  features: [
    {
      title: string,
      date: string,
      time: string,
      location: string,          // HTML with address
      description: string,
      specialGuest?: {
        name: string,
        title: string,
        photo: string,
        bio: string,
      }
    }
  ],
  additionalPerks?: string[]
}
```

### Sponsors & Exhibitors Lists
In `src/constants/sponsors.ts` and `src/constants/eventSponsors.ts`:

```typescript
// Sponsor database
" sponsor-id": {
  id: string,
  name: string,
  logo: string,                 // Logo path
  website?: string,
  description?: string,         // HTML
  size?: 'xs' | 'small' | 'medium' | 'large',
  width?: number,
  height?: number,
  priority?: boolean,
}

// Event-specific sponsors
{
  eventId: [EVENT_ID],
  sponsors: ["sponsor-id-1", "sponsor-id-2"],
  exhibitors: ["exhibitor-id-1", "exhibitor-id-2"],
}
```

## Technical Requirements

### Image Assets
Required images for each event:
- Hero image: `/events/[slug]/main.webp`
- Location image: `/events/[slug]/location.webp`
- Registration headers: `/[pass-name].webp`
- Speaker photos: `/speakers/[speaker-id].webp`
- Sponsor logos: `/sponsors/[sponsor-id].webp`
- Hotel photos: `/hotels/[hotel-name].webp`

### File Organization
```
public/
├── events/[slug]/
│   ├── main.webp
│   ├── location.webp
│   └── recap/
├── speakers/
├── sponsors/
├── hotels/
└── [pass-images].webp
```

### Environment Variables
Ensure these are configured for payment processing:
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

## Launch Checklist

### Pre-Launch
- [ ] Event object created with all required fields
- [ ] Registration types configured
- [ ] Sponsorship packages defined
- [ ] Exhibitor options set up
- [ ] Speaker database updated
- [ ] Schedule created with times and speakers
- [ ] Location details and images added
- [ ] Navigation structure configured
- [ ] FAQs written and approved
- [ ] All images optimized and uploaded
- [ ] Stripe products created (if using Stripe)

### Testing
- [ ] Event page loads correctly
- [ ] Registration flow works
- [ ] Payment processing functional
- [ ] Email confirmations sent
- [ ] Navigation links work
- [ ] Mobile responsive design
- [ ] Images display properly
- [ ] Forms validate correctly

### Post-Launch
- [ ] Monitor registrations
- [ ] Check payment errors
- [ ] Update speaker bios/photos
- [ ] Add last-minute agenda changes
- [ ] Monitor for broken links
- [ ] Collect feedback for improvements

## Common Pitfalls

1. **Missing IDs**: Ensure all objects have unique, matching IDs
2. **Image Paths**: Use correct relative paths starting with `/`
3. **Time Zones**: Use ISO timestamps with UTC conversion
4. **HTML Formatting**: Properly escape HTML in description fields
5. **Navigation Mismatch**: Ensure navigation paths match actual routes
6. **Registration Limits**: Set appropriate max quantities
7. **Early Bird Deadlines**: Set realistic deadlines and test expiration
8. **Speaker References**: Double-check speakerId references exist

## Support Contacts

For technical issues:
- Development team: [dev-contact@americandefensealliance.org]
- Content updates: [content@americandefensealliance.org]

For payment/registration issues:
- Stripe support: Check Stripe dashboard
- Registration problems: [events@americandefensealliance.org]

---

*This document should be updated as new features are added or processes change. Last updated: January 2025*
