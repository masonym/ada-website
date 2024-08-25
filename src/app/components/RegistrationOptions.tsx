import { SPONSORSHIP_TYPES } from '@/constants/sponsorships'
import React from 'react'
import { EventProps } from './Speakers'
import { notFound } from 'next/navigation'
import SponsorshipCard from './SponsorshipCard'
import Image from 'next/image'
import RegistrationCard from './RegistrationCard'
import { REGISTRATION_TYPES } from '@/constants/registrations'

export type SponsorProps = {
    event: EventProps;
}


const RegistrationOptions = ({ event }: SponsorProps) => {
    const currentEvent = REGISTRATION_TYPES.find((e) => e.id === event.id);

    if (!currentEvent) {
        notFound();
    }

    return (
        <div className="max-w-4xl mx-auto pt-0 pb-8 px-4 flex flex-col items-center ">
            <div className="flex flex-col items-center">
                <h1 className="text-[48px] text-left font-gotham font-bold mb-2  text-slate-700">
                    Registration Options
                </h1>
                <p className="text-[20px] font-gotham text-slate-600 w-full max-w-2xl mx-auto mb-6">
                    Join us for a premiere opportunity to network with key leaders.
                </p>
                <div className="flex flex-col gap-4 md:flex-row">
                    {currentEvent.registrations.map((item, index) => (
                        <RegistrationCard
                            key={index}
                            item={item}
                        >
                        </RegistrationCard>
                    ))
                    }
                </div>
            </div>
        </div>
    )
}

export default RegistrationOptions