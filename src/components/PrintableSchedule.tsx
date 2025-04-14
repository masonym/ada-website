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

const PRINTABLE_PAGE_HEIGHT_PX = 1500; // Reduced for better pagination

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
  const [pages, setPages] = useState<Array<{ items: JSX.Element[], date: string }>>([]);

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
          {showSpeakers && !!item.speakers?.length && (
            <div className="speakers">
              {item.speakers!.map((speaker, i) => (
                <div key={i} className="speaker flex items-start gap-3">
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

  const getDayHeader = (day: ScheduleDay, index: number) => {
    return (
      <div
        key={`day-header-${index}`}
        className="day-print-header"
        data-date={day.date}
      >
        <div className="day-print-header-top">{customTitle || event?.title}</div>
        <div className="day-print-header-bottom">
          <div>{day.date}</div>
          <div>{event?.locationAddress}</div>
        </div>
      </div>
    );
  };

  const getAllScheduleItems = useCallback(() => {
    const allItems: { element: JSX.Element, date: string }[] = [];
    let lastLocation: string | null = null;

    filteredSchedule.forEach((day, dayIndex) => {
      // Add day header with date info
      allItems.push({
        element: getDayHeader(day, dayIndex),
        date: day.date
      });

      if (newPagePerDay && dayIndex > 0) {
        allItems.push({
          element: <div key={`day-break-${dayIndex}`} className="page-break-before w-full"></div>,
          date: day.date
        });
      }

      day.items.forEach((item, i) => {
        const locationChanged = item.location !== lastLocation;
        allItems.push({
          element: renderScheduleItem(item, showSpeakers, showLocations, locationChanged),
          date: day.date
        });
        lastLocation = item.location || null;
      });
    });

    return allItems;
  }, [filteredSchedule, showSpeakers, showLocations, customTitle, newPagePerDay, event]);

  const paginateSchedule = async (items: { element: JSX.Element, date: string }[]): Promise<Array<{ items: JSX.Element[], date: string }>> => {
    const container = document.getElementById("measurer");
    if (!container) return [{ items: items.map(i => i.element), date: items[0]?.date || "" }];

    console.log("Paginating schedule...");
    const pages: Array<{ items: JSX.Element[], date: string }> = [];
    let currentPage: JSX.Element[] = [];
    let currentHeight = 0;
    let currentDate = items[0]?.date || "";
    let forceNewPage = false;

    for (let i = 0; i < items.length; i++) {
      const { element, date } = items[i];

      // Force new page when day changes if newPagePerDay is enabled
      if (newPagePerDay && date !== currentDate && i > 0) {
        if (currentPage.length > 0) {
          pages.push({ items: [...currentPage], date: currentDate });
          currentPage = [];
          currentHeight = 0;
        }
        currentDate = date;
        forceNewPage = false;
      }

      // Check if this is a manual page break
      if (React.isValidElement(element) &&
        (element.props).className &&
        element.props.className.includes("page-break-before")) {
        if (currentPage.length > 0) {
          pages.push({ items: [...currentPage], date: currentDate });
          currentPage = [element];
          currentHeight = 0;
          forceNewPage = false;
        }
        continue;
      }

      // Measure height of the element
      container.innerHTML = "";
      const wrapper = document.createElement("div");
      wrapper.className = "mb-4";
      container.appendChild(wrapper);

      const root = ReactDOM.createRoot(wrapper);
      root.render(element);

      await new Promise((r) => setTimeout(r, 0)); // wait for layout

      const height = wrapper.offsetHeight;
      root.unmount();

      // Start new page if this item won't fit
      if (currentHeight + height > PRINTABLE_PAGE_HEIGHT_PX || forceNewPage) {
        if (currentPage.length > 0) {
          pages.push({ items: [...currentPage], date: currentDate });
          currentPage = [element];
          currentHeight = height;
          forceNewPage = false;
        } else {
          currentPage.push(element);
          currentHeight = height;
        }
      } else {
        currentPage.push(element);
        currentHeight += height;
      }
    }

    // Add the last page if there are items left
    if (currentPage.length > 0) {
      pages.push({ items: currentPage, date: currentDate });
    }

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

      <div className="print-footer no-print-fixed">
        <div className="italic">Presented by <span className="font-bold not-italic">American Defense Alliance</span></div>
        <div>americandefensealliance.org</div>
      </div>

      <div className="printable-content" style={{ fontSize: `${fontSize}%` }}>
        {customSubtitle && <div className="text-center mb-6"><p className="text-xl italic">{customSubtitle}</p></div>}
        {pages.map((page, i) => {
          return (
            <div
              key={i}
              className={`page ${i > 0 ? 'page-break-before' : ''}`}
              data-date={page.date}
            >
              <div className="print-only day-print-header">
                <div className="day-print-header-top">{customTitle || event?.title}</div>
                <div className="day-print-header-bottom">
                  <div>{page.date}</div>
                  <div>{event?.locationAddress}</div>
                </div>
              </div>
              <div className={`page-content ${twoColumnLayout ? 'columns-1 md:columns-2 gap-0 space-y-0' : ''}`}>
                {page.items}
              </div>
              <div className="print-only print-footer">
                <div className="italic">Presented by <span className="font-bold not-italic">American Defense Alliance</span></div>
                <div>americandefensealliance.org</div>
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
