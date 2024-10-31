import React from 'react'
import Link from 'next/link'
import { SponsorProps } from './SponsorOptions'

const SponsorProspectus = ({ event }: SponsorProps) => {
    if (!event.sponsorProspectusPath) return null;

    return (
        <Link
            href={event.sponsorProspectusPath}
            target='_blank'
            className="inline-flex justify-center items-center px-8 py-3 mb-4 max-w-sm sm:max-w-lg bg-blue-900 text-white rounded-full hover:bg-blue-950 transition-all duration-300"
        >
            <span className="font-semibold text-center">
                Download Sponsorship & Exhibitor Prospectus
            </span>
        </Link>
    )
}

export default SponsorProspectus