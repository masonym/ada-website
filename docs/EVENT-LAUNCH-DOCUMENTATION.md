# Event Launch Documentation

## Overview
This document provides a comprehensive guide for launching a new event on the ADA (American Defense Alliance) website. It outlines all required information, configurations, and steps needed to successfully add and manage a new event.

## Table of Contents
1. [Core Event Information](#core-event-information)
2. [Registration Setup](#registration-setup)
3. [Sponsorship Configuration](#sponsorship-configuration)
4. [Exhibitor Setup](#exhibitor-setup)
5. [Registration Sheet Mapping](#registration-sheet-mapping)
6. [Speaker Management](#speaker-management)
7. [Schedule Creation](#schedule-creation)
8. [Venue & Location Details](#venue--location-details)
9. [Navigation Structure](#navigation-structure)
10. [Supporting Content](#supporting-content)
11. [Technical Requirements](#technical-requirements)
12. [Launch Checklist](#launch-checklist)

## Quick Start

```bash
npm run create-event                      # scaffolds src/constants/events.tsx only
# ...fill in the other registries by hand (see the sections below)
npm run typecheck && npm run lint
TEST_EVENT_ID=<id> npm run test:offline   # tells you which registries you still missed
```

`test:offline` is the fastest way to find out what a new event is missing — it needs no
server, no credentials and no network, and `tests/03-event-data-integrity.spec.ts` prints
every registry the event is still absent from. Work through [Launch Checklist](#launch-checklist)
for the full sequence.

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

### How Orders Are Priced

Pricing is resolved **on the server**, in `src/lib/event-registration/order.ts`. The browser
submits ticket ids and quantities; it does not submit prices. What is written in the three
constants files — registrations, sponsorships, exhibitors — is what the customer is charged.

This makes several config fields load-bearing rather than cosmetic:

| Field | Effect on a real order |
| --- | --- |
| `id` | Must be unique across all three catalogues for the event. An id the server cannot find is **rejected** ("… is not available for this event"), not priced at 0. |
| `price` | Must parse to a number (`1295` or `"$1,295"`). A paid item with an unusable price refuses to sell and logs a data error. |
| `earlyBirdPrice` + `earlyBirdDeadline` | Both required for the early-bird price to apply. A price with no deadline never takes effect. |
| `isActive: false` | Blocks purchase server-side, not just in the UI. |
| `saleEndTime` | After it passes, the order is refused. |
| `maxQuantityPerOrder` | Enforced on the request, not only in the modal. |
| `sponsorPasses` | Caps the complimentary `<sponsorshipId>-additional-pass` line items. The first included pass rides on the sponsorship line itself, so the separate line can only cover `sponsorPasses - 1` per sponsorship purchased, and only when that sponsorship is in the same order. |

`tests/02-order-pricing.spec.ts` covers all of the above offline. A price typo shows up
there before it shows up on a card statement.

Still enforced in the modal only, not the API: `requiresCode` / `validationCode` gating and
the order-id check for additional passes.

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
## Registration Sheet Mapping

Registrations are written to a Google Sheet chosen by event id in
`src/lib/google-sheets/spreadsheet-mapping.ts`. **An event with no entry here silently falls
back to the default spreadsheet** — nothing errors, the rows just land in the wrong place.

Add an entry keyed by the event id (as a string):

```typescript
'9': {
  spreadsheetId: env('GOOGLE_SHEETS_SPREADSHEET_ID_2026XXXX') || fallback,
  registrationSheetName: DEFAULT_REGISTRATION_SHEET_NAME,
  description: '2026 <Event Name> registrations',
},
```

Then set `GOOGLE_SHEETS_SPREADSHEET_ID_2026XXXX` in the hosting environment and in your local
`.env`. The module reads `process.env` directly, so that is the only place the variable has
to be declared — it does not need adding to `src/lib/server-env.ts`.

The sheet must already have the expected column layout and a tab named by
`registrationSheetName`. `npm run test:preflight` verifies the event maps to a real
spreadsheet, that the tab exists, and that its columns match.

## Speaker Management

Speakers and their session assignments live in **Sanity**, not in `src/constants` — see
`docs/SANITY-CMS.md`. Two authoring rules matter at launch:

- **`isVisible` must be set** for a speaker to appear in production. Staging deliberately
  shows every speaker regardless, so "it looks right on staging" does not confirm this.
- **Which fields accept HTML.** Speaker *name* and *bio* are treated as HTML (a name may
  carry `<br/>` to split a district onto its own line) and are sanitised on read. Speaker
  *position*, *session title* and the *keynote header* are plain text. Type a literal `&`
  in those — writing `&amp;` renders as a visible `&amp;`.

Bulk import from the speakers spreadsheet:

```bash
GOOGLE_SHEETS_API_KEY=... SPEAKERS_SHEET_ID=... npm run import-speakers
```

Both variables are required; the script exits if either is unset.

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

### Nav Group Labels Are URLs

A group with `subItems` carries no path of its own — its URL segment is derived from its
**label** by `navGroupPath()` in `src/lib/event-nav-path.ts` (`'Sponsorships & Exhibits'` →
`sponsorships-exhibits`). Renaming a group therefore changes a live URL. The navbar and the
sitemap both import that one function, so they cannot disagree, but an existing link into the
old segment will 404.

Leading slashes on `path` are normalised, so `'venue-and-lodging'` and `'/venue-and-lodging'`
both work. `tests/03-event-data-integrity.spec.ts` checks that every nav item resolves to a
real route and that the sitemap advertises the same segments the navbar links to.

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

**Sponsor logos and event-to-sponsor mappings live in Sanity**, not in `src/constants` — see
`docs/SANITY-CMS.md` for the schema and the studio location. `SponsorLogos` and the recap
grids read from there.

The two constants files are legacy and no longer feed the public sponsor sections:

| File | Status |
| --- | --- |
| `src/constants/sponsors.ts` | Still read, but only by `matchmaking-sponsors.ts`. Add a sponsor here if it needs to appear in a matchmaking session. |
| `src/constants/eventSponsors.ts` | Not read by any page. `tests/03-event-data-integrity.spec.ts` still treats it as a core registry, so a new event needs an entry (or a `KNOWN_ABSENT` reason) for the offline suite to pass. |

```typescript
// src/constants/sponsors.ts - sponsor database (matchmaking only)
"sponsor-id": {
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

// src/constants/eventSponsors.ts - event-specific sponsors
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

Upload an event's assets to S3 and invalidate CloudFront with:

```bash
npm run sync-event-assets --event=2026XXXX     # uses eventShorthand, not slug
```

### Event PDFs (Prospectus & Exhibit Instructions)

These two are not registered anywhere in code. They are found at request time by scanning
`events/<eventShorthand>/` in the bucket for a key containing a keyword
(`src/lib/s3/event-documents.ts`):

| Document | Filename must contain |
| --- | --- |
| Sponsorship prospectus | `Prospectus` |
| Exhibitor instructions | `Instructions` |

The match is **case-sensitive**. A misnamed file does not error — the download button simply
never appears. The lookup runs on the server and the URLs are passed to the components as
props; nothing about the bucket reaches the browser.

### Environment Variables

Per-event, when launching:
- `GOOGLE_SHEETS_SPREADSHEET_ID_<SHORTHAND>` — see [Registration Sheet Mapping](#registration-sheet-mapping)

Site-wide (already set in each environment; `.env.local.example` is the starting point):
- Stripe — `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- Google Sheets — `GOOGLE_SHEETS_SPREADSHEET_ID` (default/fallback sheet), plus the Google
  credentials in `src/lib/server-env.ts`
- Admin — `ADMIN_PASSWORD` (no default; unset locks the admin area and every `/api/admin`
  route returns 401) and optionally `ADMIN_SESSION_SECRET`, which signs session cookies and
  lets you log every admin session out by rotating it without changing the password
- AWS, DynamoDB, Resend, iContact, Sanity — see `src/lib/server-env.ts` for the full list

**Where to declare things:**

- Server-only secrets go in `src/lib/server-env.ts`, which is marked `server-only` —
  importing it from a client component is a build error rather than a silent leak.
- Client-safe values go in `src/lib/env.ts` and need the `NEXT_PUBLIC_` prefix.
- **Never add secrets to an `env` block in `next.config.mjs`.** Next inlines those as string
  literals into every bundle that references them, browser bundles included. That block is
  gone; server code reads `process.env` at runtime and needs nothing declared there.
- Anything a client component needs must arrive as props or as a `NEXT_PUBLIC_` value.

## Launch Checklist

### 1. Data

- [ ] Event object created with all required fields (`npm run create-event` scaffolds this
      one file — everything below is by hand)
- [ ] Registration types configured, every `id` unique
- [ ] Sponsorship packages defined
- [ ] Exhibitor options set up
- [ ] Schedule created with times and speakers
- [ ] Location details, lodging and images added
- [ ] Navigation structure configured
- [ ] FAQs written and approved
- [ ] Event added to `src/lib/google-sheets/spreadsheet-mapping.ts`, sheet id set in the
      environment
- [ ] Speakers entered in Sanity and marked `isVisible`
- [ ] Sponsor logos and the event-to-sponsor mapping created in Sanity

### 2. Assets

- [ ] All images optimized and uploaded — `npm run sync-event-assets --event=<SHORTHAND>`
- [ ] Prospectus / exhibit-instructions PDFs uploaded with `Prospectus` / `Instructions`
      in the filename (case-sensitive)

### 3. Offline checks — no server, no credentials, nothing can be charged

- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `TEST_EVENT_ID=<id> npm run test:offline`

The last one is config validation, server-side order pricing, cross-file data integrity and
the HTML sanitizer. `tests/03-event-data-integrity.spec.ts` names every registry the event is
still missing from; if a gap is deliberate, record it in that spec's `KNOWN_ABSENT` with a
reason so "intentional" and "forgotten" stop looking identical. CI runs all three on every
push (`.github/workflows/ci.yml`).

### 4. Registration smoke test — real payments, manual, pre-launch only

```bash
DISABLE_OUTBOUND_EMAILS=true npm run dev          # terminal 1
TEST_EVENT_ID=<id> npm run test:registration      # terminal 2
```

- [ ] Every ticket / exhibit / sponsorship type charges the configured price and lands in
      the sheet with the right amounts, then cleans up after itself
- [ ] Run once per environment with `TEST_WEBHOOK_MODE=stripe` against staging — `direct`
      mode passes even if no webhook endpoint is registered at all

Two cautions before running, both expanded in `tests/README.md`: the suite writes to the
**real spreadsheet mapped to that event**, so point the test environment at a copy rather than
the live sheet; and against localhost it races staging's registered webhook endpoint for the
same payment, which can fail a run that is not actually broken. Running against staging with
`TEST_WEBHOOK_MODE=stripe` avoids both.

### 5. Manual pass

- [ ] Event page and every nav link load (no 404s, no redirects)
- [ ] Registration modal shows the prices you configured
- [ ] Email confirmations arrive and read correctly
- [ ] Mobile responsive
- [ ] Images and PDFs display

### Post-Launch
- [ ] Monitor registrations
- [ ] Check payment errors
- [ ] Update speaker bios/photos
- [ ] Add last-minute agenda changes
- [ ] Monitor for broken links
- [ ] Collect feedback for improvements

## Common Pitfalls

1. **Missing IDs**: Ensure all objects have unique, matching IDs. `test:offline` catches
   both a duplicate id and an event absent from a registry.
2. **Unmapped spreadsheet**: An event with no entry in `spreadsheet-mapping.ts` writes its
   registrations to the default sheet without complaining.
3. **Image Paths**: Use correct relative paths starting with `/`
4. **Time Zones**: Use ISO timestamps with UTC conversion
5. **Escaping CMS text**: Speaker name and bio are HTML; position, session title and the
   keynote header are plain text — writing `&amp;` in those renders `&amp;` literally.
6. **Renamed nav labels**: A nav group's label *is* its URL segment; renaming one changes a
   live URL.
7. **Registration Limits**: `maxQuantityPerOrder` and `saleEndTime` are enforced against real
   orders now — a wrong value blocks a purchase, it does not just hide UI.
8. **Early Bird Deadlines**: `earlyBirdPrice` without `earlyBirdDeadline` never applies. Set
   realistic deadlines and test expiration.
9. **Speaker References**: Double-check speakerId references exist, and that speakers are
   marked `isVisible` — staging shows them either way.
10. **PDF filenames**: `Prospectus` / `Instructions` matching is case-sensitive, and a miss is
    silent.

## Support Contacts

For technical issues:
- Development team: [dev-contact@americandefensealliance.org]
- Content updates: [content@americandefensealliance.org]

For payment/registration issues:
- Stripe support: Check Stripe dashboard
- Registration problems: [events@americandefensealliance.org]

---

*This document should be updated as new features are added or processes change. Last updated: August 2026*
