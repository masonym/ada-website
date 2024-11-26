import { EVENTS } from '@/constants/events';
import { getCdnPath } from '@/utils/image';
import Image from 'next/image';
import { notFound, useParams } from 'next/navigation';
import React from 'react';

const RecapImage = () => {
    const params = useParams();
    const event = EVENTS.find(event => event.slug === params?.slug);

    if (!event) {
        notFound();
    }

    const mainImage = event.images?.find(img => img.id === "main");

    if (!mainImage) {
        return <div>No main image available</div>;
    }

    return (
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center">
                <div className="w-full mb-6">
                    <Image
                        src={getCdnPath(mainImage.src)}
                        width={2000}
                        height={800}
                        layout="responsive"
                        alt={mainImage.alt || `Event image for ${event.title}`}
                        className="rounded-lg"
                    />
                </div>
            </div>
        </div>
    );
}

export default RecapImage;