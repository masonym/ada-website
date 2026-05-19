# Event Recaps Runbook (Future Events)

Use this as the checklist for launching a new recap page after an event.

---

## 1) How recap pages are generated

Route:

- `/events/[slug]/about/event-recap`

Main page logic:

- `src/app/events/[slug]/about/event-recap/page.tsx`

Recap data source order:

1. **Hybrid auto-build** from S3 photos + optional metadata file
2. **Fallback** to manual constants in `src/constants/eventRecaps.tsx` when needed

---

## 2) Required inputs for a new recap

### A. Event must exist

Ensure event is defined in:

- `src/constants/events.tsx`

with a valid `eventShorthand` (example: `2026DTAPC`).

### B. Photos in event folder

Expected S3/public structure:

```text
public/events/<EVENT_SHORTHAND>/photos/
  <section-a>/
    1.webp
    2.webp
  <section-b>/
    1.webp
```

Notes:

- section folder names become section IDs in the recap builder
- avoid using a folder named `originals` (it is intentionally ignored)
- webp is preferred

### C. Optional metadata file

Path:

- `public/events/<EVENT_SHORTHAND>/metadata.json`

Use metadata when you need:

- custom section titles/descriptions
- custom layout per section (`grid`, `masonry`, `carousel`, `featured`)
- per-image alt text/captions/tags/featured flags
- social share message/hashtag
- photo credit block

You can use the admin helper at:

- `/admin/photo-metadata`

to generate a starter metadata file.

---

## 3) Optional: recap metrics block (industry/org type)

If you want the “Event Metrics” card on recap pages:

1. Place CSV at:
   - `public/events/<EVENT_SHORTHAND>/registration-information.csv`
2. Add config entry in:
   - `src/constants/eventMetrics.ts`

Minimum config example:

```ts
{
  eventId: 5,
  csvPath: 'events/2026DTAPC/registration-information.csv',
  title: 'Event Metrics',
  industryColumn: 'Industry',
  businessSizeColumn: 'Business Size',
  registrationTypeColumn: 'Registration Type',
  organizationColumn: 'Company/Organization Name',
  excludedRegistrationTypes: ['Staff'],
}
```

Current recap metrics output includes:

- industry breakdown (count + %)
- organization type breakdown buckets: small, medium, large, government, military

---

## 4) Upload/sync to S3 + CloudFront

See full guide:

- `docs/S3-CLOUDFRONT-SYNC.md`

Most-used commands:

```bash
# upload one event's CSV only
npm run sync-event-csv --event=2026DTAPC

# upload one event's entire folder (photos + metadata + csv)
npm run sync-event-assets --event=2026DTAPC
```

---

## 5) Verification checklist

After upload:

1. Open `/events/<slug>/about/event-recap`
2. Confirm:
   - page is visible (event date has passed)
   - sections render in expected order/layout
   - captions/alt text/social block render correctly
   - photo credits render (if enabled)
   - metrics card appears (if configured)
3. Spot-check mobile layout

---

## 6) Troubleshooting

### “Photos Coming Soon” appears

- path mismatch in event shorthand or photo folder
- assets not uploaded yet
- CloudFront cache not invalidated yet

### Section names look odd

- folder names are being used directly
- add `metadata.json` to define cleaner section titles

### Metrics card not showing

- missing `eventId` entry in `src/constants/eventMetrics.ts`
- CSV not uploaded to expected path
- CSV headers do not match configured column names

### Event recap route not available yet

- recap is hidden for events in the future (date gate on recap page)

---

## 7) Recommended cadence after each event

1. Upload photos into section folders
2. Generate metadata JSON draft and refine titles/captions
3. Upload event assets + invalidate CloudFront
4. Add/validate metrics CSV + config
5. QA desktop/mobile and publish
