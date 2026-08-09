"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { SCHEDULES } from '@/constants/schedules';
import { EVENTS } from '@/constants/events';
import { Event } from '@/types/events';
import Image from 'next/image';
import { getCdnPath } from '@/utils/image';
import { PDFDownloadButton, PDFPreviewButton, SponsorTierForPDF, PDFLayoutOptions, DEFAULT_PDF_LAYOUT, ScheduleCalloutForPDF, buildLocationLine } from './SchedulePDF';
import { EventSpeakerPublic } from '@/lib/sanity';
import { htmlToText } from '@/lib/html';
import { generateQrDataUrl } from '@/utils/qr';
import { buildCalloutFooter, buildCalloutHeading, findNextEvent, getEventRegistrationUrl } from '@/utils/event-callout';
import { describePage, paginateSchedule, SPONSOR_PAGE_KEY } from '@/lib/schedule-pdf-layout';

type TierPlacement = NonNullable<SponsorTierForPDF['placement']>;

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
  schedule?: ScheduleDay[];
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
      // Use manual overrides if they exist, otherwise fall back to Sanity data.
      // The profile name is authored as HTML and printed as text.
      name: speaker.name?.trim() ? speaker.name : htmlToText(speakerData.speakerName),
      title: speaker.title?.trim() ? speaker.title : speakerData.speakerPosition,
      affiliation: speaker.affiliation?.trim() ? speaker.affiliation : speakerData.speakerCompany,
      photo: undefined, // Sanity uses sanityImage
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

const PrintableSchedule: React.FC<PrintableScheduleProps> = ({ eventId, sanitySpeakers, schedule: scheduleProp }) => {
  // Use passed-in schedule (Sanity), falling back to legacy constant
  const schedule = (scheduleProp ?? SCHEDULES.find(s => s.id === eventId)?.schedule) as ScheduleDay[] | undefined;

  // Find the event details
  const event = EVENTS.find(e => e.id === eventId) as Event | undefined;

  // Build sanity speaker lookup map - keyed by both slug and _id to handle
  // schedule items coming from the public GROQ (speakerId = slug.current)
  // or the admin GROQ (speakerId = Sanity _id)
  const sanitySpeakerMap = new Map<string, EventSpeakerPublic>();
  if (sanitySpeakers) {
    sanitySpeakers.forEach(s => {
      if (s.speakerSlug) sanitySpeakerMap.set(s.speakerSlug, s);
      if (s.speakerId) sanitySpeakerMap.set(s.speakerId, s);
    });
  }

  // State for customization options
  const [showSpeakers, setShowSpeakers] = useState<boolean>(true);
  const [showLocations, setShowLocations] = useState<boolean>(true);
  const [fontSize, setFontSize] = useState<number>(100); // percentage
  const [selectedDays, setSelectedDays] = useState<string[]>(schedule?.map(day => day.date) || []);
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customSubtitle, setCustomSubtitle] = useState<string>('');
  const [customLocation, setCustomLocation] = useState<string>('');
  const [twoColumnLayout, setTwoColumnLayout] = useState<boolean>(true);
  const [showConferenceModerator, setShowConferenceModerator] = useState<boolean>(false);
  const [selectedSponsorTierIds, setSelectedSponsorTierIds] = useState<string[]>([]);
  const [showSponsorsInPDF, setShowSponsorsInPDF] = useState<boolean>(false);
  const [sponsorLoading, setSponsorLoading] = useState<boolean>(false);
  const [fetchedTiers, setFetchedTiers] = useState<{ id: string; name: string; style?: string; sponsors: { _id: string; name: string; logoUrl: string }[] }[]>([]);
  const [tierSizeMultipliers, setTierSizeMultipliers] = useState<Record<string, number>>({});
  const [tierPlacements, setTierPlacements] = useState<Record<string, TierPlacement>>({});
  const [fullPageFooterImage, setFullPageFooterImage] = useState<string | undefined>(undefined);
  const [pdfLayout, setPdfLayout] = useState<PDFLayoutOptions>({ ...DEFAULT_PDF_LAYOUT });

  // "sign up for the next event" callout
  const [showCallout, setShowCallout] = useState<boolean>(false);
  const [calloutEventId, setCalloutEventId] = useState<number | null>(null);
  const [calloutHeading, setCalloutHeading] = useState<string>('');
  const [calloutFooter, setCalloutFooter] = useState<string>('');
  const [calloutUrl, setCalloutUrl] = useState<string>('');
  const [calloutBgColor, setCalloutBgColor] = useState<string>('#5B9BD5');
  const [calloutTextColor, setCalloutTextColor] = useState<string>('#ffffff');
  const [calloutQrSize, setCalloutQrSize] = useState<number>(130);
  const [calloutLogo, setCalloutLogo] = useState<boolean>(true);
  const [calloutPlacement, setCalloutPlacement] = useState<'auto' | 'largest-gap' | 'each-day' | 'page'>('auto');
  // `${date}|${pageIndex}` identifying an exact page for the callout
  const [calloutPageKey, setCalloutPageKey] = useState<string>('');
  // '' = automatic; otherwise the date of the day whose last page takes the logos
  const [sponsorDay, setSponsorDay] = useState<string>('');
  const [calloutColumn, setCalloutColumn] = useState<'auto' | 'left' | 'right'>('auto');
  const [calloutQrDataUrl, setCalloutQrDataUrl] = useState<string | undefined>(undefined);
  const [calloutQrError, setCalloutQrError] = useState<string | null>(null);

  const updateLayout = (key: keyof PDFLayoutOptions, value: number | boolean) => {
    setPdfLayout(prev => ({ ...prev, [key]: value }));
  };

  // default the callout to whatever event comes next on the calendar
  useEffect(() => {
    const current = EVENTS.find(e => e.id === eventId);
    setCalloutEventId(findNextEvent(current)?.id ?? null);
  }, [eventId]);

  const applyCalloutDefaults = useCallback((targetEventId: number | null) => {
    const target = EVENTS.find(e => e.id === targetEventId) ?? null;
    setCalloutHeading(buildCalloutHeading(target));
    setCalloutFooter(buildCalloutFooter(target));
    setCalloutUrl(getEventRegistrationUrl(target));
  }, []);

  // picking a different target event rewrites the copy; edits after that stick
  useEffect(() => {
    applyCalloutDefaults(calloutEventId);
  }, [calloutEventId, applyCalloutDefaults]);

  // regenerate the QR whenever the link (or logo option) changes
  useEffect(() => {
    if (!showCallout || !calloutUrl.trim()) {
      setCalloutQrDataUrl(undefined);
      setCalloutQrError(null);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const dataUrl = await generateQrDataUrl(calloutUrl.trim(), {
          logoSrc: calloutLogo ? '/logo.webp' : undefined,
        });
        if (!cancelled) {
          setCalloutQrDataUrl(dataUrl);
          setCalloutQrError(null);
        }
      } catch (err) {
        console.error('Failed to generate QR code:', err);
        if (!cancelled) {
          setCalloutQrDataUrl(undefined);
          setCalloutQrError('Could not generate the QR code for this link.');
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [showCallout, calloutUrl, calloutLogo]);

  const resolvedCallout: ScheduleCalloutForPDF | null = showCallout
    ? {
        heading: calloutHeading,
        footer: calloutFooter,
        qrDataUrl: calloutQrDataUrl,
        backgroundColor: calloutBgColor,
        textColor: calloutTextColor,
        qrSize: calloutQrSize,
        placement: {
          mode: calloutPlacement,
          column: calloutColumn,
          page: calloutPageKey
            ? { date: calloutPageKey.split('|')[0], pageIndex: Number(calloutPageKey.split('|')[1]) }
            : undefined,
        },
      }
    : null;

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

  const fullPageTierIds = Object.entries(tierPlacements)
    .filter(([, placement]) => placement === 'page')
    .map(([id]) => id);

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
            placement: tierPlacements[tier.id] || 'column',
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

  // same pagination the PDF uses, so the placement dropdowns list real pages
  const paginatedPreview = paginateSchedule(filteredSchedule, {
    twoColumnLayout,
    showSpeakers,
    showLocations,
  });
  const pageOptions = [
    ...paginatedPreview.flatMap(day =>
      day.pages.map((_, pageIndex) => ({
        key: `${day.date}|${pageIndex}`,
        label: describePage(day.date, pageIndex, day.pages.length),
      }))
    ),
    // the dedicated sponsor page only exists when a tier is sent to its own page
    ...(fullPageTierIds.length > 0
      ? [{ key: `${SPONSOR_PAGE_KEY}|0`, label: 'Sponsor page — above the logos' }]
      : []),
  ];

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
            <div className="form-control">
              <label htmlFor="custom-location">Location Line:</label>
              <input
                type="text"
                id="custom-location"
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                placeholder={buildLocationLine(event)}
                className="w-full p-2 border rounded"
              />
              <span className="text-sm text-gray-500">
                Leave blank to use the event&rsquo;s venue and city
              </span>
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
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showConferenceModerator}
                  onChange={(e) => setShowConferenceModerator(e.target.checked)}
                  className="mr-2"
                />
                Show Conference Moderator (Day 1)
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
                        <div className="flex items-center gap-2">
                          <label htmlFor={`tier-placement-${tier.id}`} className="text-xs text-gray-600 whitespace-nowrap">
                            Where:
                          </label>
                          <select
                            id={`tier-placement-${tier.id}`}
                            value={tierPlacements[tier.id] || 'column'}
                            onChange={(e) =>
                              setTierPlacements(prev => ({ ...prev, [tier.id]: e.target.value as TierPlacement }))
                            }
                            className="flex-1 rounded border border-gray-300 px-1.5 py-1 text-xs"
                          >
                            <option value="column">In a column</option>
                            <option value="band">Bottom of page (full width)</option>
                            <option value="midday">Mid-day row (between pages)</option>
                            <option value="page">Separate page (full width)</option>
                          </select>
                        </div>
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
              <div className="mt-3 border-t border-gray-200 pt-2 space-y-1">
                <label htmlFor="sponsor-day" className="text-xs text-gray-600">
                  Page for the in-column logo block
                </label>
                <select
                  id="sponsor-day"
                  value={sponsorDay}
                  onChange={(e) => setSponsorDay(e.target.value)}
                  className="w-full p-2 border rounded text-sm"
                >
                  <option value="">Auto — last page with room</option>
                  {paginatedPreview.map((day) => (
                    <option key={day.date} value={day.date}>
                      {describePage(day.date, day.pages.length - 1, 1)} — last page
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500">
                  Tiers marked &ldquo;Separate page&rdquo; are not part of this block — they get their
                  own page at the end.
                </p>
              </div>
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

          {/* Next-event callout */}
          <div className="control-section">
            <h3>Next Event Callout</h3>
            <div className="form-control">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showCallout}
                  onChange={(e) => setShowCallout(e.target.checked)}
                  className="mr-2"
                />
                Add sign-up callout with QR code
              </label>
            </div>

            {showCallout && (
              <div className="mt-2 space-y-3">
                <div className="form-control">
                  <label htmlFor="callout-event" className="text-xs text-gray-600">Promoted event</label>
                  <select
                    id="callout-event"
                    value={calloutEventId ?? ''}
                    onChange={(e) => setCalloutEventId(e.target.value ? Number(e.target.value) : null)}
                    className="w-full p-2 border rounded text-sm"
                  >
                    <option value="">-- None (custom text) --</option>
                    {EVENTS.filter(e => e.id !== eventId).map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.title} ({e.date})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label htmlFor="callout-heading" className="text-xs text-gray-600">
                    Heading (line breaks are kept)
                  </label>
                  <textarea
                    id="callout-heading"
                    value={calloutHeading}
                    onChange={(e) => setCalloutHeading(e.target.value)}
                    rows={4}
                    className="w-full p-2 border rounded text-sm"
                  />
                </div>

                <div className="form-control">
                  <label htmlFor="callout-footer" className="text-xs text-gray-600">Footer (date / location)</label>
                  <textarea
                    id="callout-footer"
                    value={calloutFooter}
                    onChange={(e) => setCalloutFooter(e.target.value)}
                    rows={2}
                    className="w-full p-2 border rounded text-sm"
                  />
                </div>

                <div className="form-control">
                  <label htmlFor="callout-url" className="text-xs text-gray-600">QR code link</label>
                  <input
                    type="url"
                    id="callout-url"
                    value={calloutUrl}
                    onChange={(e) => setCalloutUrl(e.target.value)}
                    placeholder="https://www.americandefensealliance.org/events/..."
                    className="w-full p-2 border rounded text-sm"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => applyCalloutDefaults(calloutEventId)}
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  Reset text and link to defaults
                </button>

                <div className="flex items-start gap-3">
                  <div className="flex-1 space-y-2">
                    <label className="flex items-center gap-2 text-xs text-gray-600">
                      <input
                        type="checkbox"
                        checked={calloutLogo}
                        onChange={(e) => setCalloutLogo(e.target.checked)}
                        className="rounded"
                      />
                      ADA logo in QR centre
                    </label>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs text-gray-600">QR Size</label>
                        <span className="text-xs font-mono text-gray-500">{calloutQrSize}</span>
                      </div>
                      <input
                        type="range"
                        min="80"
                        max="180"
                        step="5"
                        value={calloutQrSize}
                        onChange={(e) => setCalloutQrSize(parseInt(e.target.value))}
                        className="w-full h-1 accent-sb-100"
                      />
                    </div>
                  </div>
                  <div className="w-20 flex-shrink-0">
                    {calloutQrDataUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={calloutQrDataUrl} alt="QR code preview" className="w-20 h-20 border rounded" />
                    ) : (
                      <div className="w-20 h-20 border rounded flex items-center justify-center text-[10px] text-gray-400 text-center px-1">
                        {calloutUrl.trim() ? 'Generating…' : 'No link'}
                      </div>
                    )}
                  </div>
                </div>

                {calloutQrError && (
                  <p className="text-xs text-red-500">{calloutQrError}</p>
                )}

                <div className="flex gap-3">
                  <div className="form-control flex-1">
                    <label htmlFor="callout-bg" className="text-xs text-gray-600">Background</label>
                    <input
                      type="color"
                      id="callout-bg"
                      value={calloutBgColor}
                      onChange={(e) => setCalloutBgColor(e.target.value)}
                      className="w-full h-8 border rounded"
                    />
                  </div>
                  <div className="form-control flex-1">
                    <label htmlFor="callout-fg" className="text-xs text-gray-600">Text</label>
                    <input
                      type="color"
                      id="callout-fg"
                      value={calloutTextColor}
                      onChange={(e) => setCalloutTextColor(e.target.value)}
                      className="w-full h-8 border rounded"
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label htmlFor="callout-placement" className="text-xs text-gray-600">Placement</label>
                  <select
                    id="callout-placement"
                    value={calloutPlacement}
                    onChange={(e) => setCalloutPlacement(e.target.value as typeof calloutPlacement)}
                    className="w-full p-2 border rounded text-sm"
                  >
                    <option value="auto">Auto — end of the schedule</option>
                    <option value="largest-gap">Largest empty space anywhere</option>
                    <option value="each-day">Last page of every day</option>
                    <option value="page">Specific page…</option>
                  </select>
                </div>

                {calloutPlacement === 'page' && (
                  <div className="form-control">
                    <label htmlFor="callout-page" className="text-xs text-gray-600">Page</label>
                    <select
                      id="callout-page"
                      value={calloutPageKey}
                      onChange={(e) => setCalloutPageKey(e.target.value)}
                      className="w-full p-2 border rounded text-sm"
                    >
                      <option value="">-- Choose a page --</option>
                      {pageOptions.map((p) => (
                        <option key={p.key} value={p.key}>{p.label}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Placed here even if the column is tight, so check the preview — if it
                      overflows, the PDF pushes it to a page of its own.
                    </p>
                  </div>
                )}

                <div className="form-control">
                  <label htmlFor="callout-column" className="text-xs text-gray-600">Column</label>
                  <select
                    id="callout-column"
                    value={calloutColumn}
                    onChange={(e) => setCalloutColumn(e.target.value as typeof calloutColumn)}
                    className="w-full p-2 border rounded text-sm"
                  >
                    <option value="auto">Auto — emptiest column</option>
                    <option value="left">Left column</option>
                    <option value="right">Right column</option>
                  </select>
                </div>

                <p className="text-xs text-gray-500">
                  The callout fills leftover space at the bottom of a column. If nothing has room for it,
                  it is added below the schedule on the final page.
                </p>
              </div>
            )}
          </div>

          {/* PDF Layout sliders */}
          <div className="control-section">
            <h3>PDF Layout</h3>
            <div className="space-y-3">
              {([
                { key: 'pagePadding',         label: 'Page Padding',          min: 4,  max: 30, step: 1 },
                { key: 'itemSpacing',         label: 'Item Spacing',          min: 0,  max: 16, step: 1 },
                { key: 'titleFontSize',       label: 'Title Font Size',       min: 6,  max: 16, step: 0.5 },
                { key: 'timeFontSize',        label: 'Time Font Size',        min: 5,  max: 14, step: 0.5 },
                { key: 'speakerNameFontSize', label: 'Speaker Name Size',     min: 5,  max: 14, step: 0.5 },
                { key: 'speakerDetailFontSize','label': 'Speaker Detail Size', min: 5,  max: 14, step: 0.5 },
                { key: 'speakerImageSize',    label: 'Speaker Image Size',    min: 0,  max: 48, step: 2 },
              ] as { key: keyof PDFLayoutOptions; label: string; min: number; max: number; step: number }[]).map(({ key, label, min, max, step }) => (
                <div key={key} className="form-control">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs text-gray-600">{label}</label>
                    <span className="text-xs font-mono text-gray-500 w-8 text-right">{pdfLayout[key]}</span>
                  </div>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={pdfLayout[key] as number}
                    onChange={(e) => updateLayout(key, parseFloat(e.target.value))}
                    className="w-full h-1 accent-sb-100"
                  />
                </div>
              ))}
              <div className="form-control">
                <label className="flex items-center gap-2 text-xs text-gray-600">
                  <input
                    type="checkbox"
                    checked={pdfLayout.showSpeakerImages}
                    onChange={(e) => updateLayout('showSpeakerImages', e.target.checked)}
                    className="rounded"
                  />
                  Show speaker images in PDF
                </label>
              </div>
              <button
                type="button"
                onClick={() => setPdfLayout({ ...DEFAULT_PDF_LAYOUT })}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Reset to defaults
              </button>
            </div>
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
                layoutOptions={pdfLayout}
                showConferenceModerator={showConferenceModerator}
                callout={resolvedCallout}
                sponsorPlacement={sponsorDay ? { date: sponsorDay } : null}
                locationLine={customLocation}
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
                layoutOptions={pdfLayout}
                fileName={`${event.title.toLowerCase().replace(/\s+/g, '-')}-schedule.pdf`}
                showConferenceModerator={showConferenceModerator}
                callout={resolvedCallout}
                sponsorPlacement={sponsorDay ? { date: sponsorDay } : null}
                locationLine={customLocation}
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
                  {/* Conference moderator on page 1 only, below location */}
                  {dayIndex === 0 && showConferenceModerator && (
                    <div className="conference-moderator-page-1 text-center py-2 mb-2">
                      <span className="font-bold">Conference Moderator:</span> Charles F. Sills, President & CEO, American Defense Alliance
                    </div>
                  )}
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
                  {/* Conference moderator on page 1 only, below location */}
                  {dayIndex === 0 && showConferenceModerator && (
                    <div className="conference-moderator-page-1 text-center py-2 mb-2">
                      <span className="font-bold">Conference Moderator:</span> Charles F. Sills, President & CEO, American Defense Alliance
                    </div>
                  )}

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
