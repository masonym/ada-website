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
        <div className="max-container mx-auto pb-8 pt-0 px-4 flex flex-col items-center ">
            <div className="flex flex-col items-center">
                <h1 className="text-[48px] text-left font-gotham font-bold mb-2  text-slate-700">
                    Sponsorship Opportunities
                </h1>
                <p className="text-[20px] font-gotham text-slate-600 w-full max-w-2xl mx-auto mb-6 text-center">
                    Join us for a premier opportunity to network with key leaders. <br></br> We are pleased to offer the following Sponsorship Opportunities.
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
                    For more information and to secure your sponsorship, contact: <br></br>
                    <a href="mailto:marketing@americandefensealliance.org" className='underline'>marketing@americandefensealliance.org</a>
                </p>
            </div>
        </div>
    )
}

export default SponsorOptions