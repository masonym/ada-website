"use client";
import React, { useState, useEffect } from 'react';
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
  const [showSpeakerImages, setShowSpeakerImages] = useState<boolean>(true);
  const [fontSize, setFontSize] = useState<number>(100); // percentage
  const [selectedDays, setSelectedDays] = useState<string[]>(schedule?.map(day => day.date) || []);
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customSubtitle, setCustomSubtitle] = useState<string>('');
  const [twoColumnLayout, setTwoColumnLayout] = useState<boolean>(true);

  if (!schedule || !event) {
    return <div className="p-4 text-red-500 font-semibold">Schedule not found</div>;
  }

  // Function to handle printing
  const handlePrint = () => {
    // Add a listener for the beforeprint event
    window.addEventListener('beforeprint', () => {
      // Show the first day's header initially
      const firstDayHeader = document.querySelector('.schedule-day:first-child .day-print-header');
      if (firstDayHeader) {
        firstDayHeader.classList.add('active');
      }
    });

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

  // Render a single schedule item with location context
  const renderScheduleItem = (item: ScheduleItem, showSpeakers: boolean, showLocations: boolean, showSpeakerImages: boolean, locationChanged: boolean = true) => {
    return (
      <div className="schedule-day-item break-inside-avoid page-break-inside-avoid no-page-break font-gotham">
        <div className="schedule-item flex flex-col border-0 border-gray-200 pb-1 ">
          <div className="time-column pr-4">
            <div className="time font-bold text-sm">{item.time}</div>
          </div>
          <div className="content-column flex-1">
            <div className="item-title text-base text-balance font-bold ">{item.title}</div>
            {showLocations && item.location && locationChanged &&
              <div className="location text-sm italic mb-2">{item.location}</div>
            }
            {showSpeakers && item.speakers && item.speakers.length > 0 && (
              <div className="speakers mt-2">
                {item.speakers.map((speaker, index) => (
                  <div key={index} className="speaker mb-1 flex items-start gap-3">
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
                      {speaker.sponsor != "Pre-Recorded Address" && <div className="font-semibold text-lg">{speaker.name} <span className={`w-fit text-nowrap rounded-lg md:mx-1 text-xs px-2 py-1 ${speaker.sponsorStyle}`}>{speaker.sponsor}</span></div>}
                      {speaker.title && <div className="speaker-title text-xs my-0.5">{speaker.title}</div>}
                      {speaker.affiliation && <div className="speaker-affiliation font-bold text-xs my-0.5">{speaker.affiliation}</div>}
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

    // Track the last location for each day
    let lastLocation: string | null = null;

    filteredSchedule.forEach((day, dayIndex) => {
      // Reset location tracking for each day
      lastLocation = null;

      // Add a page break before each day (except the first one)
      if (dayIndex > 0) {
        allItems.push(
          <div key={`day-break-${dayIndex}`} className="page-break-before w-full"></div>
        );
      }

      // Add day header
      //allItems.push(
      //  <div key={`day-${dayIndex}`} className="day-header-container mb-4 break-inside-avoid no-page-break">
      //    <h2 className="text-xl font-bold bg-gray-100 p-3 rounded day-header">{day.date}</h2>
      //  </div>
      //);

      // Add all items for this day
      day.items.forEach((item, itemIndex) => {
        // Add a page break every 8 items or so (roughly 8.5 inches of content)
        const needsPageBreak = itemIndex > 0 && itemIndex % 8 === 0;
        if (needsPageBreak && twoColumnLayout) {
          allItems.push(
            <div key={`break-${dayIndex}-${itemIndex}`} className="page-break-before w-full"></div>
          );
        }

        // Check if location has changed
        const locationChanged = item.location !== lastLocation;

        // Render the item with the location flag
        allItems.push(renderScheduleItem(item, showSpeakers, showLocations, showSpeakerImages, locationChanged));

        // Update the last location
        lastLocation = item.location || null;
      });

      // We don't need spacers anymore since each day will start on a new page
      // But we'll keep a small margin for visual separation
      if (dayIndex < filteredSchedule.length - 1) {
        allItems.push(
          <div key={`spacer-${dayIndex}`} className="mb-4"></div>
        );
      }
    });

    return allItems;
  };

  return (
    <div className="print-container">
      {/* Controls section (only visible on screen) */}
      <div className="print-controls no-print">
        <div className="controls-container">
          {/* Title and subtitle controls */}
          <div className="control-section">
            <h3>Title and Subtitle</h3>
            <div className="form-control">
              <label htmlFor="custom-title">Custom Title:</label>
              <input
                type="text"
                id="custom-title"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder={event.title}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="form-control">
              <label htmlFor="custom-subtitle">Custom Subtitle:</label>
              <input
                type="text"
                id="custom-subtitle"
                value={customSubtitle}
                onChange={(e) => setCustomSubtitle(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          {/* Display options */}
          <div className="control-section">
            <h3>Display Options</h3>
            <div className="form-control">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showSpeakers}
                  onChange={(e) => setShowSpeakers(e.target.checked)}
                  className="mr-2"
                />
                Show Speakers
              </label>
            </div>
            <div className="form-control">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showLocations}
                  onChange={(e) => setShowLocations(e.target.checked)}
                  className="mr-2"
                />
                Show Locations
              </label>
            </div>
            <div className="form-control">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={twoColumnLayout}
                  onChange={(e) => setTwoColumnLayout(e.target.checked)}
                  className="mr-2"
                />
                Two-Column Layout
              </label>
            </div>
            <div className="form-control">
              <label htmlFor="font-size">Font Size Adjustment:</label>
              <input
                type="number"
                id="font-size"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value) || 100)}
                min="70"
                max="130"
                step="5"
                className="w-full p-2 border rounded"
              />
              <span className="text-sm text-gray-500">100% is default size</span>
            </div>
          </div>

          {/* Day selection */}
          <div className="control-section">
            <h3>Days to Include</h3>
            {schedule.map((day, index) => (
              <div key={index} className="form-control">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedDays.includes(day.date)}
                    onChange={() => toggleDay(day.date)}
                    className="mr-2"
                  />
                  {day.date}
                </label>
              </div>
            ))}
          </div>

          {/* Print button */}
          <div className="control-section">
            <button
              onClick={handlePrint}
              className="print-button"
            >
              Print Schedule
            </button>
          </div>
        </div>
      </div>

      {/* Fixed header for every page - ONLY VISIBLE ON SCREEN */}
      <div className="print-header no-print">
        <div className="print-header-top">
          {customTitle || event.title}
        </div>
        <div className="print-header-bottom">
          <div>{event.date}</div>
          <div>{event.locationAddress}</div>
        </div>
      </div>

      {/* Fixed footer for every page */}
      <div className="print-footer">
        <div className="italic">Presented by <span className="font-bold not-italic">American Defense Alliance</span></div>
        <div>americandefensealliance.org</div>
      </div>

      {/* Main content with margin to accommodate header and footer */}
      <div className="printable-content" style={{ fontSize: `${fontSize}%` }}>
        {/* Custom subtitle if provided */}
        {customSubtitle && (
          <div className="text-center mb-6">
            <p className="text-xl italic">{customSubtitle}</p>
          </div>
        )}

        {twoColumnLayout ? (
          // Two-column layout with newspaper-style flow
          <div className="columns-1 md:columns-2 gap-8 space-y-0 h-auto">
            {filteredSchedule.map((day, dayIndex) => {
              // Track location changes for each day
              let lastLocation: string | null = null;

              return (
                <div key={dayIndex} className={`schedule-day ${dayIndex > 0 ? 'page-break-before' : ''}`}>
                  {/* Day-specific header for print */}
                  <div className="day-print-header">
                    <div className="day-print-header-top">
                      {customTitle || event.title}
                    </div>
                    <div className="day-print-header-bottom">
                      <div>{day.date}</div>
                      <div>{event.locationAddress}</div>
                    </div>
                  </div>
                  {/*               
                  <div className="day-header-container no-page-break">
                    <h2 className="day-header">{day.date}</h2>
                  </div>
                  */}
                  {day.items.map((item, itemIndex) => {
                    // Check if location has changed
                    const locationChanged = item.location !== lastLocation;

                    // Update the last location for next item
                    lastLocation = item.location || null;

                    return (
                      <div key={itemIndex} className="schedule-day-item no-page-break">
                        {renderScheduleItem(item, showSpeakers, showLocations, showSpeakerImages, locationChanged)}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ) : (
          // Single column layout with days as sections
          <div className="space-y-0">
            {filteredSchedule.map((day, dayIndex) => {
              // Track location changes for each day
              let lastLocation: string | null = null;

              return (
                <div key={dayIndex} className={`schedule-day ${dayIndex > 0 ? 'page-break-before' : ''}`}>
                  {/* Day-specific header for print */}
                  <div className="day-print-header">
                    <div className="day-print-header-top">
                      {customTitle || event.title} - {day.date}
                    </div>
                    <div className="day-print-header-bottom">
                      <div>{day.date}</div>
                      <div>{event.locationAddress}</div>
                    </div>
                  </div>

                  <div className="day-header-container no-page-break">
                    <h2 className="day-header">{day.date}</h2>
                  </div>

                  <div className="space-y-0">
                    {day.items.map((item, itemIndex) => {
                      // Check if location has changed
                      const locationChanged = item.location !== lastLocation;

                      // Update the last location for next item
                      const result = renderScheduleItem(item, showSpeakers, showLocations, showSpeakerImages, locationChanged);
                      lastLocation = item.location || null;

                      return result;
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PrintableSchedule;
