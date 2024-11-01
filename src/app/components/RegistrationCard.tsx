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
    receptionPrice?: string;
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
        <div className=" mx-auto overflow-hidden rounded-lg bg-white shadow-md flex flex-col">
            {/* Image container with aspect ratio box */}
            <div className="relative w-full pt-[50%]"> {/* 2:1 aspect ratio */}
                <div className="absolute inset-0">
                    <Image
                        src={item.headerImage}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority
                    />
                </div>
            </div>

            <div className="p-6 flex-grow flex flex-col justify-between">
                <div>
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
                <div className="mt-4">
                    {isPaid && isEarlyBird && (
                        <p className="text-md font-semibold text-center text-green-600 mb-2">
                            Early-bird price! 
                            {/* Increases to {item.regularPrice} after {deadlineDate} */}
                        </p>
                    )}
                    {item.receptionPrice && (
                        <p className="text-md font-semibold text-center break-words text-blue-600 mb-2">
                            {item.receptionPrice} with<wbr /> VIP Networking Reception
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
                            <p className="text-md font-semibold text-blue-600 hover:underline break-words mb-2">
                                <a href="mailto:marketing@americandefensealliance.org">
                                    marketing@<wbr />americandefensealliance.org
                                </a>
                            </p>
                        </div>
                    )}
                    {item.availabilityInfo && (
                        <p className="text-md font-semibold text-center text-blue-600 mb-2">
                            {item.availabilityInfo}
                        </p>
                    )}
                    <p className="text-2xl font-bold text-center mb-2">{currentPrice}</p>
                    <Link href={item.buttonLink} target="_blank">
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