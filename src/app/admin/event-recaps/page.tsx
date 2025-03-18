'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EVENTS } from '@/constants/events';
import { EVENT_RECAPS } from '@/constants/eventRecaps';
import Link from 'next/link';

export default function EventRecapsAdmin() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication on component mount
  useEffect(() => {
    const adminAuth = localStorage.getItem('admin_auth');
    if (adminAuth !== 'true') {
      router.push('/admin/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  if (!isAuthenticated) {
    return <div className="p-8 text-center">Checking authentication...</div>;
  }

  // Get events that have recaps configured
  const eventsWithRecaps = EVENT_RECAPS.map(recap => recap.eventShorthand);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Event Recaps Management</h1>
      
      <div className="mb-8">
        <p className="mb-4">
          This page helps you manage event recaps. Each event can have a structured recap with sections for different types of photos.
        </p>
        <p className="mb-4">
          To create or edit an event recap, you need to:
        </p>
        <ol className="list-decimal pl-6 mb-4 space-y-2">
          <li>Upload photos to the S3 bucket at <code>events/[eventShorthand]/photos/</code></li>
          <li>Edit the <code>src/constants/eventRecaps.tsx</code> file to add or update the recap structure</li>
          <li>For each image, you can add captions, people tags, and categorize them into different sections</li>
        </ol>
        <p>
          The system supports different layout types: <code>featured</code>, <code>grid</code>, <code>masonry</code>, and <code>carousel</code>.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <h2 className="text-xl font-semibold">Events with Configured Recaps</h2>
        </div>
        <ul className="divide-y divide-gray-200">
          {EVENT_RECAPS.map(recap => {
            const event = EVENTS.find(e => e.eventShorthand === recap.eventShorthand);
            return event ? (
              <li key={recap.eventShorthand} className="px-4 py-4 sm:px-6 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">{event.title}</h3>
                  <p className="text-sm text-gray-500">{event.date}</p>
                  <p className="text-sm mt-1">
                    {recap.sections.length} sections, {recap.sections.reduce((total, section) => total + section.images.length, 0)} images
                  </p>
                </div>
                <div className="flex space-x-3">
                  <Link
                    href={`/events/${event.slug}/about/event-recap`}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    target="_blank"
                  >
                    View
                  </Link>
                </div>
              </li>
            ) : null;
          })}
        </ul>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <h2 className="text-xl font-semibold">Events Without Configured Recaps</h2>
        </div>
        <ul className="divide-y divide-gray-200">
          {EVENTS.filter(event => !eventsWithRecaps.includes(event.eventShorthand)).map(event => (
            <li key={event.id} className="px-4 py-4 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">{event.title}</h3>
                <p className="text-sm text-gray-500">{event.date}</p>
              </div>
              <div className="flex space-x-3">
                <Link
                  href={`/events/${event.slug}/about/event-recap`}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  target="_blank"
                >
                  View
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
