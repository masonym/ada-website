"use client";
import React from 'react';
import PrintableSchedule from '@/components/PrintableSchedule';
import '../print-styles.css';

interface PrintSchedulePageProps {
  params: {
    eventId: string;
  };
}

export default function PrintSchedulePage({ params }: PrintSchedulePageProps) {
  const eventId = parseInt(params.eventId, 10);
  
  return (
    <div className="print-page-container">
      <PrintableSchedule eventId={eventId} />
    </div>
  );
}
