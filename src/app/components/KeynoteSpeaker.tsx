import React from 'react';
import Image from 'next/image';
import { SPEAKERS } from '@/constants/speakers';

type KeynoteSpeakerProps = {
  eventId: number;
};

const KeynoteSpeaker: React.FC<KeynoteSpeakerProps> = ({ eventId }) => {
  const eventSpeakers = SPEAKERS.find(event => event.id === eventId)?.speakers;
  const keynoteSpeaker = eventSpeakers?.find(speaker => speaker.keynote);

  if (!keynoteSpeaker) {
    return null;
  }

  return (
    <section className="bg-navy-500 text-white mb-8 pt-12 pb-8 sm:pt-16 lg:pt-20 px-4 rounded-xl shadow-2xl">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-8 sm:mb-12 text-lightBlue-400">Keynote Speaker</h2>
        <div className="flex flex-col items-center md:flex-row md:items-start">
          <div className="mb-8 md:mb-0 md:mr-12 flex-shrink-0">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-lightBlue-400 to-blue-600 rounded-full opacity-75 blur-md"></div>
              <Image
                src={keynoteSpeaker.image}
                alt={keynoteSpeaker.name}
                width={250}
                height={250}
                className="rounded-full relative z-10 border-4 border-white shadow-lg"
              />
            </div>
          </div>
          <div className="text-center md:text-left flex-grow">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-lightBlue-400">{keynoteSpeaker.name}</h3>
            <p className="text-xl sm:text-2xl mb-2 text-blue-300">{keynoteSpeaker.position}</p>
            <p className="text-lg sm:text-xl mb-6 text-blue-200">{keynoteSpeaker.company}</p>
            <div 
              className="text-base sm:text-lg leading-relaxed max-w-none"
              dangerouslySetInnerHTML={{ __html: keynoteSpeaker.bio }} 
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default KeynoteSpeaker;