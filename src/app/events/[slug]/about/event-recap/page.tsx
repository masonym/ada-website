import React from 'react';
import { EVENTS } from '@/constants/events';
import { notFound } from 'next/navigation';
import { getEventImages, validateImagePaths } from '@/utils/imageUtils';
import dynamic from 'next/dynamic';
import HighlightedPhotos from './HighlightedPhotos';
import EmblaCarousel from './EmblaCarousel';

// Lazy load the lightbox component
const PhotoLightbox = dynamic(() => import('./PhotoLightbox'), {
  loading: () => <div className="animate-pulse bg-gray-200 rounded-lg h-96"></div>,
});

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

  if (!hasImages) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Photos Coming Soon</h2>
        <p className="text-lg">
          Photo gallery for {event.title} is being prepared. Please check back later.
        </p>
      </div>
    );
  }

  // Get all event images
  const allImages = await getEventImages(event);
  const highlightedImages = allImages.filter(img => img.highlighted);
  const regularImages = allImages.filter(img => !img.highlighted);

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
        Highlights & Photographs of the <br/>{event.title}
      </h1>

      {highlightedImages.length > 0 && (
        <div className="mb-12">
          {/* <h2 className="text-center text-3xl text-slate-700 font-bold mb-6">Event Highlights</h2> */}
          <HighlightedPhotos images={highlightedImages} />
        </div>
      )}

      {regularImages.length > 0 && (
        <div className="mb-12">
          <h2 className="text-center text-3xl text-slate-700 font-bold mb-6">Photo Gallery</h2>
          <EmblaCarousel slides={regularImages} options={{loop: true}} />
        </div>
      )}
    </div>
  );
}