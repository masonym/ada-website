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
    padding: 30,
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 15,
  },
  dayHeader: {
    backgroundColor: '#0047AB', // ADA blue
    color: 'white',
    padding: 8,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  scheduleItem: {
    flexDirection: 'row',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 8,
    breakInside: 'avoid',
  },
  timeColumn: {
    width: '20%',
    paddingRight: 10,
  },
  contentColumn: {
    width: '80%',
  },
  time: {
    fontWeight: 'bold',
    fontSize: 11,
  },
  title2: { // renamed to avoid conflict with title style
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  description: {
    fontSize: 10,
    marginBottom: 3,
  },
  speaker: {
    fontSize: 10,
    fontStyle: 'italic',
    color: '#444444',
  },
  location: {
    fontSize: 10,
    color: '#666666',
  },
  twoColumnLayout: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  columnLeft: {
    width: '48%',
    marginRight: '2%',
  },
  columnRight: {
    width: '48%',
    marginLeft: '2%',
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
  const renderScheduleItem = (item: ScheduleItem) => (
    <View style={styles.scheduleItem} key={`${item.time}-${item.title}`}>
      <View style={styles.timeColumn}>
        <Text style={styles.time}>{item.time}</Text>
      </View>
      <View style={styles.contentColumn}>
        <Text style={styles.title2}>{item.title}</Text>
        {item.description && (
          <Text style={styles.description}>{item.description}</Text>
        )}
        {showSpeakers && item.speakers && item.speakers.length > 0 && (
          <Text style={styles.speaker}>Speaker: {item.speakers[0].name}</Text>
        )}
        {showLocations && item.location && (
          <Text style={styles.location}>Location: {item.location}</Text>
        )}
      </View>
    </View>
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
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
        
        {filteredSchedule.map((day) => (
          <View key={day.date} wrap={false}>
            <Text style={styles.dayHeader}>{day.date}</Text>
            
            {twoColumnLayout ? (
              <View style={styles.twoColumnLayout}>
                <View style={styles.columnLeft}>
                  {day.items.slice(0, Math.ceil(day.items.length / 2)).map(renderScheduleItem)}
                </View>
                <View style={styles.columnRight}>
                  {day.items.slice(Math.ceil(day.items.length / 2)).map(renderScheduleItem)}
                </View>
              </View>
            ) : (
              <View>
                {day.items.map(renderScheduleItem)}
              </View>
            )}
          </View>
        ))}
      </Page>
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
