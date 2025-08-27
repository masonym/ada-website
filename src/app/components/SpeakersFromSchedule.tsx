"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { SCHEDULES } from '@/constants/schedules';
import { EVENTS } from '@/constants/events';
import { SPEAKERS, Speaker as SpeakerData } from '@/constants/speakers';
import { slugify } from '@/utils/slugify';
import { getCdnPath } from '@/utils/image';

interface Props {
  eventId: number;
  title?: string;
  subtitle?: string;
  maxSpeakers?: number; // optional limit
}

// Minimal schedule speaker shape (duplicated from Schedule.tsx to avoid import cycles)
interface ScheduleSpeaker {
  name?: string;
  title?: string;
  sponsor?: string;
  sponsorStyle?: string;
  affiliation?: string;
  photo?: string;
  presentation?: string;
  videoId?: string;
  videoStartTime?: number;
  speakerId?: string;
}

const resolveSpeaker = (speaker: ScheduleSpeaker): ScheduleSpeaker => {
  if (speaker.speakerId && SPEAKERS[speaker.speakerId]) {
    const s = SPEAKERS[speaker.speakerId];
    return {
      ...speaker,
      name: s.name,
      title: s.position,
      affiliation: s.company,
      photo: s.image,
    };
  }
  return speaker;
};

const SpeakersFromSchedule: React.FC<Props> = ({ eventId, title, subtitle, maxSpeakers }) => {
  const scheduleEntry = SCHEDULES.find((s) => s.id === eventId);
  if (!scheduleEntry) return null;

  // Aggregate speakers with first-found session anchor
  const speakerMap = new Map<string, { speaker: ScheduleSpeaker; sessionAnchor?: string }>();

  for (const day of scheduleEntry.schedule) {
    for (const item of day.items) {
      // Type guard: only proceed if this schedule item actually has speakers
      if (!('speakers' in item) || !item.speakers) continue;
      const sessionAnchor = `session-${slugify(item.time)}-${slugify(item.title)}`;
      for (const sp of item.speakers as ScheduleSpeaker[]) {
        const resolved = resolveSpeaker(sp);
        const key = sp.speakerId || `${resolved.name || ''}-${resolved.title || ''}-${resolved.affiliation || ''}`;
        if (!key) continue;
        if (!speakerMap.has(key)) {
          speakerMap.set(key, { speaker: resolved, sessionAnchor });
        }
      }
    }
  }

  let speakers = Array.from(speakerMap.values());
  if (maxSpeakers && speakers.length > maxSpeakers) {
    speakers = speakers.slice(0, maxSpeakers);
  }

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSpeaker, setSelectedSpeaker] = useState<SpeakerData | null>(null);

  const openModal = (sp: ScheduleSpeaker) => {
    if (sp.speakerId && SPEAKERS[sp.speakerId]) {
      setSelectedSpeaker(SPEAKERS[sp.speakerId]);
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSpeaker(null);
  };

  if (speakers.length === 0) return null;

  return (
    <section className="pt-8 pb-16 px-4 bg-white">
      <div className="max-w-[90rem] mx-auto">
        <h3 className="text-xl font-bold text-center mb-0 text-navy-800">{title || 'Event Speakers'}</h3>
        {subtitle && <h4 className="text-lg text-center mb-8 text-slate-600">{subtitle}</h4>}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-8">
          {speakers.map(({ speaker, sessionAnchor }, idx) => (
            <div key={idx} className="bg-gray-50 rounded-lg shadow-sm p-4 flex flex-col items-center">
              {speaker.photo && (
                <Image
                  src={getCdnPath(`speakers/${speaker.photo}`)}
                  alt={speaker.name || 'Speaker'}
                  width={160}
                  height={160}
                  className="rounded-full mb-4 object-cover"
                />
              )}
              <div className="text-center">
                <div className="font-semibold text-lg">{speaker.name}</div>
                {speaker.title && (
                  <div className="text-sm text-gray-600" dangerouslySetInnerHTML={{ __html: speaker.title }} />
                )}
                {speaker.affiliation && (
                  <div className="text-sm text-gray-600">{speaker.affiliation}</div>
                )}
              </div>
              <div className="flex gap-2 mt-3">
                {speaker.speakerId && SPEAKERS[speaker.speakerId]?.bio && (
                  <button
                    onClick={() => openModal(speaker)}
                    className="text-white px-4 py-2 rounded-md bg-lightBlue-400 hover:bg-blue-500 transition-colors"
                  >
                    View Bio
                  </button>
                )}
                {sessionAnchor && (
                  (() => {
                    const event = EVENTS.find((e) => e.id === eventId);
                    const href = event ? `/events/${event.slug}/agenda#${sessionAnchor}` : `#${sessionAnchor}`;
                    return (
                      <a
                        className="text-white px-4 py-2 rounded-md bg-navy-700 hover:bg-navy-800 transition-colors"
                        href={href}
                      >
                        View Session
                      </a>
                    );
                  })()
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && selectedSpeaker && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-navy-800">Speaker Bio</h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <div className="w-48 h-48 mx-auto md:mx-0">
                    <Image
                      src={getCdnPath(`speakers/${selectedSpeaker.image}`)}
                      alt={selectedSpeaker.name}
                      width={192}
                      height={192}
                      className="rounded-lg object-cover w-full h-full"
                    />
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className="text-3xl font-bold text-navy-800 mb-2">{selectedSpeaker.name}</h3>
                  <div className="text-lg text-gray-700 mb-2" dangerouslySetInnerHTML={{ __html: selectedSpeaker.position }}></div>
                  <div className="text-lg text-gray-600 mb-4">{selectedSpeaker.company}</div>
                  {selectedSpeaker.bio && (
                    <div className="prose prose-lg max-w-none">
                      <div className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: selectedSpeaker.bio }}></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default SpeakersFromSchedule;
