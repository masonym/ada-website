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
    marginBottom: 8,
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
    marginBottom: 8,
    paddingBottom: 6,
    breakInside: 'avoid',
    pageBreakInside: 'avoid',
  },
  timeColumn: {
    width: '18%',
    paddingRight: 8,
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
    fontSize: 8,
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
    marginBottom: 3,
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
    fontSize: 7,
    fontStyle: 'italic',
    color: '#666666',
    marginBottom: 1,
  },
  speakerAffiliation: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#0047AB',
  },
  location: {
    fontSize: 8,
    color: '#666666',
    fontStyle: 'italic',
    marginTop: 2,
  },
  twoColumnContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    width: '48%',
  },
  columnLeft: {
    width: '48%',
    marginRight: '2%',
  },
  columnRight: {
    width: '48%',
    marginLeft: '2%',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    textAlign: 'center',
    fontSize: 8,
    color: '#666666',
    borderTopWidth: 0.5,
    borderTopColor: '#CCCCCC',
    paddingTop: 5,
  },
});

Font.registerHyphenationCallback((word) => {
  return [word];
});

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
  const renderScheduleItem = (item: ScheduleItem, index: number) => (
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
              
              console.log(speakerData)
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
                  </View>
                </View>
              );
            })}
          </View>
        )}
        {showLocations && item.location && (
          <Text style={styles.location}>Location: {item.location}</Text>
        )}
      </View>
    </View>
  );

  // Helper function to distribute items across columns vertically (downwards)
  const distributeItemsInColumns = (items: ScheduleItem[]) => {
    if (!twoColumnLayout) {
      return { leftColumn: items, rightColumn: [] };
    }

    const leftColumn: ScheduleItem[] = [];
    const rightColumn: ScheduleItem[] = [];
    
    // Calculate midpoint to split items vertically
    const midpoint = Math.ceil(items.length / 2);
    
    // Fill left column with first half of items
    for (let i = 0; i < midpoint; i++) {
      leftColumn.push(items[i]);
    }
    
    // Fill right column with second half of items
    for (let i = midpoint; i < items.length; i++) {
      rightColumn.push(items[i]);
    }
    
    return { leftColumn, rightColumn };
  };

  return (
    <Document>
      {filteredSchedule.map((day, dayIndex) => {
        const { leftColumn, rightColumn } = distributeItemsInColumns(day.items);
        
        return (
          <Page key={day.date} size="A4" style={styles.page}>
            {/* Header on each page */}
            <View style={styles.header}>
              <Text style={styles.title}>
                {customTitle || `${event.title} Schedule`}
              </Text>
              {(customSubtitle || event.date) && (
                <Text style={styles.subtitle}>
                  {customSubtitle || event.date}
                </Text>
              )}
            </View>
            
            {/* Day header */}
            <Text style={styles.dayHeader}>{day.date}</Text>
            
            {/* Content layout */}
            {twoColumnLayout ? (
              <View style={styles.twoColumnContainer}>
                <View style={styles.columnLeft}>
                  {leftColumn.map((item, index) => renderScheduleItem(item, index))}
                </View>
                <View style={styles.columnRight}>
                  {rightColumn.map((item, index) => renderScheduleItem(item, index + leftColumn.length))}
                </View>
              </View>
            ) : (
              <View>
                {day.items.map((item, index) => renderScheduleItem(item, index))}
              </View>
            )}
            
            {/* Footer */}
            <View style={styles.footer}>
              <Text>Presented by American Defense Alliance • americandefensealliance.org</Text>
            </View>
          </Page>
        );
      })}
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
