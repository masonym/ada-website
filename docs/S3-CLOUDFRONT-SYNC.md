# S3 + CloudFront Sync (Event Assets)

This guide is the quick reference for uploading event assets (including `registration-information.csv`) from `public/events/<EVENT_CODE>/` to S3 and invalidating CloudFront.

## Prerequisites

- AWS CLI installed and authenticated
- AWS profile `ada` available locally
- Repo root as current working directory
- Event folder exists in: `public/events/<EVENT_CODE>/`

Current infrastructure values used by scripts:
- S3 bucket: `s3://americandefensealliance`
- CloudFront distribution: `E15R7SXII9T1VC`

## Commands (recommended)

### 1) Upload only the registration CSV for one event

```bash
npm run sync-event-csv --event=2026DTAPC
```

What this does:
- uploads `public/events/2026DTAPC/registration-information.csv` to
  `s3://americandefensealliance/events/2026DTAPC/registration-information.csv`
- invalidates CloudFront path:
  `/events/2026DTAPC/registration-information.csv`

### 2) Upload all assets for one event folder

```bash
npm run sync-event-assets --event=2026DTAPC
```

What this does:
- syncs `public/events/2026DTAPC/` to `s3://americandefensealliance/events/2026DTAPC/`
- invalidates CloudFront path:
  `/events/2026DTAPC/*`

## Existing broader commands

- Full public sync (large scope):

```bash
npm run sync-images
```

- Metadata-only sync:

```bash
npm run sync-metadata
```

## Troubleshooting

### "Usage: npm run sync-event-csv --event=..."
You forgot to pass `--event=<EVENT_CODE>`.

### "Event folder not found"
Confirm folder exists at:
`public/events/<EVENT_CODE>/`

### "CSV not found"
Confirm file exists at:
`public/events/<EVENT_CODE>/registration-information.csv`

### CloudFront still serving old file
Re-run the same command once and wait a minute for invalidation to propagate.
