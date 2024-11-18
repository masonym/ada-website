import React from 'react'
import EventCard from './EventCard'
import { EVENTS } from '@/constants/events'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

type UpcomingEventsProps = {
  showMainTitle?: boolean;
  customTitle?: React.ReactNode;
  customSubtitle?: React.ReactNode;
  hideBottomText?: boolean;
};

const UpcomingEvents = ({
  showMainTitle = true,
  customTitle,
  customSubtitle,
  hideBottomText = false,
}: UpcomingEventsProps) => {
  // Get current date
  const now = new Date();

  // Filter and sort upcoming events
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

  const gridClass = getGridClass(upcomingEvents.length);

  // If no upcoming events, show a message
  if (upcomingEvents.length === 0) {
    return (
      <section className="max-container flex flex-col items-center mt-8 mb-16">
        <h2 className="text-center font-gotham font-bold text-[36px] md:text-[64px] text-slate-900 sm:px-16 px-6">
          Upcoming Events
        </h2>
        <p className="text-center text-slate-600 text-xl mt-8 max-w-3xl mx-2">
          No upcoming events at this time. Please check back soon for new events or view our past events below.
        </p>
      </section>
    );
  }

  return (
    <section id="upcoming-events" className="max-container flex flex-col items-center mt-8 mb-16">
      {customTitle || (showMainTitle && (
        <h2 className="text-center font-gotham font-bold text-[36px] md:text-[64px] text-slate-900 sm:px-16 px-6">
          Don't miss our upcoming events!
        </h2>
      ))}
      {customSubtitle || (
        <p className="text-center text-slate-600 text-xl mb-12 max-w-3xl mx-2">
          Join us for industry-leading conferences and networking opportunities. Discover the latest in defense technology and procurement strategies.
        </p>
      )}
      
      <div className={`grid grid-cols-1 md:grid-cols-1 ${gridClass} gap-10 mx-4 justify-items-center w-full px-4`}>
        {upcomingEvents.map(event => (
          <div key={event.id} className="relative group h-fit cursor-pointer transition-all duration-300 hover:scale-105 w-full max-w-[640px]">
            <EventCard
              title={event.title}
              date={event.date}
              description={event.description}
              image={event.image}
              link={`/events/${event.slug}`}
            />
            <div className="absolute inset-0 bg-blue-600 bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg flex items-center justify-center">
              <Link href={`/events/${event.slug}`} className="w-full h-full flex items-center justify-center">
                <div className="bg-white text-blue-600 px-6 py-3 rounded-full font-bold text-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 flex items-center">
                  View Event Details <ArrowRight className="ml-2" />
                </div>
              </Link>
            </div>
            <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-2 rounded-bl-md">
              Click for Details
            </div>
          </div>
        ))}
      </div>
      {!hideBottomText && (
        <p className="text-center text-slate-600 text-lg mt-8">
          Click on any event card to view full details and registration information.
        </p>
      )}
    </section>
  )
}

export default UpcomingEvents