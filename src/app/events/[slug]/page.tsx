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
import { Metadata } from 'next';
import KeynoteSpeaker from '@/app/components/KeynoteSpeaker';
import SponsorLogos from '@/app/components/SponsorLogos';
import SpecialFeatures from '@/app/components/SpecialFeatures';
import FooterEventText from '@/app/components/FooterEventText';

export async function generateStaticParams() {
  return EVENTS.map((event) => ({
    slug: event.slug,
  }));
}

type Props = {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const event = EVENTS.find(event => event.slug === params.slug)

  if (!event) {
    return {
      title: 'Event Not Found',
      description: 'The requested event could not be found.',
    }
  }

  return {
    title: `${event.title} | American Defense Alliance`,
    description: event.description.substring(0, 160) + (event.description.length > 160 ? '...' : ''),
    openGraph: {
      title: event.title,
      description: event.description,
      images: [
        {
          url: event.image,
          width: 1200,
          height: 630,
          alt: event.title,
        }
      ],
      type: 'website',
    },
    other: {
      'og:type': 'event',
      'og:event:start_time': event.timeStart,
    },
  }
}

export default function EventPage({ params }: { params: { slug: string } }) {
  const event = EVENTS.find((e) => e.slug === params.slug);

  if (!event) {
    notFound();
  }

  const now = new Date().getTime();
  const targetTime = new Date(event.timeStart).getTime();
  const distance = targetTime - now;

  const initialTimeLeft = {
    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((distance % (1000 * 60)) / 1000)
  };

  return (
    <>
      <Script id="event-schema" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Event",
          "name": event.title,
          "description": event.description,
          "startDate": event.timeStart,
          "location": event.locationAddress,
          "topicalCoverage": event.topicalCoverage,
          "organizer": {
            "@type": "Organization",
            "name": "American Defense Alliance",
            "url": "https://www.americandefensealliance.org"
          }

        })}
      </Script>
      <div className="max-w-[91rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          <div className="py-2 sm:py-2 flex flex-col items-center">
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

            <CountdownTimer targetDate={event.timeStart} initialTimeLeft={initialTimeLeft} />



            <div className="flex flex-col leading-relaxed text-slate-600 text-lg text-center mx-8">
              {event.eventText}
            </div>

            <KeynoteSpeaker eventId={event.id} showExpandedBio={false}/>

            <SponsorLogos event={event} />

            <SpecialFeatures event={event} />

            <RegistrationOptions event={event} />



            <div className="mt-0 text-center flex flex-col items-center">
              <p className="text-2xl text-navy-500 mb-6 text-center mx-8">Act Now and Secure your Seat at this Groundbreaking Event!</p>
              <Button
                title="REGISTER"
                variant="btn_blue"
                link={event.registerLink}
                className="max-w-xs sm:max-w-sm"
              />
            </div>

            <FooterEventText event={event} />
            
          </div>
        </div>
      </div>
    </>
  );
}