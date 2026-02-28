'use client';

import { Event } from '@/types/events';
import { useState, useEffect } from 'react';

interface EventNoticeBannerProps {
  event: Event;
}

export default function EventNoticeBanner({ event }: EventNoticeBannerProps) {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    // check if we should show the banner based on registration closed time
    if (event.eventPageNotice && event.registrationClosedTime) {
      const isAfterClosedTime = new Date() >= new Date(event.registrationClosedTime);
      setShouldShow(isAfterClosedTime);
    }
  }, [event.eventPageNotice, event.registrationClosedTime]);

  if (!shouldShow || !event.eventPageNotice) {
    return null;
  }

  return (
    <div className={`w-full max-w-4xl mx-auto my-6 p-6 rounded-lg border-l-4 ${
      event.eventPageNoticeVariant === 'error' 
        ? 'bg-red-50 border-red-500 text-red-900' 
        : event.eventPageNoticeVariant === 'info'
        ? 'bg-blue-50 border-blue-500 text-blue-900'
        : 'bg-yellow-50 border-yellow-500 text-yellow-900'
    }`}>
      <div 
        className="text-base leading-relaxed"
        dangerouslySetInnerHTML={{ __html: event.eventPageNotice }}
      />
    </div>
  );
}
