import React from 'react'
import EventCard from './EventCard'
import { EVENTS } from '@/constants/events'

const UpcomingEvents = () => {
  return (
    <section className="max-container flex flex-col items-center mt-12 ">


      <h1 className="text-center font-gotham font-bold text-[36px] md:text-[64px] text-slate-900 sm:px-16 px-6">
        Don't miss our upcoming events!
      </h1>
      <div className="flex lg:flex-row flex-col gap-10 mx-12 my-12">
        {/* get these from data file  */}
        {EVENTS.map(event => (
          <EventCard
            key={event.id}
            title={event.title}
            date={event.date}
            description={event.description}
            image={event.image}
            link={`/events/${event.slug}`}
          />
        ))}

      </div>
    </section >
  )
}

export default UpcomingEvents