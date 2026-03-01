"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { SCHEDULES } from '@/constants/schedules';
import { EVENTS } from '@/constants/events';
import { Event } from '@/types/events';
import Image from 'next/image';
import { getCdnPath } from '@/utils/image';
import { PDFDownloadButton, PDFPreviewButton, SponsorTierForPDF } from './SchedulePDF';
import { EventSpeakerPublic } from '@/lib/sanity';

// helper to get sanity image URL
function getSanityImageUrl(ref: string) {
  return `https://cdn.sanity.io/images/nc4xlou0/production/${ref
    .replace("image-", "")
    .replace("-webp", ".webp")
    .replace("-jpg", ".jpg")
    .replace("-png", ".png")}`;
}

interface PrintableScheduleProps {
  eventId: number;
  sanitySpeakers?: EventSpeakerPublic[] | null;
}

// Define types for schedule items
type Speaker = {
  name?: string;
  title?: string;
  sponsor?: string;
  sponsorStyle?: string;
  affiliation?: string;
  photo?: string;
  sanityImage?: { asset: { _ref: string } };
  presentation?: string;
  videoId?: string;
  videoStartTime?: number;
  speakerId?: string;
};

// helper function to resolve speaker data from sanity
const resolveSpeaker = (speaker: Speaker, sanitySpeakerMap: Map<string, EventSpeakerPublic>): Speaker => {
  if (speaker.speakerId && sanitySpeakerMap.has(speaker.speakerId)) {
    const speakerData = sanitySpeakerMap.get(speaker.speakerId)!;
    return {
      ...speaker,
      name: speakerData.speakerName,
      title: speakerData.speakerPosition,
      affiliation: speakerData.speakerCompany,
      photo: undefined,
      sanityImage: speakerData.speakerImage,
    };
  }
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

type ScheduleDay = {
  date: string;
  items: ScheduleItem[];
};

const PrintableSchedule: React.FC<PrintableScheduleProps> = ({ eventId, sanitySpeakers }) => {
  // Find the schedule for the given event ID
  const schedule = SCHEDULES.find(s => s.id === eventId)?.schedule as ScheduleDay[] | undefined;

  // Find the event details
  const event = EVENTS.find(e => e.id === eventId) as Event | undefined;

  // Build sanity speaker lookup map
  const sanitySpeakerMap = new Map<string, EventSpeakerPublic>();
  if (sanitySpeakers) {
    sanitySpeakers.forEach(s => {
      if (s.speakerSlug) sanitySpeakerMap.set(s.speakerSlug, s);
    });
  }

  // State for customization options
  const [showSpeakers, setShowSpeakers] = useState<boolean>(true);
  const [showLocations, setShowLocations] = useState<boolean>(true);
  const [fontSize, setFontSize] = useState<number>(100); // percentage
  const [selectedDays, setSelectedDays] = useState<string[]>(schedule?.map(day => day.date) || []);
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customSubtitle, setCustomSubtitle] = useState<string>('');
  const [twoColumnLayout, setTwoColumnLayout] = useState<boolean>(true);
  const [selectedSponsorTierIds, setSelectedSponsorTierIds] = useState<string[]>([]);
  const [showSponsorsInPDF, setShowSponsorsInPDF] = useState<boolean>(false);
  const [sponsorLoading, setSponsorLoading] = useState<boolean>(false);
  const [fetchedTiers, setFetchedTiers] = useState<{ id: string; name: string; style?: string; sponsors: { _id: string; name: string; logoUrl: string }[] }[]>([]);
  const [tierSizeMultipliers, setTierSizeMultipliers] = useState<Record<string, number>>({});
  const [fullPageTierIds, setFullPageTierIds] = useState<string[]>([]);
  const [fullPageFooterImage, setFullPageFooterImage] = useState<string | undefined>(undefined);

  // fetch sponsor tiers from sanity via the banner-generator API
  const fetchSponsorTiers = useCallback(async () => {
    setSponsorLoading(true);
    try {
      const res = await fetch('/api/admin/banner-generator');
      const data = await res.json();
      const eventData = (data.events || []).find((e: any) => e.eventId === eventId);
      if (eventData?.tiers) {
        // Debug: log full tier data
        eventData.tiers.forEach((tier: any) => {
          console.log(`Tier "${tier.name}" (${tier.id}):`, {
            totalFromAPI: tier.sponsors.length,
            sponsors: tier.sponsors.map((s: any) => ({
              name: s.name,
              hasLogo: !!s.logoUrl,
              logoUrl: s.logoUrl?.substring(0, 50) + '...',
            })),
          });
        });
        setFetchedTiers(eventData.tiers);
      }
    } catch (err) {
      console.error('Failed to fetch sponsor tiers:', err);
    } finally {
      setSponsorLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (showSponsorsInPDF && fetchedTiers.length === 0) {
      fetchSponsorTiers();
    }
  }, [showSponsorsInPDF, fetchedTiers.length, fetchSponsorTiers]);

  // tier display order (same as BannerGeneratorPage)
  const TIER_ORDER = [
    'platinum', 'diamond', 'gold', 'silver', 'bronze', 'vip',
    'coffee', 'networking', 'luncheon', 'beverage', 'small', 'exhibitor', 'partner',
  ];
  const getTierPriority = (tierName: string): number => {
    const name = tierName.toLowerCase();
    for (let i = 0; i < TIER_ORDER.length; i++) {
      if (name.includes(TIER_ORDER[i])) return i;
    }
    return TIER_ORDER.length;
  };

  const availableTiers = [...fetchedTiers].sort(
    (a, b) => getTierPriority(a.name) - getTierPriority(b.name)
  );

  // build proxied PNG URL for react-pdf compatibility
  const buildPdfLogoUrl = (sanityUrl: string) => {
    // append fm=png to force PNG format from Sanity CDN
    const pngUrl = sanityUrl.includes('?')
      ? `${sanityUrl}&fm=png&w=200&h=120&fit=max&q=80`
      : `${sanityUrl}?fm=png&w=200&h=120&fit=max&q=80`;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/api/proxy-image?url=${encodeURIComponent(pngUrl)}`;
  };

  const resolvedSponsorTiers: SponsorTierForPDF[] = showSponsorsInPDF
    ? availableTiers
        .filter(tier => selectedSponsorTierIds.includes(tier.id))
        .map(tier => {
          // Debug: check for sponsors without logos
          const sponsorsWithoutLogos = tier.sponsors.filter(s => !s.logoUrl || s.logoUrl.trim() === '');
          if (sponsorsWithoutLogos.length > 0) {
            console.warn(`Tier "${tier.name}" has ${sponsorsWithoutLogos.length} sponsors without logos:`, sponsorsWithoutLogos.map(s => s.name));
          }
          
          const sponsorsWithLogos = tier.sponsors
            .filter(s => s.logoUrl && s.logoUrl.trim() !== ''); // Filter out sponsors without logos
          
          console.log(`Tier "${tier.name}" final count:`, {
            original: tier.sponsors.length,
            withoutLogos: sponsorsWithoutLogos.length,
            withLogos: sponsorsWithLogos.length,
            finalForPDF: sponsorsWithLogos.length,
          });
          
          return {
            id: tier.id,
            name: tier.name,
            style: tier.style,
            sizeMultiplier: tierSizeMultipliers[tier.id] || 1.0,
            fullPage: fullPageTierIds.includes(tier.id),
            sponsors: sponsorsWithLogos.map(s => ({
              id: s._id,
              name: s.name,
              logoUrl: buildPdfLogoUrl(s.logoUrl),
            })),
          };
        })
        .filter(tier => tier.sponsors.length > 0)
    : [];

  const toggleSponsorTier = (tierId: string) => {
    setSelectedSponsorTierIds(prev =>
      prev.includes(tierId)
        ? prev.filter(id => id !== tierId)
        : [...prev, tierId]
    );
  };

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
  const renderScheduleItem = (item: ScheduleItem, showSpeakers: boolean, showLocations: boolean, locationChanged: boolean = true) => {
    return (
      <div className="schedule-day-item break-inside-avoid page-break-inside-avoid no-page-break font-gotham">
        <div className="schedule-item flex flex-col border-0 border-gray-200 pb-1 ">
          <div className="time-column pr-4">
            <div className="time font-bold text-sm">{item.time}</div>
          </div>
          <div className="content-column flex-1">
            <div className="item-title text-base text-balance font-bold ">{item.title}</div>
            {showLocations && item.location && locationChanged &&
              <div className="location text-xs italic mb-2">{item.location}</div>
            }
            {showSpeakers && item.speakers && item.speakers.length > 0 && (
              <div className="speakers mt-2">
                {item.speakers.map((speaker, index) => {
                  const resolvedSpeaker = resolveSpeaker(speaker, sanitySpeakerMap);
                  const isDiscussant =
                    resolvedSpeaker.speakerId === 'nelinia-nel-varenus' &&
                    item.time === '12:25 PM';
                  return (
                    <div key={index} className="speaker mb-1 flex items-start gap-3">
                      {showSpeakers && (resolvedSpeaker.sanityImage?.asset?._ref || resolvedSpeaker.photo) && (
                        <div className="flex-shrink-0">
                          {resolvedSpeaker.sanityImage?.asset?._ref ? (
                            <Image
                              src={getSanityImageUrl(resolvedSpeaker.sanityImage.asset._ref)}
                              alt={resolvedSpeaker.name || 'Speaker'}
                              width={48}
                              height={48}
                              className="rounded-full"
                              unoptimized={true}
                            />
                          ) : resolvedSpeaker.photo && (
                            <Image
                              src={getCdnPath(`speakers/${resolvedSpeaker.photo}`)}
                              alt={resolvedSpeaker.name || 'Speaker'}
                              width={48}
                              height={48}
                              className="rounded-full"
                            />
                          )}
                        </div>
                      )}
                      <div className="text-balance space-y-1">
                        <div className="font-semibold text-md flex flex-wrap items-center gap-2">
                          <span className="inline-flex flex-wrap items-baseline gap-2">
                            {isDiscussant && (
                              <span className="font-normal underline underline-offset-4 text-sm text-navy-800">
                                Discussant:
                              </span>
                            )}
                            <span>{resolvedSpeaker.name}</span>
                          </span>
                          {resolvedSpeaker.sponsor && resolvedSpeaker.sponsor !== "Pre-Recorded Address" && (
                            <span className={`w-fit text-nowrap rounded-lg md:mx-1 text-xs px-2 py-1 ${resolvedSpeaker.sponsorStyle}`}>
                              {resolvedSpeaker.sponsor}
                            </span>
                          )}
                        </div>
                        {resolvedSpeaker.title && <div className="speaker-title text-xs my-0.5">{resolvedSpeaker.title}</div>}
                        {resolvedSpeaker.affiliation && <div className="speaker-affiliation font-bold text-xs my-0.5">{resolvedSpeaker.affiliation}</div>}
                      </div>
                    </div>
                  );
                })}
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
        allItems.push(renderScheduleItem(item, showSpeakers, showLocations, locationChanged));

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
            {/* ~~This doesn't work for now~~
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
            */}
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

          {/* Sponsor tiers for PDF */}
          <div className="control-section">
            <h3>Sponsor Logos in PDF</h3>
            <div className="form-control">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showSponsorsInPDF}
                  onChange={(e) => {
                    setShowSponsorsInPDF(e.target.checked);
                    if (!e.target.checked) setSelectedSponsorTierIds([]);
                  }}
                  className="mr-2"
                />
                Show sponsor logos after schedule
              </label>
            </div>
            {showSponsorsInPDF && sponsorLoading && (
              <p className="text-xs text-gray-500 mt-1">Loading sponsor tiers...</p>
            )}
            {showSponsorsInPDF && !sponsorLoading && availableTiers.length > 0 && (
              <div className="mt-2 space-y-1 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-2">
                <div className="flex gap-2 mb-1">
                  <button
                    type="button"
                    onClick={() => setSelectedSponsorTierIds(availableTiers.map(t => t.id))}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedSponsorTierIds([])}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Clear
                  </button>
                </div>
                {availableTiers.map((tier) => (
                  <div key={tier.id} className="space-y-1">
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={selectedSponsorTierIds.includes(tier.id)}
                        onChange={() => toggleSponsorTier(tier.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{tier.name}</span>
                      <span className="text-xs text-gray-400">({tier.sponsors.length})</span>
                    </label>
                    {selectedSponsorTierIds.includes(tier.id) && (
                      <div className="ml-6 space-y-1">
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-600 whitespace-nowrap">
                            Size: {Math.round((tierSizeMultipliers[tier.id] || 1.0) * 100)}%
                          </label>
                          <input
                            type="range"
                            min="50"
                            max="200"
                            step="5"
                            value={(tierSizeMultipliers[tier.id] || 1.0) * 100}
                            onChange={(e) => {
                              const newValue = parseInt(e.target.value) / 100;
                              setTierSizeMultipliers(prev => ({
                                ...prev,
                                [tier.id]: newValue,
                              }));
                            }}
                            className="flex-1 h-1"
                          />
                        </div>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={fullPageTierIds.includes(tier.id)}
                            onChange={() => {
                              setFullPageTierIds(prev =>
                                prev.includes(tier.id)
                                  ? prev.filter(id => id !== tier.id)
                                  : [...prev, tier.id]
                              );
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-xs text-gray-600">Separate page (full width)</span>
                        </label>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {showSponsorsInPDF && !sponsorLoading && availableTiers.length === 0 && (
              <p className="text-xs text-gray-500 mt-1">No sponsor tiers found for this event.</p>
            )}
            {showSponsorsInPDF && selectedSponsorTierIds.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Logos will fill remaining space after each day in the PDF.
              </p>
            )}
            {showSponsorsInPDF && fullPageTierIds.length > 0 && (
              <div className="mt-3 border-t border-gray-200 pt-2">
                <label className="text-sm font-medium text-gray-700">Footer image for full-page sponsors</label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        setFullPageFooterImage(ev.target?.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="mt-1 block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {fullPageFooterImage && (
                  <div className="mt-2 flex items-center gap-2">
                    <img src={fullPageFooterImage} alt="Footer preview" className="h-10 object-contain border rounded" />
                    <button
                      type="button"
                      onClick={() => setFullPageFooterImage(undefined)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Print and PDF buttons */}
          <div className="control-section">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handlePrint}
                className="print-button"
              >
                Print Schedule
              </button>
              
              {/* PDF Preview Button */}
              <PDFPreviewButton
                schedule={filteredSchedule}
                event={event}
                showSpeakers={showSpeakers}
                showLocations={showLocations}
                customTitle={customTitle}
                customSubtitle={customSubtitle}
                selectedDays={selectedDays}
                twoColumnLayout={twoColumnLayout}
                sanitySpeakers={sanitySpeakers}
                sponsorTiers={resolvedSponsorTiers}
                fullPageFooterImage={fullPageFooterImage}
              />
              
              {/* PDF Download Button */}
              <PDFDownloadButton
                schedule={filteredSchedule}
                event={event}
                showSpeakers={showSpeakers}
                showLocations={showLocations}
                customTitle={customTitle}
                customSubtitle={customSubtitle}
                selectedDays={selectedDays}
                twoColumnLayout={twoColumnLayout}
                sanitySpeakers={sanitySpeakers}
                sponsorTiers={resolvedSponsorTiers}
                fullPageFooterImage={fullPageFooterImage}
                fileName={`${event.title.toLowerCase().replace(/\s+/g, '-')}-schedule.pdf`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Fixed header for every page - ONLY VISIBLE ON PRINT SCREEN */}
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
          <div className="columns-1 md:columns-2 gap-0 space-y-0 h-auto">
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
                        {renderScheduleItem(item, showSpeakers, showLocations, locationChanged)}
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
                      const result = renderScheduleItem(item, showSpeakers, showLocations, locationChanged);
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
