import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { SPEAKERS } from '@/constants/speakers';
import { ChevronDown, ChevronUp } from 'lucide-react';

type KeynoteSpeakerProps = {
  eventId: number;
};

const KeynoteSpeaker: React.FC<KeynoteSpeakerProps> = ({ eventId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [height, setHeight] = useState<number | undefined>(undefined);
  const bioRef = useRef<HTMLDivElement>(null);
  const eventSpeakers = SPEAKERS.find(event => event.id === eventId)?.speakers;
  const keynoteSpeaker = eventSpeakers?.find(speaker => speaker.keynote);

  useEffect(() => {
    if (isExpanded) {
      setHeight(bioRef.current?.scrollHeight);
    } else {
      setHeight(200); // Adjust this value to match the height of the collapsed bio
    }
  }, [isExpanded]);

  if (!keynoteSpeaker) {
    return null;
  }

  const toggleBio = () => {
    setIsExpanded(!isExpanded);
  };

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
          ref={bioRef}
          className="text-base text-center sm:text-lg leading-relaxed max-w-4xl mx-auto overflow-hidden transition-all duration-500 ease-in-out"
          style={{ height: height }}
        >
          <div dangerouslySetInnerHTML={{ __html: keynoteSpeaker.bio }} />
        </div>
        <div className="text-center mt-4">
          <button 
            onClick={toggleBio}
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isExpanded ? (
              <>
                Read Less <ChevronUp className="ml-2 h-5 w-5" />
              </>
            ) : (
              <>
                Click to read bio <ChevronDown className="ml-2 h-5 w-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
};

export default KeynoteSpeaker;