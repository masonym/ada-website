import { SPONSORSHIP_TYPES } from '@/constants/sponsorships'
import React from 'react'
import { EventProps } from './Speakers'
import { notFound } from 'next/navigation'
import SponsorshipCard from './SponsorshipCard'
import Image from 'next/image'
import Link from 'next/link'

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
                <h1 className="text-[48px] text-center font-gotham font-bold mb-2  text-slate-700">
                    Sponsorship Opportunities
                </h1>
                <p className="text-[20px] font-gotham text-slate-600 w-full max-w-2xl mx-auto mb-6 text-center">
                    Increase your Brand Visibility and gain a Competitive Advantage! <br></br> Engaging in Sponsorship Opportunities is a Strategic way to effectively Promote your Products or Services.
                </p>
                <p className="text-[20px] font-gotham text-slate-600 w-full max-w-2xl mx-auto mb-6 text-center">
                    Registered Sponsors: Please submit a high-quality logo for inclusion in the conference materials, along with the desired link for the logo on the event website, to <Link className="text-blue-600 hover:underline text-nowrap" href="mailto:marketing@americandefensealliance.org">marketing@americandefencealliance.org</Link>.
                </p>
                {/* NOTE: may need to change this later for events with 5th/6th sponsors */}
                {/* [&>*:nth-child(4)]:md:col-span-3 [&>*:nth-child(4)]:md:mx-auto [&>*:nth-child(4)]:md:max-w-[29rem] */}
                <div className="grid md:grid-cols-3 grid-cols-1 gap-8 ">
                    {currentEvent.sponsorships.map((item, index) => (
                        <SponsorshipCard
                            key={index}
                            item={item}
                        >
                        </SponsorshipCard>
                    ))
                    }
                </div>
                <p className="text-[16px] font-gotham text-slate-600 text-center w-full max-w-2xl mx-auto mb-6">
                    For more information and to secure your sponsorship, contact: <br></br>
                    <a href="mailto:marketing@americandefensealliance.org" className='underline'>marketing@americandefensealliance.org</a>
                </p>
            </div>
        </div>
    )
}

export default SponsorOptions