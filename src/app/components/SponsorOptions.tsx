import { SPONSORSHIP_TYPES } from '@/constants/sponsorships'
import React from 'react'
import { EventProps } from './Speakers'
import { notFound } from 'next/navigation'
import SponsorshipCard from './SponsorshipCard'
import Image from 'next/image'

export type SponsorProps = {
    event: EventProps;
}


const SponsorOptions = ({ event }: SponsorProps) => {
    const currentEvent = SPONSORSHIP_TYPES.find((e) => e.id === event.id);

    if (!currentEvent) {
        notFound();
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 flex flex-col items-center ">
            <h1 className="text-[48px] font-gotham font-bold mb-2  text-slate-700 text-center">{event.title}</h1>
            <p className="text-[28px] mb-4  text-slate-700">{event.date}</p>
            <Image
                src={event.image}
                width={1000}
                height={400}
                alt={`Event image for ${event.title}`}
                className="mb-6"
            />
            <div className="flex flex-col items-center">
                <h1 className="text-[48px] text-left font-gotham font-bold mb-2  text-slate-700">
                    Sponsorship
                </h1>
                <p className="text-[20px] font-gotham text-slate-600 w-full max-w-2xl mx-auto mb-6">
                    Join us for a premiere opportunity to network with key leaders. We are pleased to offer the following Sponsorship Opportunities.
                </p>
                {currentEvent.sponsorships.map((item, index) => (
                    <SponsorshipCard
                        key={index}
                        item={item}
                    >
                    </SponsorshipCard>
                ))
                }
                <p className="text-[16px] font-gotham text-slate-600 text-center w-full max-w-2xl mx-auto mb-6">
                    For more information and to secure your Sponsorship, contact: <br></br>
                    <a href="mailto:marketing@americandefensealliance.org" className='underline'>marketing@americandefensealliance.org</a>
                </p>
            </div>
        </div>
    )
}

export default SponsorOptions