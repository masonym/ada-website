"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { getSpeakersForEvent } from '@/constants/speakers';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { getCdnPath } from '@/utils/image';

type KeynoteSpeaker = {
  id: string;
  image: string;
  name: string;
  position: string;
  company: string;
  bio: string;
  keynote?: {
    isKeynote: boolean;
    headerText?: string;
  };
};

type KeynoteSpeakerProps = {
  eventId: number;
  eventShorthand: string;
  showExpandedBio?: boolean;
};

const KeynoteSpeaker: React.FC<KeynoteSpeakerProps> = ({ eventId, eventShorthand, showExpandedBio = true }) => {
  const [expandedStates, setExpandedStates] = useState<{ [key: string]: boolean }>({});
  const [heightStates, setHeightStates] = useState<{
    [key: string]: {
      collapsed: number;
      full: number;
    };
  }>({});

  const bioRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const collapsedRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const speakers = getSpeakersForEvent(eventId);
  const keynoteSpeakers = speakers.filter(speaker => speaker.keynote);

  useEffect(() => {
    if (!keynoteSpeakers) return;

    const newHeightStates: { [key: string]: { collapsed: number; full: number } } = {};

    keynoteSpeakers.forEach(speaker => {
      const bioRef = bioRefs.current[speaker.id];
      const collapsedRef = collapsedRefs.current[speaker.id];

      if (bioRef && collapsedRef) {
        newHeightStates[speaker.id] = {
          full: bioRef.scrollHeight,
          collapsed: collapsedRef.scrollHeight
        };
      }
    });

    setHeightStates(newHeightStates);
  }, [keynoteSpeakers?.length]);

  const toggleBio = (speakerId: string) => {
    setExpandedStates(prev => ({
      ...prev,
      [speakerId]: !prev[speakerId]
    }));
  };

  if (!keynoteSpeakers || keynoteSpeakers.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-6 px-4 sm:px-4 lg:px-6 mb-8">
      <div className="grid grid-flow-row sm:grid-flow-col gap-6 w-full max-w-6xl lg:max-w-full">
        {keynoteSpeakers.map((speaker, index) => (
          <section
            key={index}
            className="bg-navy-500 text-white rounded-xl shadow-2xl h-fit"
          >
            <div className="p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-lightBlue-400">
                {speaker.keynote?.headerText || "Keynote Speaker"}
              </h2>
              <div className="flex flex-col items-center">
                <div className="relative w-48 h-48 mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-lightBlue-400 to-blue-600 rounded-full opacity-75 blur-md"></div>
                  <Image
                    src={getCdnPath(`speakers/${speaker.image}`)}
                    alt={speaker.name}
                    fill
                    className="rounded-full relative z-10 border-4 border-white shadow-lg object-cover"
                  />
                </div>
                <div className="text-center">
                  <h3 className="text-xl sm:text-2xl font-bold mb-2 text-white">{speaker.name}</h3>
                  <p className="text-lg mb-2 text-red-400">{speaker.position}</p>
                  <p className="text-base mb-6 text-blue-300">{speaker.company}</p>
                </div>
              </div>
              <div className="relative">
                <div
                  ref={el => { bioRefs.current[speaker.id] = el; }}
                  className="text-base text-center leading-relaxed overflow-hidden transition-all duration-500 ease-in-out"
                  style={{
                    height: expandedStates[speaker.id]
                      ? heightStates[speaker.id]?.full || 'auto'
                      : heightStates[speaker.id]?.collapsed || 'auto'
                  }}
                >
                  <div dangerouslySetInnerHTML={{ __html: speaker.bio || '' }} />
                </div>
                <div
                  ref={el => { collapsedRefs.current[speaker.id] = el; }}
                  className="absolute top-0 left-0 right-0 text-base text-center leading-relaxed opacity-0 pointer-events-none"
                >
                  <div dangerouslySetInnerHTML={{ __html: speaker.bio?.split('<br/>')[0] || '' }} />
                </div>
              </div>
              {showExpandedBio && (
                <div className="text-center mt-4">
                  <button
                    onClick={() => toggleBio(speaker.id)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {expandedStates[speaker.id] ? (
                      <>
                        Hide bio <ChevronUp className="ml-2 h-5 w-5" />
                      </>
                    ) : (
                      <>
                        Click to read bio <ChevronDown className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default KeynoteSpeaker;
