"use client";

import React from 'react';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { EVENTS } from '@/constants/events';
import { EventProps } from './Speakers';

type RegistrationTypes = {
    title: string;
    headerImage: string;
    subtitle: string;
    perks: string[];
    buttonText: string;
    buttonLink: string;
    type: string;
    earlyBirdPrice?: string;
    regularPrice?: string;
    earlyBirdDeadline?: string;
    availabilityInfo?: string;
    receptionPrice?: string;
};

type RegistrationProp = {
    item: RegistrationTypes;
};

const RegistrationCard = ({ item }: RegistrationProp) => {
    const params = useParams()
    const event = EVENTS.find((event: EventProps) => event.slug === params?.slug);
    const isPaid = item.type === 'paid';
    const isSponsor = item.type === 'sponsor';
    const isFree = item.type === 'complimentary';
    const isEarlyBird = isPaid && new Date() < new Date(item.earlyBirdDeadline!);
    const currentPrice = isPaid
        ? (isEarlyBird ? item.earlyBirdPrice : item.regularPrice)
        : isFree
            ? 'Complimentary'
            : '';
    const deadlineDate = isPaid ? new Date(item.earlyBirdDeadline!).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) : null;

    const formatEmail = (email: string) => {
        return email.replace('@', '\u200B@');
    };

    return (
        <div className="flex flex-col bg-white rounded-lg shadow-md overflow-hidden max-w-sm mx-auto h-full">
            {/* Image container with responsive dimensions */}
            <div className="relative w-full h-32">
                <Image
                    src={item.headerImage}
                    alt={item.title}
                    fill
                    className="object-cover"
                    priority
                />
            </div>

            {/* Content container */}
            <div className="flex flex-col flex-grow p-6">
                {/* Scrollable content area */}
                <div className="flex-grow overflow-y-auto">
                    <p className="text-lg font-bold text-center text-slate-700 mb-4">{item.title}</p>
                    <p className="text-sm text-gray-600 mb-4">{item.subtitle}</p>
                    <ul className="space-y-2 mb-6">
                        {item.perks.map((perk, index) => (
                            <li key={index} className="flex items-start">
                                <ChevronRight className="h-5 w-5 mr-2 text-blue-600 flex-shrink-0" />
                                <span className="text-sm" dangerouslySetInnerHTML={{ __html: perk }}></span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Footer section */}
                <div className="mt-auto pt-4">
                    {isPaid && isEarlyBird && (
                        <p className="text-sm font-semibold text-center text-green-600 mb-2">
                            Early-bird price available!
                        </p>
                    )}
                    {item.receptionPrice && (
                        <p className="text-sm font-semibold text-center break-words text-blue-600 mb-2">
                            {item.receptionPrice} with<wbr /> VIP Networking Reception
                        </p>
                    )}
                    {isFree && (
                        <div className="text-center">
                            <p className="text-sm font-semibold text-gray-600">Register with .gov or .mil email</p>
                        </div>
                    )}

                    {isSponsor && (
                        <div className="text-center">
                            <p className="text-sm font-semibold text-gray-600">For more information and to secure your sponsorship, contact:</p>
                            <p className="text-sm font-semibold text-blue-600 hover:underline break-words mb-2">
                                <a href={`mailto:${event?.contactInfo?.contactEmail2 || 'marketing@americandefensealliance.org'}`}>
                                    {formatEmail(event?.contactInfo?.contactEmail2 || 'marketing@americandefensealliance.org')}
                                </a>
                            </p>
                        </div>
                    )}
                    {item.availabilityInfo && (
                        <p className="text-sm font-semibold text-center text-blue-600 mb-2">
                            {item.availabilityInfo}
                        </p>
                    )}
                    <p className="text-xl font-bold text-center mb-2">{currentPrice}</p>
                    <Link href={item.buttonLink} target="_blank" className="block w-full">
                        <button className="w-full py-2 px-4 bg-blue-800 text-white font-semibold rounded-md hover:bg-navy-200 transition duration-300">
                            {item.buttonText}
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RegistrationCard;