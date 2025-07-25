import React from 'react';
import { REGISTRATION_TYPES } from '@/constants/registrations';
import { Event } from '@/types/events';
import { notFound } from 'next/navigation';
import RegistrationCard from './RegistrationCard';
import Link from 'next/link';
import { Award, ChevronRight, Mail } from 'lucide-react';
import SponsorProspectus from './SponsorProspectus';
import ExhibitInstructionsButton from './ExhibitInstructionsButton';
import { RegistrationType } from '@/types/event-registration/registration';
import { getRegistrationsForEvent, getExhibitorsForEvent, AdapterModalRegistrationType } from '@/lib/registration-adapters';

export type RegistrationProps = {
    event: Event;

};

type AddOn = {
    title: string;
    price: string;
    description: string;
};

const RegistrationOptions = ({ event }: RegistrationProps) => {
    const currentEvent = REGISTRATION_TYPES.find((e) => e.id.toString() === event.id.toString());

    if (!currentEvent) {
        notFound();
    }

    // Use the adapter functions to get properly typed registration and exhibitor data
    const registrationCards: AdapterModalRegistrationType[] = getRegistrationsForEvent(event.id)
        .filter(reg => !reg.requiresCode); // Hide code-validated add-ons from main registration page
    const exhibitorCards: AdapterModalRegistrationType[] = getExhibitorsForEvent(event.id).filter((e) => e.shownOnRegistrationPage);

    // Combine registration and exhibitor cards
    const allCards = [...registrationCards, ...exhibitorCards];

    // Find any registration with an early bird deadline
    const registrationWithDeadline = allCards.find(reg => reg.earlyBirdDeadline);
    const earlyBirdDeadline = registrationWithDeadline?.earlyBirdDeadline || null;
    const isEarlyBird = earlyBirdDeadline ? new Date() < new Date(earlyBirdDeadline) : false;

    // Determine grid columns based on number of cards
    const getGridCols = (count: number) => {
        if (count === 1) return 'sm:grid-cols-1 md:grid-cols-1';
        if (count === 2) return 'sm:grid-cols-1 md:grid-cols-2';
        if (count === 3) return 'sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
        return 'sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4';
    };

    const gridCols = getGridCols(allCards.length);

    return (
        <div className="w-full px-4">
            <div className="flex flex-col items-center max-w-7xl mx-auto">
                <h1 className="text-3xl md:text-4xl lg:text-[48px] text-center font-gotham font-bold mt-4 mb-8 text-slate-700">
                    Registration Options
                </h1>

                {/* Registration Cards Grid - Responsive and Centered */}
                <div className="w-full flex justify-center">
                    <div className={`grid grid-cols-1 ${gridCols} gap-6 justify-center`}
                        style={{ maxWidth: `${allCards.length * 320 + (allCards.length - 1) * 24}px` }}>
                        {allCards.map((item, index) => {
                            // Ensure type is always defined with a default value
                            const registrationItem = {
                                ...item,
                                type: item.type || 'paid' // Default to 'paid' if type is undefined
                            };
                            return <RegistrationCard key={index} item={registrationItem} event={event} />;
                        })}
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
