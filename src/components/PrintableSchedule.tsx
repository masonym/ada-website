"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { SCHEDULES } from "@/constants/schedules";
import { EVENTS } from "@/constants/events";
import { Event } from "@/types/events";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getCdnPath } from "@/utils/image";
import ReactDOM from "react-dom/client";

interface PrintableScheduleProps {
  eventId: number;
}

type Speaker = {
  name: string;
  title?: string;
  sponsor?: string;
  sponsorStyle?: string;
  affiliation?: string;
  photo?: string;
};

type ScheduleItem = {
  time: string;
  title: string;
  location?: string;
  speakers?: Speaker[];
  description?: string;
};

type ScheduleDay = {
  date: string;
  items: ScheduleItem[];
};

const PRINTABLE_PAGE_HEIGHT_PX = 1500;

const PrintableSchedule: React.FC<PrintableScheduleProps> = ({ eventId }) => {
  const router = useRouter();
  const schedule = SCHEDULES.find((s) => s.id === eventId)?.schedule as ScheduleDay[] | undefined;
  const event = EVENTS.find((e) => e.id === eventId) as Event | undefined;

  const [showSpeakers, setShowSpeakers] = useState(true);
  const [showLocations, setShowLocations] = useState(true);
  const [fontSize, setFontSize] = useState(100);
  const [selectedDays, setSelectedDays] = useState(schedule?.map((d) => d.date) || []);
  const [customTitle, setCustomTitle] = useState("");
  const [customSubtitle, setCustomSubtitle] = useState("");
  const [twoColumnLayout, setTwoColumnLayout] = useState(true);
  const [newPagePerDay, setNewPagePerDay] = useState(true);
  const [pages, setPages] = useState<JSX.Element[][]>([]);

  if (!schedule || !event) return <div>Schedule not found</div>;

  const toggleDay = (date: string) => {
    setSelectedDays((prev) => prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]);
  };

  const filteredSchedule = useMemo(() => {
    return schedule.filter((d) => selectedDays.includes(d.date));
  }, [schedule, selectedDays]);

  const renderScheduleItem = (item: ScheduleItem, showSpeakers: boolean, showLocations: boolean, locationChanged: boolean = true) => (
    <div className="schedule-day-item break-inside-avoid page-break-inside-avoid no-page-break font-gotham">
      <div className="schedule-item flex flex-col border-0 border-gray-200 pb-1 ">
        <div className="time-column pr-4">
          <div className="time font-bold text-sm">{item.time}</div>
        </div>
        <div className="content-column flex-1">
          <div className="item-title text-base text-balance font-bold ">{item.title}</div>
          {showLocations && item.location && locationChanged && (
            <div className="location text-xs italic mb-2">{item.location}</div>
          )}
          {showSpeakers && item.speakers?.length && (
            <div className="speakers mt-2">
              {item.speakers.map((speaker, i) => (
                <div key={i} className="speaker mb-1 flex items-start gap-3">
                  {speaker.photo && (
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
                  <div className="text-balance">
                    <div className="font-semibold text-md">
                      {speaker.name}
                      {speaker.sponsor && (
                        <span className={`w-fit text-nowrap rounded-lg md:mx-1 text-xs px-2 py-1 ${speaker.sponsorStyle}`}>{speaker.sponsor}</span>
                      )}
                    </div>
                    {speaker.title && <div className="speaker-title text-xs my-0.5">{speaker.title}</div>}
                    {speaker.affiliation && <div className="speaker-affiliation font-bold text-xs my-0.5">{speaker.affiliation}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
          {item.description && <div className="description text-balance text-sm mt-2">{item.description}</div>}
        </div>
      </div>
    </div>
  );

  const getAllScheduleItems = useCallback(() => {
    const allItems: JSX.Element[] = [];
    let lastLocation: string | null = null;

    filteredSchedule.forEach((day, dayIndex) => {
      if (newPagePerDay && dayIndex > 0) {
        allItems.push(<div key={`day-break-${dayIndex}`} className="page-break-before w-full"></div>);
      }

      allItems.push(
        <div key={`day-header-${dayIndex}`} className="day-print-header">
          <div className="day-print-header-top">{customTitle || event.title}</div>
          <div className="day-print-header-bottom">
            <div>{day.date}</div>
            <div>{event.locationAddress}</div>
          </div>
        </div>
      );

      day.items.forEach((item, i) => {
        const locationChanged = item.location !== lastLocation;
        allItems.push(renderScheduleItem(item, showSpeakers, showLocations, locationChanged));
        lastLocation = item.location || null;
      });
    });

    return allItems;
  }, [filteredSchedule, showSpeakers, showLocations, customTitle, newPagePerDay]);

  const paginateSchedule = async (items: JSX.Element[]): Promise<JSX.Element[][]> => {
    const container = document.getElementById("measurer");
    if (!container) return [items];

    console.log("Paginating schedule..."); // Debugging line
    const pages: JSX.Element[][] = [];
    let currentPage: JSX.Element[] = [];
    let currentHeight = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      container.innerHTML = ""; // clear old
      const wrapper = document.createElement("div");
      wrapper.className = "mb-4";
      container.appendChild(wrapper);

      const root = ReactDOM.createRoot(wrapper);
      root.render(item);

      await new Promise((r) => setTimeout(r, 0)); // wait for layout

      const height = wrapper.offsetHeight;
      root.unmount(); // unmount this wrapper render

      if (currentHeight + height > PRINTABLE_PAGE_HEIGHT_PX) {
        pages.push(currentPage);
        currentPage = [item];
        currentHeight = height;
      } else {
        currentPage.push(item);
        currentHeight += height;
      }
    }

    if (currentPage.length > 0) pages.push(currentPage);
    return pages;
  };

  const flatItems = useMemo(() => getAllScheduleItems(), [getAllScheduleItems]);

  useEffect(() => {
    let isCancelled = false;
    const timeout = setTimeout(() => {
      paginateSchedule(flatItems).then((res) => {
        if (!isCancelled) setPages(res);
      });
    }, 200);

    return () => {
      isCancelled = true;
      clearTimeout(timeout);
    };
  }, [flatItems]);

  return (
    <div className="print-container">
      <div className="print-controls no-print">
        <div className="controls-container">
          <div className="control-section">
            <h3>Title and Subtitle</h3>
            <div className="form-control">
              <label>Custom Title:</label>
              <input value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} className="w-full p-2 border rounded" />
            </div>
            <div className="form-control">
              <label>Custom Subtitle:</label>
              <input value={customSubtitle} onChange={(e) => setCustomSubtitle(e.target.value)} className="w-full p-2 border rounded" />
            </div>
          </div>

          <div className="control-section">
            <h3>Display Options</h3>
            <div className="form-control">
              <label><input type="checkbox" checked={showSpeakers} onChange={(e) => setShowSpeakers(e.target.checked)} /> Show Speakers</label>
            </div>
            <div className="form-control">
              <label><input type="checkbox" checked={showLocations} onChange={(e) => setShowLocations(e.target.checked)} /> Show Locations</label>
            </div>
            <div className="form-control">
              <label><input type="checkbox" checked={twoColumnLayout} onChange={(e) => setTwoColumnLayout(e.target.checked)} /> Two-Column Layout</label>
            </div>
            <div className="form-control">
              <label><input type="checkbox" checked={newPagePerDay} onChange={(e) => setNewPagePerDay(e.target.checked)} /> New Page Per Day</label>
            </div>
          </div>

          <div className="control-section">
            <h3>Days to Include</h3>
            {schedule.map((day, i) => (
              <div key={i} className="form-control">
                <label><input type="checkbox" checked={selectedDays.includes(day.date)} onChange={() => toggleDay(day.date)} /> {day.date}</label>
              </div>
            ))}
          </div>

          <div className="control-section">
            <button onClick={() => window.print()} className="print-button">Print Schedule</button>
          </div>
        </div>
      </div>

      <div className="print-footer">
        <div className="italic">Presented by <span className="font-bold not-italic">American Defense Alliance</span></div>
        <div>americandefensealliance.org</div>
      </div>

      <div className="printable-content" style={{ fontSize: `${fontSize}%` }}>
        {customSubtitle && <div className="text-center mb-6"><p className="text-xl italic">{customSubtitle}</p></div>}
        {pages.map((items, i) => {
          const firstDayElement = items.find(el =>
            React.isValidElement(el) &&
            el.props?.["data-date"]
          );

          const pageDate = firstDayElement?.props?.["data-date"] ?? "—";

          return (
            <div key={i} className="page">
              <div className="fixed day-print-header print-only z-[9999]">
                <div className="day-print-header-top">{customTitle || event.title}</div>
                <div className="day-print-header-bottom">
                  <div>{pageDate}</div>
                  <div>{event.locationAddress}</div>
                </div>
              </div>
              <div key={i} className={`page ${twoColumnLayout ? 'columns-1 md:columns-2 gap-0 space-y-0' : ''}`}>
                {items}
              </div>
            </div>
          );
        })}
      </div>

      <div id="measurer" className="absolute invisible left-[-9999px] top-[-9999px] w-[900px]"></div>
    </div>
  );
};

export default PrintableSchedule;
