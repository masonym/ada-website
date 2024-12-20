import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { EVENTS } from '@/constants/events';
import { getCdnPath } from '@/utils/image';
import { validateImagePaths } from '@/utils/imageUtils';

const HeroSection = async () => {
  // Get current date at the start of the day for consistent comparison
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // Add date objects to events and sort by date
  const eventsWithDates = EVENTS.map(event => ({
    ...event,
    dateObj: new Date(event.timeStart)
  })).sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

  // Find the next upcoming event
  const nextEvent = eventsWithDates.find(event => event.dateObj >= now);

  // Find the most recent past event with available recap
  const pastEvents = eventsWithDates.filter(event => event.dateObj < now).reverse();
  let eventWithRecap = null;
  
  for (const event of pastEvents) {
    const hasImages = await validateImagePaths(event.eventShorthand);
    if (hasImages) {
      eventWithRecap = event;
      break;
    }
  }

  return (
    <section className="relative h-[35vh] md:h-[45vh] lg:h-[55vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0">
        <Image
          src={getCdnPath('2025_Defense_Industry_Forecast_Collage.webp')}
          alt="2025 Defense Industry Forecast Collage"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
          quality={90}
        />
        {/* Gradient overlay for better text readability */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-navy-800/90 via-navy-800/75 to-navy-800/60"
          aria-hidden="true"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 w-full max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 break-words">
          American Defense Alliance
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-balance md:text-nowrap lg:text-2xl mb-8 max-w-3xl mx-auto italic font-semibold">
          Connecting Industry to Government Procurement Opportunities
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {nextEvent ? (
            <Link 
              href={`/events/${nextEvent.slug}`} 
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition duration-300 text-sm sm:text-base md:text-lg"
            >
              Learn About Our Next Event
            </Link>
          ) : (
            <Link 
              href="/events" 
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition duration-300 text-sm sm:text-base md:text-lg"
            >
              View All Events
            </Link>
          )}
          
          {eventWithRecap && (
            <Link 
              href={`/events/${eventWithRecap.slug}/about/event-recap`}
              className="inline-block bg-white text-black px-6 py-3 rounded-full hover:bg-navy-900 transition duration-300 text-sm sm:text-base md:text-lg border border-white/20"
            >
              View Latest Event Recap
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;