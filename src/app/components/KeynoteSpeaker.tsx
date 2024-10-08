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
    <section className="bg-navy-500 text-white mb-8 py-8 px-4 rounded-xl shadow-2xl">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-8 sm:mb-12 text-lightBlue-400">Keynote Speaker</h2>
        <div className="flex flex-col items-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-lightBlue-400 to-blue-600 rounded-full opacity-75 blur-md"></div>
            <Image
              src={keynoteSpeaker.image}
              alt={keynoteSpeaker.name}
              width={300}
              height={300}
              className="rounded-full relative z-10 border-4 border-white shadow-lg"
            />
          </div>
          <div className="text-center max-w-2xl">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-white-400">{keynoteSpeaker.name}</h3>
            <p className="text-xl sm:text-2xl mb-2 text-red-400">{keynoteSpeaker.position}</p>
            <p className="text-lg sm:text-xl mb-6 text-blue-300">{keynoteSpeaker.company}</p>
          </div>
        </div>
        <div 
          className="text-base text-center sm:text-lg leading-relaxed max-w-3xl mx-auto mt-8"
          dangerouslySetInnerHTML={{ __html: keynoteSpeaker.bio.substring(0, 800) }} 
        />
      </div>
    </section>
  );
};

export default KeynoteSpeaker;