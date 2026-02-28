# Sanity CMS Integration Guide

This document explains how the ADA website integrates with Sanity.io for sponsor management.

## Overview

- **Project ID:** `nc4xlou0`
- **Dataset:** `production`
- **CMS Studio Location:** `C:\Users\Mason\Documents\coding_projects\ada-sponsor-cms`
- **Website Integration:** `src/lib/sanity.ts`

## Architecture

```
ada-sponsor-cms/          # Sanity Studio (content management)
├── schemas/
│   ├── sponsor.ts        # Individual sponsor documents
│   └── eventSponsor.ts   # Event-to-sponsor mappings with tiers
└── scripts/              # Migration utilities

ada-website/              # Next.js frontend
└── src/lib/sanity.ts     # Client + query functions
```

## Content Types

### Sponsor
Individual company/organization that sponsors events.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✓ | Company name |
| `slug` | slug | ✓ | URL-friendly identifier (auto-generated from name) |
| `logo` | image | ✓ | Company logo |
| `website` | url | | Company website URL |
| `description` | text | | HTML description for featured sponsors |
| `width` | number | | Custom logo width (pixels) |
| `height` | number | | Custom logo height (pixels) |
| `priority` | boolean | | Load image with priority |
| `size` | string | | Size category: `xs`, `small`, `medium`, `large` |

### Event Sponsor
Links sponsors to specific events with tier organization.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `eventId` | number | ✓ | Numeric event identifier |
| `title` | string | | Display title for sponsor section |
| `description` | text | | Section description |
| `tiers` | array | ✓ | Array of sponsor tiers |

#### Tier Object
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✓ | Tier identifier (e.g., `platinum-sponsor`) |
| `name` | string | ✓ | Display name (e.g., "Platinum Sponsors") |
| `description` | text | | Tier description |
| `style` | string | | Tailwind classes (e.g., `bg-amber-400 text-slate-900`) |
| `topTier` | boolean | | Mark as featured/top tier |
| `sponsors` | reference[] | ✓ | References to sponsor documents |

## Running the CMS Studio

```powershell
cd C:\Users\Mason\Documents\coding_projects\ada-sponsor-cms
npm run dev
```

This starts the Sanity Studio at `http://localhost:3333`. From here you can:
- Create/edit sponsors
- Upload logos
- Organize sponsors into event tiers
- Preview content

## Common Tasks

### Adding a New Sponsor (Easy Way - Admin Dashboard)

1. Go to `/admin/sponsors` on your website
2. Fill in the form:
   - **Company Name:** Required
   - **Website:** Optional
   - **Logo:** Upload image
   - **Event:** Select which event
   - **Tiers:** Click multiple tiers (e.g., "Small Business" AND "Exhibitors")
3. Click **Create Sponsor & Add to Event**

This creates the sponsor AND adds it to the selected tiers in one step.

### Adding an Existing Sponsor to Another Event

1. Go to `/admin/sponsors`
2. Click **Existing Sponsor** tab
3. Select the sponsor from the dropdown
4. Select the event and tiers
5. Click **Add Sponsor to Event**

### Adding a New Sponsor (Sanity Studio)

1. Open Sanity Studio (`npm run dev` in ada-sponsor-cms)
2. Click **Sponsor** in the sidebar
3. Click **+ Create new document**
4. Fill in required fields:
   - **Name:** Company name
   - **Slug:** Click "Generate" or enter manually
   - **Logo:** Upload image
5. Optional: Add website, description, custom dimensions
6. Click **Publish**

### Adding a Sponsor to an Event (Sanity Studio)

1. Open Sanity Studio
2. Click **Event Sponsor** in the sidebar
3. Find the event by ID or create new
4. Under **Sponsor Tiers**, find or add the appropriate tier
5. In the tier's **Sponsors** array, click **Add item**
6. Search for and select the sponsor
7. Click **Publish**

### Creating a New Event Sponsor Document

1. Click **Event Sponsor** → **+ Create new document**
2. Set **Event ID** (must match the event ID in your codebase)
3. Add tiers with appropriate IDs:
   - `platinum-sponsor`
   - `gold-sponsor`
   - `silver-sponsor`
   - `bronze-sponsor`
   - `small-business-sponsor`
   - `vip-networking-reception-sponsor`
   - etc.
4. Add sponsors to each tier
5. Publish

### Updating a Sponsor Logo

1. Find the sponsor in Sanity Studio
2. Click the logo field
3. Upload new image or replace existing
4. Publish

Changes appear on the website automatically (CDN cache may take a few minutes).

## Website Integration

### Client Setup (`src/lib/sanity.ts`)

```typescript
import { createClient } from '@sanity/client'
import { createImageUrlBuilder } from '@sanity/image-url'

export const client = createClient({
  projectId: 'nc4xlou0',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2024-11-30',
})

const builder = createImageUrlBuilder(client)
export function urlFor(source: any) {
  return builder.image(source)
}
```

### Available Functions

| Function | Description |
|----------|-------------|
| `getAllSponsors()` | Fetch all sponsors as a keyed object |
| `getEventSponsors(eventId)` | Fetch event sponsor config with tier structure |
| `getEventTierSponsors(eventId, tierId)` | Fetch full sponsor data for a specific tier |
| `urlFor(source)` | Generate optimized image URLs |

### Usage in Components

```tsx
import { getEventSponsors, getEventTierSponsors, urlFor } from '@/lib/sanity';

// In a server component
const eventSponsors = await getEventSponsors(event.id);
const platinumSponsors = await getEventTierSponsors(event.id, 'platinum-sponsor');

// Render logo
<Image src={urlFor(sponsor.logo).url()} alt={sponsor.name} />
```

## Deployment

### Deploy Sanity Studio (optional hosted version)

```powershell
cd C:\Users\Mason\Documents\coding_projects\ada-sponsor-cms
npm run deploy
```

This deploys to `https://ada-sponsor-cms.sanity.studio` (or similar).

### Deploy GraphQL API (if needed)

```powershell
npm run deploy-graphql
```

## Migration Scripts

Located in `ada-sponsor-cms/scripts/`:

| Script | Command | Description |
|--------|---------|-------------|
| `migrate-sponsors.ts` | `npm run migrate` | Migrate sponsor data |
| `migrate-images.ts` | `npm run migrate-images` | Migrate image assets |
| `check-data.ts` | `npx tsx scripts/check-data.ts` | Verify data integrity |

## Troubleshooting

### Sponsors not appearing on website
1. Check the event has an `eventSponsor` document with matching `eventId`
2. Verify sponsors are published (not drafts)
3. Check tier IDs match what the component expects
4. Clear CDN cache or wait a few minutes

### Images not loading
1. Verify logo is uploaded and published
2. Check browser console for CORS or 404 errors
3. Ensure `urlFor()` is being called correctly

### GROQ Query Testing
Use the Vision plugin in Sanity Studio to test queries:
```groq
*[_type == "eventSponsor" && eventId == 1][0] {
  _id,
  eventId,
  tiers[] {
    id,
    name,
    sponsors[]->
  }
}
```

## Environment Variables

The website uses these Sanity-related values:

**Read-only (hardcoded in `sanity.ts`):**
- `projectId`: `nc4xlou0`
- `dataset`: `production`

**Write access (for admin features):**
- `SANITY_WRITE_TOKEN`: API token with write permissions

To get a write token:
1. Go to [sanity.io/manage](https://www.sanity.io/manage/project/nc4xlou0)
2. Navigate to **API** → **Tokens**
3. Click **Add API token**
4. Name it (e.g., "Website Admin")
5. Select **Editor** permissions
6. Copy the token and add to your `.env.local`:
   ```
   SANITY_WRITE_TOKEN=your_token_here
   ```

## Useful Links

- [Sanity Studio](https://ada-sponsor-cms.sanity.studio) (if deployed)
- [Sanity Dashboard](https://www.sanity.io/manage/project/nc4xlou0)
- [GROQ Cheat Sheet](https://www.sanity.io/docs/groq-syntax)
- [Image URL Builder Docs](https://www.sanity.io/docs/image-url)
