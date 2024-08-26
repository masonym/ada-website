"use client";

import { EVENTS } from '@/constants/events';
import Image from 'next/image';
import { notFound, useParams } from 'next/navigation';
import React from 'react';
import Map from './Map';

const Page = () => {
    const params = useParams();
    const event = EVENTS.find(event => event.slug === params?.slug);

    if (!event) {
        notFound()
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-700 text-center mb-8">
                Event Venue & Location
            </h2>
            <div className="space-y-6">
                <p className="text-center">(placeholder) stuff goes here</p>
            </div>
            <div className="mt-12">
                <Image 
                    src={event.locationImage} 
                    className="rounded-lg mb-4" 
                    alt="Location Map" 
                    width={1000} 
                    height={400} 
                />
            </div>
            <div className="mt-12 " style={{ width: "100%", height: "400px" }}>
                {/* Pass the address instead of latitude/longitude */}
                <Map address={event.locationAddress} />
            </div>
        </div>
    );
};

export default Page;