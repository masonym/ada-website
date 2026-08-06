# American Defense Alliance Website

Production site for [americandefensealliance.org](https://www.americandefensealliance.org/), a U.S. company that runs industry conferences for defense contractors, government agencies, and national security stakeholders. I designed, built, and maintain this application solo as their sole engineer, from initial launch through ongoing feature work.

## Background

The original ask was a push-to-market rebuild: replace a no-code prototype with a real site in about two weeks. That constraint shaped the early architecture (event content lives in typed data files rather than a CMS) and some of it is still working through the seams a year-plus later. Since launch the scope has grown well past the original site into a small internal platform: paid event registration, an admin back office non-technical staff use directly, automated attendee data pipelines, and a printable-schedule generator.

## What it does

**Public site**
- Per-event marketing pages (overview, agenda, speakers, sponsorships, venue/lodging) generated from structured event data
- Multi-ticket-type event registration with Stripe Checkout, add-ons, tiered/early-bird pricing, and promo codes
- Post-event recap galleries (photo/video, testimonials) built from S3-scanned media
- Printable, print-CSS-driven event schedules with sponsor placement logic

**Admin portal**
- Password-gated internal tools for staff to manage speakers, sponsors, schedules, promo codes, and matchmaking-sponsor data without touching code
- Direct-to-S3 uploads for speaker presentation PDFs and sponsor/event assets
- A conference banner generator and a resend-confirmation-email tool

**Behind the scenes**
- Registration writes go through a Stripe webhook into per-event Google Sheets (the client's system of record for attendee lists), with a Playwright suite that exercises every ticket type against real Stripe test charges and Sheets rows before an event goes live
- Speaker data is pulled from Google Sheets via a custom ETL script and curated into per-event rosters
- A Sanity CMS integration is layered in for the content that outgrew static data files, alongside the original TypeScript event data

## Stack

- **Framework**: Next.js (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Payments**: Stripe (Checkout, webhooks, promo codes)
- **Data**: Sanity CMS, DynamoDB, Google Sheets API (as an attendee-data store), typed TypeScript data files
- **Infra**: AWS S3 + CloudFront for asset delivery, Vercel for hosting, with an OpenNext/Cloudflare Workers build path for staging
- **Testing**: Playwright (registration flow, config, and preflight smoke tests run against real Stripe/Sheets test accounts)
- **Email**: Resend / Nodemailer for confirmations and admin notifications

## Notes on the code

This started as my first TypeScript and Next.js project, written under a hard two-week deadline, and it shows in places — the earliest event data files are loosely typed and inconsistent, and some early routes predate patterns used later in the project. I've been steadily hardening it as I go (typed schemas, shared validation, the Playwright suite, moving content into Sanity) rather than doing a big-bang rewrite, since the site has to stay live for paying customers between conferences.

## License

All rights reserved. This repository is shared for portfolio purposes only; it is not licensed for reuse, redistribution, or commercial use.
