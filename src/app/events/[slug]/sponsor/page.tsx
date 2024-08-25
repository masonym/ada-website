import SponsorOptions from '@/app/components/SponsorOptions'
import { EVENTS } from '@/constants/events';
import { notFound } from 'next/navigation';
import React from 'react'



const page = ({ params }: { params: { slug: string } }) => {
    const currentEvent = EVENTS.find((e) => e.slug === params.slug);

    if (!currentEvent) {
        notFound();
      }

    return (
        <div>

            <SponsorOptions
                event={currentEvent}
            ></SponsorOptions>
        </div>
    )
}

export default page