import { SPEAKERS } from '@/constants/speakers';
import Image from 'next/image';
import React from 'react';

type SpeakerProps = {
    id: number;
};

const Speakers = ({ id }: SpeakerProps) => {
    // Find the speakers object corresponding to the given id
    const event = SPEAKERS.find((event) => event.id === id);

    return (
        <div className="max-container my-12 flex flex-col items-center">
            <h3 className="text-[48px] font-gotham font-bold mb-4  text-slate-700">Speaker Presentations</h3>
            <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {event && event.speakers.map((speaker, index) => (
                    <div key={index} className="flex flex-col items-center text-center">
                        <Image
                            src={speaker.image}
                            width={128}
                            height={128}
                            alt={`Image of ${speaker.name}`}
                            className="rounded-lg"
                        />
                        <p className="mt-4 font-semibold whitespace-nowrap">{speaker.name}</p>
                        <p className="text-sm text-gray-600 whitespace-nowrap">{speaker.position}</p>
                        <p className="text-sm text-gray-600 whitespace-nowrap">{speaker.company}</p>
                        <a 
                            href={speaker.presentation} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="mt-2 text-white bg-lightBlue-400 p-2 rounded-md hover:bg-blue-500 transition-all"
                        >
                            Presentation
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Speakers;