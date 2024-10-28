import React from 'react'
import EventCard from './EventCard'
import { EVENTS } from '@/constants/events'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

const UpcomingEvents = () => {
  return (
    <section id="upcoming-events" className="max-container flex flex-col items-center mt-24 mb-16">
      <h2 className="text-center font-gotham font-bold text-[36px] md:text-[64px] text-slate-900 sm:px-16 px-6">
        Don't miss our upcoming events!
      </h2>
      {/* <h3 className="text-center font-gotham font-semibold text-[20px] md:text-[28px] text-slate-900 sm:px-16 px-6 mb-8">
        We host events nationwide, so stay tuned for an event coming near you!
      </h3> */}
      <p className="text-center text-slate-600 text-xl mb-12 max-w-3xl mx-2">
        Join us for industry-leading conferences and networking opportunities. Discover the latest in defense technology and procurement strategies.
      </p>
      <div className="flex lg:flex-row flex-col gap-10 mx-4">
        {EVENTS.map(event => (
          <div key={event.id} className="relative group h-fit cursor-pointer transition-all duration-300 hover:scale-105">
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
      <p className="text-center text-slate-600 text-lg mt-8">
        Click on any event card to view full details and registration information.
      </p>
    </section>
  )
}

export default UpcomingEvents