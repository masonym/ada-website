import { SPEAKERS } from '@/constants/speakers';
import React, { useState, useRef } from 'react';
import Image from 'next/image';
import KeynoteSpeakerSpotlight from './KeynoteSpeakerSpotlight';

type SpeakerProps = {
    event: EventProps;
    isAuthenticated: boolean;
    onRequestPassword: () => void;
};

export type EventProps = {
    id: number;
    title: string;
    date: string;
    timeStart: string;
    description: string;
    eventText: React.ReactNode;
    image: string;
    slug: string;
    registerLink: string;
    password: string;
    contactInfo?: {
        contactEmail?: string;
        contactText?: string;
    };
    sponsorshipInfo?: {
        exhibitorSpacesText?: React.ReactNode;
        customContactText?: React.ReactNode;
        sponsorSection?: React.ReactNode;
    };
    sponsorProspectusPath?: string;
};

type Speaker = {
    image: string;
    name: string;
    position: string;
    company: string;
    bio?: string;
    presentation?: string;
    keynote?: boolean;
};

const Speakers = ({ event, isAuthenticated, onRequestPassword }: SpeakerProps) => {
    const currentEvent = SPEAKERS.find((e) => e.id === event.id);
    const [expandedBios, setExpandedBios] = useState<boolean[]>([]);
    const bioRefs = useRef<Array<HTMLDivElement | null>>([]);

    const toggleBio = (index: number) => {
        setExpandedBios((prevExpandedBios) => {
            const newExpandedBios = [...prevExpandedBios];
            newExpandedBios[index] = !newExpandedBios[index];
            return newExpandedBios;
        });
    };

    const handlePresentationClick = (presentation: string | undefined) => {
        if (isAuthenticated && presentation) {
            window.open(presentation, '_blank');
        } else if (!isAuthenticated) {
            onRequestPassword();
        }
    };

    const getLastName = (name: string) => {
        const cleanedName = name.replace(/\s*\(.*\)$/, '');
        const nameParts = cleanedName.split(' ');
        return nameParts[nameParts.length - 1];
    };

    const nonKeynoteSpeakers = currentEvent ? currentEvent.speakers.filter(speaker => !speaker.keynote) : [];

    return (
        <div className="max-container flex flex-col items-center">
            <KeynoteSpeakerSpotlight eventId={event.id} />
            <h1 className="text-[48px] font-gotham font-bold mb-4 text-slate-700 text-center">Speaker Spotlight</h1>
            <p className="text-l font-bold text-center mb-8 text-slate-600">More speaker information will be added as we get closer to the event date, please check back later for updates.</p>
            <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mx-4">
                {nonKeynoteSpeakers
                    .sort((a: Speaker, b: Speaker) => getLastName(a.name).localeCompare(getLastName(b.name)))
                    .map((speaker: Speaker, index: number) => (
                        <div key={index} className="flex flex-col items-center text-center">
                            <Image
                                src={speaker.image}
                                width={256}
                                height={256}
                                alt={`${speaker.name}`}
                                className="rounded-lg"
                            />
                            <p className="mt-4 font-semibold whitespace-nowrap text-wrap">{speaker.name}</p>
                            <p className="text-sm text-gray-600">{speaker.position}</p>
                            <p className="text-sm text-gray-600 whitespace-nowrap">{speaker.company}</p>
                            {speaker.presentation && (
                                <button
                                    onClick={() => handlePresentationClick(speaker.presentation)}
                                    className={`mt-2 text-white p-2 rounded-md transition-all ${isAuthenticated ? 'bg-lightBlue-400 hover:bg-blue-500' : 'bg-gray-400'
                                        }`}
                                >
                                    Presentation
                                </button>
                            )}
                            {speaker.bio && (
                                <>
                                    <button
                                        onClick={() => toggleBio(index)}
                                        className="text-blue-600 mt-2 flex items-center"
                                    >
                                        Click to read bio
                                        <svg
                                            className={`w-4 h-4 ml-2 transform transition-transform ${expandedBios[index] ? '-rotate-90' : 'rotate-0'
                                                }`}
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    <div
                                        ref={(el) => {
                                            bioRefs.current[index] = el;
                                        }}
                                        style={{
                                            height: expandedBios[index] ? `${bioRefs.current[index]?.scrollHeight}px` : '0px',
                                        }}
                                        className={`overflow-hidden transition-all duration-500 ease-in-out`}
                                    >
                                        <div className="text-sm text-gray-600 mt-2 text-center">
                                            <p dangerouslySetInnerHTML={{ __html: speaker.bio }}></p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default Speakers;