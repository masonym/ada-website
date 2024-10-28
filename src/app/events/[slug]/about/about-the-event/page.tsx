import React from 'react';
import { EVENTS } from '@/constants/events';
import { notFound } from 'next/navigation';
import EventDetails from './EventDetails';

export default function AboutPage({ params }: { params: { slug: string } }) {
  const event = EVENTS.find((e) => e.slug === params.slug);

  if (!event) {
    notFound();
  }

  return (
    <EventDetails
      title={event.title}
      eventText={event.eventText}
      topicalCoverage={event.topicalCoverage}
      registerLink={event.registerLink}
    />
  );
}