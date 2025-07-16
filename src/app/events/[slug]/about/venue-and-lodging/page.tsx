"use client";

import React, { useState } from 'react';
import { EVENTS } from '@/constants/events';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { LODGING_INFO } from '@/constants/lodging';
import { getCdnPath } from '@/utils/image';
import Map from '../venue/Map';
import Link from 'next/link';
import LodgingSection from '@/app/components/LodgingSection';

export default function VenueAndLodgingPage({ params }: { params: { slug: string } }) {
    const event = EVENTS.find((e) => e.slug === params.slug);

    if (!event) {
        notFound();
    }

    const [openElems, setOpenElems] = useState<number[]>([]);
    const [isDiningGuideOpen, setIsDiningGuideOpen] = useState(false);

    const toggleElem = (index: number) => {
        setOpenElems(prev =>
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        )
    }

    const lodging = LODGING_INFO.find((l) => l.eventId === event.id);

    return (
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
            {/* Venue Section */}

            {/* Lodging Section */}
            {lodging && <LodgingSection lodging={lodging} className="max-w-[46rem] mx-auto"/>}

            {/* Norfolk Dining Guide Section */}
            {event.id === 4 && (
                <section className="max-w-[86rem] mx-auto my-12">
                <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-lg hover:border-blue-300 max-w-[90%] md:max-w-[60%] mx-auto">
                    <div className="bg-navy-300 p-4 cursor-pointer flex justify-between items-center" onClick={() => setIsDiningGuideOpen(!isDiningGuideOpen)}>
                        <h4 className="text-xl font-semibold text-white flex items-center">
                            {isDiningGuideOpen ? <ChevronDown className="mr-2" /> : <ChevronRight className="mr-2" />}
                            Norfolk Dining Guide
                        </h4>
                    </div>
                    <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${isDiningGuideOpen ? 'max-h-[2500px] opacity-100' : 'max-h-0 opacity-0'}`}
                    >
                        <div className="p-4 sm:p-6">
                            <p className="text-gray-600 mb-4 text-center">
                                Explore the local dining scene with this guide provided by Visit Norfolk.
                            </p>
                            <div className="grid grid-cols-1 gap-4">
                                <Image
                                    src={getCdnPath("/events/2025NMCPC/norfolk-dining-guide-1.webp")}
                                    alt="Norfolk Dining Guide Page 1"
                                    width={790}
                                    height={1024}
                                    className="w-full h-auto rounded-md shadow-sm border"
                                />
                                <Image
                                    src={getCdnPath("/events/2025NMCPC/norfolk-dining-guide-2.webp")}
                                    alt="Norfolk Dining Guide Page 2"
                                    width={790}
                                    height={1024}
                                    className="w-full h-auto rounded-md shadow-sm border"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                </section>
            )}

            <section className="max-w-8xl mx-auto flex flex-col sm:flex-row justify-center gap-4 lg:gap-8">

                {/* directions */}
                <div className="mb-12 flex flex-col items-center">
                    <h3 className="text-3xl font-bold mt-6 mb-6 text-slate-800">Directions</h3>
                    <div className="grid gap-6 grid-cols-1 auto-rows-auto">
                        {event.directions?.map((option, index) => (
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
                                            className="text-sm space-y-2 text-gray-600 overflow-visible"
                                            dangerouslySetInnerHTML={{ __html: option.description }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Parking Section */}
                <div className="mb-12">
                    <h3 className="text-4xl font-bold mt-6 mb-6 text-slate-800 text-center">Parking</h3>
                    <div className="bg-white px-6 py-4 rounded-lg shadow-md flex flex-col gap-6">
                        {event.parkingInfo?.map((option, index) => (
                            <div key={index}>
                                <h4 className="text-[18px] leading-10 font-semibold mb-2">{option.title}</h4>
                                <p className="text-balance" dangerouslySetInnerHTML={{ __html: option.description }}></p>
                                {'link' in option && option.link && (
                                    <Link href={option.link.href} className="text-blue-600 hover:underline text-wrap lg:text-nowrap">
                                        <p className="mt-4">{option.link.linkText}</p>
                                    </Link>
                                )

                                }
                            </div>
                        ))}
                    </div>
                </div>


            </section>

            {/* Google Map */}
            <div className="h-[400px] rounded-lg overflow-hidden max-w-7xl mx-auto">
                <Map placeId={event.placeID || ''} />
            </div>
        </div>
    );
}
