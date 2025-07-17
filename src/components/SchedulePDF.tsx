'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { Event } from '@/types/events';

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
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 20,
    fontSize: 10,
  },
  header: {
    marginBottom: 15,
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#0047AB',
    paddingBottom: 10,
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
    marginTop: 10,
  },
  scheduleItem: {
    flexDirection: 'row',
    marginBottom: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#DDDDDD',
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
    marginBottom: 1,
    color: '#444444',
  },
  speakerName: {
    fontWeight: 'bold',
    fontSize: 8,
  },
  speakerTitle: {
    fontSize: 7,
    fontStyle: 'italic',
    color: '#666666',
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
            {item.speakers.map((speaker, speakerIndex) => (
              <View key={speakerIndex} style={styles.speaker}>
                <Text style={styles.speakerName}>{speaker.name}</Text>
                {speaker.title && (
                  <Text style={styles.speakerTitle}>{speaker.title}</Text>
                )}
                {speaker.affiliation && (
                  <Text style={styles.speakerAffiliation}>{speaker.affiliation}</Text>
                )}
              </View>
            ))}
          </View>
        )}
        {showLocations && item.location && (
          <Text style={styles.location}>Location: {item.location}</Text>
        )}
      </View>
    </View>
  );

  // Helper function to distribute items across columns more evenly
  const distributeItemsInColumns = (items: ScheduleItem[]) => {
    if (!twoColumnLayout) {
      return { leftColumn: items, rightColumn: [] };
    }

    const leftColumn: ScheduleItem[] = [];
    const rightColumn: ScheduleItem[] = [];
    
    // Simple alternating distribution for better balance
    items.forEach((item, index) => {
      if (index % 2 === 0) {
        leftColumn.push(item);
      } else {
        rightColumn.push(item);
      }
    });
    
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

export default SchedulePDF;
