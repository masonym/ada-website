"use client";

import { EVENTS } from '@/constants/events';
import Image from 'next/image';
import { notFound, useParams } from 'next/navigation';
import React from 'react';

interface EventImageProps {
  slug: string;
}

const EventImage = () => {
    const params = useParams(); // Get the dynamic slug
    const event = EVENTS.find(event => event.slug === params?.slug); // Find the event ID based on the slug

    if (!event) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center">
        <div className="w-full mb-6">
          <Image
            src={event.image}
            width={2000}
            height={800}
            layout="responsive"
            alt={`Event image for ${event.title}`}
            className="rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}

export default EventImage;