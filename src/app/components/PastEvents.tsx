import React, { useMemo } from 'react';
import { EVENTS } from '@/constants/events';
import Image from 'next/image';
import Link from 'next/link';
import { History, ArrowRight } from 'lucide-react';

// Simple card component without description
const SimpleEventCard = ({ title, date, image, slug }: {
  title: string;
  date: string;
  image: string;
  slug: string;
}) => (
  <Link href={`/events/${slug}/about/event-recap`} className="w-full max-w-[400px] group">
    <div className="relative overflow-hidden rounded-lg transition-all duration-300 hover:scale-105">
      {/* Image Container */}
      <div className="relative h-[200px] w-full">
        <Image
          src={image}
          fill
          style={{ objectFit: 'cover' }}
          alt={`Event image for ${title}`}
        />
      </div>
      
      {/* Content Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
        <h3 className="text-white font-bold text-xl mb-2">{title}</h3>
        <p className="text-white/80 text-sm">{date}</p>
      </div>

      {/* Past Event Badge */}
      <div className="absolute top-4 right-4 bg-gray-800/90 text-white px-3 py-1 text-sm rounded-md">
        Past Event
      </div>

      {/* Hover State */}
      <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        <div className="bg-white text-blue-600 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
          View Recap <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  </Link>
);

const PastEvents = () => {
  // Group past events by year
  const eventsByYear = useMemo(() => {
    const now = new Date();
    
    // Filter past events and group them by year
    const pastEvents = EVENTS
      .filter(event => new Date(event.timeStart) < now)
      .reduce((acc, event) => {
        const year = new Date(event.timeStart).getFullYear();
        if (!acc[year]) {
          acc[year] = [];
        }
        acc[year].push(event);
        return acc;
      }, {} as Record<number, typeof EVENTS>);
    
    // Sort years in descending order
    return Object.entries(pastEvents)
      .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
      .map(([year, events]) => ({
        year: Number(year),
        events: events.sort((a, b) => 
          new Date(b.timeStart).getTime() - new Date(a.timeStart).getTime()
        )
      }));
  }, []);

  if (eventsByYear.length === 0) {
    return null;
  }

  return (
    <section id="past-events" className="max-container flex flex-col items-center mt-24 mb-16">
      {/* Header */}
      <div className="flex items-center gap-4 mb-12">
        <History className="w-14 h-14 text-gray-500" />
        <h2 className="text-center font-gotham font-bold text-[36px] md:text-[64px] text-gray-700">
          Past Events
        </h2>
      </div>

      {/* Events by Year */}
      <div className="w-full max-w-7xl">
        {eventsByYear.map(({ year, events }) => (
          <div key={year} className="mb-16">
            <div className="flex items-center gap-4 mb-8">
              <h3 className="text-3xl font-bold text-gray-700">{year}</h3>
              <div className="flex-1 h-[1px] bg-gray-300"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map(event => (
                <SimpleEventCard
                  key={event.id}
                  title={event.title}
                  date={event.date}
                  image={event.image}
                  slug={event.slug}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PastEvents;