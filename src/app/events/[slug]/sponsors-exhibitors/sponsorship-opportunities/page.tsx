import SponsorOptions from '@/app/components/SponsorOptions'
import SponsorLogos from '@/app/components/SponsorLogos'
import { EVENTS } from '@/constants/events';
import { notFound } from 'next/navigation';
import React from 'react'



const page = ({ params }: { params: { slug: string } }) => {
    const event = EVENTS.find((e) => e.slug === params.slug);

    if (!event) {
        notFound();
    }

    return (
        <>
            <SponsorOptions
                event={event}
            />
            
            <SponsorLogos event={event} showTiers={['Sponsor', 'Partner']} />
        </>
    )
}

export default page