import React from 'react';
import { EVENTS } from '@/constants/events';
import { SCHEDULES } from '@/constants/schedules';
import { notFound } from 'next/navigation';
import Schedule from '@/app/components/Schedule';

export default function AgendaPage({ params }: { params: { slug: string } }) {
  const event = EVENTS.find((e) => e.slug === params.slug);

  if (!event) {
    notFound();
  }

  const eventSchedule = SCHEDULES.find((s) => s.id === event.id);

  if (!eventSchedule) {
    return (
      <div className="text-center">
        {/* <h1 className="text-3xl font-bold mb-4">{event.title} - Agenda</h1> */}
        <h1 className="text-[48px] font-gotham font-bold mb-4 text-slate-700 text-center">Schedule</h1>
        <p className="text-l font-bold text-center mb-8 text-slate-600">Schedule not available at this time. Please check back later.</p>
      </div>
    );
  }

  return (
    <div>
      {/* <h1 className="text-3xl font-bold text-center my-8">{event.title} - Agenda</h1> */}
      <Schedule schedule={eventSchedule.schedule} />
    </div>
  );
}