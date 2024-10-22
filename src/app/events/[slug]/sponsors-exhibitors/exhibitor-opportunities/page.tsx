import { EVENTS } from '@/constants/events';
import { notFound } from 'next/navigation';
import React from 'react'
import ExhibitorOptions from '@/app/components/ExhibitorOptions';



const page = ({ params }: { params: { slug: string } }) => {
    const event = EVENTS.find((e) => e.slug === params.slug);

    if (!event) {
        notFound();
    }

    return (
        <>
            {/* <div className="max-container mx-auto pt-8 px-4 flex flex-col items-start underline">
                <Link href={`/events/${params.slug}`} className="text-[24px] items-center font-bold text-gray-700 hover:text-gray-900 flex">
                    <ChevronLeft /> Back
                </Link>
            </div> */}

            <ExhibitorOptions
                event={event}
            ></ExhibitorOptions>
        </>
    )
}

export default page