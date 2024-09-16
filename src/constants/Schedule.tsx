"use client";

import React, { useState } from 'react';
import Image from 'next/image';

type ScheduleItem = {
  time: string;
  title: string;
  location?: string;
  duration?: string;
  speaker?: {
    name: string;
    title?: string;
    affiliation?: string;
    photo?: string;
  };
  description?: string;
};

type DaySchedule = {
  date: string;
  items: ScheduleItem[];
};

type ScheduleAtAGlanceProps = {
  schedule: DaySchedule[];
};

const ScheduleAtAGlance: React.FC<ScheduleAtAGlanceProps> = ({ schedule }) => {
  const [selectedDay, setSelectedDay] = useState(0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Schedule at a Glance</h1>
      <p className="text-l font-bold text-center mb-8 text-slate-600">This event schedule is still pending, please check back later as more information is added!</p>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="flex border-b">
          {schedule.map((day, index) => (
            <button
              key={index}
              className={`flex-1 text-center py-4 px-4 font-semibold ${
                selectedDay === index
                  ? 'bg-navy-800 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setSelectedDay(index)}
            >
              {day.date}
            </button>
          ))}
        </div>
        <div className="p-6">
          {schedule[selectedDay].items.map((item, itemIndex, array) => (
            <div key={itemIndex} className={`relative pl-8 ${itemIndex !== array.length - 1 ? 'mb-8 pb-8 border-b border-gray-200' : ''}`}>
              <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-300"></div>
              <div className="absolute left-[-4px] top-2 w-3 h-3 rounded-full bg-navy-800 border-2 border-white"></div>
              <div className="font-bold text-xl text-navy-800 mb-2">{item.time}</div>
              <div className="text-xl font-semibold mb-2">{item.title}</div>
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
              {item.speaker && (
                <div className="flex items-center mt-3 mb-2">
                  {item.speaker.photo && (
                    <Image
                      src={item.speaker.photo}
                      alt={item.speaker.name}
                      width={48}
                      height={48}
                      className="rounded-full mr-4"
                    />
                  )}
                  <div>
                    <div className="font-semibold text-lg">{item.speaker.name}</div>
                    {item.speaker.title && <div className="text-sm text-gray-600">{item.speaker.title}</div>}
                    {item.speaker.affiliation && <div className="text-sm text-gray-600">{item.speaker.affiliation}</div>}
                  </div>
                </div>
              )}
              {item.description && <div className="text-sm mt-2 text-gray-700">{item.description}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScheduleAtAGlance;