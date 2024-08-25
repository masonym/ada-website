import SponsorOptions from '@/app/components/SponsorOptions'
import { EVENTS } from '@/constants/events';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import React from 'react'
import { ChevronLeft } from 'lucide-react'



const page = ({ params }: { params: { slug: string } }) => {
    const currentEvent = EVENTS.find((e) => e.slug === params.slug);

    if (!currentEvent) {
        notFound();
    }

    return (
        <>
            <div className="max-w-4xl mx-auto pt-8 px-4 flex flex-col items-start underline">
                <Link href={`/events/${params.slug}`} className="text-[24px] items-center font-bold text-gray-700 hover:text-gray-900 flex">
                    <ChevronLeft/> Back
                </Link>
            </div>
            <div>
                <SponsorOptions
                    event={currentEvent}
                ></SponsorOptions>
            </div>
        </>
    )
}

export default page