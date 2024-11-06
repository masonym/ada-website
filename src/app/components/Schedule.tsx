"use client";

import React, { useState } from 'react';
import Image from 'next/image';

// Updated types with presentation and video at the ScheduleItem level
type Speaker = {
  name: string;
  title?: string;
  affiliation?: string;
  photo?: string;
};

type ScheduleItem = {
  time: string;
  title: string;
  location?: string;
  duration?: string;
  speakers?: Speaker[];
  description?: string;
  sponsorLogo?: string;
  presentation?: string;  // Moved to ScheduleItem level
  video?: string;        // Moved to ScheduleItem level
};

type ScheduleAtAGlanceProps = {
  schedule: {
    date: string;
    items: ScheduleItem[];
  }[];
  isAuthenticated: boolean;
  onRequestPassword: () => void;
};

const ScheduleAtAGlance: React.FC<ScheduleAtAGlanceProps> = ({
  schedule,
  isAuthenticated,
  onRequestPassword
}) => {
  const [selectedDay, setSelectedDay] = useState(0);

  const handleMediaClick = (link: string | undefined) => {
    if (isAuthenticated && link) {
      window.open(link, '_blank');
    } else if (!isAuthenticated) {
      onRequestPassword();
    }
  };

  return (
    <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 pb-8">
      <h1 className="text-[48px] font-gotham font-bold mb-4 text-slate-700 text-center">Event Agenda</h1>
      <p className="text-l font-bold text-center mb-8 text-slate-600">
        This event schedule is still pending, please check back later as more information is added!
      </p>
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
              className={`flex justify-between items-center min-h-[120px] ${itemIndex !== array.length - 1 ? 'mb-8 pb-8 border-b border-gray-200' : ''
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
                    {item.speakers.map((speaker, speakerIndex) => (
                      <div key={speakerIndex} className="flex items-center">
                        {speaker.photo && (
                          <Image
                            src={speaker.photo}
                            alt={speaker.name}
                            width={48}
                            height={48}
                            className="rounded-full mr-4"
                          />
                        )}
                        <div>
                          <div className="font-semibold text-lg">{speaker.name}</div>
                          {speaker.title && <div className="text-sm text-gray-600">{speaker.title}</div>}
                          {speaker.affiliation && <div className="text-sm text-gray-600">{speaker.affiliation}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {item.description && <div className="text-sm mt-2 text-gray-700">{item.description}</div>}
              </div>
              <div className="mx-2 flex gap-2 flex-col">
                {item.presentation && (
                  <button
                    onClick={() => handleMediaClick(item.presentation)}
                    className={`text-white px-4 py-2 rounded-md transition-all text-nowrap ${isAuthenticated ? 'bg-lightBlue-400 hover:bg-blue-500' : 'bg-gray-400'
                      }`}
                  >
                    Presentation Slides
                  </button>
                )}
                {item.video && (
                  <button
                    onClick={() => handleMediaClick(item.video)}
                    className={`text-white px-4 py-2 rounded-md transition-all text-nowrap ${isAuthenticated ? 'bg-lightBlue-400 hover:bg-blue-500' : 'bg-gray-400'
                      }`}
                  >
                    Watch Video
                  </button>
                )}
              </div>
              {item.sponsorLogo && (
                <div className="flex-shrink-0 w-48 h-full flex items-center justify-center">
                  <div className="relative w-full h-24">
                    <Image
                      src={item.sponsorLogo}
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
    </div>
  );
};

export default ScheduleAtAGlance;