"use client";

import React from 'react';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';

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
};

type RegistrationProp = {
    item: RegistrationTypes;
};

const RegistrationCard = ({ item }: RegistrationProp) => {
    const params = useParams()
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

    return (
        <div className="w-full mx-auto overflow-hidden rounded-lg bg-white shadow-md flex flex-col">
            <div className="h-40 relative">
                <Image
                    src={item.headerImage}
                    alt={item.title}
                    layout="fill"
                    objectFit="cover"
                    unoptimized={true}
                />
                {/* <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <h4 className="text-2xl font-bold text-white text-center">{item.title}</h4>
                </div> */}
            </div>
            <div className="p-6 flex-grow flex flex-col justify-between">
                <div>
                    <p className="text-sm text-gray-600 mb-4">{item.subtitle}</p>
                    <ul className="space-y-2 mb-6">
                        {item.perks.map((perk, index) => (
                            <li key={index} className="flex items-start">
                                <ChevronRight className="h-5 w-5 mr-2 text-blue-600 flex-shrink-0" />
                                <span className="text-sm">{perk}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="mt-4">
                    <p className="text-2xl font-bold text-center mb-2">{currentPrice}</p>
                    {isPaid && isEarlyBird && (
                        <p className="text-md font-semibold text-center text-green-600 mb-2">
                            Early-bird price! Increases to {item.regularPrice} after {deadlineDate}
                        </p>
                    )}
                    {isPaid && !isEarlyBird && (
                        <p className="text-sm text-center text-gray-600 mb-2">
                            {/* Regular price */}
                        </p>
                    )}
                    {isFree && (
                        <div className="text-center">
                            <p className="text-md font-semibold text-gray-600">Register with .gov or .mil email</p>
                        </div>
                    )}
                    {isSponsor && (
                        <div className="text-center">
                            <p className="text-md font-semibold text-gray-600">For more information and to secure your sponsorship, contact:</p>
                            <p className="text-md font-semibold text-blue-600 hover:underline text-nowrap mb-2"><a href="mailto:marketing@americandefensealliance.org">marketing@americandefensealliance.org</a></p>
                        </div>
                    )}
                    {item.availabilityInfo && (
                        <p className="text-md font-semibold text-center text-blue-600 mb-2">
                            {item.availabilityInfo}
                        </p>
                    )}

                    <Link
                        href={`${item.buttonLink}`}>
                        <button className="w-full py-2 px-4 bg-blue-800  text-white font-semibold rounded-md hover:bg-navy-200 transition duration-300">
                            {item.buttonText}
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RegistrationCard;