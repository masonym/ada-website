import React from 'react';
import { EVENTS } from '@/constants/events';
import { notFound } from 'next/navigation';
import Image from 'next/image';

export default function EventRecapPage({ params }: { params: { slug: string } }) {
  const event = EVENTS.find((e) => e.slug === params.slug);

  if (!event) {
    notFound();
  }

  const eventDate = new Date(event.timeStart);
  const currentDate = new Date();
  const eventHasOccurred = eventDate < currentDate;

  return (
    <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-[48px] font-gotham font-bold mb-4 text-slate-700 text-center">

        Highlights & Photographs of the <br/>{event.title}
      </h1>

      {false ? (
        <div>
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Event Highlights</h2>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Photo Gallery</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {event?.images.map((img, index) => (
                <Image
                  key={index}
                  src={img.src}
                  alt={img.alt || `Event image ${index + 1}`}
                  width={400}
                  height={300}
                  className="rounded-lg"
                />
              ))}
            </div>
          </section>

          {/* Video section remains the same */}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Event Recap Coming Soon</h2>
          <p className="text-lg">
            The {event.title} hasn't taken place yet. Please check back after {event.date} for highlights, photographs, and video content from the event.
          </p>
        </div>
      )}
    </div>
  );
}