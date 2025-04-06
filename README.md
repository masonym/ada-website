# American Defense Alliance Website

> A full-stack web application powering the digital presence of the American Defense Alliance—a U.S. startup supporting defense contractors, government agencies, and national security stakeholders through high-impact industry events.

## Overview

This platform serves as the central hub for all ADA-hosted events, including conference overviews, sponsorships, registration links, speaker rosters, and multimedia recaps. It replaces a legacy no-code prototype with a performant, scalable, and fully custom event infrastructure.

## Features

- 🔧 **Dynamic Event Architecture**  
  Each event is dynamically generated from structured TypeScript data files—pages include overview, registration options, speaker lineups, agendas, and sponsorship packages.

- 🧾 **Speaker Management System**  
  Speaker data is ingested from Google Sheets via a custom ETL pipeline and curated manually into per-event rosters using a reusable schema.

- 📥 **Internal Admin Tools**  
  Admin portal allows non-technical staff to upload speaker presentation PDFs directly to S3 for event distribution.

- 💡 **Post-Event Media Galleries**  
  Photo/video galleries with lightbox functionality and testimonial content, built for engagement and social proof.

- 🚀 **Performance-Oriented Delivery**  
  Assets delivered via CloudFront CDN and S3, optimized for low latency across the U.S. audience.

## Stack

- **Frontend**: Next.js (App Router) + React  
- **Styling**: Tailwind CSS  
- **Language**: TypeScript  
- **Infra**: AWS (CloudFront, S3), Vercel  
- **Tooling**: Git, Neovim, custom CLI scripts

## Architecture Overview

- All event data is stored in structured TypeScript files, which are used for dynamic rendering. These files are stored under `src/constants`.
- These files are _not_ fully typed, and honestly a little messy! Watch for inconsistencies in the data structure. I hope to clean them up in the future. This was my first TypeScript project, and I learned a lot about the language and its ecosystem while building this site.
- Each event page is located at `/events/[slug]/page.tsx`.
- Static assets are stored in S3 and served via CloudFront CDN. Generally speaking locally I use `aws s3 sync` to upload files to S3, and then use the CloudFront invalidation API to clear the cache. This is a bit of a pain, but it works.

## Future Plans

- 💾 Migration to database-backed CMS (e.g. Sanity or Supabase) for dynamic content editing  
- 🔒 Authenticated admin portal with UI for speaker/event management  
- 📊 Internal analytics dashboard for tracking event engagement and registrations

## Screenshots

_(To be added soon)_ – demo video + GIFs planned

## License

All rights reserved. This repository is provided for educational purposes only. You may not copy, distribute, or use this project for commercial purposes without explicit permission.
