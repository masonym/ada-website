import React from 'react';
import { EVENTS } from '@/constants/events';
import { notFound } from 'next/navigation';
import EventDetails from './EventDetails';

export default function AboutPage({ params }: { params: { slug: string } }) {
  const event = EVENTS.find((e) => e.slug === params.slug);

  if (!event) {
    notFound();
  }

  // For event id 2, use "Featured Contracting Commands" as the title

  return (
    <EventDetails
      title={event.title}
      eventId={event.id}
      eventText={event.aboutEventText || event.eventText}
      topicalCoverage={event.topicalCoverage}
      expectations={event.expectations}
      expectationsText={event.expectationsText}
      featuredTopics={event.featuredTopics}
      featuredTopicsTitle={event.featuredTopicsTitle}
      featuredTopicsSubtitle={event.featuredTopicsSubtitle}
    />
  );
}