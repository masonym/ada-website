import React from 'react';
import { EVENTS } from '@/constants/events';
import { notFound } from 'next/navigation';
import { validateImagePaths } from '@/utils/imageUtils';
import Link from 'next/link';
import EventTestimonials from '@/app/components/EventTestimonials';
import { getEventRecap } from '@/constants/eventRecaps';
import { SectionRenderer } from './sections';

// Generate static params for all event slugs
export async function generateStaticParams() {
  return EVENTS.map((event) => ({
    slug: event.slug,
  }));
}

export default async function EventRecapPage({ params }: { params: { slug: string } }) {
  const event = EVENTS.find((e) => e.slug === params.slug);

  if (!event) {
    notFound();
  }

  // Validate if images directory exists
  const hasImages = await validateImagePaths(event.eventShorthand);

  // Get event recap data
  const recapData = getEventRecap(event.eventShorthand);

  const eventDate = new Date(event.timeStart);
  const currentDate = new Date();
  const eventHasOccurred = eventDate < currentDate;

  if (!eventHasOccurred) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Event Recap Coming Soon</h2>
        <p className="text-lg">
          Please check back after {event.date} for highlights and photographs from the event.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-[48px] font-gotham font-bold mb-4 text-slate-700 text-center">
        Highlights & Photographs of the <br />{event.title}
      </h1>

      {!hasImages && <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Photos Coming Soon</h2>
        <p className="text-lg">
          Photo gallery for {event.title} is being prepared. Please check back later.
        </p>
      </div>}

      <div className="mb-8 max-w-3xl mx-auto bg-navy-800 rounded-lg p-6 sm:p-8 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-lg sm:text-xl mb-4">
            Access Presentation Materials and Recordings
          </p>
          <Link
            href={`/events/${params.slug}/agenda`}
            className="inline-block bg-white text-navy-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            View Agenda
          </Link>
        </div>
      </div>

      {event.testimonials && event.testimonials.length > 0 && (
        <EventTestimonials testimonials={event.testimonials} />
      )}

      {/* Display custom introduction if available */}
      {recapData?.introduction && (
        <div className="max-w-4xl mx-auto mb-12 text-center">
          {recapData.introduction}
        </div>
      )}

      {/* Render each section based on its layout type */}
      {recapData?.sections.map(section => (
        <SectionRenderer key={section.id} section={section} />
      ))}

      {/* Fallback if no recap data is available but images exist */}
      {hasImages && !recapData && (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Enhanced Photo Gallery Coming Soon</h2>
          <p className="text-lg mb-4">
            We're currently working on an enhanced photo gallery for this event. 
            In the meantime, you can view the agenda and presentation materials.
          </p>
          <Link
            href={`/events/${params.slug}/agenda`}
            className="inline-block bg-navy-800 text-white px-6 py-2 rounded-lg font-semibold hover:bg-navy-700 transition-colors"
          >
            View Agenda
          </Link>
        </div>
      )}
    </div>
  );
}
