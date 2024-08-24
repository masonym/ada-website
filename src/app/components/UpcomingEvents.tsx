import React from 'react'
import EventCard from './EventCard'

const UpcomingEvents = () => {
  return (
    <section className="max-container flex flex-col gap-20 md:gap-28 items-center my-8 ">


      <h1 className="self-end text-right font-gotham font-bold ss:text-[72px] text-[64px] text-slate-900 sm:px-16 px-6">
        DON'T MISS OUR EVENTS!
      </h1>
      <div className="flex lg:flex-row flex-col gap-10 mx-12">
        {/* get these from data file  */}
        <EventCard
          title="2025 Defense Industry Forecast"
          date="November 14th, 2024"
          description="A Description!"
          image="/2025_DefenseIndustryForecast.png"
          link="http://google.com/"
        />
{/* 
        <EventCard
          title="2026 Defense Industry Forecast"
          date="November 14th, 2025"
          description="A different description!"
          image="/2025_DefenseIndustryForecast.png"
        /> */}

      </div>
    </section >
  )
}

export default UpcomingEvents