import { SPEAKERS } from '@/constants/speakers';
import Image from 'next/image';
import React from 'react';

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

  const handlePresentationClick = (presentation: string | undefined) => {
    if (isAuthenticated) {
      window.open(presentation, '_blank');
    } else {
      onRequestPassword();
    }
  };

  return (
    <div className="max-container my-12 flex flex-col items-center">
      <h3 className="text-[48px] font-gotham font-bold mb-4 text-slate-700">Speaker Presentations</h3>
      <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {currentEvent &&
          currentEvent.speakers.map((speaker, index) => (
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
              <button
                onClick={() => handlePresentationClick(speaker.presentation)}
                className={`mt-2 text-white p-2 rounded-md transition-all ${
                  isAuthenticated ? 'bg-lightBlue-400 hover:bg-blue-500' : 'bg-gray-400'
                }`}
              >
                Presentation
              </button>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Speakers;
