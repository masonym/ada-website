// app/events/[slug]/speakers/page.tsx

import React from 'react';
import { EVENTS } from '@/constants/events';
import { notFound } from 'next/navigation';
import Speakers from '@/app/components/Speakers';

export default function SpeakersPage({ params }: { params: { slug: string } }) {
  const event = EVENTS.find((e) => e.slug === params.slug);

  if (!event) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 flex flex-col items-center">
      <h1 className="text-[48px] font-gotham font-bold mb-2 text-slate-700">
        {event.title}
      </h1>
      <Speakers id={event.id} />
    </div>
  );
}