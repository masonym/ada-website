"use client";

import { EVENTS } from '@/constants/events';
import Image from 'next/image';
import { notFound, useParams } from 'next/navigation';
import React from 'react';

const EventImage = () => {
    const params = useParams();
    const event = EVENTS.find(event => event.slug === params?.slug);

    if (!event) {
        notFound();
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center">
                <div className="w-full mb-6 relative aspect-[5/2]">
                    <Image
                        src={event.image}
                        alt={`Event image for ${event.title}`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="rounded-lg object-cover"
                        priority
                    />
                </div>
            </div>
        </div>
    );
}

export default EventImage;