import React from 'react';
import { REGISTRATION_TYPES } from '@/constants/registrations';
import { EventProps } from './Speakers';
import { notFound } from 'next/navigation';
import RegistrationCard from './RegistrationCard';

export type RegistrationProps = {
    event: EventProps;
};

const RegistrationOptions = ({ event }: RegistrationProps) => {
    const currentEvent = REGISTRATION_TYPES.find((e) => e.id === event.id);

    if (!currentEvent) {
        notFound();
    }

    const paidRegistrations = currentEvent.registrations.filter(reg => reg.type === 'paid');
    const complimentaryRegistrations = currentEvent.registrations.filter(reg => reg.type === 'complimentary');

    const isEarlyBird = paidRegistrations.length > 0 && new Date() < new Date(paidRegistrations[0].earlyBirdDeadline!);
    const deadlineDate = paidRegistrations.length > 0 ? new Date(paidRegistrations[0].earlyBirdDeadline!).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) : null;

    return (
        <div className="max-w-7xl mx-auto pt-0 pb-8 px-4 flex flex-col items-center">
            <div className="flex flex-col items-center">
                <h1 className="text-[48px] text-center font-gotham font-bold mb-2 text-slate-700">
                    Registration Options
                </h1>
                <p className="text-[20px] font-gotham text-slate-600 w-full max-w-2xl mx-auto mb-6 text-center">
                    Join us for a premiere opportunity to network with key leaders.
                </p>
                {isEarlyBird && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6" role="alert">
                        <strong className="font-bold">Early-bird pricing available!</strong>
                        <span className="block sm:inline"> Register before {deadlineDate} to save.</span>
                    </div>
                )}
                <div className="flex flex-col gap-8 md:flex-row mb-12">
                    {currentEvent.registrations.map((item, index) => (
                        <RegistrationCard key={index} item={item} />
                    ))}
                </div>
                
                {/* {complimentaryRegistrations.length > 0 && (
                    <div className="w-full max-w-2xl mb-12">
                        <h2 className="text-3xl font-bold text-center mb-6">Complimentary Registrations</h2>
                        <p className="text-center text-gray-600 mb-4">
                            The following registration options are complimentary but have limited availability. 
                            Please check eligibility and availability before registering.
                        </p>
                        <div className="flex flex-col gap-8 md:flex-row">
                            {complimentaryRegistrations.map((item, index) => (
                                <RegistrationCard key={index} item={item} />
                            ))}
                        </div>
                    </div>
                )} */}
                
                {currentEvent.addOns && currentEvent.addOns.length > 0 && (
                    <div className="w-full max-w-2xl">
                        <h2 className="text-3xl font-bold text-center mb-6">Add-Ons</h2>
                        <div className="bg-white shadow-md rounded-lg overflow-hidden">
                            {currentEvent.addOns.map((addOn, index) => (
                                <div key={index} className="p-6 border-b border-gray-200 last:border-b-0">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-xl font-semibold">{addOn.title}</h3>
                                        <span className="text-lg font-bold">{addOn.price}</span>
                                    </div>
                                    <p className="text-gray-600">{addOn.description}</p>
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