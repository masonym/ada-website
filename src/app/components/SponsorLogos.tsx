import React from 'react'
import { SponsorProps } from './SponsorOptions'

const SponsorLogos = ({ event }: SponsorProps) => {
    return (
        <p className="text-[16px] font-gotham text-slate-600 text-center w-full max-w-2xl mx-auto mb-6">
            {event.sponsorshipInfo?.sponsorSection}
        </p>
    )
}

export default SponsorLogos