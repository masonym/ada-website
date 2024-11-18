import React from 'react'
import EventCard from './EventCard'
import { EVENTS } from '@/constants/events'
import { History, ArrowRight, CalendarCheck } from 'lucide-react'
import Link from 'next/link'

const PastEvents = () => {
  // Get current date
  const now = new Date();

  // Filter and sort past events
  const pastEvents = [...EVENTS]
    .filter(event => new Date(event.timeStart) < now)
    .sort((a, b) => {
      const dateA = new Date(a.timeStart);
      const dateB = new Date(b.timeStart);
      return dateB.getTime() - dateA.getTime(); // Sort in reverse chronological order
    });

  // Get upcoming events for the promotional section
  const upcomingEvents = [...EVENTS]
    .filter(event => new Date(event.timeStart) >= now)
    .sort((a, b) => {
      const dateA = new Date(a.timeStart);
      const dateB = new Date(b.timeStart);
      return dateA.getTime() - dateB.getTime();
    });

  // Determine grid columns based on number of events
  const getGridClass = (count: number) => {
    switch (count) {
      case 1:
        return 'xl:grid-cols-1 max-w-[640px]';
      case 2:
        return 'xl:grid-cols-2 xl:max-w-[1300px]';
      default:
        return 'xl:grid-cols-3 xl:max-w-[1900px]';
    }
  };

  const gridClass = getGridClass(pastEvents.length);

  if (pastEvents.length === 0) {
    return null; // Don't render the section if there are no past events
  }

  return (
    <section id="past-events" className="max-container flex flex-col items-center mt-24 mb-16">
      <div className="flex items-center gap-4 mb-8">
        <History className="w-14 h-14 text-gray-500" />
        <h2 className="text-center font-gotham font-bold text-[36px] md:text-[64px] text-gray-700">
          Past Events
        </h2>
      </div>
      <p className="text-center text-gray-600 text-xl mb-12 max-w-3xl mx-2">
        Explore our previous conferences and events. View event recaps, photo galleries, and presentation materials.
      </p>

      <div className={`grid grid-cols-1 md:grid-cols-1 ${gridClass} gap-10 mx-4 justify-items-center w-full px-4`}>
        {pastEvents.map(event => (
          <Link key={event.id} href={`/events/${event.slug}/about/event-recap`} className="w-full max-w-[640px]">
            <div className="relative group h-fit cursor-pointer transition-all duration-300 hover:scale-105">
              <EventCard
                title={event.title}
                date={event.date}
                description={event.description}
                image={event.image}
                link={`/events/${event.slug}/about/event-recap`}
              />
              
              {/* Past Event Badge */}
              <div className="absolute top-4 right-4 bg-gray-800/90 text-white px-4 py-2 rounded-md z-20">
                Past Event
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-blue-600 bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg flex items-center justify-center">
                <div className="bg-white text-blue-600 px-6 py-3 rounded-full font-bold text-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 flex items-center">
                  View Event Recap <ArrowRight className="ml-2" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {upcomingEvents.length > 0 && (
        <div className="mt-20 w-full max-w-4xl bg-gradient-to-r from-navy-800 to-blue-900 rounded-xl p-8 text-white">
          <div className="flex items-center justify-center gap-3 mb-6">
            <CalendarCheck className="w-8 h-8" />
            <h3 className="text-2xl md:text-3xl font-bold text-center">Upcoming Events</h3>
          </div>
          
          <p className="text-center mb-8 text-lg">
            Don't miss our upcoming conferences and networking opportunities!
          </p>

          <div className="flex flex-col gap-4">
            {upcomingEvents.map(event => (
              <Link 
                key={event.id} 
                href={`/events/${event.slug}`}
                className="bg-white/10 hover:bg-white/20 transition-all duration-300 rounded-lg p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div>
                  <h4 className="text-xl font-bold">{event.title}</h4>
                  <p className="text-white/80">{event.date}</p>
                </div>
                <button className="bg-blue-500 hover:bg-blue-600 transition-colors duration-300 px-6 py-2 rounded-full flex items-center gap-2 text-sm">
                  Learn More <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

export default PastEvents