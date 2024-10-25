import React from 'react';
import { REGISTRATION_TYPES } from '@/constants/registrations';
import { EventProps } from './Speakers';
import { notFound } from 'next/navigation';
import RegistrationCard from './RegistrationCard';
import Link from 'next/link';
import Button from './Button';
import { Award, ChevronRight, Mail } from 'lucide-react';

export type RegistrationProps = {
    event: EventProps;
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

    const earlyBirdDeadline = currentEvent.registrations.find(reg => reg.earlyBirdDeadline)?.earlyBirdDeadline || null; const isEarlyBird = earlyBirdDeadline && new Date() < new Date(earlyBirdDeadline);
    const deadlineDate = earlyBirdDeadline ? new Date(earlyBirdDeadline).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'EST'
    }) : null;

    const getGridClass = (itemCount: number) => {
        switch (itemCount) {
            case 1: return 'grid-cols-1';
            case 2: return 'sm:grid-cols-2';
            case 3: return 'sm:grid-cols-1 lg:grid-cols-3';
            default: return 'sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4';
        }
    };

    return (
        <div className="max-w-[90rem] mx-auto pt-0 pb-8 px-4 flex flex-col items-center">
            <div className="flex flex-col items-center w-full">
                <h1 className="text-[48px] text-center font-gotham font-bold mb-2 text-slate-700">
                    Registration Options
                </h1>
                {/* {isEarlyBird && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6 text-xl mx-4 text-center" role="alert">
                        <strong className="font-bold">Early-bird pricing available!</strong>
                        <span className="block sm:inline"> Register before {deadlineDate}.</span>
                    </div>
                )}
                */}
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

                <div className={`grid ${getGridClass(currentEvent.registrations.length)} gap-8 justify-center max-w-[85vw] xl:min-w-[1320px] md:min-w-[738px] lg:min-w-[1024px] sm:min-w-[640px] min-w-[320px]`}>
                    {currentEvent.registrations.map((item, index) => (
                        <RegistrationCard key={index} item={item} />
                    ))}
                </div>

                {currentEvent.addOns && currentEvent.addOns.length > 0 && (
                    <div className="w-full max-w-2xl mt-12">
                        <h2 className="text-3xl font-bold text-center mb-6">Add-Ons</h2>
                        <div className="bg-white shadow-md rounded-lg overflow-hidden">
                            {currentEvent.addOns.map((addOn: AddOn, index: number) => (
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

                <div className="mt-4 pt-8">
                    <div className="flex items-center justify-center mb-4">
                        <Award className="w-8 h-8 text-gold-500 mr-3" />
                        <h3 className="text-2xl font-bold text-navy-800">
                            Become a Sponsor
                        </h3>
                    </div>

                    <div className="bg-gradient-to-r from-navy-500 to-navy-800 text-white p-6 rounded-lg mb-6">
                        <p className="text-center mb-4">
                        Enhance your Visibility and Connect with Key Decision-Makers through our Exclusive Sponsorship Opportunities. This is your chance to elevate your brand and make a lasting impact in the Defense Sector.
                        </p>
                        <Link href={`/events/${event.slug}/sponsors-exhibitors/sponsorship-opportunities`}>
                            <button className="w-full py-3 px-6 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition duration-300 flex items-center justify-center">
                                View Sponsorship Packages
                                <ChevronRight className="ml-2 w-5 h-5" />
                            </button>
                        </Link>
                    </div>

                    <div className="text-center">
                        <div className="flex items-center justify-center text-gray-600 mb-2">
                            <Mail className="w-5 h-5 mr-2" />
                            <p className="font-medium">Contact our Sponsorship Team:</p>
                        </div>
                        <a
                            href="mailto:marketing@americandefensealliance.org"
                            className="text-blue-600 hover:text-blue-800 transition-colors duration-300 font-medium break-words"
                        >
                            marketing@americandefensealliance.org
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegistrationOptions;