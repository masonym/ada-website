"use client";

import React from 'react';
import { EVENTS } from '@/constants/events';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { MapPin, Phone } from 'lucide-react';
import { LODGING_INFO } from '@/constants/lodging';
import { getCdnPath } from '@/utils/image';
import Map from '../venue/Map';
import Link from 'next/link';

export default function VenueAndLodgingPage({ params }: { params: { slug: string } }) {
    const event = EVENTS.find((e) => e.slug === params.slug);

    if (!event) {
        notFound();
    }

    const lodging = LODGING_INFO.find((l) => l.eventId === event.id);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Venue Section */}
            <section className="mb-16">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center font-gotham text-slate-700 mb-8">
                    Venue Information
                </h1>

                <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
                    <div className="relative h-[30rem]">
                        <Image
                            src={getCdnPath(event.locationImage)}
                            alt={event.title}
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div className="p-6">
                        <div className="flex items-start">
                            <MapPin className="w-5 h-5 mr-2 mt-1 flex-shrink-0 text-gray-400" />
                            <div className="text-gray-600" dangerouslySetInnerHTML={{ __html: event.locationAddress }} />
                        </div>
                    </div>
                </div>

                {/* Parking Section */}
                <div className="mb-12">
                    <h3 className="text-4xl font-bold mt-6 mb-6 text-slate-800 text-center">Parking</h3>
                    <div className="bg-white px-6 py-4 rounded-lg shadow-md flex flex-col gap-6">
                        {event.parkingInfo?.map((option, index) => (
                            <div key={index}>
                                <h4 className="text-[18px] leading-10 font-semibold mb-2">{option.title}</h4>
                                <p className="" dangerouslySetInnerHTML={{__html: option.description}}></p>
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

                {/* Google Map */}
                <div className="h-[400px] rounded-lg overflow-hidden">
                    <Map placeId={event.placeID || ''} />
                </div>
                
            </section>

            {/* Lodging Section */}
            {lodging && (
                <section>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center font-gotham text-slate-700 mb-8">
                        Recommended Lodging
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
                        {lodging.hotels.map((hotel, index) => (
                            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="relative h-[30rem]">
                                    <Image
                                        src={getCdnPath(hotel.image)}
                                        alt={hotel.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="p-6">
                                    <h3 className="text-2xl font-bold mb-4 text-navy-800">{hotel.name}</h3>
                                    <div className="space-y-2 text-gray-600">
                                        <div className="flex items-start">
                                            <MapPin className="w-5 h-5 mr-2 mt-1 flex-shrink-0 text-gray-400" />
                                            <div>
                                                <p>{hotel.address}</p>
                                                <p>{`${hotel.city}, ${hotel.state} ${hotel.zip}`}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <Phone className="w-5 h-5 mr-2 flex-shrink-0 text-gray-400" />
                                            <p>{hotel.phone}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {lodging?.note && (
                        <p className="mt-8 text-center text-gray-600">
                            {lodging.note}
                        </p>
                    )}
                </section>
            )}
        </div>
    );
}