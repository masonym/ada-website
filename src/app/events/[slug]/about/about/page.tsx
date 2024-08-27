import React from 'react';
import { EVENTS } from '@/constants/events';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { ChevronDown, Calendar, MapPin, Clock } from 'lucide-react';
import Button from '@/app/components/Button';

export default function AboutPage({ params }: { params: { slug: string } }) {
  const event = EVENTS.find((e) => e.slug === params.slug);

  if (!event) {
    notFound();
  }

  return (
    <div className="min-h-screen text-navy-800 text-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center">

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 mb-12 shadow-xl">
          <h2 className="text-3xl font-semibold mb-4 text-navy-500">About the Event</h2>
          <div className="text-lg leading-relaxed">{event.eventText}</div>
        </div>

        <div>
          <h2 className="text-3xl font-semibold mb-6 text-navy-500">Topical Coverage</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {event.topicalCoverage.map((topic, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm p-6 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 "
              >
                <p className="text-lg">{topic}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center w-fit">
          <p className="text-2xl text-navy-500 mb-6 w-fit text-center">Don't miss this groundbreaking event!</p>
          <Button
            title="REGISTER"
            variant="btn_blue"
            link={event.registerLink}
            className="w-full"
          />
        </div>

      </div>
    </div>
  );
}