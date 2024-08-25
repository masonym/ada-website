import { SPEAKERS } from '@/constants/speakers';
import React, { useState, useRef } from 'react';
import Image from 'next/image';

type SpeakerProps = {
    event: EventProps;
    isAuthenticated: boolean;
    onRequestPassword: () => void;
};

type EventProps = {
    id: number;
    title: string;
    description: string;
    image: string;
    slug: string;
    registerLink: string;
    password: string;
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
        if (isAuthenticated) {
            window.open(presentation, '_blank');
        } else {
            onRequestPassword();
        }
    };

    return (
        <div className="max-container flex flex-col items-center">
            <Image
                src={event.image}
                width={1000}
                height={400}
                alt={`Event image for ${event.title}`}
                className="mb-6"
            />
            <h3 className="text-[48px] font-gotham font-bold mb-4 text-slate-700 text-center">Speaker Spotlight</h3>
            <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {currentEvent &&
                    currentEvent.speakers.map((speaker, index) => (
                        <div key={index} className="flex flex-col items-center text-center">
                            <Image
                                src={speaker.image}
                                width={256}
                                height={256}
                                alt={`${speaker.name}`}
                                className="rounded-lg"
                            />
                            <p className="mt-4 font-semibold whitespace-nowrap">{speaker.name}</p>
                            <p className="text-sm text-gray-600 whitespace-nowrap">{speaker.position}</p>
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
                            {/* Optional Bio Section */}
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
                                        ref={(el) => (bioRefs.current[index] = el)}
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