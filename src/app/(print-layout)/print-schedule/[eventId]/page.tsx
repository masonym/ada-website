import React from 'react';
import PrintableSchedule from '@/components/PrintableSchedule';
import { SCHEDULES } from '@/constants/schedules';
import { getEventSchedulePublic, getEventSpeakersPublic } from '@/lib/sanity';

// revalidate every 60 seconds
export const revalidate = 60;

interface PrintSchedulePageProps {
  params: Promise<{
    eventId: string;
  }>;
}

export default async function PrintSchedulePage({ params }: PrintSchedulePageProps) {
  const eventId = parseInt((await params).eventId, 10);
  
  // prefer the CMS schedule so admin edits show up here too, same as the agenda page
  const sanitySchedule = await getEventSchedulePublic(eventId);
  const legacySchedule = SCHEDULES.find((s) => s.id === eventId);
  const schedule = sanitySchedule?.days?.length ? sanitySchedule.days : legacySchedule?.schedule;

  // fetch speakers from sanity for bio lookups
  const speakerData = await getEventSpeakersPublic(eventId);
  const allSpeakers = speakerData ? [...speakerData.speakers, ...speakerData.keynoteSpeakers] : null;

  return (
    <div className="print-page-container">
      <PrintableSchedule
        eventId={eventId}
        sanitySpeakers={allSpeakers}
        schedule={schedule as React.ComponentProps<typeof PrintableSchedule>['schedule']}
      />
    </div>
  );
}
