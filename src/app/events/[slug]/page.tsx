
import React from 'react';
import { EVENTS } from '@/constants/events';
import RegistrationModalController from './RegistrationModalController';
import { notFound } from 'next/navigation';
import RegisterButtonModal from './RegisterButtonModal';
import CountdownTimer from '@/app/components/CountdownTimer';
import RegistrationOptions from '@/app/components/RegistrationOptions';
import Script from 'next/script';
import { Metadata } from 'next';
import KeynoteSpeaker from '@/app/components/KeynoteSpeaker';
import SponsorLogos from '@/app/components/SponsorLogos';
import SpecialFeatures from '@/app/components/SpecialFeatures';
import FooterEventText from '@/app/components/FooterEventText';
import { EventSaleBanner } from '@/app/components/EventSaleBanner';
import SponsorAdvert from '@/app/components/SponsorAdvert';
import { getCdnPath } from '@/utils/image';
import RelatedEventLinks from '@/app/components/RelatedEventLinks';
import EventTestimonials from '@/app/components/EventTestimonials';
import EventHighlights from '@/app/components/EventHighlights';
import { HIGHLIGHTS } from '@/constants/highlights';
import EventNoticeBanner from '@/app/components/EventNoticeBanner';

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
          url: getCdnPath(event.image),
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
      {/* Add RegistrationModalController for URL-based modal control */}
      <RegistrationModalController event={event} />
      
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

            {event.id != 5 && <CountdownTimer targetDate={event.timeStart} initialTimeLeft={initialTimeLeft} backgroundColor={event.countdownColour} />}

            {/* Event notice banner (e.g., postponement, shutdown) - client-side time check */}
            <EventNoticeBanner event={event} />

            {/* Related/Linked events section (e.g., previous year's recap) */}
            <RelatedEventLinks event={event} />

            {event.sales && event.sales.length > 0 && (
              <EventSaleBanner sales={event.sales} />
            )}



            <div className="flex flex-col leading-relaxed text-slate-600 text-center text-lg px-4 sm:px-6 lg:px-8 max-w-[95vw] mx-auto">
              {event.eventText}
            </div>

            {event.features?.showKeynoteSpeaker && <KeynoteSpeaker eventId={event.id} eventShorthand={event.eventShorthand} showExpandedBio={false} />}


            <SpecialFeatures event={event} />


            <RegistrationOptions event={event} />

            <SponsorAdvert event={event} />
            

            <SponsorLogos event={event} />


            {/* Testimonials section: only render when borrowing from explicit or older related event */}
            {(() => {
              let sourceEvent = null as typeof event | null;
              // 1) Explicit mapping takes precedence
              if (event.testimonialsFromEventId) {
                const explicit = EVENTS.find(e => e.id === event.testimonialsFromEventId) || null;
                if (explicit && (explicit.testimonials?.length ?? 0) > 0) {
                  sourceEvent = explicit;
                }
              }
              // 2) Else fallback to older related event with testimonials
              if (!sourceEvent && event.relatedEventId) {
                const related = EVENTS.find(e => e.id === event.relatedEventId) || null;
                if (related) {
                  const relatedEnd = new Date(related.timeEnd || related.timeStart).getTime();
                  const currentStart = new Date(event.timeStart).getTime();
                  const isOlder = relatedEnd < currentStart;
                  if (isOlder && (related.testimonials?.length ?? 0) > 0) {
                    sourceEvent = related;
                  }
                }
              }
              if (!sourceEvent) return null; // Do not show for current event by default
              if (sourceEvent.id === event.id) return null; // Extra guard: only show when borrowing from another event
              const testimonials = sourceEvent.testimonials || [];
              if (testimonials.length === 0) return null;
              return (
                <div className="w-full">
                  <EventTestimonials
                    title={`What attendees said about the <br/>${sourceEvent.title}`}
                    showTitle={true}
                    testimonials={testimonials}
                  />
                </div>
              );
            })()}

            {(() => {
              if (!event.relatedEventId) return null;
              const related = EVENTS.find(e => e.id === event.relatedEventId);
              if (!related) return null;
              // Only show if the related event is older than the current event
              const relatedEnd = new Date(related.timeEnd || related.timeStart).getTime();
              const currentStart = new Date(event.timeStart).getTime();
              const isOlder = relatedEnd < currentStart;
              const hasHighlights = Array.isArray(HIGHLIGHTS[related.id]) && HIGHLIGHTS[related.id].length > 0;
              if (!isOlder || !hasHighlights) return null;
              return (
                <EventHighlights
                  sourceEventId={related.id}
                  title={`${related.title} Highlights`}
                  subtitle={`Watch standout moments from the ${related.title}`}
                />
              );
            })()}

            <div className="mt-0 text-center flex flex-col items-center">
              <p className="text-2xl text-navy-500 mb-6 text-center mx-8">Act Now and Secure your Place at this Groundbreaking Event!</p>
                <RegisterButtonModal 
                event={event}
                title="REGISTER"
                variant="btn_blue"
                className="max-w-sm sm:max-w-xs"
              />
            </div>


            <FooterEventText event={event} />
          </div>
        </div>
      </div>
    </>
  );
}
