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
            {/* <div className="max-container mx-auto pt-8 px-4 flex flex-col items-start underline">
                <Link href={`/events/${params.slug}`} className="text-[24px] items-center font-bold text-gray-700 hover:text-gray-900 flex">
                    <ChevronLeft /> Back
                </Link>
            </div> */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center">
                    <div className="w-full mb-6">
                        <Image
                            src={event.image}
                            width={2000}
                            height={800}
                            layout="responsive"
                            alt={`Event image for ${event.title}`}
                            className="rounded-lg"
                        />
                    </div>
                    <SponsorOptions
                        event={event}
                    ></SponsorOptions>
                </div>
            </div>
        </>
    )
}

export default page