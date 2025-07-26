'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, PDFDownloadLink, PDFViewer, Image, BlobProvider } from '@react-pdf/renderer';
import { Event } from '@/types/events';
import { getCdnPath } from '@/utils/image';
import { resolveSpeaker } from '@/app/components/Schedule';

// Define schedule types locally since they may not be directly exported from the project
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

// Register fonts (we can add Gotham font files if available)
// Font.register({
//   family: 'Gotham',
//   src: '/fonts/Gotham-Bold.ttf',
//   fontWeight: 'bold',
// });

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
    color: '#0047AB',
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 2,
    color: '#666666',
  },
  dayHeader: {
    backgroundColor: '#0047AB',
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
  },
  speakerAffiliation: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#0047AB',
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
});

Font.registerHyphenationCallback((word) => {
  return [word];
});

// Function to convert Tailwind CSS classes to PDF styles
const convertSponsorStyleToPDF = (sponsorStyle?: string) => {
  if (!sponsorStyle) {
    return {
      backgroundColor: '#dc2626', // Default red
      color: '#fff'
    };
  }

  let backgroundColor = '#dc2626'; // Default red
  let color = '#fff'; // Default white text

  // Parse background colors
  if (sponsorStyle.includes('bg-red-999')) {
    backgroundColor = '#dc2626'; // Red
  } else if (sponsorStyle.includes('bg-sky-300')) {
    backgroundColor = '#7dd3fc'; // Sky blue
  } else if (sponsorStyle.includes('bg-gray-300')) {
    backgroundColor = '#d1d5db'; // Gray
  } else if (sponsorStyle.includes('bg-[#ffaf00]')) {
    backgroundColor = '#ffaf00'; // Gold/Yellow
  } else if (sponsorStyle.includes('bg-[#CD7F32]')) {
    backgroundColor = '#CD7F32'; // Bronze
  } else if (sponsorStyle.includes('bg-navy-800')) {
    backgroundColor = '#000080'; // Dark slate
  }

  // Parse text colors
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
  twoColumnLayout = true
}: {
  schedule: ScheduleDay[];
  event: Event;
  showSpeakers?: boolean;
  showLocations?: boolean;
  customTitle?: string;
  customSubtitle?: string;
  selectedDays?: string[];
  twoColumnLayout?: boolean;
}) => {
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
              // Get PNG image URL for PDF compatibility
              const speakerData = resolveSpeaker(speaker);
              const getPDFImageUrl = (photo: string) => {
                if (!photo) return null;
                
                // Convert WebP filename to PNG for PDF rendering
                const pngFilename = photo.replace('.webp', '.png');
                
                // Use local PNG images from public/speakers/png/ directory
                const pngPath = `/speakers/png/${pngFilename}`;
                
                // Return absolute URL for PDF rendering
                if (typeof window !== 'undefined') {
                  return new URL(pngPath, window.location.origin).href;
                }
                // Fallback for server-side rendering
                return `https://americandefensealliance.org${pngPath}`;
              };

              const imageSrc = speakerData.photo ? getPDFImageUrl(speakerData.photo) : null;
              
              return (
                <View key={speakerIndex} style={styles.speaker}>
                  {imageSrc && (
                    <View style={styles.speakerImageContainer}>
                      <Image
                        src={imageSrc}
                        style={styles.speakerImage}
                      />
                    </View>
                  )}
                  <View style={styles.speakerInfo}>
                    <Text style={styles.speakerName}>{speakerData.name}</Text>
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

  const A4_HEIGHT = 750;
  const PAGE_MARGIN_TOP = 30;
  const PAGE_MARGIN_BOTTOM = 40; // Space for footer
  const HEADER_HEIGHT = 60;
  const DAY_HEADER_HEIGHT = 30;
  const CONTENT_HEIGHT = A4_HEIGHT - PAGE_MARGIN_TOP - PAGE_MARGIN_BOTTOM - HEADER_HEIGHT - DAY_HEADER_HEIGHT;

  const estimateLineHeight = (text: string, width: number, fontSize: number) => {
    const charsPerLine = width / (fontSize * 0.6);
    return Math.ceil(text.length / charsPerLine);
  };

  const estimateItemHeight = (item: ScheduleItem, prevItem?: ScheduleItem) => {
    let height = 0; // Base for padding/margin

    const contentWidth = 400; // Estimated width of content column in points

    height += estimateLineHeight(item.title, contentWidth, 10) * 12;
    if (item.description) {
      height += estimateLineHeight(item.description, contentWidth, 9) * 11;
    }
    if (showLocations && item.location && item.location !== prevItem?.location) {
      height += 10;
    }
    if (showSpeakers && item.speakers && item.speakers.length > 0) {
      item.speakers.forEach(speakerId => {
        const speaker = resolveSpeaker(speakerId);
        height += 20; // Approx height for speaker photo + text
        if (speaker.title) height += 8;
        if (speaker.affiliation) height += 8;
      });
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

      day.items.forEach((item, index) => {
        const prevItem = day.items[index - 1];
        const itemHeight = estimateItemHeight(item, prevItem);

        if (currentColumn === 'left') {
          if (currentLeftHeight + itemHeight > CONTENT_HEIGHT) {
            currentColumn = 'right'; // Switch to right column
          }
        }

        if (currentColumn === 'right') {
          if (currentRightHeight + itemHeight > CONTENT_HEIGHT) {
            // Page is full, start a new one
            pages.push(currentPage);
            currentPage = { left: [], right: [] };
            currentLeftHeight = 0;
            currentRightHeight = 0;
            currentColumn = 'left';
          }
        }

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

  return (
    <Document>
      {paginatedSchedule.map(day =>
        day.pages.map((page, pageIndex) => (
          <Page key={`${day.date}-${pageIndex}`} size="A4" style={styles.page}>
            <View style={styles.header}>
              <Text style={styles.title}>{customTitle || `${event.title} Schedule`}</Text>
              {(customSubtitle || event.date) && (
                <Text style={styles.subtitle}>{customSubtitle || event.date}</Text>
              )}
            </View>
            <View style={styles.footer}>
              <Text>Presented by American Defense Alliance • americandefensealliance.org</Text>
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
              </View>
            </View>

          </Page>
        ))
      )}
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
}: {
  schedule: ScheduleDay[];
  event: Event;
  showSpeakers: boolean;
  showLocations: boolean;
  customTitle: string;
  customSubtitle: string;
  selectedDays: string[];
  twoColumnLayout: boolean;
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
}: {
  schedule: ScheduleDay[];
  event: Event;
  showSpeakers: boolean;
  showLocations: boolean;
  customTitle: string;
  customSubtitle: string;
  selectedDays: string[];
  twoColumnLayout: boolean;
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
