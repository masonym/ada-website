'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, PDFDownloadLink, PDFViewer, Image, BlobProvider } from '@react-pdf/renderer';
import { Event } from '@/types/events';
import { EventSpeakerPublic } from '@/lib/sanity';

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
      // Start with schedule-specific data
      ...speaker,
      // Override with resolved speaker data
      name: speakerData.speakerName,
      title: speakerData.speakerPosition,
      affiliation: speakerData.speakerCompany,
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
  fullPage?: boolean;
};

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

// convert Tailwind tier style classes to PDF-compatible colors
const convertTierStyleToPDF = (tierName: string, style?: string): { backgroundColor: string; color: string } => {
  // if an explicit style string is provided, parse it
  if (style) {
    let bg = '#0047AB';
    let fg = '#ffffff';

    const bgHex = style.match(/bg-\[#([0-9a-fA-F]{3,8})\]/);
    if (bgHex) bg = `#${bgHex[1]}`;

    if (style.includes('bg-amber-400')) bg = '#fbbf24';
    else if (style.includes('bg-amber-700')) bg = '#b45309';
    else if (style.includes('bg-gray-300')) bg = '#d1d5db';
    else if (style.includes('bg-sky-300')) bg = '#7dd3fc';
    else if (style.includes('bg-sb-100') || style.includes('bg-[#3FB4E6]')) bg = '#3FB4E6';
    else if (style.includes('bg-navy-800') || style.includes('bg-[#1B212B]')) bg = '#1B212B';
    else if (style.includes('bg-purple-600')) bg = '#9333ea';
    else if (style.includes('bg-blue-500')) bg = '#3b82f6';
    else if (style.includes('bg-blue-600')) bg = '#2563eb';

    if (style.includes('text-slate-900')) fg = '#0f172a';
    else if (style.includes('text-white')) fg = '#ffffff';

    const textHex = style.match(/text-\[#([0-9a-fA-F]{3,8})\]/);
    if (textHex) fg = `#${textHex[1]}`;

    return { backgroundColor: bg, color: fg };
  }

  // fallback: derive from tier name (same as getDefaultTierStyle in BannerGeneratorPage)
  const name = tierName.toLowerCase();
  if (name.includes('small')) return { backgroundColor: '#3FB4E6', color: '#0f172a' };
  if (name.includes('gold')) return { backgroundColor: '#fbbf24', color: '#0f172a' };
  if (name.includes('silver')) return { backgroundColor: '#d1d5db', color: '#0f172a' };
  if (name.includes('bronze')) return { backgroundColor: '#b45309', color: '#ffffff' };
  if (name.includes('premier')) return { backgroundColor: '#9333ea', color: '#ffffff' };
  if (name.includes('platinum')) return { backgroundColor: '#7dd3fc', color: '#0f172a' };
  if (name.includes('diamond')) return { backgroundColor: '#3b82f6', color: '#ffffff' };
  if (name.includes('exhibitor')) return { backgroundColor: '#1B212B', color: '#ffffff' };
  if (name.includes('coffee')) return { backgroundColor: '#0891b2', color: '#ffffff' };
  if (name.includes('vip')) return { backgroundColor: '#7c3aed', color: '#ffffff' };
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
    color: '#58799c',
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
});

Font.registerHyphenationCallback((word) => {
  return [word];
});

// Function to convert Tailwind CSS classes to PDF styles
const convertSponsorStyleToPDF = (sponsorStyle?: string) => {
  if (!sponsorStyle) {
    return {
      backgroundColor: '#FF3131', // Default red
      color: '#fff'
    };
  }

  let backgroundColor = '#FF3131'; // Default red
  let color = '#fff'; // Default white text

  // Parse background colors
  const bgHexMatch = sponsorStyle.match(/bg-\[#([0-9a-fA-F]{3,8})\]/);
  if (bgHexMatch) {
    backgroundColor = `#${bgHexMatch[1]}`;
  }

  if (sponsorStyle.includes('bg-red-999')) {
    backgroundColor = '#FF3131'; // Red
  } else if (sponsorStyle.includes('bg-sky-300')) {
    backgroundColor = '#7dd3fc'; // Sky blue
  } else if (sponsorStyle.includes('bg-gray-300')) {
    backgroundColor = '#d1d5db'; // Gray
  } else if (sponsorStyle.includes('bg-navy-800')) {
    backgroundColor = '#1B212B';
  }

  // Parse text colors
  const textHexMatch = sponsorStyle.match(/text-\[#([0-9a-fA-F]{3,8})\]/);
  if (textHexMatch) {
    color = `#${textHexMatch[1]}`;
  }

  if (sponsorStyle.includes('text-slate-900')) {
    color = '#0f172a'; // Dark slate
  } else if (sponsorStyle.includes('text-white')) {
    color = '#fff'; // White
  }

  return {
    backgroundColor,
    color
  };
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
}) => {
  // Build sanity speaker lookup map
  const sanitySpeakerMap = new Map<string, EventSpeakerPublic>();
  if (sanitySpeakers) {
    sanitySpeakers.forEach(s => {
      if (s.speakerSlug) sanitySpeakerMap.set(s.speakerSlug, s);
    });
  }
  // Filter schedule based on selected days
  const filteredSchedule = selectedDays.length > 0
    ? schedule.filter(day => selectedDays.includes(day.date))
    : schedule;

  // Render a single schedule item
  const renderScheduleItem = (item: ScheduleItem, index: number, prevItem?: ScheduleItem) => (
    <View style={styles.scheduleItem} key={`${item.time}-${item.title}-${index}`} wrap={false}>
      <View style={styles.timeColumn}>
        <Text style={styles.time}>{item.time}</Text>
      </View>
      <View style={styles.contentColumn}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        {item.description && (
          <Text style={styles.description}>{item.description}</Text>
        )}
        {showSpeakers && item.speakers && item.speakers.length > 0 && (
          <View style={styles.speakersContainer}>
            {item.speakers.map((speaker, speakerIndex) => {
              // Get speaker image for PDF
              const speakerData = resolveSpeaker(speaker, sanitySpeakerMap);
              const isDiscussant =
                speakerData.speakerId === 'nelinia-nel-varenus' &&
                item.time === '12:25 PM';
              const sanityUrl = speakerData.sanityImage?.asset?._ref
                ? getSanityImageUrl(speakerData.sanityImage.asset._ref, { width: 96, height: 96 })
                : null;
              const imageSrc = sanityUrl ? getProxiedImageUrl(sanityUrl) : null;

              return (
                <View key={speakerIndex} style={styles.speaker}>
                  {imageSrc && (
                    <View style={styles.speakerImageContainer}>
                      <Image
                        src={imageSrc}
                        style={styles.speakerImage}
                        cache={true}
                      />
                    </View>
                  )}
                  <View style={styles.speakerInfo}>
                    <Text style={styles.speakerName}>
                      {isDiscussant && (
                        <View>
                          <Text style={styles.discussantLabel}>Discussant</Text><Text>: </Text>
                        </View>
                      )}
                      {speakerData.name}
                    </Text>
                    {speakerData.title && (
                      <Text style={styles.speakerTitle}>{speakerData.title}</Text>
                    )}
                    {speakerData.affiliation && (
                      <Text style={styles.speakerAffiliation}>{speakerData.affiliation}</Text>
                    )}
                    {speakerData.sponsor && (
                      <Text style={{
                        ...styles.speakerSponsor,
                        ...convertSponsorStyleToPDF(speakerData.sponsorStyle)
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





  // --- Newspaper-Style Column Pagination Logic ---
  // LETTER size: 612 x 792 points
  // Use a very conservative estimate - better to have fewer items per column than overflow
  const MAX_ITEMS_PER_COLUMN = 12; // simple count-based approach as backup
  const CONTENT_HEIGHT = 750; // conservative fixed height in points

  const estimateItemHeight = (item: ScheduleItem) => {
    // very conservative fixed estimates
    let height = 25; // base height for time + title

    // add for description
    if (item.description) {
      height += 20;
    }

    // add for location
    if (showLocations && item.location) {
      height += 12;
    }

    // add for speakers - this is where most height comes from
    if (showSpeakers && item.speakers && item.speakers.length > 0) {
      // each speaker takes significant space
      height += item.speakers.length * 45;
    }

    return height;
  };

  const paginateDays = () => {
    const paginatedData: { date: string; pages: { left: ScheduleItem[]; right: ScheduleItem[] }[] }[] = [];

    filteredSchedule.forEach(day => {
      if (!twoColumnLayout) {
        paginatedData.push({ date: day.date, pages: [{ left: day.items, right: [] }] });
        return;
      }

      const pages: { left: ScheduleItem[]; right: ScheduleItem[] }[] = [];
      let currentPage: { left: ScheduleItem[]; right: ScheduleItem[] } = { left: [], right: [] };
      let currentLeftHeight = 0;
      let currentRightHeight = 0;
      let currentColumn: 'left' | 'right' = 'left';

      day.items.forEach((item) => {
        const itemHeight = estimateItemHeight(item);

        // simple logic: fill left first, then right, then new page
        const leftFull = currentLeftHeight + itemHeight > CONTENT_HEIGHT || currentPage.left.length >= MAX_ITEMS_PER_COLUMN;
        const rightFull = currentRightHeight + itemHeight > CONTENT_HEIGHT || currentPage.right.length >= MAX_ITEMS_PER_COLUMN;

        if (currentColumn === 'left' && leftFull) {
          // switch to right column
          currentColumn = 'right';
        }

        if (currentColumn === 'right' && rightFull) {
          // both columns full, start new page
          pages.push(currentPage);
          currentPage = { left: [], right: [] };
          currentLeftHeight = 0;
          currentRightHeight = 0;
          currentColumn = 'left';
        }

        // add item to current column
        if (currentColumn === 'left') {
          currentPage.left.push(item);
          currentLeftHeight += itemHeight;
        } else {
          currentPage.right.push(item);
          currentRightHeight += itemHeight;
        }
      });

      if (currentPage.left.length > 0 || currentPage.right.length > 0) {
        pages.push(currentPage);
      }

      paginatedData.push({ date: day.date, pages });
    });

    return paginatedData;
  };

  const paginatedSchedule = paginateDays();

  // render sponsor tiers into remaining space after a day's content.
  // each tier is individually wrap={false} so react-pdf fits as many as possible
  // without breaking a single tier across pages.
  const renderSponsorSection = (dayDate: string) => {
    // only render column (non-full-page) tiers inline
    const columnTiers = sponsorTiers.filter(t => !t.fullPage);
    if (columnTiers.length === 0) return null;

    // sort tiers by canonical order
    const sortedTiers = [...columnTiers].sort(
      (a, b) => getTierPriority(a.name) - getTierPriority(b.name)
    );

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

    return (
      <View style={styles.sponsorSection}>
        {sortedTiers.map((tier) => {
          const multiplier = tier.sizeMultiplier || 1;
          const logoSize = getLogoSize(tier.sponsors.length, multiplier);
          const pillStyle = convertTierStyleToPDF(tier.name, tier.style);
          return (
            <View key={`sponsor-tier-${dayDate}-${tier.id}`} style={{ marginBottom: 4 }} wrap={false}>
              <View style={{ alignItems: 'center', marginBottom: 4 }}>
                <Text style={[styles.sponsorTierHeader, {
                  backgroundColor: pillStyle.backgroundColor,
                  color: pillStyle.color,
                }]}>{tier.name}</Text>
              </View>
              {tier.name.toLowerCase().includes('bronze') ? (
                // Bronze sponsors: render in 2x2 grid
                <View>
                  {[...Array(Math.ceil(tier.sponsors.length / 2))].map((_, rowIndex) => (
                    <View key={rowIndex} style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 6 }}>
                      {tier.sponsors.slice(rowIndex * 2, rowIndex * 2 + 2).map((sponsor) => (
                        <View key={sponsor.id} style={[styles.sponsorLogoContainer, { width: logoSize.width + 8, height: logoSize.height + 4, marginHorizontal: 4 }]}>
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
                // Other tiers: use default flex layout
                <View style={styles.sponsorLogoRow}>
                  {tier.sponsors.map((sponsor) => (
                    <View key={sponsor.id} style={[styles.sponsorLogoContainer, { width: logoSize.width + 8, height: logoSize.height + 4 }]}>
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
        })}
      </View>
    );
  };

  return (
    <Document>
      {paginatedSchedule.map(day =>
        day.pages.map((page, pageIndex) => {
          const isLastPageOfDay = pageIndex === day.pages.length - 1;

          return (
            <Page key={`${day.date}-${pageIndex}`} size="LETTER" style={styles.page}>
              <View style={styles.header}>
                <Text style={styles.title}>{customTitle || `${event.title} Schedule`}</Text>
                {/* {(customSubtitle || event.date) && (
                  <Text style={styles.subtitle}>{customSubtitle || event.date}</Text>
                )} */}
              </View>
              <View style={styles.footer}>
                <Text style={{ fontSize: 12 }}>Presented by the <Text style={{ fontWeight: 'bold' }}>American Defense Alliance</Text> • www.americandefensealliance.org</Text>
              </View>

              <View style={styles.footer}>
                <Text style={{ fontSize: 10 }}>Renaissance Austin Hotel, Austin, Texas</Text>
              </View>

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
                </View>
                <View style={styles.column}>
                  {page.right.map((item, index) => {
                    const prevItem = index === 0 ? page.left[page.left.length - 1] : page.right[index - 1];
                    // The key index needs to be unique across the whole page.
                    const keyIndex = page.left.length + index;
                    return renderScheduleItem(item, keyIndex, prevItem);
                  })}
                  {isLastPageOfDay && sponsorTiers.filter(t => !t.fullPage).length > 0 && renderSponsorSection(day.date)}
                </View>
              </View>

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
              <Text style={{ fontSize: 12 }}>Presented by the <Text style={{ fontWeight: 'bold' }}>American Defense Alliance</Text> • www.americandefensealliance.org</Text>
            </View>
            <View style={styles.footer}>
              <Text style={{ fontSize: 10 }}>Renaissance Austin Hotel, Austin, Texas</Text>
            </View>
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
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
                      {tier.sponsors.map((sponsor) => (
                        <View key={sponsor.id} style={[styles.sponsorLogoContainer, { width: logoSize.width + 12, height: logoSize.height + 8 }]}>
                          <Image src={sponsor.logoUrl} style={[styles.sponsorLogo, { maxWidth: logoSize.width, maxHeight: logoSize.height }]} cache={true} />
                        </View>
                      ))}
                    </View>
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
  fileName = 'schedule.pdf'
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
  fileName?: string;
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
