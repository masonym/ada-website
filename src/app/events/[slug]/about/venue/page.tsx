"use client";

import React, { useState } from 'react';
import { EVENTS } from '@/constants/events';
import Image from 'next/image';
import { notFound, useParams } from 'next/navigation';
import Map from './Map';
import Link from 'next/link';
import { ChevronDown, ChevronRight } from 'lucide-react';

type Event = {
    id: number;
    title: string;
    slug: string;
    locationAddress: string;
    locationImage: string;
    placeID: string;
    directions: {
        title: string;
        description: string;
    }[];
    parkingInfo: {
        title: string;
        description: string;
        link?: {
            linkText: string;
            href: string;
        };
    }[]
};

const Page = () => {
    const params = useParams();
    const event = EVENTS.find((event: Event) => event.slug === params?.slug);

    const [openElems, setOpenElems] = useState<number[]>([]);

    const toggleElem = (index: number) => {
        setOpenElems(prev =>
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        )
    }

    if (!event) {
        notFound()
    }

    return (
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-700 text-center mb-8">
                Event Location & Parking
            </h2>

            <div className="mb-2 flex flex-col items-center text-slate-700">
                <h3 className="text-2xl font-bold mb-4">Address</h3>
                <p className="text-lg">{event.locationAddress}</p>
            </div>
            <div className="mt-6 flex justify-center">
                <Image
                    src={event.locationImage}
                    className="rounded-lg mb-4"
                    alt="Location Map"
                    width={1000}
                    height={400}
                    priority={true}
                />
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 lg:gap-20">

                {/* directions */}
                <div className="mb-12 flex flex-col items-center">
                    <h3 className="text-3xl font-bold mt-6 mb-6 text-slate-800">Directions</h3>
                    <div className="grid gap-6 grid-cols-1 auto-rows-auto">
                        {event.directions.map((option, index) => (
                            <div key={index} className="bg-white h-fit rounded-lg shadow-md overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-lg hover:border-blue-300">
                                <div className="bg-navy-300 p-4 cursor-pointer flex justify-between items-center" onClick={() => toggleElem(index)}>
                                    <h4 className="text-xl font-semibold text-white flex items-center">
                                        {openElems.includes(index) ? <ChevronDown className="mr-2" /> : <ChevronRight className="mr-2" />}
                                        {option.title}
                                    </h4>
                                </div>
                                {/* html is set dangerously here to allow for styling & flexibility */}
                                <div
                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${openElems.includes(index) ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}
                                >
                                    <div className="py-4 px-8">
                                        <div
                                            className="text-sm space-y-2 text-gray-600"
                                            dangerouslySetInnerHTML={{ __html: option.description }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* parking */}
                <div className="mb-12">
                    <h3 className="text-3xl font-bold mt-6 mb-6 text-slate-800 text-center">Parking</h3>
                    <div className="bg-white px-6 py-4 rounded-lg shadow-md flex flex-col gap-6">
                        {event.parkingInfo.map((option, index) => (
                            <div key={index}>
                                <h4 className="text-[18px] leading-10 font-semibold mb-2">{option.title}</h4>
                                <p className="mt-4">{option.description}</p>
                                {option.link && (
                                    <Link href={option.link.href} className="text-blue-600 hover:underline text-wrap lg:text-nowrap">
                                        <p className="mt-4">{option.link.linkText}</p>
                                    </Link>
                                )

                                }
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* map */}

            <div className="mt-12 self-center" style={{ width: "100%", height: "400px" }}>
                <Map placeId={event.placeID} />
            </div>
        </div>
    );
};

export default Page;