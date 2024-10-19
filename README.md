This is a [Next.js](https://nextjs.org/) project. 

Company website for [American Defense Alliance](https://americandefensealliance.org/).

Written in TypeScript/Next.js 

## Run Locally

To run locally, `git clone` the project first.

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


## Creating new events

To create a new event, we must manage the data files in @/constants

1. Events.tsx
   - ID: Int. Must be unique
   - Title: Str. Event title
   - Date: Str. Event date.
   - TimeStart: Str. Time in the format YYYY-MM-DDT00:00:00Z
   - Description: Str. Event description
   - EventText: JSX Element.
   - Topical Coverage: Array of strings. Topical coverage
   - Image: Str. Path to event image
   - Slug: Str. Event slug for url
   - LocationImage: Str. Path to venue location image
   - LocationAddress: Str. Address to the event venue.
   - Directions: Array of objects. With title/descriptions.
   - Images: Array of objects - I think this is for the event recap page?
   - ParkingInfo: Array of objects with parking info
   - PlaceID: Str for google maps place ID.
   - RegisterLink: Str. Eventbrite URL.
   - Password: Str. Password for accessing presentation files.

2. Faqs.tsx
   - ID: Int. Corresponds to the event ID
   - FAQS: Array of objects with questions and answers.

3. Registrations.ts
   - ID: Int. Corresponds to the event ID.
   - Registrations: Array of objects with registration info.

4. Schedules.tsx
   - ID: Int. Corresponds to the event ID.
   - Schedule: Array of objects with schedule info.

5. Speakers.ts
   - ID: Int. Corresponds to the event ID.
   - Speakers: Array of objects with speaker info.
       - Note: one speaker can be labeled as a keynote speaker.
    
6. Sponsorships.ts
   - ID: Int. Corresponds to the event ID.
   - Sponsorships: Array of objects with sponsorship info.
