"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Event } from '@/types/events';
import ModalVideo from 'react-modal-video';
import 'react-modal-video/css/modal-video.css';
import { getCdnPath } from '@/utils/image';
import { SPEAKERS, Speaker as SpeakerData } from '@/constants/speakers';

type Speaker = {
  name?: string; // Optional when using speakerId
  title?: string;
  sponsor?: string;
  sponsorStyle?: string;
  affiliation?: string;
  photo?: string;
  presentation?: string;
  videoId?: string;      // YouTube video ID only
  videoStartTime?: number; // Optional start time in seconds
  // New field for speaker ID reference
  speakerId?: string;
};

// Helper function to resolve speaker data
const resolveSpeaker = (speaker: Speaker): Speaker => {
  if (speaker.speakerId && SPEAKERS[speaker.speakerId]) {
    const speakerData = SPEAKERS[speaker.speakerId];
    return {
      // Start with schedule-specific data
      ...speaker,
      // Override with resolved speaker data
      name: speakerData.name,
      title: speakerData.position,
      affiliation: speakerData.company,
      photo: speakerData.image,
    };
  }
  // Return original speaker data if no speakerId or speaker not found
  return speaker;
};

type ScheduleItem = {
  time: string;
  title: string;
  location?: string;
  duration?: string;
  speakers?: Speaker[];
  description?: string;
  sponsorLogo?: string;
};

type ScheduleAtAGlanceProps = {
  schedule: {
    date: string;
    items: ScheduleItem[];
  }[];
  isAuthenticated: boolean;
  onRequestPassword: () => void;
  event: Event;
};

const ScheduleAtAGlance: React.FC<ScheduleAtAGlanceProps> = ({
  schedule,
  isAuthenticated,
  onRequestPassword,
  event
}) => {
  const [selectedDay, setSelectedDay] = useState(0);
  const [isVideoOpen, setVideoOpen] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [currentStartTime, setCurrentStartTime] = useState<number | undefined>(undefined);
  const [isSpeakerModalOpen, setSpeakerModalOpen] = useState(false);
  const [selectedSpeaker, setSelectedSpeaker] = useState<SpeakerData | null>(null);

  const handleMediaClick = (
    type: 'video' | 'presentation',
    url?: string,
    videoId?: string,
    startTime?: number
  ) => {
    if (!isAuthenticated) {
      onRequestPassword();
      return;
    }

    if (type === 'video' && videoId) {
      setCurrentVideoId(videoId);
      setCurrentStartTime(startTime);
      setVideoOpen(true);
    } else if (type === 'presentation' && url) {
      window.open(url, '_blank');
    }
  };

  const handleSpeakerClick = (speaker: Speaker) => {
    const resolvedSpeaker = resolveSpeaker(speaker);
    // Only open modal if we have speaker data with bio
    if (resolvedSpeaker.speakerId && SPEAKERS[resolvedSpeaker.speakerId]) {
      setSelectedSpeaker(SPEAKERS[resolvedSpeaker.speakerId]);
      setSpeakerModalOpen(true);
    }
  };

  const closeSpeakerModal = () => {
    setSpeakerModalOpen(false);
    setSelectedSpeaker(null);
  };

  // if day 0 has only 1 item, select day 1
  // also manage local storage to remember the selected day
  useEffect(() => {
    if (selectedDay == 0 && schedule[0].items.length < 3) {
      setSelectedDay(1);
    }
  }, []);

  const eventStartDate = event.timeStart;
  const isEventFuture = new Date(new Date(eventStartDate).getTime() - 3 * 24 * 60 * 60 * 1000) > new Date();
  const isEventPassed = new Date(eventStartDate) < new Date();

  return (
    <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 pb-8">
      <ModalVideo
        channel="youtube"
        youtube={{ mute: 0, autoplay: 1, start: currentVideoId && currentStartTime ? currentStartTime : 0 } as any}
        isOpen={isVideoOpen}
        videoId={currentVideoId || ''}
        onClose={() => setVideoOpen(false)}
      />

      <h1 className="text-[48px] font-gotham font-bold mb-4 text-slate-700 text-center">Event Agenda</h1>
      {isEventFuture && (
        <p className="text-l font-bold text-center mb-8 text-slate-600">
          The Event Agenda is still pending, please check back later for more information! We appreciate your patience as updates are made!
        </p>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="flex border-b">
          {schedule.map((day, index) => (
            <button
              key={index}
              className={`flex-1 text-center py-4 px-4 font-semibold ${selectedDay === index
                ? 'bg-navy-800 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-300'
                }`}
              onClick={() => setSelectedDay(index)}
            >
              {day.date}
            </button>
          ))}
        </div>

        <div className="p-6">
          {schedule[selectedDay].items.map((item, itemIndex, array) => (
            <div
              key={itemIndex}
              className={`flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center min-h-[120px] ${itemIndex !== array.length - 1 ? 'mb-8 pb-8 border-b border-gray-200' : ''
                }`}
            >
              <div className="flex-grow pr-2">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-bold text-xl text-navy-800">{item.time}</div>
                    <div className="text-xl font-semibold">{item.title}</div>
                  </div>
                </div>

                {item.location && (
                  <div className="text-sm text-gray-600 mb-1">
                    <span className="font-semibold">Location:</span> {item.location}
                  </div>
                )}

                {item.duration && (
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-semibold">Duration:</span> {item.duration}
                  </div>
                )}

                {item.speakers && item.speakers.length > 0 && (
                  <div className="space-y-4 mt-3">
                    {item.speakers.map((speaker, speakerIndex) => {
                      const resolvedSpeaker = resolveSpeaker(speaker);
                      return (
                        <div key={speakerIndex} className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          <div 
                            className="flex items-center flex-grow cursor-pointer hover:bg-gray-200 rounded-lg p-2 -m-2 transition-colors duration-200"
                            onClick={() => handleSpeakerClick(speaker)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleSpeakerClick(speaker);
                              }
                            }}
                          >
                            {resolvedSpeaker.photo && (
                              <Image
                                src={getCdnPath(`speakers/${resolvedSpeaker.photo}`)}
                                alt={resolvedSpeaker.name || 'Speaker'}
                                width={48}
                                height={48}
                                className="rounded-full mr-4"
                              />
                            )}
                            <div>
                              <div className="font-semibold text-lg md:block flex flex-col">
                                {resolvedSpeaker.name} 
                                <span className={`w-fit rounded-lg md:mx-1 text-sm px-2 py-1 ${resolvedSpeaker.sponsorStyle}`}>
                                  {resolvedSpeaker.sponsor}
                                </span>
                              </div>
                              {resolvedSpeaker.title && <div className="text-sm text-gray-600" dangerouslySetInnerHTML={{ __html: resolvedSpeaker.title }}></div>}
                              {resolvedSpeaker.affiliation && <div className="text-sm text-gray-600">{resolvedSpeaker.affiliation}</div>}
                              {resolvedSpeaker.speakerId && SPEAKERS[resolvedSpeaker.speakerId]?.bio && (
                                <div className="text-xs text-blue-600 mt-1">Click to view bio</div>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            {resolvedSpeaker.presentation && isEventPassed && (
                              <button
                                onClick={() => handleMediaClick('presentation',
                                  getCdnPath(`/events/${event.eventShorthand}/presentations/${resolvedSpeaker.presentation}`))}
                                className={`text-white px-4 py-2 rounded-md transition-all text-nowrap ${isAuthenticated ? 'bg-lightBlue-400 hover:bg-blue-500' : 'bg-gray-400'
                                  }`}
                              >
                                Presentation Slides
                              </button>
                            )}
                            {resolvedSpeaker.videoId && (
                              <button
                                onClick={() => handleMediaClick('video', undefined, resolvedSpeaker.videoId, resolvedSpeaker.videoStartTime)}
                                className={`text-white px-4 py-2 rounded-md transition-all text-nowrap ${isAuthenticated ? 'bg-lightBlue-400 hover:bg-blue-500' : 'bg-gray-400'
                                  }`}
                              >
                                Watch Video
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {item.description && <div className="text-sm mt-2 text-gray-700">{item.description}</div>}
              </div>

              {item.sponsorLogo && (
                <div className="flex-shrink-0 w-48 h-full flex items-center justify-center">
                  <div className="relative w-full h-24">
                    <Image
                      src={getCdnPath(item.sponsorLogo)}
                      alt="Sponsor Logo"
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Speaker Bio Modal */}
      {isSpeakerModalOpen && selectedSpeaker && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeSpeakerModal}
        >
          <div 
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-navy-800">Speaker Bio</h2>
              <button
                onClick={closeSpeakerModal}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Speaker Photo */}
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

                {/* Speaker Info */}
                <div className="flex-grow">
                  <h3 className="text-3xl font-bold text-navy-800 mb-2">{selectedSpeaker.name}</h3>
                  <div className="text-lg text-gray-700 mb-2" dangerouslySetInnerHTML={{ __html: selectedSpeaker.position }}></div>
                  <div className="text-lg text-gray-600 mb-4">{selectedSpeaker.company}</div>
                  
                  {selectedSpeaker.bio && (
                    <div className="prose prose-lg max-w-none">
                      <div 
                        className="text-gray-700 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: selectedSpeaker.bio }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleAtAGlance;
