import React from 'react'
import EventCard from './EventCard'

const UpcomingEvents = () => {
  return (
    <section className="max-container flex flex-col gap-20 md:gap-28 items-center my-8">

      <h1 className="self-end text-right font-gotham font-bold ss:text-[72px] text-[64px] text-slate-900 sm:px-16 px-6">
        DON'T MISS OUR EVENTS!
      </h1>
      {/* get these from data file  */}
      <EventCard
        title="2025 Defense Industry Forecast"
      date="November 14th, 2024"
      description="A Description!"
      image="/2025_DefenseIndustryForecast.png"
      >

    </EventCard>
    </section >
  )
}

export default UpcomingEvents