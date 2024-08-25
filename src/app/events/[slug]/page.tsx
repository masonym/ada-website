import React from 'react';
import { EVENTS } from '@/constants/events';
import Image from 'next/image';
import { notFound } from 'next/navigation';

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
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
      <p className="text-xl mb-4">{event.date}</p>
      <Image
        src={event.image}
        width={1000}
        height={400}
        alt={`Event image for ${event.title}`}
        className="mb-6"
      />
      <div 
        dangerouslySetInnerHTML={{ __html: event.eventText }} 
        className="prose prose-zinc max-w-none"
      />
    </div>
  );
}