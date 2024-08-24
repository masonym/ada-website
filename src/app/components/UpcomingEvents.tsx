import React from 'react'
import EventCard from './EventCard'
import { EVENTS } from '@/constants/events'

const UpcomingEvents = () => {
  return (
    <section className="max-container flex flex-col gap-20 md:gap-28 items-center my-8 ">


      <h1 className="self-end text-right font-gotham font-bold ss:text-[72px] text-[64px] text-slate-900 sm:px-16 px-6">
        DON'T MISS OUR EVENTS!
      </h1>
      <div className="flex lg:flex-row flex-col gap-10 mx-12">
        {/* get these from data file  */}
        {EVENTS.map(event => (
          <EventCard
            key={event.id}
            title={event.title}
            date={event.date}
            description={event.description}
            image={event.image}
            link={event.link}
          />
        ))}

      </div>
    </section >
  )
}

export default UpcomingEvents