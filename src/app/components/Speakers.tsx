import { getSpeakersForEvent } from '@/constants/speakers';
import React, { useState, useRef } from 'react';
import Image from 'next/image';
import KeynoteSpeaker from './KeynoteSpeaker';
import { getCdnPath } from '@/utils/image';
import { Event } from '@/types/events';

type SpeakerProps = {
    event: Event;
    isAuthenticated: boolean;
    onRequestPassword: () => void;
};

const Speakers = ({ event, isAuthenticated, onRequestPassword }: SpeakerProps) => {
    const speakers = getSpeakersForEvent(event.id);
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
        // strip common suffixes like ranks and titles
        const removeTitles = (s: string) =>
            s
                .replace(/\([^)]*\)/g, '') // remove things in parens
                .replace(/\b(Vice\s+)?Admiral\b|USN|Ret\.?|Capt\.?|Major|Col\.?|Lt\.?|General|Commander|Rear\s+Admiral/gi, '')
                .replace(/^[^a-zA-Z]*|[^a-zA-Z]*$/g, '') // trim non-alpha edges
                .replace(/,\s*.*$/, '') // remove stuff after commas
                .trim();

        const cleanedName = removeTitles(name);
        const nameParts = cleanedName.split(/\s+/);

        if (nameParts.length === 0) return '';
        return nameParts[nameParts.length - 1];
    };


    const isEventFuture = event.timeStart
        ? new Date(new Date(event.timeStart).getTime() - 0.5 * 24 * 60 * 60 * 1000) > new Date()
        : false;

    return (
        <div className="max-container flex flex-col items-center">
            <KeynoteSpeaker eventId={event.id} eventShorthand={event.eventShorthand} />
            <h1 className="text-[48px] font-gotham font-bold mb-4 text-slate-700 text-center">Speaker Spotlight</h1>
            {/* TODO: Remove this stupid hack after March 2026 event */}
            {event.id === 5 && (
                <p className="text-l font-bold text-center mb-8 text-slate-600">We are in the process of reconfirming speakers for the new conference dates on March 4-5, 2026.</p>
            )}
            {isEventFuture && (
                <p className="text-l font-bold text-center mb-8 text-slate-600">More speaker information will be added as we get closer to the event date, please check back later for updates.</p>
            )}
            <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mx-4">
                {speakers
                    .sort((a, b) => getLastName(a.name).localeCompare(getLastName(b.name)))
                    .map((speaker, index) => (
                        <div key={speaker.id} className="flex flex-col items-center text-center">
                            <Image
                                src={getCdnPath(`speakers/${speaker.image}`)}
                                width={256}
                                height={256}
                                alt={`${speaker.name}`}
                                className="rounded-lg mb-4"
                            />
                            {speaker.label && <span className="text-sm font-semibold border bg-gray-700 rounded-full px-2 py-1 text-white ml-2">{speaker.label}</span>}
                            <p className="mt-0 font-semibold whitespace-nowrap text-wrap"><span dangerouslySetInnerHTML={{ __html: speaker.name }}></span></p>
                            <p className="text-sm text-gray-600">{speaker.position}</p>
                            <p className="text-sm text-gray-600">{speaker.company}</p>

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
