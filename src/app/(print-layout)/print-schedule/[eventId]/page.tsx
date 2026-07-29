import React from 'react';
import PrintableSchedule from '@/components/PrintableSchedule';
import { getEventSpeakersPublic } from '@/lib/sanity';

// revalidate every 60 seconds
export const revalidate = 60;

interface PrintSchedulePageProps {
  params: {
    eventId: string;
  };
}

export default async function PrintSchedulePage({ params }: PrintSchedulePageProps) {
  const eventId = parseInt(params.eventId, 10);
  
  // fetch speakers from sanity for bio lookups
  const speakerData = await getEventSpeakersPublic(eventId);
  const allSpeakers = speakerData ? [...speakerData.speakers, ...speakerData.keynoteSpeakers] : null;
  
  return (
    <div className="print-page-container">
      <PrintableSchedule eventId={eventId} sanitySpeakers={allSpeakers} />
    </div>
  );
}
