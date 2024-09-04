import React from 'react';
import { EVENTS } from '@/constants/events';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Button from '@/app/components/Button';
import SponsorOptions from '@/app/components/SponsorOptions';
import CountdownTimer from '@/app/components/CountdownTimer';
import RegistrationOptions from '@/app/components/RegistrationOptions';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import Script from 'next/script';

export async function generateStaticParams() {
  return EVENTS.map((event) => ({
    slug: event.slug,
  }));
}

export default function EventPage({ params }: { params: { slug: string } }) {
  const event = EVENTS.find((e) => e.slug === params.slug);

  if (!event) {
    notFound();
  }

  return (
    <>
    <Script id="event-schema" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Event",
          "name": event.title,
          "description": event.description,
          "startDate": event.date,
          "locationAddress": event.locationAddress,
          "topicalCoverage": event.topicalCoverage,
          
        })}
      </Script>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          <div className="py-4 sm:py-8 flex flex-col items-center">
            {/* <Link href="/events" className="inline-flex items-center text-blue-500 hover:underline mb-4">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Events
          </Link> */}


            {/* <Button
            title="SPONSORSHIP OPPORTUNITIES"
            variant="btn_sqr_navy_blue"
            link={`/events/${event.slug}/sponsor`}
            // className="w-full sm:w-auto"
            />
            <Button
            title="EVENT SPEAKERS"
            variant="btn_sqr_navy_blue"
            link={`/events/${event.slug}/speakers`}
            // className="w-full sm:w-auto"
            /> */}

            <CountdownTimer targetDate={event.timeStart} />

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center font-gotham text-slate-700 mb-6">
              Event Info
            </h2>
            <div className="flex flex-col leading-relaxed text-slate-600 max-w-4xl text-lg text-center">
              {event.eventText}
            </div>

            <RegistrationOptions event={event} />

            <div className="mt-12 text-center max-w-sm">
              <p className="text-2xl text-navy-500 mb-6 w-fit text-center text-nowrap ">Don't miss this event, register now!</p>
              <Button
                title="REGISTER"
                variant="btn_blue"
                link={event.registerLink}
                className="w-full sm:w-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}