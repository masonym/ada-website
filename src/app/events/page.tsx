import { EVENTS } from '@/constants/events'
import React from 'react'
import EventCard from '../components/EventCard'
import { ArrowRight, Link } from 'lucide-react'

const page = () => {
    return (
        <div className="flex flex-col max-content mt-12">
            <h1 className="text-[48px] font-gotham font-bold mb-0 text-slate-900 text-center">UPCOMING EVENTS</h1>
            <h2 className="text-[24px] font-gotham font-bold mb-4 text-slate-700 text-center">Presented by ADA</h2>

            <div className="flex lg:flex-row flex-col gap-10 mx-12">
                {EVENTS.map(event => (
                    <div key={event.id} className="relative group">
                        <EventCard
                            title={event.title}
                            date={event.date}
                            description={event.description}
                            image={event.image}
                            link={`/events/${event.slug}`}
                        />
                        <div className="absolute inset-0 bg-blue-600 bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg flex items-center justify-center">
                            <Link
                                href={`/events/${event.slug}`}
                            >
                                <div className="bg-white text-blue-600 px-6 py-3 rounded-full font-bold text-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 flex items-center">
                                    Learn More <ArrowRight className="ml-2" />
                                </div>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>

    )
}

export default page