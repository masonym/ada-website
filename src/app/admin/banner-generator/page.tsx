"use client";

import { useState, useEffect, useRef } from "react";
import { Download, RefreshCw, Eye, Settings, Image as ImageIcon, CalendarDays, MapPin } from "lucide-react";
import html2canvas from "html2canvas";
import { pluraliseTierName } from "@/lib/sponsor-tier-styles";

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

type VipReception = {
  title: string;
  description: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  additionalInfo?: string;
  additionalInfo2?: string;
  locationName?: string;
  locationAddress?: string;
  locationRoom?: string;
  website?: string;
};

type EventWithSponsors = {
  eventId: number;
  eventName: string;
  title?: string;
  vipReception?: VipReception | null;
  tiers: TierData[];
};

type BannerMode = "sponsors" | "vip";

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
  if (tierName.toLowerCase().includes('small')) return 'bg-[#40E0D0] text-slate-900';
  if (tierName.toLowerCase().includes('coffee')) return 'bg-[#966919] text-white';
  if (tierName.toLowerCase().includes('panel')) return 'bg-[#F33A6A] text-white';
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
  const [tierShowDescriptions, setTierShowDescriptions] = useState<Record<string, boolean>>({});
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [eventImageScale, setEventImageScale] = useState(80); // percentage
  const [tierLabelSize, setTierLabelSize] = useState(12); // font size in px at preview scale
  const [sponsorVerticalOffset, setSponsorVerticalOffset] = useState(0); // pixels offset
  const [eventImageMarginBottom, setEventImageMarginBottom] = useState(20); // pixels
  const [tierSizeMultipliers, setTierSizeMultipliers] = useState<Record<string, number>>({}); // per-tier size multipliers
  const [tierGridColumns, setTierGridColumns] = useState<Record<string, number>>({}); // per-tier column count (1 = one sponsor per row)
  const [tierLabelGap, setTierLabelGap] = useState<Record<string, number>>({}); // per-tier gap between tier label and logos
  const [tierDescGap, setTierDescGap] = useState<Record<string, number>>({}); // per-tier gap between logo and description
  const [descriptionFontSize, setDescriptionFontSize] = useState(6); // px at preview scale
  const [descriptionMaxWidth, setDescriptionMaxWidth] = useState(120); // px at preview scale

  // VIP reception mode state
  const [mode, setMode] = useState<BannerMode>("sponsors");
  const [mapImagePath, setMapImagePath] = useState("");
  const [mapImageScale, setMapImageScale] = useState(70); // percentage
  const [vipTitleSize, setVipTitleSize] = useState(18); // px at preview scale
  const [vipHeadingSize, setVipHeadingSize] = useState(15); // px at preview scale
  const [vipDetailSize, setVipDetailSize] = useState(8); // px at preview scale
  const [vipBodySize, setVipBodySize] = useState(7); // px at preview scale
  const [vipSponsorScale, setVipSponsorScale] = useState(100); // percentage
  const [vipShowSponsorDescriptions, setVipShowSponsorDescriptions] = useState(true);
  // editable text overrides (pre-filled from the reception data on event select)
  const [vipDescription, setVipDescription] = useState("");
  const [vipAdditionalInfo, setVipAdditionalInfo] = useState("");
  const [vipAdditionalInfo2, setVipAdditionalInfo2] = useState("");

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

  const vipReception = selectedEvent?.vipReception || null;

  // reception sponsors are auto-detected from any tier whose name/id mentions "reception"
  const receptionSponsors = selectedEvent
    ? selectedEvent.tiers
        .filter((t) => /reception/i.test(t.name) || /reception/i.test(t.id))
        .flatMap((t) => t.sponsors)
    : [];

  // pre-fill the editable text fields whenever the selected reception changes
  useEffect(() => {
    setVipDescription(vipReception?.description || "");
    setVipAdditionalInfo(vipReception?.additionalInfo || "");
    setVipAdditionalInfo2(vipReception?.additionalInfo2 || "");
  }, [selectedEventId, vipReception?.description, vipReception?.additionalInfo, vipReception?.additionalInfo2]);

  // events available for the current mode
  const availableEvents =
    mode === "vip" ? events.filter((e) => e.vipReception) : events.filter((e) => e.tiers.length > 0);

  const vipWeekday = vipReception?.date
    ? (() => {
        const d = new Date(vipReception.date);
        return isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-US", { weekday: "long" });
      })()
    : "";

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

  // get grid columns based on sponsor count
  const getGridColumns = (sponsorCount: number) => {
    if (sponsorCount === 1) return 1;
    if (sponsorCount === 2) return 1;
    if (sponsorCount === 4) return 2;
    if (sponsorCount <= 6) return 3;
    if (sponsorCount <= 9) return 3;
    return 4;
  };

  // get logo size based on tier
  const getLogoSize = (tierName: string, tierId: string, sponsorCount: number) => {
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

    // apply per-tier multiplier if set
    const multiplier = tierSizeMultipliers[tierId] || 1.0;
    baseWidth *= multiplier;
    baseHeight *= multiplier;

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

              {/* mode toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Banner Type
                </label>
                <div className="flex gap-1 p-1 bg-gray-100 rounded-md">
                  <button
                    type="button"
                    onClick={() => setMode("sponsors")}
                    className={`flex-1 text-sm py-1.5 rounded ${mode === "sponsors" ? "bg-white shadow-sm font-medium text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    Sponsor Banner
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("vip")}
                    className={`flex-1 text-sm py-1.5 rounded ${mode === "vip" ? "bg-white shadow-sm font-medium text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    VIP Reception
                  </button>
                </div>
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
                  {availableEvents.map((event) => (
                    <option key={event.eventId} value={event.eventId}>
                      {event.eventName}
                    </option>
                  ))}
                </select>
              </div>

              {/* tier selection */}
              {mode === "sponsors" && selectedEvent && (
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
                        <div key={tier.id} className="space-y-1">
                          <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
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
                          {selectedTierIds.includes(tier.id) && (
                            <div className="ml-6 space-y-2">
                              <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-600 whitespace-nowrap">
                                  Size: {Math.round((tierSizeMultipliers[tier.id] || 1.0) * 100)}%
                                </label>
                                <input
                                  type="range"
                                  min="50"
                                  max="150"
                                  step="5"
                                  value={(tierSizeMultipliers[tier.id] || 1.0) * 100}
                                  onChange={(e) => {
                                    const newValue = parseInt(e.target.value) / 100;
                                    setTierSizeMultipliers(prev => ({
                                      ...prev,
                                      [tier.id]: newValue
                                    }));
                                  }}
                                  className="flex-1 h-1"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-600 whitespace-nowrap">Columns:</label>
                                <div className="flex gap-1">
                                  {[1, 2, 3, 4].map((cols) => (
                                    <button
                                      key={cols}
                                      type="button"
                                      title={cols === 1 ? 'One sponsor per row' : `${cols} per row`}
                                      onClick={() => setTierGridColumns(prev => ({ ...prev, [tier.id]: cols }))}
                                      className={`text-xs px-2 py-0.5 rounded ${(tierGridColumns[tier.id] || 4) === cols ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                    >
                                      {cols}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-600 whitespace-nowrap">
                                  Label Gap: {tierLabelGap[tier.id] ?? 12}px
                                </label>
                                <input
                                  type="range"
                                  min="0"
                                  max="60"
                                  step="1"
                                  value={tierLabelGap[tier.id] ?? 12}
                                  onChange={(e) => {
                                    const newValue = parseInt(e.target.value);
                                    setTierLabelGap(prev => ({
                                      ...prev,
                                      [tier.id]: newValue
                                    }));
                                  }}
                                  className="flex-1 h-1"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-600 whitespace-nowrap">
                                  Desc Gap: {tierDescGap[tier.id] ?? 4}px
                                </label>
                                <input
                                  type="range"
                                  min="0"
                                  max="40"
                                  step="1"
                                  value={tierDescGap[tier.id] ?? 4}
                                  onChange={(e) => {
                                    const newValue = parseInt(e.target.value);
                                    setTierDescGap(prev => ({
                                      ...prev,
                                      [tier.id]: newValue
                                    }));
                                  }}
                                  className="flex-1 h-1"
                                />
                              </div>
                            </div>
                          )}
                        </div>
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

              {mode === "sponsors" && (
                <>
                  {/* event image bottom margin */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Image Bottom Margin: {eventImageMarginBottom}px
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={eventImageMarginBottom}
                      onChange={(e) => setEventImageMarginBottom(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  {/* tier label size */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tier Label Size: {tierLabelSize}px
                    </label>
                    <input
                      type="range"
                      min="6"
                      max="24"
                      step="0.5"
                      value={tierLabelSize}
                      onChange={(e) => setTierLabelSize(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  {/* sponsor vertical offset */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sponsors Vertical Offset: {sponsorVerticalOffset}px
                    </label>
                    <input
                      type="range"
                      min="-200"
                      max="200"
                      value={sponsorVerticalOffset}
                      onChange={(e) => setSponsorVerticalOffset(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </>
              )}

              {/* VIP reception controls */}
              {mode === "vip" && (
                <>
                  {/* map image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <ImageIcon className="w-4 h-4 inline mr-1" />
                      Map Image Path
                    </label>
                    <input
                      type="text"
                      value={mapImagePath}
                      onChange={(e) => setMapImagePath(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="/locations/harbor_club_map.webp"
                    />
                    <p className="text-xs text-gray-400 mt-1">Optional screenshot of the walking-directions map</p>
                  </div>

                  {/* map scale */}
                  {mapImagePath && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Map Scale: {mapImageScale}%
                      </label>
                      <input
                        type="range"
                        min="20"
                        max="100"
                        value={mapImageScale}
                        onChange={(e) => setMapImageScale(parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  )}

                  {/* vip font sizes */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title Size: {vipTitleSize}px
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="30"
                        step="0.5"
                        value={vipTitleSize}
                        onChange={(e) => setVipTitleSize(parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Heading Size: {vipHeadingSize}px
                      </label>
                      <input
                        type="range"
                        min="8"
                        max="26"
                        step="0.5"
                        value={vipHeadingSize}
                        onChange={(e) => setVipHeadingSize(parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Detail Size: {vipDetailSize}px
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="16"
                        step="0.5"
                        value={vipDetailSize}
                        onChange={(e) => setVipDetailSize(parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Body Text Size: {vipBodySize}px
                      </label>
                      <input
                        type="range"
                        min="4"
                        max="14"
                        step="0.5"
                        value={vipBodySize}
                        onChange={(e) => setVipBodySize(parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* editable text */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={vipDescription}
                        onChange={(e) => setVipDescription(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Additional Info
                      </label>
                      <textarea
                        value={vipAdditionalInfo}
                        onChange={(e) => setVipAdditionalInfo(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Additional Info 2
                      </label>
                      <textarea
                        value={vipAdditionalInfo2}
                        onChange={(e) => setVipAdditionalInfo2(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                  </div>

                  {/* sponsor controls */}
                  {receptionSponsors.length > 0 && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Sponsor Logo Scale: {vipSponsorScale}%
                        </label>
                        <input
                          type="range"
                          min="40"
                          max="200"
                          value={vipSponsorScale}
                          onChange={(e) => setVipSponsorScale(parseInt(e.target.value))}
                          className="w-full"
                        />
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={vipShowSponsorDescriptions}
                          onChange={(e) => setVipShowSponsorDescriptions(e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Show sponsor descriptions</span>
                      </label>
                      <p className="text-xs text-gray-400">
                        {receptionSponsors.length} reception sponsor{receptionSponsors.length === 1 ? "" : "s"} detected
                      </p>
                    </div>
                  )}
                </>
              )}

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

              {/* description controls per tier */}
              {mode === "sponsors" && selectedTierIds.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Show Descriptions by Tier
                  </label>
                  <div className="space-y-1 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-2">
                    {selectedTiers.map((tier) => (
                      <label key={tier.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={tierShowDescriptions[tier.id] || false}
                          onChange={(e) => {
                            setTierShowDescriptions(prev => ({
                              ...prev,
                              [tier.id]: e.target.checked
                            }));
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{tier.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* description font size + width */}
              {mode === "sponsors" && selectedTierIds.some(id => tierShowDescriptions[id]) && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description Font Size: {descriptionFontSize}px
                    </label>
                    <input
                      type="range"
                      min="4"
                      max="20"
                      step="0.5"
                      value={descriptionFontSize}
                      onChange={(e) => setDescriptionFontSize(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description Width: {descriptionMaxWidth}px
                    </label>
                    <input
                      type="range"
                      min="40"
                      max={Math.round(previewWidth - 32)}
                      step="4"
                      value={descriptionMaxWidth}
                      onChange={(e) => setDescriptionMaxWidth(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              )}

              {/* download button */}
              <button
                onClick={handleDownload}
                // disabled={generating || selectedTierIds.length === 0}
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
                  {mode === "sponsors" && (
                  <>
                  {/* event image */}
                  {eventImagePath && (
                    <div
                      style={{ 
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                        paddingTop: 0, 
                        paddingBottom: eventImageMarginBottom,
                        width: '100%',
                      }}
                    >
                      <img
                        src={eventImagePath}
                        alt="Event"
                        style={{
                          width: `${eventImageScale}%`,
                          objectFit: "contain",
                        }}
                        crossOrigin="anonymous"
                      />
                    </div>
                  )}

                  {/* sponsors */}
                  <div
                    style={{
                      flex: 1,
                      overflow: 'visible',
                      paddingLeft: 16,
                      paddingRight: 16,
                      marginTop: sponsorVerticalOffset,
                    }}
                  >
                    {selectedTiers.map((tier) => (
                      <div key={tier.id} style={{ marginBottom: 24 }}>
                        {/* tier label */}
                        <div style={{ textAlign: 'center', marginBottom: tierLabelGap[tier.id] ?? 12, marginTop: 12 }}>
                          <span
                            className={tier.style || getDefaultTierStyle(tier.name)}
                            style={{ 
                              fontSize: tierLabelSize,
                              fontWeight: 'bold',
                              borderRadius: 9999,
                              paddingLeft: 64,
                              paddingRight: 64,
                              paddingTop: tierLabelSize * 0.2,
                              paddingBottom: tierLabelSize * 0.2,
                              display: 'inline-block',
                            }}
                          >
                            {pluraliseTierName(tier.name, tier.sponsors.length)}
                          </span>
                        </div>

                        {/* sponsor logos */}
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                            gap: 12,
                          }}
                        >
                          {tier.sponsors.map((sponsor) => {
                            const logoSize = getLogoSize(tier.name, tier.id, tier.sponsors.length);
                            // never spread fewer sponsors across more columns than we have
                            const columns = Math.min(tierGridColumns[tier.id] || 4, tier.sponsors.length);
                            return (
                              <div
                                key={sponsor._id}
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  flex: `0 0 calc(${100 / columns}% - 12px)`,
                                  maxWidth: `calc(${100 / columns}% - 12px)`,
                                  minWidth: 0,
                                }}
                              >
                                {columns > 1 ? (
                                  // grid: fixed box normalizes every logo to a uniform footprint
                                  <div
                                    style={{
                                      width: '100%',
                                      maxWidth: logoSize.width * 1.1,
                                      height: logoSize.height * 1.5,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}
                                  >
                                    <img
                                      src={`/api/admin/banner-generator/proxy-image?url=${encodeURIComponent(sponsor.logoUrl)}`}
                                      alt={sponsor.name}
                                      style={{
                                        maxWidth: '100%',
                                        maxHeight: '100%',
                                        width: 'auto',
                                        height: 'auto',
                                        objectFit: 'contain',
                                      }}
                                    />
                                  </div>
                                ) : (
                                  // one per row: shrink-wrap so a skinny logo leaves no dead space above/below
                                  <img
                                    src={`/api/admin/banner-generator/proxy-image?url=${encodeURIComponent(sponsor.logoUrl)}`}
                                    alt={sponsor.name}
                                    style={{
                                      maxWidth: `min(100%, ${logoSize.width * 1.1}px)`,
                                      maxHeight: logoSize.height * 1.5,
                                      width: 'auto',
                                      height: 'auto',
                                      objectFit: 'contain',
                                    }}
                                  />
                                )}
                                {tierShowDescriptions[tier.id] && sponsor.description && (
                                  <p
                                    style={{
                                      fontSize: descriptionFontSize,
                                      width: '100%',
                                      maxWidth: descriptionMaxWidth,
                                      textAlign: 'center',
                                      color: '#4b5563',
                                      marginTop: tierDescGap[tier.id] ?? 4,
                                      paddingLeft: 8,
                                      paddingRight: 8,
                                    }}
                                  >
                                    {sponsor.description}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    {/* {selectedTierIds.length === 0 && (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <p className="text-center" style={{ fontSize: 12 }}>
                          Select an event and tiers<br />to preview sponsors
                        </p>
                      </div>
                    )} */}
                  </div>
                  </>
                  )}

                  {/* VIP reception layout */}
                  {mode === "vip" && vipReception && (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        overflow: 'hidden',
                        paddingLeft: 16,
                        paddingRight: 16,
                        color: '#0f172a',
                      }}
                    >
                      {/* event banner image */}
                      {eventImagePath && (
                        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                          <img
                            src={eventImagePath}
                            alt="Event"
                            style={{ width: `${eventImageScale}%`, objectFit: 'contain' }}
                            crossOrigin="anonymous"
                          />
                        </div>
                      )}

                      {/* title pill */}
                      <div style={{ textAlign: 'center', marginTop: 14, marginBottom: 10 }}>
                        <span
                          style={{
                            display: 'inline-block',
                            backgroundColor: '#bae6fd',
                            color: '#0f172a',
                            fontWeight: 'bold',
                            fontSize: vipTitleSize,
                            borderRadius: 14,
                            paddingLeft: 22,
                            paddingRight: 22,
                            paddingTop: 6,
                            paddingBottom: 6,
                          }}
                        >
                          {vipReception.title}
                        </span>
                      </div>

                      {/* location & directions heading */}
                      <h3 style={{ textAlign: 'center', fontWeight: 'bold', fontSize: vipHeadingSize, marginBottom: 10 }}>
                        Location &amp; Directions
                      </h3>

                      {/* date/time + location columns */}
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 28, marginBottom: 10 }}>
                        <div style={{ textAlign: 'center', maxWidth: '45%' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 3 }}>
                            <CalendarDays style={{ width: vipDetailSize + 2, height: vipDetailSize + 2, color: '#2563eb' }} />
                            <span style={{ fontWeight: 600, fontSize: vipDetailSize }}>Date and Time</span>
                          </div>
                          {vipWeekday && <div style={{ fontWeight: 'bold', fontSize: vipDetailSize }}>{vipWeekday}</div>}
                          <div style={{ fontSize: vipDetailSize }}>{vipReception.date}</div>
                          <div style={{ fontSize: vipDetailSize }}>{vipReception.timeStart} - {vipReception.timeEnd}</div>
                        </div>
                        {vipReception.locationName && (
                          <div style={{ textAlign: 'center', maxWidth: '45%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 3 }}>
                              <MapPin style={{ width: vipDetailSize + 2, height: vipDetailSize + 2, color: '#2563eb' }} />
                              <span style={{ fontWeight: 600, fontSize: vipDetailSize }}>Location</span>
                            </div>
                            <div style={{ fontWeight: 'bold', fontSize: vipDetailSize }} dangerouslySetInnerHTML={{ __html: vipReception.locationName }} />
                            {vipReception.locationAddress && (
                              <div style={{ fontSize: vipDetailSize }} dangerouslySetInnerHTML={{ __html: vipReception.locationAddress }} />
                            )}
                            {vipReception.locationRoom && (
                              <div style={{ fontSize: vipDetailSize, fontWeight: 600 }}>Room: {vipReception.locationRoom}</div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* description paragraphs */}
                      <div style={{ textAlign: 'center', color: '#4b5563', fontSize: vipBodySize, lineHeight: 1.4 }}>
                        {vipDescription && <p style={{ marginBottom: 5 }} dangerouslySetInnerHTML={{ __html: vipDescription }} />}
                        {vipAdditionalInfo && <p style={{ marginBottom: 5 }} dangerouslySetInnerHTML={{ __html: vipAdditionalInfo }} />}
                        {vipAdditionalInfo2 && <p>{vipAdditionalInfo2}</p>}
                      </div>

                      {/* map image */}
                      {mapImagePath && (
                        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: 10 }}>
                          <img
                            src={mapImagePath}
                            alt="Directions map"
                            style={{ width: `${mapImageScale}%`, objectFit: 'contain', borderRadius: 6 }}
                            crossOrigin="anonymous"
                          />
                        </div>
                      )}

                      {/* reception sponsors */}
                      {receptionSponsors.length > 0 && (
                        <div style={{ marginTop: 14 }}>
                          <h3 style={{ textAlign: 'center', fontWeight: 'bold', fontSize: vipHeadingSize, marginBottom: 10, lineHeight: 1.2 }}>
                            Thank You to our Reception Sponsors
                          </h3>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                            {receptionSponsors.map((sponsor) => (
                              <div key={sponsor._id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                                <img
                                  src={`/api/admin/banner-generator/proxy-image?url=${encodeURIComponent(sponsor.logoUrl)}`}
                                  alt={sponsor.name}
                                  style={{
                                    maxWidth: `${vipSponsorScale}%`,
                                    maxHeight: 1.1 * vipSponsorScale,
                                    width: 'auto',
                                    height: 'auto',
                                    objectFit: 'contain',
                                  }}
                                />
                                {vipShowSponsorDescriptions && sponsor.description && (
                                  <p
                                    style={{
                                      fontSize: vipBodySize,
                                      maxWidth: '85%',
                                      textAlign: 'center',
                                      color: '#4b5563',
                                      marginTop: 4,
                                      lineHeight: 1.4,
                                    }}
                                  >
                                    {sponsor.description}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
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
