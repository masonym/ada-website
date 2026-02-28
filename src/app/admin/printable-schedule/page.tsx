'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { EVENTS } from '@/constants/events';
import { SCHEDULES } from '@/constants/schedules';
import { EventSpeakerPublic } from '@/lib/sanity';

const PrintableSchedule = dynamic(() => import('@/components/PrintableSchedule'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-800"></div>
      <span className="ml-3 text-gray-600">Loading PDF generator...</span>
    </div>
  ),
});

export default function PrintableSchedulePage() {
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [sanitySpeakers, setSanitySpeakers] = useState<EventSpeakerPublic[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const eventsWithSchedules = EVENTS.filter((event) => SCHEDULES.some((s) => s.id === event.id));

  const selectedEvent = selectedEventId ? EVENTS.find((e) => e.id === selectedEventId) : null;

  const selectedSchedule = selectedEventId ? SCHEDULES.find((s) => s.id === selectedEventId)?.schedule : null;

  useEffect(() => {
    if (!selectedEventId) {
      setSanitySpeakers(null);
      return;
    }

    const fetchSpeakers = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/event-speakers-public?eventId=${selectedEventId}`);
        const data = await res.json();

        if (data.speakers && data.speakers.length > 0) {
          setSanitySpeakers(data.speakers);
        } else {
          setSanitySpeakers(null);
        }
      } catch (error) {
        console.error('Error fetching speakers:', error);
        setSanitySpeakers(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSpeakers();
  }, [selectedEventId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <Link href="/admin" className="text-sb-100 hover:text-blue-700 text-sm">
              ← Back to Admin
            </Link>
            <h1 className="text-2xl font-bold text-navy-800 mt-1">Printable Schedule Generator</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-navy-800 mb-4">Select Event</h2>

          <select
            value={selectedEventId ?? ''}
            onChange={(e) => setSelectedEventId(e.target.value ? Number(e.target.value) : null)}
            className="w-full max-w-md border border-gray-300 rounded-md px-4 py-2 focus:ring-sb-100 focus:border-sb-100"
          >
            <option value="">-- Select an event --</option>
            {eventsWithSchedules.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title} ({event.date})
              </option>
            ))}
          </select>

          {selectedEvent && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">
                <strong>Event:</strong> {selectedEvent.title}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Date:</strong> {selectedEvent.date}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Schedule Days:</strong> {selectedSchedule?.length || 0}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Speakers from Sanity:</strong>{' '}
                {isLoading ? 'Loading...' : (sanitySpeakers?.length ?? 'None found')}
              </p>
            </div>
          )}
        </div>

        {selectedEvent && selectedSchedule && !isLoading ? (
          <PrintableSchedule eventId={selectedEvent.id} sanitySpeakers={sanitySpeakers} />
        ) : selectedEventId && isLoading ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-800 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading event data...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Event Selected</h3>
            <p className="text-gray-500">Select an event above to generate a printable schedule PDF.</p>
          </div>
        )}
      </div>
    </div>
  );
}
