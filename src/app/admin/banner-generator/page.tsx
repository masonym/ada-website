"use client";

import { useState, useEffect, useRef } from "react";
import { Download, RefreshCw, Eye, Settings, Image as ImageIcon } from "lucide-react";
import html2canvas from "html2canvas";

type SponsorData = {
  _id: string;
  name: string;
  logoUrl: string;
  description?: string;
  website?: string;
};

type TierData = {
  id: string;
  name: string;
  style?: string;
  sponsors: SponsorData[];
};

type EventWithSponsors = {
  eventId: number;
  eventName: string;
  title?: string;
  tiers: TierData[];
};

// tier display order (same as SponsorLogos.tsx)
const TIER_ORDER = [
  'platinum',
  'diamond',
  'gold',
  'silver',
  'bronze',
  'vip',
  'coffee',
  'networking',
  'luncheon',
  'beverage',
  'small',
  'exhibitor',
  'partner',
];

const getTierPriority = (tierName: string): number => {
  const name = tierName.toLowerCase();
  for (let i = 0; i < TIER_ORDER.length; i++) {
    if (name.includes(TIER_ORDER[i])) {
      return i;
    }
  }
  return TIER_ORDER.length;
};

const getDefaultTierStyle = (tierName: string) => {
  if (tierName.toLowerCase().includes('small')) return 'bg-[#3FB4E6] text-slate-900';
  if (tierName.toLowerCase().includes('gold')) return 'bg-amber-400 text-slate-900';
  if (tierName.toLowerCase().includes('silver')) return 'bg-gray-300 text-slate-900';
  if (tierName.toLowerCase().includes('bronze')) return 'bg-amber-700 text-white';
  if (tierName.toLowerCase().includes('premier')) return 'bg-purple-600 text-white';
  if (tierName.toLowerCase().includes('platinum')) return 'bg-sky-300 text-slate-900';
  if (tierName.toLowerCase().includes('diamond')) return 'bg-blue-500 text-white';
  if (tierName.toLowerCase().includes('exhibitor')) return 'bg-[#1B212B] text-white';
  return 'bg-blue-600 text-white';
};

// banner dimensions in inches (33.5" x 80")
const BANNER_WIDTH_INCHES = 33.5;
const BANNER_HEIGHT_INCHES = 80;
const DPI = 150; // for preview/export quality
const PREVIEW_SCALE = 0.08; // scale for preview display

export default function BannerGeneratorPage() {
  const [events, setEvents] = useState<EventWithSponsors[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // config state
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [selectedTierIds, setSelectedTierIds] = useState<string[]>([]);
  const [headerHeight, setHeaderHeight] = useState(2); // inches
  const [footerHeight, setFooterHeight] = useState(2); // inches
  const [bleedColor, setBleedColor] = useState("#23395d"); // navy-100
  const [eventImagePath, setEventImagePath] = useState("");
  const [showDescriptions, setShowDescriptions] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [eventImageScale, setEventImageScale] = useState(80); // percentage

  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      const res = await fetch("/api/admin/banner-generator");
      const data = await res.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  }

  const selectedEvent = events.find((e) => e.eventId === selectedEventId);

  const selectedTiers = selectedEvent
    ? selectedEvent.tiers
        .filter((t) => selectedTierIds.includes(t.id))
        .sort((a, b) => getTierPriority(a.name) - getTierPriority(b.name))
    : [];

  function handleTierToggle(tierId: string) {
    setSelectedTierIds((prev) =>
      prev.includes(tierId)
        ? prev.filter((id) => id !== tierId)
        : [...prev, tierId]
    );
  }

  function selectAllTiers() {
    if (selectedEvent) {
      setSelectedTierIds(selectedEvent.tiers.map((t) => t.id));
    }
  }

  function clearAllTiers() {
    setSelectedTierIds([]);
  }

  async function handleDownload() {
    if (!bannerRef.current) return;

    setGenerating(true);
    try {
      // calculate actual pixel dimensions
      const actualWidth = BANNER_WIDTH_INCHES * DPI;
      const actualHeight = BANNER_HEIGHT_INCHES * DPI;

      const canvas = await html2canvas(bannerRef.current, {
        scale: DPI / 96 / PREVIEW_SCALE, // convert from preview scale to actual DPI
        width: bannerRef.current.scrollWidth,
        height: bannerRef.current.scrollHeight,
        useCORS: true,
        allowTaint: true,
        backgroundColor: backgroundColor,
      });

      // create download link
      const link = document.createElement("a");
      const eventName = selectedEvent?.eventName || "banner";
      const timestamp = new Date().toISOString().split("T")[0];
      link.download = `${eventName.replace(/\s+/g, "-")}_banner_${timestamp}.png`;
      link.href = canvas.toDataURL("image/png", 1.0);
      link.click();
    } catch (error) {
      console.error("Failed to generate banner:", error);
      alert("Failed to generate banner. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  // calculate preview dimensions
  const previewWidth = BANNER_WIDTH_INCHES * DPI * PREVIEW_SCALE;
  const previewHeight = BANNER_HEIGHT_INCHES * DPI * PREVIEW_SCALE;

  // get grid layout based on sponsor count
  const getGridClass = (sponsorCount: number) => {
    if (sponsorCount === 1) return "grid-cols-1";
    if (sponsorCount === 2) return "grid-cols-2";
    if (sponsorCount === 3) return "grid-cols-3";
    if (sponsorCount <= 6) return "grid-cols-3";
    if (sponsorCount <= 9) return "grid-cols-3";
    return "grid-cols-4";
  };

  // get logo size based on tier
  const getLogoSize = (tierName: string, sponsorCount: number) => {
    const name = tierName.toLowerCase();
    // base size in pixels at preview scale
    let baseWidth = 120;
    let baseHeight = 80;

    if (name.includes('platinum') || name.includes('diamond')) {
      baseWidth = 200;
      baseHeight = 120;
    } else if (name.includes('gold')) {
      baseWidth = 180;
      baseHeight = 100;
    } else if (name.includes('silver') || name.includes('bronze')) {
      baseWidth = 150;
      baseHeight = 90;
    } else if (name.includes('small') || name.includes('exhibitor')) {
      baseWidth = 100;
      baseHeight = 60;
    }

    // reduce size if many sponsors
    if (sponsorCount > 6) {
      baseWidth *= 0.8;
      baseHeight *= 0.8;
    }

    return { width: baseWidth, height: baseHeight };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gray-100">
      <div className="max-w-[1800px] mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Banner Generator</h1>
          <p className="text-gray-600 mt-2">
            Generate sponsor banners for retractable pop-up displays (33.5&quot; × 80&quot;)
          </p>
        </div>

        <div className="flex gap-6">
          {/* config panel */}
          <div className="w-96 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-6 sticky top-8">
              <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Settings className="w-5 h-5" />
                Configuration
              </div>

              {/* event selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event *
                </label>
                <select
                  value={selectedEventId || ""}
                  onChange={(e) => {
                    setSelectedEventId(e.target.value ? parseInt(e.target.value) : null);
                    setSelectedTierIds([]);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select an event...</option>
                  {events.map((event) => (
                    <option key={event.eventId} value={event.eventId}>
                      {event.eventName}
                    </option>
                  ))}
                </select>
              </div>

              {/* tier selection */}
              {selectedEvent && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Sponsor Tiers
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={selectAllTiers}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        All
                      </button>
                      <button
                        type="button"
                        onClick={clearAllTiers}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-2">
                    {selectedEvent.tiers
                      .sort((a, b) => getTierPriority(a.name) - getTierPriority(b.name))
                      .map((tier) => (
                        <label
                          key={tier.id}
                          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={selectedTierIds.includes(tier.id)}
                            onChange={() => handleTierToggle(tier.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{tier.name}</span>
                          <span className="text-xs text-gray-400">
                            ({tier.sponsors.length})
                          </span>
                        </label>
                      ))}
                  </div>
                </div>
              )}

              {/* event image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <ImageIcon className="w-4 h-4 inline mr-1" />
                  Event Image Path
                </label>
                <input
                  type="text"
                  value={eventImagePath}
                  onChange={(e) => setEventImagePath(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="/2025_DefenseIndustryForecast.webp"
                />
                <p className="text-xs text-gray-400 mt-1">Path to event logo/image for banner header</p>
              </div>

              {/* event image scale */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Image Scale: {eventImageScale}%
                </label>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={eventImageScale}
                  onChange={(e) => setEventImageScale(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* header/footer size */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Header (inches)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.5"
                    value={headerHeight}
                    onChange={(e) => setHeaderHeight(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Footer (inches)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.5"
                    value={footerHeight}
                    onChange={(e) => setFooterHeight(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* colors */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bleed Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={bleedColor}
                      onChange={(e) => setBleedColor(e.target.value)}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={bleedColor}
                      onChange={(e) => setBleedColor(e.target.value)}
                      className="flex-1 px-2 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Background
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="flex-1 px-2 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* show descriptions toggle */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showDescriptions}
                    onChange={(e) => setShowDescriptions(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Show sponsor descriptions</span>
                </label>
              </div>

              {/* download button */}
              <button
                onClick={handleDownload}
                disabled={generating || selectedTierIds.length === 0}
                className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Download Banner PNG
                  </>
                )}
              </button>

              <p className="text-xs text-gray-400 text-center">
                Output: {BANNER_WIDTH_INCHES * DPI}px × {BANNER_HEIGHT_INCHES * DPI}px @ {DPI}DPI
              </p>
            </div>
          </div>

          {/* preview panel */}
          <div className="flex-1 overflow-auto">
            <div className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-900">
              <Eye className="w-5 h-5" />
              Preview
              <span className="text-sm font-normal text-gray-500">
                (scaled to {Math.round(PREVIEW_SCALE * 100)}%)
              </span>
            </div>

            <div className="bg-gray-200 p-4 rounded-lg inline-block">
              {/* banner preview container */}
              <div
                ref={bannerRef}
                style={{
                  width: previewWidth,
                  height: previewHeight,
                  backgroundColor: backgroundColor,
                }}
                className="relative shadow-2xl"
              >
                {/* header bleed */}
                <div
                  style={{
                    height: headerHeight * DPI * PREVIEW_SCALE,
                    backgroundColor: bleedColor,
                  }}
                  className="w-full"
                />

                {/* main content area */}
                <div
                  className="w-full flex flex-col"
                  style={{
                    height: previewHeight - (headerHeight + footerHeight) * DPI * PREVIEW_SCALE,
                  }}
                >
                  {/* event image */}
                  {eventImagePath && (
                    <div className="flex justify-center py-4" style={{ paddingTop: 20, paddingBottom: 20 }}>
                      <img
                        src={eventImagePath}
                        alt="Event"
                        style={{
                          maxWidth: `${eventImageScale}%`,
                          maxHeight: 120,
                          objectFit: "contain",
                        }}
                        crossOrigin="anonymous"
                      />
                    </div>
                  )}

                  {/* sponsors */}
                  <div className="flex-1 overflow-hidden px-4">
                    {selectedTiers.map((tier) => (
                      <div key={tier.id} className="mb-6">
                        {/* tier label */}
                        <div className="flex justify-center mb-3">
                          <span
                            className={`px-4 py-1 text-xs font-bold rounded-full ${
                              tier.style || getDefaultTierStyle(tier.name)
                            }`}
                            style={{ fontSize: 10 }}
                          >
                            {tier.name}
                          </span>
                        </div>

                        {/* sponsor logos */}
                        <div
                          className={`grid ${getGridClass(tier.sponsors.length)} gap-3 justify-items-center`}
                        >
                          {tier.sponsors.map((sponsor) => {
                            const logoSize = getLogoSize(tier.name, tier.sponsors.length);
                            return (
                              <div key={sponsor._id} className="flex flex-col items-center">
                                <img
                                  src={sponsor.logoUrl}
                                  alt={sponsor.name}
                                  style={{
                                    width: logoSize.width,
                                    height: logoSize.height,
                                    objectFit: "contain",
                                  }}
                                  crossOrigin="anonymous"
                                />
                                {showDescriptions && sponsor.description && (
                                  <p
                                    className="text-center text-gray-600 mt-1 px-2"
                                    style={{ fontSize: 6, maxWidth: logoSize.width + 40 }}
                                  >
                                    {sponsor.description.slice(0, 150)}
                                    {sponsor.description.length > 150 ? "..." : ""}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    {selectedTierIds.length === 0 && (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <p className="text-center" style={{ fontSize: 12 }}>
                          Select an event and tiers<br />to preview sponsors
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* footer bleed */}
                <div
                  style={{
                    height: footerHeight * DPI * PREVIEW_SCALE,
                    backgroundColor: bleedColor,
                  }}
                  className="w-full absolute bottom-0"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
