"use client";
import React, { useState } from 'react';
import { SCHEDULES } from '@/constants/schedules';
import { EVENTS } from '@/constants/events';
import { Event } from '@/types/events';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getCdnPath } from '@/utils/image';

interface PrintableScheduleProps {
  eventId: number;
}

// Define types for schedule items
type Speaker = {
  name: string;
  title?: string;
  sponsor?: string;
  sponsorStyle?: string;
  affiliation?: string;
  photo?: string;
  presentation?: string;
  videoId?: string;
  videoStartTime?: number;
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

type ScheduleDay = {
  date: string;
  items: ScheduleItem[];
};

const PrintableSchedule: React.FC<PrintableScheduleProps> = ({ eventId }) => {
  const router = useRouter();
  
  // Find the schedule for the given event ID
  const schedule = SCHEDULES.find(s => s.id === eventId)?.schedule as ScheduleDay[] | undefined;
  
  // Find the event details
  const event = EVENTS.find(e => e.id === eventId) as Event | undefined;
  
  // State for customization options
  const [showSpeakers, setShowSpeakers] = useState<boolean>(true);
  const [showLocations, setShowLocations] = useState<boolean>(true);
  const [showSpeakerImages, setShowSpeakerImages] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<number>(100); // percentage
  const [selectedDays, setSelectedDays] = useState<string[]>(schedule?.map(day => day.date) || []);
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customSubtitle, setCustomSubtitle] = useState<string>('');
  const [twoColumnLayout, setTwoColumnLayout] = useState<boolean>(false);
  
  if (!schedule || !event) {
    return <div className="p-4 text-red-500 font-semibold">Schedule not found</div>;
  }

  const handlePrint = () => {
    window.print();
  };

  const toggleDay = (date: string) => {
    if (selectedDays.includes(date)) {
      setSelectedDays(selectedDays.filter(d => d !== date));
    } else {
      setSelectedDays([...selectedDays, date]);
    }
  };

  // Filter schedule based on selected days
  const filteredSchedule = schedule.filter(day => selectedDays.includes(day.date));
  
  // Render a single schedule item
  const renderScheduleItem = (item: ScheduleItem, key: string) => {
    return (
      <div key={key} className="schedule-day-item mb-4 break-inside-avoid page-break-inside-avoid no-page-break">
        <div className="schedule-item flex border-b border-gray-200 pb-4">
          <div className="time-column w-24 min-w-24 pr-4">
            <div className="time font-bold text-sm">{item.time}</div>
          </div>
          <div className="content-column flex-1">
            <div className="item-title text-base font-bold mb-1">{item.title}</div>
            {showLocations && item.location && <div className="location text-sm italic mb-2">{item.location}</div>}
            {showSpeakers && item.speakers && item.speakers.length > 0 && (
              <div className="speakers mt-2">
                {item.speakers.map((speaker, index) => (
                  <div key={index} className="speaker mb-2 flex items-start gap-3">
                    {showSpeakerImages && speaker.photo && (
                      <div className="flex-shrink-0">
                        <Image
                          src={getCdnPath(`speakers/${speaker.photo}`)}
                          alt={speaker.name}
                          width={48}
                          height={48}
                          className="rounded-full"
                        />
                      </div>
                    )}
                    <div>
                      <div className="speaker-name font-bold text-sm mb-0.5">{speaker.name}</div>
                      {speaker.title && <div className="speaker-title text-xs my-0.5">{speaker.title}</div>}
                      {speaker.affiliation && <div className="speaker-affiliation text-xs my-0.5">{speaker.affiliation}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {item.description && <div className="description text-sm mt-2">{item.description}</div>}
          </div>
        </div>
      </div>
    );
  };

  // Prepare all schedule items as a flat array for the two-column layout
  const getAllScheduleItems = () => {
    const allItems: JSX.Element[] = [];
    
    filteredSchedule.forEach((day, dayIndex) => {
      // Add day header
      allItems.push(
        <div key={`day-${dayIndex}`} className="day-header-container mb-4 break-inside-avoid no-page-break">
          <h2 className="text-xl font-bold bg-gray-100 p-3 rounded day-header">{day.date}</h2>
        </div>
      );
      
      // Add all items for this day
      day.items.forEach((item, itemIndex) => {
        // Add a page break every 8 items or so (roughly 8.5 inches of content)
        const needsPageBreak = itemIndex > 0 && itemIndex % 8 === 0;
        if (needsPageBreak && twoColumnLayout) {
          allItems.push(
            <div key={`break-${dayIndex}-${itemIndex}`} className="page-break-before w-full"></div>
          );
        }
        
        allItems.push(renderScheduleItem(item, `${dayIndex}-${itemIndex}`));
      });
      
      // Add a spacer after each day except the last one
      if (dayIndex < filteredSchedule.length - 1) {
        allItems.push(
          <div key={`spacer-${dayIndex}`} className="mb-8 page-break-after"></div>
        );
      }
    });
    
    return allItems;
  };

  return (
    <div className="print-container max-w-4xl mx-auto p-5" style={{ fontSize: `${fontSize}%` }}>
      <div className="print-controls no-print bg-gray-100 rounded-lg p-6 mb-8 shadow-md">
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-2">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Print Options</h3>
            <div className="flex gap-4">
              <button 
                onClick={() => router.back()} 
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded transition-colors"
              >
                Back
              </button>
              <button 
                onClick={handlePrint} 
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors"
              >
                Print Schedule
              </button>
            </div>
          </div>
          
          <div className="border-b border-gray-200 pb-2">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Content Options</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="show-speakers" 
                  checked={showSpeakers} 
                  onChange={(e) => setShowSpeakers(e.target.checked)} 
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="show-speakers" className="text-sm text-gray-700">Show Speakers</label>
              </div>
              
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="show-locations" 
                  checked={showLocations} 
                  onChange={(e) => setShowLocations(e.target.checked)} 
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="show-locations" className="text-sm text-gray-700">Show Locations</label>
              </div>
              
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="show-speaker-images" 
                  checked={showSpeakerImages} 
                  onChange={(e) => setShowSpeakerImages(e.target.checked)} 
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="show-speaker-images" className="text-sm text-gray-700">Show Speaker Images</label>
              </div>
              
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="two-column-layout" 
                  checked={twoColumnLayout} 
                  onChange={(e) => setTwoColumnLayout(e.target.checked)} 
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="two-column-layout" className="text-sm text-gray-700">Two-Column Layout</label>
              </div>
            </div>
          </div>
          
          <div className="border-b border-gray-200 pb-2">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Font Size</h3>
            <div className="flex items-center gap-4">
              <input 
                type="range" 
                value={fontSize} 
                min={70} 
                max={150} 
                step={5}
                onChange={(e) => setFontSize(parseInt(e.target.value))} 
                className="w-[200px]"
              />
              <span className="text-sm text-gray-700">{fontSize}%</span>
            </div>
          </div>
          
          <div className="border-b border-gray-200 pb-2">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Days to Include</h3>
            <div className="space-y-2">
              {schedule.map((day, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id={`day-${index}`} 
                    checked={selectedDays.includes(day.date)} 
                    onChange={() => toggleDay(day.date)} 
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor={`day-${index}`} className="text-sm text-gray-700">{day.date}</label>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Custom Text</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="custom-title" className="block text-sm text-gray-700 mb-1">Custom Title (leave blank for default)</label>
                <input 
                  type="text"
                  id="custom-title" 
                  value={customTitle} 
                  onChange={(e) => setCustomTitle(e.target.value)} 
                  placeholder={event.title}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="custom-subtitle" className="block text-sm text-gray-700 mb-1">Custom Subtitle</label>
                <input 
                  type="text"
                  id="custom-subtitle" 
                  value={customSubtitle} 
                  onChange={(e) => setCustomSubtitle(e.target.value)} 
                  placeholder="Optional subtitle"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="printable-content">
        <div className="text-center mb-8 pb-2 border-b-2 border-gray-800">
          <h1 className="text-3xl font-bold mb-1">{customTitle || event.title}</h1>
          {customSubtitle && <p className="text-xl italic mb-2">{customSubtitle}</p>}
          <p className="text-lg mb-1">{event.date}</p>
          <p className="text-lg">{event.locationAddress}</p>
        </div>
        
        {twoColumnLayout ? (
          // Two-column layout with newspaper-style flow
          <div className="columns-1 md:columns-2 gap-8 space-y-4 h-auto">
            {getAllScheduleItems()}  
          </div>
        ) : (
          // Single column layout - render days sequentially
          <div>
            {filteredSchedule.map((day, dayIndex) => (
              <div key={dayIndex} className="schedule-day mb-8 page-break-inside-avoid">
                <h2 className="text-xl font-bold bg-gray-100 p-3 mb-4 rounded day-header">{day.date}</h2>
                
                <div className="space-y-4">
                  {day.items.map((item, itemIndex) => renderScheduleItem(item, `${dayIndex}-${itemIndex}`))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PrintableSchedule;
