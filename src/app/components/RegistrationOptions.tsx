import React from 'react';
import { REGISTRATION_TYPES } from '@/constants/registrations';
import { EventProps } from './Speakers';
import { notFound } from 'next/navigation';
import RegistrationCard from './RegistrationCard';
import Link from 'next/link';
import { Award, ChevronRight, Mail } from 'lucide-react';
import SponsorProspectus from './SponsorProspectus';

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

    const earlyBirdDeadline = currentEvent.registrations.find(reg => reg.earlyBirdDeadline)?.earlyBirdDeadline || null;
    const isEarlyBird = earlyBirdDeadline && new Date() < new Date(earlyBirdDeadline);

    const getContainerStyles = (itemCount: number) => {
        // Card width is 320px (w-80) and gap is 24px (gap-6)
        const cardWidth = 320;
        const gapWidth = 24;

        switch (itemCount) {
            case 1:
                return {
                    width: `${cardWidth}px`,
                    gridTemplateColumns: '1fr'
                };
            case 2:
                return {
                    width: `${(cardWidth * 2) + gapWidth}px`,
                    gridTemplateColumns: 'repeat(2, 1fr)'
                };
            case 3:
                return {
                    width: `${(cardWidth * 3) + (gapWidth * 2)}px`,
                    gridTemplateColumns: 'repeat(3, 1fr)'
                };
            case 4:
                return {
                    width: `${(cardWidth * 4) + (gapWidth * 3)}px`,
                    gridTemplateColumns: 'repeat(4, 1fr)'
                };
            default:
                return {
                    width: `${(cardWidth * 4) + (gapWidth * 3)}px`,
                    gridTemplateColumns: 'repeat(4, 1fr)'
                };
        }
    };

    const containerStyles = getContainerStyles(currentEvent.registrations.length);

    return (
        <div className="w-full py-8 px-4">
            <div className="flex flex-col items-center">
                <h1 className="text-[48px] text-center font-gotham font-bold mb-8 text-slate-700">
                    Registration Options
                </h1>
                
                {/* Registration Cards Grid */}
                <div className="flex justify-center w-full">
                    <div 
                        className="grid gap-6" 
                        style={containerStyles}
                    >
                        {currentEvent.registrations.map((item, index) => (
                            <div key={index} className="w-80">
                                <RegistrationCard item={item} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Add-Ons Section */}
                {currentEvent.addOns && currentEvent.addOns.length > 0 && (
                    <div className="w-full max-w-4xl mt-8 text-center">
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

                {/* Sponsorship Section */}
                <div className="pt-12 items-center flex flex-col">
                    <div className="flex flex-wrap items-center justify-center mb-4 gap-3">
                        <Award className="w-8 h-8 text-gold-500 shrink-0" />
                        <h3 className="text-4xl font-bold text-navy-800 text-center">
                            Become a Sponsor
                        </h3>
                    </div>

                    <div className="bg-gradient-to-r from-navy-500 to-navy-800 text-white p-6 rounded-lg mb-6 max-w-4xl">
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

                    <SponsorProspectus event={event}/>

                    <div className="text-center">
                        <div className="flex items-center justify-center text-gray-600 mb-2">
                            <Mail className="w-5 h-5 mr-2" />
                            <p className="font-medium">{event.contactInfo?.contactText || 'Contact our Sponsorship Team'} </p>
                        </div>
                        <a
                            href={`mailto:${event.contactInfo?.contactEmail || 'marketing@americandefensealliance.org'}`}
                            className="text-blue-600 hover:text-blue-800 transition-colors duration-300 font-medium break-words"
                        >
                            {event.contactInfo?.contactEmail || 'marketing@americandefensealliance.org'}
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegistrationOptions;