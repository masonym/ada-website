import { EVENTS } from '@/constants/events';
import { SCHEDULES } from '@/constants/schedules';
import { notFound } from 'next/navigation';
import { getEventSchedulePublic, getEventSpeakersPublic } from '@/lib/sanity';
import AgendaPageClient from './AgendaPageClient';

// revalidate every 60 seconds - no redeploy needed for speaker updates
export const revalidate = 60;

export default async function AgendaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = EVENTS.find((e) => e.slug === slug);

  if (!event) {
    notFound();
  }

  const sanitySchedule = await getEventSchedulePublic(event.id);
  const legacySchedule = SCHEDULES.find((s) => s.id === event.id);
  const schedule = sanitySchedule?.days?.length ? sanitySchedule.days : legacySchedule?.schedule;

  if (!schedule) {
    return (
      <div className="text-center">
        <h1 className="text-[48px] font-gotham font-bold mb-4 text-slate-700 text-center">Event Agenda</h1>
        <p className="text-l font-bold text-center mb-8 text-slate-600">Event Agenda not available at this time. Please check back later.</p>
      </div>
    );
  }

  // fetch speakers from sanity for bio lookups
  const speakerData = await getEventSpeakersPublic(event.id);
  const allSpeakers = speakerData ? [...speakerData.speakers, ...speakerData.keynoteSpeakers] : null;

  return (
    <AgendaPageClient
      event={event}
      schedule={schedule}
      sanitySpeakers={allSpeakers}
    />
  );
}