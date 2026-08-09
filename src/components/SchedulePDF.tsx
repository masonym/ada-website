'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, PDFDownloadLink, PDFViewer, Image, BlobProvider } from '@react-pdf/renderer';
import { Event } from '@/types/events';
import { EventSpeakerPublic } from '@/lib/sanity';
import { htmlToText } from '@/lib/html';
import { PageColumns, paginateSchedule, SPONSOR_PAGE_KEY } from '@/lib/schedule-pdf-layout';
import { getCityAndState } from '@/utils/event-callout';

/** "Hotel Polaris, Colorado Springs, Colorado" - venue plus city/state from the event */
export const buildLocationLine = (event: Event): string => {
  const venue = event.venueName?.trim();
  const cityState = getCityAndState(event);
  return [venue, cityState].filter(Boolean).join(', ') || (event.locationAddress ?? '');
};

// helper to get sanity image URL for PDF
function getSanityImageUrl(ref: string, opts?: { width?: number; height?: number }) {
  // Sanity refs look like: "image-<assetId>-<dimensions>-<format>"
  const refWithoutPrefix = ref.replace('image-', '');
  const parts = refWithoutPrefix.split('-');
  if (parts.length < 3) return null;

  const format = parts.pop();
  const dimensions = parts.pop();
  const assetId = parts.join('-');

  const baseUrl = `https://cdn.sanity.io/images/nc4xlou0/production/${assetId}-${dimensions}.${format}`;

  const width = opts?.width ?? 96;
  const height = opts?.height ?? 96;

  // force a PDF-friendly format and explicit sizing to leverage CDN caching
  return `${baseUrl}?w=${width}&h=${height}&fit=crop&fm=png&q=80`;
}

function getAbsoluteUrl(path: string) {
  if (typeof window !== 'undefined') {
    return new URL(path, window.location.origin).href;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://americandefensealliance.org';
  return new URL(path, siteUrl).href;
}

function getProxiedImageUrl(remoteUrl: string) {
  return getAbsoluteUrl(`/api/proxy-image?url=${encodeURIComponent(remoteUrl)}`);
}

// Define schedule types locally since they may not be directly exported from the project
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

// helper function to resolve speaker data from sanity (same as Schedule.tsx)
const resolveSpeaker = (speaker: Speaker, sanitySpeakerMap?: Map<string, EventSpeakerPublic>): Speaker => {
  if (speaker.speakerId && sanitySpeakerMap?.has(speaker.speakerId)) {
    const speakerData = sanitySpeakerMap.get(speaker.speakerId)!;
    return {
      ...speaker,
      // Use manual overrides if they exist, otherwise fall back to Sanity data.
      // react-pdf has no HTML renderer, so the authored name is flattened.
      name: speaker.name?.trim() ? speaker.name : htmlToText(speakerData.speakerName),
      title: speaker.title?.trim() ? speaker.title : speakerData.speakerPosition,
      affiliation: speaker.affiliation?.trim() ? speaker.affiliation : speakerData.speakerCompany,
      photo: undefined, // Sanity uses sanityImage
      sanityImage: speakerData.speakerImage,
    };
  }
  // Return original speaker data if no speakerId or speaker not found
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

// Layout customization options passed from the controls panel
export type PDFLayoutOptions = {
  pagePadding: number;
  itemSpacing: number;
  titleFontSize: number;
  timeFontSize: number;
  speakerNameFontSize: number;
  speakerDetailFontSize: number;
  speakerImageSize: number;
  showSpeakerImages: boolean;
};

export const DEFAULT_PDF_LAYOUT: PDFLayoutOptions = {
  pagePadding: 8,
  itemSpacing: 2,
  titleFontSize: 10.5,
  timeFontSize: 9.5,
  speakerNameFontSize: 8.5,
  speakerDetailFontSize: 8,
  speakerImageSize: 24,
  showSpeakerImages: true,
};

// "sign up for the next event" promo box dropped into leftover column space
export type ScheduleCalloutForPDF = {
  heading: string;
  footer?: string;
  /** PNG data URL - generated browser-side so react-pdf can embed it */
  qrDataUrl?: string;
  backgroundColor?: string;
  textColor?: string;
  qrSize?: number;
  placement?: {
    /**
     * auto        - end of the schedule, walking back until a column has room
     * largest-gap - the emptiest column anywhere in the document
     * each-day    - repeat on the final page of every day
     * page        - exactly where `page` says, room permitting or not
     */
    mode: 'auto' | 'largest-gap' | 'each-day' | 'page';
    column: 'auto' | 'left' | 'right';
    /** target for mode 'page': a day's date plus the page index within that day */
    page?: { date: string; pageIndex: number };
  };
};

// sponsor types for PDF rendering
export type SponsorForPDF = {
  id: string;
  name: string;
  logoUrl: string;
};

export type SponsorTierForPDF = {
  id: string;
  name: string;
  style?: string;
  sponsors: SponsorForPDF[];
  sizeMultiplier?: number;
  /**
   * column - stacked inside the emptiest column (default)
   * band   - full-width strip below both columns, to soak up bottom whitespace
   * midday - side-by-side row on a page that isn't the day's last
   * page   - its own full-width page at the end
   */
  placement?: 'column' | 'band' | 'midday' | 'page';
  /** @deprecated superseded by `placement` */
  fullPage?: boolean;
  midPage?: boolean;
};

export const tierPlacement = (tier: SponsorTierForPDF): 'column' | 'band' | 'midday' | 'page' =>
  tier.placement ?? (tier.fullPage ? 'page' : tier.midPage ? 'midday' : 'column');

// tier display order (same as BannerGeneratorPage / SponsorLogos.tsx)
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
    if (name.includes(TIER_ORDER[i])) return i;
  }
  return TIER_ORDER.length;
};

// react-pdf can't read Tailwind, so every class the CMS or the admin badge
// presets can produce needs a hex here. Keep in sync with BADGE_PRESETS
// (admin/schedules) and TIER_STYLE_PRESETS (admin/sponsors) - a class that is
// missing falls back to the default colour, which reads as a styling bug.
const TAILWIND_BG_HEX: Record<string, string> = {
  'bg-red-999': '#FF3131',
  'bg-amber-400': '#fbbf24',
  'bg-amber-700': '#b45309',
  'bg-amber-800': '#92400e',
  'bg-amber-900': '#78350f',
  'bg-orange-800': '#9a3412',
  'bg-orange-900': '#7c2d12',
  'bg-orange-950': '#431407',
  'bg-yellow-300': '#fde047',
  'bg-yellow-700': '#a16207',
  'bg-green-700': '#15803d',
  'bg-green-800': '#166534',
  'bg-emerald-600': '#059669',
  'bg-teal-500': '#14b8a6',
  'bg-cyan-600': '#0891b2',
  'bg-gray-300': '#d1d5db',
  'bg-gray-500': '#6b7280',
  'bg-slate-700': '#334155',
  'bg-sky-300': '#7dd3fc',
  'bg-blue-500': '#3b82f6',
  'bg-blue-600': '#2563eb',
  'bg-blue-800': '#1e40af',
  'bg-indigo-600': '#4f46e5',
  'bg-purple-600': '#9333ea',
  'bg-rose-600': '#e11d48',
  'bg-navy-800': '#1B212B',
  'bg-sb-100': '#3FB4E6',
};

const TAILWIND_TEXT_HEX: Record<string, string> = {
  'text-slate-900': '#0f172a',
  'text-white': '#ffffff',
};

/**
 * Resolves an authored Tailwind colour string to PDF colours. Arbitrary values
 * (bg-[#40E0D0]) win over named classes, the way Tailwind resolves them itself.
 */
const resolveStyleColours = (
  style: string,
  fallback: { backgroundColor: string; color: string }
): { backgroundColor: string; color: string } => {
  let { backgroundColor, color } = fallback;

  const bgClass = Object.keys(TAILWIND_BG_HEX).find(cls => style.includes(cls));
  if (bgClass) backgroundColor = TAILWIND_BG_HEX[bgClass];

  const bgHex = style.match(/bg-\[(#[0-9a-fA-F]{3,8})\]/);
  if (bgHex) backgroundColor = bgHex[1];

  const textClass = Object.keys(TAILWIND_TEXT_HEX).find(cls => style.includes(cls));
  if (textClass) color = TAILWIND_TEXT_HEX[textClass];

  const textHex = style.match(/text-\[(#[0-9a-fA-F]{3,8})\]/);
  if (textHex) color = textHex[1];

  return { backgroundColor, color };
};

// convert Tailwind tier style classes to PDF-compatible colors
const convertTierStyleToPDF = (tierName: string, style?: string): { backgroundColor: string; color: string } => {
  // if an explicit style string is provided, parse it
  if (style) {
    return resolveStyleColours(style, { backgroundColor: '#0047AB', color: '#ffffff' });
  }

  // fallback: derive from tier name. Mirrors getDefaultTierStyle in
  // src/lib/sponsor-tier-styles.ts, plus the tiers only the PDF renders.
  const name = tierName.toLowerCase();
  if (name.includes('small')) return { backgroundColor: '#40E0D0', color: '#0f172a' };
  if (name.includes('coffee')) return { backgroundColor: '#966919', color: '#ffffff' };
  if (name.includes('panel')) return { backgroundColor: '#F33A6A', color: '#ffffff' };
  if (name.includes('gold')) return { backgroundColor: '#fbbf24', color: '#0f172a' };
  if (name.includes('silver')) return { backgroundColor: '#d1d5db', color: '#0f172a' };
  if (name.includes('bronze')) return { backgroundColor: '#b45309', color: '#ffffff' };
  if (name.includes('premier')) return { backgroundColor: '#9333ea', color: '#ffffff' };
  if (name.includes('platinum')) return { backgroundColor: '#7dd3fc', color: '#0f172a' };
  if (name.includes('diamond')) return { backgroundColor: '#3b82f6', color: '#ffffff' };
  if (name.includes('cmmc')) return { backgroundColor: '#fde047', color: '#0f172a' };
  if (name.includes('exhibitor')) return { backgroundColor: '#1B212B', color: '#ffffff' };
  if (name.includes('vip')) return { backgroundColor: '#7dd3fc', color: '#ffffff' };
  if (name.includes('networking')) return { backgroundColor: '#0891b2', color: '#ffffff' };
  if (name.includes('luncheon')) return { backgroundColor: '#059669', color: '#ffffff' };
  if (name.includes('beverage')) return { backgroundColor: '#0891b2', color: '#ffffff' };
  if (name.includes('partner')) return { backgroundColor: '#1B212B', color: '#ffffff' };
  return { backgroundColor: '#2563eb', color: '#ffffff' };
};

// Register fonts (we can add Gotham font files if available)
Font.register({
  family: 'Gotham',
  src: '/fonts/Gotham-Bold.otf',
  fontStyle: 'normal',
  fontWeight: 'bold',
});

// Create styles
const styles = StyleSheet.create({
  textWrap: {
    display: "flex",
    flexWrap: "wrap",
    flexGrow: 1,
    flexBasis: 0,
    padding: 2,
  },
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 10,
    fontSize: 10,
  },
  header: {
    marginBottom: 0,
    textAlign: 'center',
    paddingBottom: 0,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: 'hsl(240, 100%, 40%)',
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 2,
    color: '#666666',
  },
  dayHeader: {
    backgroundColor: '#58799c',
    color: 'white',
    padding: 6,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 0,
  },
  scheduleItem: {
    flexDirection: 'row',
    marginBottom: 2,
    paddingBottom: 0,
    marginTop: 4,
    breakInside: 'avoid',
    pageBreakInside: 'avoid',
  },
  timeColumn: {
    width: '20%',
    paddingRight: 6,
    flexShrink: 0,
  },
  contentColumn: {
    width: '82%',
    flex: 1,
  },
  time: {
    fontWeight: 'bold',
    fontSize: 9,
    color: '#0047AB',
  },
  itemTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 2,
    lineHeight: 1.2,
  },
  description: {
    fontSize: 9,
    marginBottom: 3,
    lineHeight: 1.3,
    color: '#333333',
  },
  speakersContainer: {
    marginTop: 3,
    marginBottom: 2,
  },
  speaker: {
    fontSize: 8,
    marginBottom: 2,
    color: '#444444',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  speakerImageContainer: {
    marginRight: 6,
    flexShrink: 0,
  },
  speakerImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  speakerInfo: {
    flex: 1,
  },
  speakerName: {
    fontWeight: 'bold',
    fontSize: 8,
    marginBottom: 1,
  },
  speakerTitle: {
    fontSize: 8,
    fontStyle: 'italic',
    color: '#666666',
    marginBottom: 1,
    textWrap: 'balance',
    maxWidth: '90%',
  },
  speakerAffiliation: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#0047AB',
  },
  discussantLabel: {
    fontSize: 8,
    textDecoration: 'underline',
    textDecorationStyle: 'solid',
    textDecorationColor: '#1B212B',
    color: '#1B212B',
    fontWeight: 'normal',
    marginBottom: 1,
  },
  speakerSponsor: {
    fontSize: 8,
    color: '#fff',
    backgroundColor: '#dc2626', // Default red background
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
    marginTop: 2,
    alignSelf: 'flex-start',
  },
  location: {
    fontSize: 8,
    color: '#666666',
    fontStyle: 'italic',
    marginTop: 1,
    marginBottom: 2,
  },
  columnsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    width: '48%',
    flexDirection: 'column',
  },
  footer: {
    // position: 'absolute',
    // bottom: 20,
    // left: 20,
    // right: 20,
    textAlign: 'center',
    fontSize: 8,
    color: '#666666',
    // borderTopWidth: 0.5,
    // borderTopColor: '#CCCCCC',
    marginTop: 2,
    marginBottom: 2,
  },
  sponsorSection: {
    marginTop: 8,
    paddingTop: 4,
  },
  sponsorTierHeader: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: '#58799c',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 2,
    textAlign: 'center',
    marginBottom: 6,
    alignSelf: 'center',
  },
  sponsorLogoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  sponsorLogoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  sponsorLogo: {
    objectFit: 'contain',
  },
  callout: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  calloutHeading: {
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 1.35,
    marginBottom: 8,
  },
  calloutQrPlate: {
    backgroundColor: '#ffffff',
    padding: 5,
  },
  calloutFooter: {
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 1.3,
    marginTop: 8,
  },
});

Font.registerHyphenationCallback((word) => {
  return [word];
});

// Speaker badge ("Gold Sponsor", "Moderator", ...) colours for the PDF
const convertSponsorStyleToPDF = (sponsorStyle?: string) => {
  const fallback = { backgroundColor: '#FF3131', color: '#fff' };
  if (!sponsorStyle) return fallback;

  return resolveStyleColours(sponsorStyle, fallback);
};

// Schedule PDF Document Component
const SchedulePDF = ({
  schedule,
  event,
  showSpeakers = true,
  showLocations = true,
  customTitle = '',
  customSubtitle = '',
  selectedDays = [],
  twoColumnLayout = true,
  sanitySpeakers,
  sponsorTiers = [],
  fullPageFooterImage,
  layoutOptions = DEFAULT_PDF_LAYOUT,
  showConferenceModerator = false,
  callout,
  sponsorPlacement,
  locationLine,
}: {
  schedule: ScheduleDay[];
  event: Event;
  showSpeakers?: boolean;
  showLocations?: boolean;
  customTitle?: string;
  customSubtitle?: string;
  selectedDays?: string[];
  twoColumnLayout?: boolean;
  sanitySpeakers?: EventSpeakerPublic[] | null;
  sponsorTiers?: SponsorTierForPDF[];
  fullPageFooterImage?: string;
  layoutOptions?: PDFLayoutOptions;
  showConferenceModerator?: boolean;
  callout?: ScheduleCalloutForPDF | null;
  /** pin the in-column logo block to a day's last page; omit for automatic */
  sponsorPlacement?: { date: string } | null;
  /** overrides the venue line under the title; omit to derive it from the event */
  locationLine?: string;
}) => {
  const lo = { ...DEFAULT_PDF_LAYOUT, ...layoutOptions };
  const venueLine = locationLine?.trim() || buildLocationLine(event);

  // Build sanity speaker lookup map - keyed by both slug and _id to handle
  // schedule items from the public GROQ (speakerId = slug.current)
  // or the admin GROQ (speakerId = Sanity _id)
  const sanitySpeakerMap = new Map<string, EventSpeakerPublic>();
  if (sanitySpeakers) {
    sanitySpeakers.forEach(s => {
      if (s.speakerSlug) sanitySpeakerMap.set(s.speakerSlug, s);
      if (s.speakerId) sanitySpeakerMap.set(s.speakerId, s);
    });
  }
  // Filter schedule based on selected days
  const filteredSchedule = selectedDays.length > 0
    ? schedule.filter(day => selectedDays.includes(day.date))
    : schedule;

  // Render a single schedule item
  const renderScheduleItem = (item: ScheduleItem, index: number, prevItem?: ScheduleItem) => (
    <View style={[styles.scheduleItem, { marginTop: lo.itemSpacing }]} key={`${item.time}-${item.title}-${index}`} wrap={false}>
      <View style={styles.timeColumn}>
        <Text style={[styles.time, { fontSize: lo.timeFontSize }]}>{item.time}</Text>
      </View>
      <View style={styles.contentColumn}>
        <Text style={[styles.itemTitle, { fontSize: lo.titleFontSize }]}>{item.title}</Text>
        {/* {item.description && (
          <Text style={[styles.description, { fontSize: lo.speakerDetailFontSize }]}>{item.description}</Text>
        )} */}
        {showSpeakers && item.speakers && item.speakers.length > 0 && (
          <View style={styles.speakersContainer}>
            {item.speakers.map((speaker, speakerIndex) => {
              // Get speaker image for PDF
              const speakerData = resolveSpeaker(speaker, sanitySpeakerMap);
              const isDiscussant =
                speakerData.speakerId === 'nelinia-nel-varenus' &&
                item.time === '12:25 PM';
              const sanityUrl = lo.showSpeakerImages && speakerData.sanityImage?.asset?._ref
                ? getSanityImageUrl(speakerData.sanityImage.asset._ref, { width: 96, height: 96 })
                : null;
              const imageSrc = sanityUrl ? getProxiedImageUrl(sanityUrl) : null;
              const imgSize = lo.speakerImageSize;

              return (
                <View key={speakerIndex} style={styles.speaker}>
                  {imageSrc && (
                    <View style={[styles.speakerImageContainer]}>
                      <Image
                        src={imageSrc}
                        style={[styles.speakerImage, { width: imgSize, height: imgSize, borderRadius: imgSize / 2 }]}
                        cache={true}
                      />
                    </View>
                  )}
                  <View style={styles.speakerInfo}>
                    <Text style={[styles.speakerName, { fontSize: lo.speakerNameFontSize }]}>
                      {isDiscussant && (
                        <View>
                          <Text style={styles.discussantLabel}>Discussant</Text><Text>: </Text>
                        </View>
                      )}
                      {speakerData.name}
                    </Text>
                    {speakerData.title && (
                      <Text style={[styles.speakerTitle, { fontSize: lo.speakerDetailFontSize }]}>{speakerData.title}</Text>
                    )}
                    {speakerData.affiliation && (
                      <Text style={[styles.speakerAffiliation, { fontSize: lo.speakerDetailFontSize }]}>{speakerData.affiliation}</Text>
                    )}
                    {speakerData.sponsor && (
                      <Text style={{
                        ...styles.speakerSponsor,
                        ...convertSponsorStyleToPDF(speakerData.sponsorStyle),
                        fontSize: lo.speakerDetailFontSize,
                      }}>{speakerData.sponsor}</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
        {showLocations && item.location && item.location !== prevItem?.location && (
          <Text style={styles.location}>Location: {item.location}</Text>
        )}
      </View>
    </View>
  );





  const paginatedSchedule = paginateSchedule<ScheduleItem>(filteredSchedule, {
    twoColumnLayout,
    showSpeakers,
    showLocations,
  });

  // --- Leftover column space ---
  // Real column height on a LETTER page once the title block and day header are
  // drawn. CONTENT_HEIGHT is a looser budget tuned for pagination only.
  const columnBudget = 792 - lo.pagePadding * 2 - 95;
  // estimateItemHeight overshoots the real layout by ~5-15%; stay at the low end
  // of that so nothing we drop into a column spills onto a page of its own.
  const ESTIMATE_SLACK = 0.95;
  const PLACEMENT_COLUMNS = twoColumnLayout ? (['left', 'right'] as const) : (['left'] as const);

  const columnFill = (page: PageColumns<ScheduleItem>, column: 'left' | 'right') =>
    (column === 'left' ? page.leftHeight : page.rightHeight) * ESTIMATE_SLACK;

  /**
   * Band tiers span the whole page, so sizing them by sponsor count wastes the
   * width they were given. Pick the logo size that fills a row instead, then
   * shrink if the resulting rows would outgrow the strip they live in.
   */
  const getBandLogoSize = (
    sponsorCount: number,
    multiplier: number,
    availableWidth: number,
    availableHeight: number
  ) => {
    const GAP = 10;
    const MIN_WIDTH = 40;
    const MAX_WIDTH = 150;
    const ASPECT = 90 / 50; // matches the widest count-based size
    const ROW_GAP = 8;

    const arrangement = (rows: number) => {
      const perRow = Math.ceil(sponsorCount / rows);
      const width = Math.min(MAX_WIDTH, availableWidth / perRow - GAP);
      const height = width / ASPECT;
      return { perRow, rows, width, height, blockHeight: rows * (height + ROW_GAP) };
    };

    // fewer logos per row means bigger logos but more rows - take the biggest
    // arrangement the strip can still hold, so leftover height gets used
    let best: ReturnType<typeof arrangement> | null = null;
    for (let rows = 1; rows <= sponsorCount; rows++) {
      const candidate = arrangement(rows);
      if (candidate.width < MIN_WIDTH) continue;
      if (availableHeight > 0 && candidate.blockHeight > availableHeight) continue;
      if (!best || candidate.width > best.width) best = candidate;
    }

    // nothing fit the strip: take the flattest arrangement and shrink into it
    if (!best) {
      const maxPerRow = Math.max(1, Math.floor(availableWidth / (MIN_WIDTH + GAP)));
      best = arrangement(Math.max(1, Math.ceil(sponsorCount / maxPerRow)));
      if (availableHeight > 0 && best.blockHeight > availableHeight) {
        const scale = availableHeight / best.blockHeight;
        best = { ...best, width: best.width * scale, height: best.height * scale };
      }
    }

    return {
      width: Math.max(1, Math.round(best.width * multiplier)),
      height: Math.max(1, Math.round(best.height * multiplier)),
      perRow: best.perRow,
      blockHeight: best.blockHeight,
    };
  };

  // scale logos based on sponsor count within a tier
  const getLogoSize = (sponsorCount: number, multiplier: number = 1) => {
    let w = 60;
    let h = 36;
    if (sponsorCount <= 2) { w = 90; h = 50; }
    else if (sponsorCount <= 4) { w = 72; h = 42; }
    else if (sponsorCount <= 8) { w = 60; h = 36; }
    else { w = 48; h = 30; }
    return { width: Math.round(w * multiplier), height: Math.round(h * multiplier) };
  };

  // --- Sponsor section placement ---
  // Tiers used to render underneath both columns, which only left them the space
  // below the *taller* column - usually none, so they spilled onto a page of
  // their own while a half-empty column sat next to them. They now claim the
  // emptiest column on a day's last page, falling back to the old full-width
  // block when neither column can take them.
  const endOfDayTiers = sponsorTiers.filter(t => tierPlacement(t) === 'column');
  const bandTiers = sponsorTiers.filter(t => tierPlacement(t) === 'band');

  // a column is 48% of the printable width
  const columnWidth = (612 - lo.pagePadding * 2) * 0.48;

  const estimateSponsorSectionHeight = (tiers: SponsorTierForPDF[], width: number) =>
    tiers.reduce((total, tier) => {
      const { width: logoW, height: logoH } = getLogoSize(tier.sponsors.length, tier.sizeMultiplier || 1);
      // bronze is forced to two per row; everything else wraps to fit
      const perRow = tier.name.toLowerCase().includes('bronze')
        ? 2
        : Math.max(1, Math.floor(width / (logoW + 12)));
      const rows = Math.ceil(tier.sponsors.length / perRow);
      return total + 22 /* tier pill + margin */ + rows * (logoH + 8) + 6;
    }, 12 /* section margin + padding */);

  // the logos appear once for the whole document, not once per day
  let sponsorSlot: string | null = null;
  // slot key -> height already claimed there, so the callout doesn't double-book it
  const claimedHeight = new Map<string, number>();

  if (endOfDayTiers.length > 0 && twoColumnLayout) {
    const sponsorHeight = estimateSponsorSectionHeight(endOfDayTiers, columnWidth);

    const emptiestColumn = (page: PageColumns<ScheduleItem>, requireRoom: boolean) =>
      PLACEMENT_COLUMNS
        .map(column => ({ column, remaining: columnBudget - columnFill(page, column) }))
        .filter(c => !requireRoom || c.remaining >= sponsorHeight)
        // right column first on a tie - it reads as the end of the page
        .sort((a, b) => b.remaining - a.remaining || (a.column === 'right' ? -1 : 1))[0];

    const pinnedDay = sponsorPlacement?.date
      ? paginatedSchedule.findIndex(d => d.date === sponsorPlacement.date)
      : -1;

    if (pinnedDay >= 0) {
      // an explicit choice wins even if the estimate says it is tight
      const pageIndex = paginatedSchedule[pinnedDay].pages.length - 1;
      const page = paginatedSchedule[pinnedDay].pages[pageIndex];
      const best = page && emptiestColumn(page, false);
      if (best) {
        sponsorSlot = `${pinnedDay}-${pageIndex}-${best.column}`;
        claimedHeight.set(sponsorSlot, sponsorHeight);
      }
    } else {
      // work backwards from the end of the schedule, so the logos land on the
      // last page with room rather than the first
      for (let dayIndex = paginatedSchedule.length - 1; dayIndex >= 0 && !sponsorSlot; dayIndex--) {
        const day = paginatedSchedule[dayIndex];
        const pageIndex = day.pages.length - 1;
        const page = day.pages[pageIndex];
        if (!page) continue;

        const best = emptiestColumn(page, true);
        if (best) {
          sponsorSlot = `${dayIndex}-${pageIndex}-${best.column}`;
          claimedHeight.set(sponsorSlot, sponsorHeight);
        }
      }
    }
  }

  // --- Band placement ---
  // A band sits below both columns, so its room is what's left under the
  // *taller* column. Fills the whitespace a short final page leaves behind.
  let bandSlot: string | null = null;
  let bandRoom = 0;

  if (bandTiers.length > 0) {
    const bottomRoom = (dayIndex: number, pageIndex: number, page: PageColumns<ScheduleItem>) => {
      // anything already dropped into a column counts against the strip below it
      const fill = (column: 'left' | 'right') =>
        columnFill(page, column) + (claimedHeight.get(`${dayIndex}-${pageIndex}-${column}`) ?? 0);
      return columnBudget - Math.max(fill('left'), fill('right'));
    };

    const pinnedDay = sponsorPlacement?.date
      ? paginatedSchedule.findIndex(d => d.date === sponsorPlacement.date)
      : -1;

    if (pinnedDay >= 0) {
      const pageIndex = paginatedSchedule[pinnedDay].pages.length - 1;
      const page = paginatedSchedule[pinnedDay].pages[pageIndex];
      if (page) {
        bandSlot = `${pinnedDay}-${pageIndex}`;
        bandRoom = bottomRoom(pinnedDay, pageIndex, page);
      }
    } else {
      // otherwise the page with the deepest empty strip
      let best = -Infinity;
      paginatedSchedule.forEach((day, dayIndex) => {
        const pageIndex = day.pages.length - 1;
        const page = day.pages[pageIndex];
        if (!page) return;
        const room = bottomRoom(dayIndex, pageIndex, page);
        if (room > best) {
          best = room;
          bandSlot = `${dayIndex}-${pageIndex}`;
          bandRoom = room;
        }
      });
    }
  }

  // --- Callout placement ---
  // The callout drops into whichever column has the most leftover space, using
  // the same height estimates that drive pagination.
  const CALLOUT_QR_SIZE_DEFAULT = 130;

  const estimateCalloutHeight = (c: ScheduleCalloutForPDF) => {
    // a column is ~48% of the printable width, so ~40 bold 11pt chars per line
    const CHARS_PER_LINE = 40;
    const countLines = (text?: string) =>
      (text ?? '')
        .split('\n')
        .reduce((lines, line) => lines + Math.max(1, Math.ceil(line.length / CHARS_PER_LINE)), 0);

    const qrSize = c.qrSize ?? CALLOUT_QR_SIZE_DEFAULT;
    const box = 30; // vertical padding + top margin
    const heading = c.heading ? countLines(c.heading) * 15 + 8 : 0;
    const qr = c.qrDataUrl ? qrSize + 10 : 0;
    const footer = c.footer ? countLines(c.footer) * 16 + 8 : 0;

    return box + heading + qr + footer;
  };

  // slots are keyed `${dayIndex}-${pageIndex}-${column}`
  const calloutSlots = new Set<string>();

  // targeting the dedicated sponsor page takes the callout out of column placement
  const calloutOnSponsorPage =
    !!callout &&
    callout.placement?.mode === 'page' &&
    callout.placement.page?.date === SPONSOR_PAGE_KEY;

  if (calloutOnSponsorPage) {
    // rendered with the full-page tiers further down
  } else if (callout && callout.placement?.mode === 'page' && callout.placement.page) {
    // explicit target: honour it whether or not the estimate says it fits
    const { date, pageIndex } = callout.placement.page;
    const dayIndex = paginatedSchedule.findIndex(d => d.date === date);
    const page = dayIndex >= 0 ? paginatedSchedule[dayIndex].pages[pageIndex] : undefined;

    if (page) {
      const forcedColumn = callout.placement.column;
      const column = forcedColumn !== 'auto'
        ? forcedColumn
        : PLACEMENT_COLUMNS
            .map(c => ({
              c,
              remaining: columnBudget - columnFill(page, c) - (claimedHeight.get(`${dayIndex}-${pageIndex}-${c}`) ?? 0),
            }))
            .sort((a, b) => b.remaining - a.remaining || (a.c === 'right' ? -1 : 1))[0].c;

      calloutSlots.add(`${dayIndex}-${pageIndex}-${column}`);
    }
  } else if (callout) {
    const mode = callout.placement?.mode ?? 'auto';
    const forcedColumn = callout.placement?.column ?? 'auto';
    const calloutHeight = estimateCalloutHeight(callout);

    type Candidate = { dayIndex: number; pageIndex: number; column: 'left' | 'right'; remaining: number; score: number };
    const candidates: Candidate[] = [];

    paginatedSchedule.forEach((day, dayIndex) => {
      // only a day's final page has genuine leftover space - earlier pages are packed
      const pageIndex = day.pages.length - 1;
      const page = day.pages[pageIndex];
      if (!page) return;

      PLACEMENT_COLUMNS.forEach(column => {
        if (forcedColumn !== 'auto' && forcedColumn !== column) return;

        const key = `${dayIndex}-${pageIndex}-${column}`;
        // sponsors get first claim on a column; the callout takes what's left
        const remaining = columnBudget - columnFill(page, column) - (claimedHeight.get(key) ?? 0);
        if (remaining < calloutHeight) return;

        candidates.push({ dayIndex, pageIndex, column, remaining, score: remaining });
      });
    });

    // right column first on ties - it reads as the end of the page
    const preferRight = (a: Candidate, b: Candidate) =>
      a.column === b.column ? 0 : a.column === 'right' ? -1 : 1;

    // 'largest-gap' hunts for the emptiest column anywhere; the others work
    // backwards from the end of the schedule, which is where a sign-up
    // prompt belongs, and only walk earlier when nothing there has room
    const byGap = (a: Candidate, b: Candidate) =>
      b.score - a.score || b.dayIndex - a.dayIndex || preferRight(a, b);
    const byLatest = (a: Candidate, b: Candidate) =>
      b.dayIndex - a.dayIndex || b.score - a.score || preferRight(a, b);

    if (mode === 'each-day') {
      // one callout per day, on that day's emptiest trailing column
      paginatedSchedule.forEach((_, dayIndex) => {
        const best = candidates.filter(c => c.dayIndex === dayIndex).sort(byGap)[0];
        if (best) calloutSlots.add(`${best.dayIndex}-${best.pageIndex}-${best.column}`);
      });
    } else {
      const best = [...candidates].sort(mode === 'largest-gap' ? byGap : byLatest)[0];
      if (best) calloutSlots.add(`${best.dayIndex}-${best.pageIndex}-${best.column}`);
    }
  }

  const renderCallout = (key: string) => {
    if (!callout) return null;
    const qrSize = callout.qrSize ?? CALLOUT_QR_SIZE_DEFAULT;
    const textColor = callout.textColor || '#ffffff';

    return (
      <View
        key={key}
        style={[styles.callout, { backgroundColor: callout.backgroundColor || '#5B9BD5' }]}
        wrap={false}
      >
        {callout.heading ? (
          <Text style={[styles.calloutHeading, { color: textColor }]}>{callout.heading}</Text>
        ) : null}
        {callout.qrDataUrl ? (
          <View style={styles.calloutQrPlate}>
            <Image src={callout.qrDataUrl} style={{ width: qrSize, height: qrSize }} cache={true} />
          </View>
        ) : null}
        {callout.footer ? (
          <Text style={[styles.calloutFooter, { color: textColor }]}>{callout.footer}</Text>
        ) : null}
      </View>
    );
  };

  // render sponsor tiers into remaining space after a day's content.
  // each tier is individually wrap={false} so react-pdf fits as many as possible
  // without breaking a single tier across pages.
  // sideBySide lays tiers out in one row (mid-day); otherwise they stack
  const renderSponsorSection = (
    dayDate: string,
    sideBySide: boolean,
    tiers: SponsorTierForPDF[],
    band?: { availableWidth: number; availableHeight: number }
  ) => {
    const columnTiers = tiers;
    if (columnTiers.length === 0) return null;

    // sort tiers by canonical order
    const sortedTiers = [...columnTiers].sort(
      (a, b) => getTierPriority(a.name) - getTierPriority(b.name)
    );

    // Share the strip out by sponsor count, but sequentially - a tier that
    // needs less than its share hands the rest to the tiers after it.
    const bandSizes = new Map<string, ReturnType<typeof getBandLogoSize>>();
    if (band) {
      let remainingHeight = Math.max(0, band.availableHeight - sortedTiers.length * 24 - 12);
      let remainingSponsors = sortedTiers.reduce((n, t) => n + t.sponsors.length, 0) || 1;

      sortedTiers.forEach(tier => {
        const share = remainingHeight * (tier.sponsors.length / Math.max(1, remainingSponsors));
        const size = getBandLogoSize(
          tier.sponsors.length,
          tier.sizeMultiplier || 1,
          band.availableWidth,
          share
        );
        bandSizes.set(tier.id, size);

        const rows = Math.ceil(tier.sponsors.length / size.perRow);
        remainingHeight = Math.max(0, remainingHeight - rows * (size.height + 8));
        remainingSponsors -= tier.sponsors.length;
      });
    }

    const renderTierBlock = (tier: typeof sortedTiers[0], dayDate: string, flex?: boolean) => {
      const multiplier = tier.sizeMultiplier || 1;
      const bandSize = bandSizes.get(tier.id) ?? null;
      const logoSize = bandSize ?? getLogoSize(tier.sponsors.length, multiplier);
      const pillStyle = convertTierStyleToPDF(tier.name, tier.style);

      if (bandSize) {
        // explicit balanced rows - the height estimate above assumes them
        const rowCount = Math.ceil(tier.sponsors.length / bandSize.perRow);
        return (
          <View key={`sponsor-tier-${dayDate}-${tier.id}`} style={{ marginBottom: 4 }} wrap={false}>
            <View style={{ alignItems: 'center', marginBottom: 4 }}>
              <Text style={[styles.sponsorTierHeader, {
                backgroundColor: pillStyle.backgroundColor,
                color: pillStyle.color,
              }]}>{tier.name}</Text>
            </View>
            {[...Array(rowCount)].map((_, rowIndex) => (
              <View key={rowIndex} style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 6 }}>
                {tier.sponsors
                  .slice(rowIndex * bandSize.perRow, rowIndex * bandSize.perRow + bandSize.perRow)
                  .map((sponsor) => (
                    <View
                      key={sponsor.id}
                      style={[styles.sponsorLogoContainer, { width: bandSize.width + 10, height: bandSize.height }]}
                    >
                      <Image
                        src={sponsor.logoUrl}
                        style={[styles.sponsorLogo, { maxWidth: bandSize.width, maxHeight: bandSize.height }]}
                        cache={true}
                      />
                    </View>
                  ))}
              </View>
            ))}
          </View>
        );
      }

      return (
        <View key={`sponsor-tier-${dayDate}-${tier.id}`} style={[{ marginBottom: 2 }, flex ? { flex: 1 } : {}]} wrap={false}>
          <View style={{ alignItems: 'center', marginBottom: 4 }}>
            <Text style={[styles.sponsorTierHeader, {
              backgroundColor: pillStyle.backgroundColor,
              color: pillStyle.color,
            }]}>{tier.name}</Text>
          </View>
          {tier.name.toLowerCase().includes('bronze') ? (
            <View>
              {[...Array(Math.ceil(tier.sponsors.length / 2))].map((_, rowIndex) => (
                <View key={rowIndex} style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 6 }}>
                  {tier.sponsors.slice(rowIndex * 2, rowIndex * 2 + 2).map((sponsor) => (
                    <View key={sponsor.id} style={[styles.sponsorLogoContainer, { width: logoSize.width + 4, height: logoSize.height + 0, marginHorizontal: 3 }]}>
                      <Image
                        src={sponsor.logoUrl}
                        style={[styles.sponsorLogo, { maxWidth: logoSize.width, maxHeight: logoSize.height }]}
                        cache={true}
                      />
                    </View>
                  ))}
                </View>
              ))}
            </View>
          ) : (
            <View style={flex
              ? { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 16 }
              : styles.sponsorLogoRow
            }>
              {tier.sponsors.map((sponsor) => (
                <View key={sponsor.id} style={flex
                  ? { alignItems: 'center', justifyContent: 'center', padding: 1 }
                  : [styles.sponsorLogoContainer, { width: logoSize.width + 4, height: logoSize.height + 0 }]
                }>
                  <Image
                    src={sponsor.logoUrl}
                    style={[styles.sponsorLogo, { maxWidth: logoSize.width, maxHeight: logoSize.height }]}
                    cache={true}
                  />
                </View>
              ))}
            </View>
          )}
        </View>
      );
    };

    return (
      <View style={styles.sponsorSection}>
        {sideBySide ? (
          // Mid-page: all tiers side-by-side in a single row
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }} wrap={false}>
            {sortedTiers.map((tier) => renderTierBlock(tier, dayDate, true))}
          </View>
        ) : (
          // End-of-day: tiers stacked vertically (existing behaviour)
          sortedTiers.map((tier) => renderTierBlock(tier, dayDate, false))
        )}
      </View>
    );
  };

  // Calculate global page index for tracking page 1
  let globalPageIndex = 0;

  return (
    <Document>
      {paginatedSchedule.map((day, dayIndex) =>
        day.pages.map((page, pageIndex) => {
          const isLastPageOfDay = pageIndex === day.pages.length - 1;
          const isPageOne = globalPageIndex === 0;
          globalPageIndex++;

          return (
            <Page key={`${day.date}-${pageIndex}`} size="LETTER" style={[styles.page, { padding: lo.pagePadding }]}>
              <View style={styles.header}>
                <Text style={styles.title}>{customTitle || `${event.title} Schedule`}</Text>
                {/* {(customSubtitle || event.date) && (
                  <Text style={styles.subtitle}>{customSubtitle || event.date}</Text>
                )} */}
              </View>
              <View style={styles.footer}>
                <Text style={{ fontSize: 12 }}>Presented by the <Text style={{ fontWeight: 'bold' }}>American Defense Alliance</Text> • <Text style={{ color: 'blue', textDecoration: 'underline' }}>www.americandefensealliance.org</Text></Text>
              </View>

              <View style={styles.footer}>
                <Text style={{ fontSize: 10, marginBottom: 2 }}>{venueLine}</Text>
              </View>
              {isPageOne && showConferenceModerator && (
                <Text style={{ textAlign: 'center', fontSize: 10, marginBottom: 4 }}>
                  <Text style={{ fontWeight: 'bold' }}>Conference Moderator:</Text> Charles F. Sills, President & CEO, American Defense Alliance
                </Text>
              )}

              <Text style={styles.dayHeader}>
                {new Date(day.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>

              <View style={styles.columnsContainer}>
                <View style={styles.column}>
                  {page.left.map((item, index) => renderScheduleItem(item, index, page.left[index - 1]))}
                  {sponsorSlot === `${dayIndex}-${pageIndex}-left` &&
                    renderSponsorSection(day.date, false, endOfDayTiers)}
                  {calloutSlots.has(`${dayIndex}-${pageIndex}-left`) &&
                    renderCallout(`callout-${dayIndex}-${pageIndex}-left`)}
                </View>
                <View style={styles.column}>
                  {page.right.map((item, index) => {
                    const prevItem = index === 0 ? page.left[page.left.length - 1] : page.right[index - 1];
                    // The key index needs to be unique across the whole page.
                    const keyIndex = page.left.length + index;
                    return renderScheduleItem(item, keyIndex, prevItem);
                  })}
                  {sponsorSlot === `${dayIndex}-${pageIndex}-right` &&
                    renderSponsorSection(day.date, false, endOfDayTiers)}
                  {calloutSlots.has(`${dayIndex}-${pageIndex}-right`) &&
                    renderCallout(`callout-${dayIndex}-${pageIndex}-right`)}
                </View>
              </View>
              {!isLastPageOfDay && sponsorTiers.some(t => tierPlacement(t) === 'midday') &&
                renderSponsorSection(day.date, true, sponsorTiers.filter(t => tierPlacement(t) === 'midday'))}

              {/* full-width strip under both columns, soaking up bottom whitespace */}
              {bandSlot === `${dayIndex}-${pageIndex}` &&
                renderSponsorSection(day.date, false, bandTiers, {
                  availableWidth: 612 - lo.pagePadding * 2,
                  availableHeight: bandRoom,
                })}
              {/* no column anywhere had room - fall back to a full-width block at the end */}
              {isLastPageOfDay && endOfDayTiers.length > 0 && !sponsorSlot &&
                dayIndex === paginatedSchedule.length - 1 &&
                renderSponsorSection(day.date, false, endOfDayTiers)}

              {/* nothing had room for it (single column, or every column full) - fall back to the end of the schedule */}
              {callout && !calloutOnSponsorPage && calloutSlots.size === 0 && isLastPageOfDay && dayIndex === paginatedSchedule.length - 1 && (
                <View style={{ alignItems: 'center' }}>
                  <View style={{ width: '48%' }}>{renderCallout('callout-fallback')}</View>
                </View>
              )}
            </Page>
          );
        })
      )}
      {/* full-page sponsor tiers on dedicated pages */}
      {sponsorTiers.filter(t => t.fullPage).length > 0 && (() => {
        const fullPageTiers = [...sponsorTiers.filter(t => t.fullPage)].sort(
          (a, b) => getTierPriority(a.name) - getTierPriority(b.name)
        );
        const getLogoSizeFP = (sponsorCount: number, multiplier: number = 1) => {
          let w = 100; let h = 60;
          if (sponsorCount <= 4) { w = 140; h = 80; }
          else if (sponsorCount <= 8) { w = 120; h = 70; }
          else if (sponsorCount <= 16) { w = 100; h = 60; }
          else { w = 80; h = 50; }
          return { width: Math.round(w * multiplier), height: Math.round(h * multiplier) };
        };
        return (
          <Page size="LETTER" style={styles.page}>
            <View style={styles.header}>
              <Text style={styles.title}>{customTitle || `${event.title} Schedule`}</Text>
            </View>
            <View style={styles.footer}>
                <Text style={{ fontSize: 12 }}>Presented by the <Text style={{ fontWeight: 'bold' }}>American Defense Alliance</Text> • <Text style={{ color: 'blue', textDecoration: 'underline' }}>www.americandefensealliance.org</Text></Text>
            </View>
            <View style={styles.footer}>
              <Text style={{ fontSize: 10 }}>{venueLine}</Text>
            </View>
            {calloutOnSponsorPage && (
              <View style={{ alignItems: 'center', marginTop: 10 }}>
                <View style={{ width: '48%' }}>{renderCallout('callout-sponsor-page')}</View>
              </View>
            )}
            <View style={{ marginTop: 12 }}>
              {fullPageTiers.map((tier) => {
                const multiplier = tier.sizeMultiplier || 1;
                const logoSize = getLogoSizeFP(tier.sponsors.length, multiplier);
                const pillStyle = convertTierStyleToPDF(tier.name, tier.style);
                return (
                  <View key={`fp-tier-${tier.id}`} style={{ marginBottom: 12 }} wrap={false}>
                    <View style={{ alignItems: 'center', marginBottom: 8 }}>
                      <Text style={[styles.sponsorTierHeader, { backgroundColor: pillStyle.backgroundColor, color: pillStyle.color, fontSize: 10, paddingHorizontal: 12, paddingVertical: 4 }]}>{tier.name}</Text>
                    </View>
                    {tier.name.toLowerCase().includes('bronze') ? (
                      // Bronze sponsors: render in 2-per-row grid
                      <View>
                        {[...Array(Math.ceil(tier.sponsors.length / 2))].map((_, rowIndex) => (
                          <View key={rowIndex} style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 6 }}>
                            {tier.sponsors.slice(rowIndex * 2, rowIndex * 2 + 2).map((sponsor) => (
                              <View key={sponsor.id} style={[styles.sponsorLogoContainer, { width: logoSize.width + 8, height: logoSize.height + 0, marginHorizontal: 4 }]}>
                                <Image src={sponsor.logoUrl} style={[styles.sponsorLogo, { maxWidth: logoSize.width, maxHeight: logoSize.height }]} cache={true} />
                              </View>
                            ))}
                          </View>
                        ))}
                      </View>
                    ) : (
                      // Other tiers: use default flex layout
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
                        {tier.sponsors.map((sponsor) => (
                          <View key={sponsor.id} style={[styles.sponsorLogoContainer, { width: logoSize.width + 12, height: logoSize.height + 0 }]}>
                            <Image src={sponsor.logoUrl} style={[styles.sponsorLogo, { maxWidth: logoSize.width, maxHeight: logoSize.height }]} cache={true} />
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
            {fullPageFooterImage && (
              <View style={{ alignItems: 'center', marginTop: 'auto', paddingTop: 12 }}>
                <Image src={fullPageFooterImage} style={{ maxWidth: 500, maxHeight: 210, objectFit: 'contain' }} cache={true} />
              </View>
            )}
          </Page>
        );
      })()}
    </Document>
  );
};

// PDF Download Button
export const PDFDownloadButton = ({
  schedule,
  event,
  showSpeakers,
  showLocations,
  customTitle,
  customSubtitle,
  selectedDays,
  twoColumnLayout,
  sanitySpeakers,
  sponsorTiers,
  fullPageFooterImage,
  layoutOptions,
  fileName = 'schedule.pdf',
  showConferenceModerator = false,
  callout,
  sponsorPlacement,
  locationLine,
}: {
  schedule: ScheduleDay[];
  event: Event;
  showSpeakers: boolean;
  showLocations: boolean;
  customTitle: string;
  customSubtitle: string;
  selectedDays: string[];
  twoColumnLayout: boolean;
  sanitySpeakers?: EventSpeakerPublic[] | null;
  sponsorTiers?: SponsorTierForPDF[];
  fullPageFooterImage?: string;
  layoutOptions?: PDFLayoutOptions;
  fileName?: string;
  showConferenceModerator?: boolean;
  callout?: ScheduleCalloutForPDF | null;
  sponsorPlacement?: { date: string } | null;
  locationLine?: string;
}) => (
  <PDFDownloadLink
    document={
      <SchedulePDF
        schedule={schedule}
        event={event}
        showSpeakers={showSpeakers}
        showLocations={showLocations}
        customTitle={customTitle}
        customSubtitle={customSubtitle}
        selectedDays={selectedDays}
        twoColumnLayout={twoColumnLayout}
        sanitySpeakers={sanitySpeakers}
        sponsorTiers={sponsorTiers}
        fullPageFooterImage={fullPageFooterImage}
        layoutOptions={layoutOptions}
        showConferenceModerator={showConferenceModerator}
        callout={callout}
        sponsorPlacement={sponsorPlacement}
        locationLine={locationLine}
      />
    }
    fileName={fileName}
    className="inline-block px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
  >
    {({ loading }) => (loading ? 'Generating PDF...' : 'Download PDF')}
  </PDFDownloadLink>
);

// PDF Preview (for development/testing)
export const PDFPreview = ({
  schedule,
  event,
  showSpeakers,
  showLocations,
  customTitle,
  customSubtitle,
  selectedDays,
  twoColumnLayout,
  sanitySpeakers,
  sponsorTiers,
  fullPageFooterImage,
  layoutOptions,
  showConferenceModerator = false,
  callout,
  sponsorPlacement,
  locationLine,
}: {
  schedule: ScheduleDay[];
  event: Event;
  showSpeakers: boolean;
  showLocations: boolean;
  customTitle: string;
  customSubtitle: string;
  selectedDays: string[];
  twoColumnLayout: boolean;
  sanitySpeakers?: EventSpeakerPublic[] | null;
  sponsorTiers?: SponsorTierForPDF[];
  fullPageFooterImage?: string;
  layoutOptions?: PDFLayoutOptions;
  showConferenceModerator?: boolean;
  callout?: ScheduleCalloutForPDF | null;
  sponsorPlacement?: { date: string } | null;
  locationLine?: string;
}) => (
  <div className="w-full h-screen">
    <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
      <SchedulePDF
        schedule={schedule}
        event={event}
        showSpeakers={showSpeakers}
        showLocations={showLocations}
        customTitle={customTitle}
        customSubtitle={customSubtitle}
        selectedDays={selectedDays}
        twoColumnLayout={twoColumnLayout}
        sanitySpeakers={sanitySpeakers}
        sponsorTiers={sponsorTiers}
        fullPageFooterImage={fullPageFooterImage}
        layoutOptions={layoutOptions}
        showConferenceModerator={showConferenceModerator}
        callout={callout}
        sponsorPlacement={sponsorPlacement}
        locationLine={locationLine}
      />
    </PDFViewer>
  </div>
);

// PDF Preview Button (opens in new tab)
export const PDFPreviewButton = ({
  schedule,
  event,
  showSpeakers,
  showLocations,
  customTitle,
  customSubtitle,
  selectedDays,
  twoColumnLayout,
  sanitySpeakers,
  sponsorTiers,
  fullPageFooterImage,
  layoutOptions,
  showConferenceModerator = false,
  callout,
  sponsorPlacement,
  locationLine,
}: {
  schedule: ScheduleDay[];
  event: Event;
  showSpeakers: boolean;
  showLocations: boolean;
  customTitle: string;
  customSubtitle: string;
  selectedDays: string[];
  twoColumnLayout: boolean;
  sanitySpeakers?: EventSpeakerPublic[] | null;
  sponsorTiers?: SponsorTierForPDF[];
  fullPageFooterImage?: string;
  layoutOptions?: PDFLayoutOptions;
  showConferenceModerator?: boolean;
  callout?: ScheduleCalloutForPDF | null;
  sponsorPlacement?: { date: string } | null;
  locationLine?: string;
}) => (
  <BlobProvider document={
    <SchedulePDF
      schedule={schedule}
      event={event}
      showSpeakers={showSpeakers}
      showLocations={showLocations}
      customTitle={customTitle}
      customSubtitle={customSubtitle}
      selectedDays={selectedDays}
      twoColumnLayout={twoColumnLayout}
      sanitySpeakers={sanitySpeakers}
      sponsorTiers={sponsorTiers}
      fullPageFooterImage={fullPageFooterImage}
      layoutOptions={layoutOptions}
      showConferenceModerator={showConferenceModerator}
      callout={callout}
      sponsorPlacement={sponsorPlacement}
      locationLine={locationLine}
    />
  }>
    {({ blob, url, loading, error }) => {
      const handlePreview = () => {
        if (url) {
          window.open(url, '_blank');
        }
      };

      return (
        <button
          onClick={handlePreview}
          disabled={loading || !url}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Generating Preview...' : 'Preview PDF'}
        </button>
      );
    }}
  </BlobProvider>
);

export default SchedulePDF;
