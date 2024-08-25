import { EVENTS } from '@/constants/events'
import React from 'react'
import EventCard from '../components/EventCard'

const page = () => {
    return (
        <div className="flex flex-col max-content mt-12">
            <h1 className="text-[48px] font-gotham font-bold mb-0 text-slate-900 text-center">UPCOMING EVENTS</h1>
            <h2 className="text-[24px] font-gotham font-bold mb-4 text-slate-700 text-center">Presented by ADA</h2>

            <div className="flex lg:flex-row flex-col gap-10 mx-12 items-center justify-center">
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
        </div>

    )
}

export default page