import SponsorOptions from '@/app/components/SponsorOptions'
import { EVENTS } from '@/constants/events';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import React from 'react'
import { ChevronLeft } from 'lucide-react'
import Image from 'next/image';



const page = ({ params }: { params: { slug: string } }) => {
    const event = EVENTS.find((e) => e.slug === params.slug);

    if (!event) {
        notFound();
    }

    return (
        <>
            <div className="max-container mx-auto pt-8 px-4 flex flex-col items-start underline">
                <Link href={`/events/${params.slug}`} className="text-[24px] items-center font-bold text-gray-700 hover:text-gray-900 flex">
                    <ChevronLeft /> Back
                </Link>
            </div>
            <div className="py-8 flex flex-col items-center">
                <Image
                    src={event.image}
                    width={1000}
                    height={400}
                    alt={`Event image for ${event.title}`}
                    unoptimized={true}
                    className="mb-6 w-full max-w-[1536px]"
                />
                <SponsorOptions
                    event={event}
                ></SponsorOptions>
            </div>
        </>
    )
}

export default page