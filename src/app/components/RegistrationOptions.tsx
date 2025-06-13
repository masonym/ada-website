import React from 'react';
import { REGISTRATION_TYPES } from '@/constants/registrations';
import { Event } from '@/types/events';
import { notFound } from 'next/navigation';
import RegistrationCard from './RegistrationCard';

export type RegistrationProps = {
    event: Event;
};

type AddOn = {
    title: string;
    price: string;
    description: string;
};

const RegistrationOptions = ({ event }: RegistrationProps) => {
    const currentEvent = REGISTRATION_TYPES.find((e) => e.id === event.id);

    if (!currentEvent) {
        notFound();
    }

    const earlyBirdDeadline = currentEvent.registrations.find(reg => reg.earlyBirdDeadline)?.earlyBirdDeadline || null;
    const isEarlyBird = earlyBirdDeadline && new Date() < new Date(earlyBirdDeadline);

    // Determine grid columns based on number of cards
    const getGridCols = (count: number) => {
        if (count === 1) return 'md:grid-cols-1';
        if (count === 2) return 'md:grid-cols-2';
        if (count === 3) return 'md:grid-cols-3';
        return 'md:grid-cols-4';
    };

    const gridCols = getGridCols(currentEvent.registrations.length);

    return (
        <div className="w-full px-4">
            <div className="flex flex-col items-center max-w-7xl mx-auto">
                <h1 className="text-3xl md:text-4xl lg:text-[48px] text-center font-gotham font-bold mb-8 text-slate-700">
                    Registration Options
                </h1>

                {/* Registration Cards Grid - Responsive and Centered */}
                <div className="w-full flex justify-center">
                    <div className={`grid grid-cols-1 ${gridCols} gap-6 justify-center`}
                        style={{ maxWidth: `${currentEvent.registrations.length * 320 + (currentEvent.registrations.length - 1) * 24}px` }}>
                        {currentEvent.registrations.map((item, index) => (
                            <div key={index} className="w-full max-w-[320px]">
                                <RegistrationCard item={item} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Add-Ons Section */}
                {currentEvent.addOns && currentEvent.addOns.length > 0 && (
                    <div className="w-full max-w-4xl mt-8">
                        <div className="bg-white shadow-md rounded-lg overflow-hidden">
                            {currentEvent.addOns.map((addOn: AddOn, index: number) => (
                                <div key={index} className="p-6 border-b border-gray-200 last:border-b-0">
                                    <div className="flex flex-col justify-between text-center items-center gap-2">
                                        <h3 className="text-xl font-semibold">{addOn.title}</h3>
                                        <p className="text-gray-600">{addOn.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default RegistrationOptions;
