'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { EventSpeakerPublic } from '@/lib/sanity';

// helper to get sanity image URL for PDF
function getSanityImageUrl(ref: string) {
  const directUrl = `https://cdn.sanity.io/images/nc4xlou0/production/${ref
    .replace("image-", "")
    .replace("-webp", ".webp")
    .replace("-jpg", ".jpg")
    .replace("-png", ".png")}`;
  // use proxy to avoid CORS issues
  return `/api/proxy-image?url=${encodeURIComponent(directUrl)}`;
}

// types
export type Speaker = {
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

export type ScheduleItem = {
  time: string;
  title: string;
  location?: string;
  duration?: string;
  speakers?: Speaker[];
  description?: string;
  sponsorLogo?: string;
};

export type ScheduleDay = {
  date: string;
  items: ScheduleItem[];
};

export type PDFOptions = {
  showSpeakers: boolean;
  showLocations: boolean;
  showDescriptions: boolean;
  showSpeakerPhotos: boolean;
  showSponsorBadges: boolean;
  columnLayout: 'single' | 'two';
  customTitle?: string;
  customSubtitle?: string;
  customImages?: { position: 'header' | 'footer' | 'between-days'; url: string; height?: number }[];
  selectedDays: number[];
  pageSize: 'LETTER' | 'A4';
  orientation: 'portrait' | 'landscape';
};

export type SchedulePDFProps = {
  schedule: ScheduleDay[];
  eventTitle: string;
  eventDate: string;
  eventLocation?: string;
  options: PDFOptions;
  sanitySpeakerMap?: Map<string, EventSpeakerPublic>;
};

// helper function to resolve speaker data from sanity
const resolveSpeaker = (speaker: Speaker, sanitySpeakerMap?: Map<string, EventSpeakerPublic>): Speaker => {
  if (speaker.speakerId && sanitySpeakerMap?.has(speaker.speakerId)) {
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

// styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    backgroundColor: '#ffffff',
  },
  pageHeader: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#1B212B',
    paddingBottom: 10,
    alignItems: 'center',
  },
  eventTitle: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#1B212B',
    marginBottom: 4,
    textAlign: 'center',
  },
  eventSubtitle: {
    fontSize: 12,
    color: '#4a5568',
    textAlign: 'center',
  },
  dayHeader: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#1B212B',
    backgroundColor: '#f7fafc',
    padding: 8,
    marginBottom: 10,
    marginTop: 10,
  },
  twoColumnContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  column: {
    flex: 1,
  },
  scheduleItem: {
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  itemHeader: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  itemTimeContainer: {
    width: 75,
    marginRight: 5,
  },
  itemTime: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#1B212B',
  },
  itemTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#2d3748',
    flex: 1,
  },
  itemLocation: {
    fontSize: 8,
    color: '#718096',
    marginLeft: 80,
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 8,
    color: '#4a5568',
    marginLeft: 80,
    marginTop: 4,
  },
  speakerContainer: {
    marginLeft: 80,
    marginTop: 6,
  },
  speaker: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  speakerPhoto: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  speakerInfo: {
    flex: 1,
  },
  speakerName: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#2d3748',
  },
  speakerTitle: {
    fontSize: 8,
    color: '#4a5568',
  },
  speakerAffiliation: {
    fontSize: 8,
    color: '#718096',
  },
  sponsorBadge: {
    fontSize: 7,
    color: '#ffffff',
    backgroundColor: '#3FB4E6',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 2,
    marginLeft: 4,
  },
  pageFooter: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: '#718096',
  },
  pageNumber: {
    fontSize: 8,
    color: '#718096',
  },
  customImage: {
    marginVertical: 10,
    alignSelf: 'center',
  },
  noWrap: {
    // prevent page break within this element
  },
});

// component to render a single schedule item
const ScheduleItemComponent: React.FC<{
  item: ScheduleItem;
  options: PDFOptions;
  sanitySpeakerMap?: Map<string, EventSpeakerPublic>;
}> = ({ item, options, sanitySpeakerMap }) => {
  return (
    <View style={styles.scheduleItem} wrap={false}>
      <View style={styles.itemHeader}>
        <View style={styles.itemTimeContainer}>
          {formatTime(item.time).map((timeLine, idx) => (
            <Text key={idx} style={styles.itemTime}>{timeLine}</Text>
          ))}
        </View>
        <Text style={styles.itemTitle}>{item.title}</Text>
      </View>

      {options.showLocations && item.location && (
        <Text style={styles.itemLocation}>📍 {item.location}</Text>
      )}

      {options.showDescriptions && item.description && (
        <Text style={styles.itemDescription}>{item.description}</Text>
      )}

      {options.showSpeakers && item.speakers && item.speakers.length > 0 && (
        <View style={styles.speakerContainer}>
          {item.speakers.map((speaker, idx) => {
            const resolvedSpeaker = resolveSpeaker(speaker, sanitySpeakerMap);
            const imageUrl = resolvedSpeaker.sanityImage?.asset?._ref
              ? getSanityImageUrl(resolvedSpeaker.sanityImage.asset._ref)
              : resolvedSpeaker.photo
                ? `/api/proxy-image?url=${encodeURIComponent(`https://cdn.americandefensealliance.org/speakers/${resolvedSpeaker.photo}`)}`
                : null;

            return (
              <View key={idx} style={styles.speaker}>
                {options.showSpeakerPhotos && imageUrl && (
                  <Image src={imageUrl} style={styles.speakerPhoto} />
                )}
                <View style={styles.speakerInfo}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.speakerName}>{resolvedSpeaker.name}</Text>
                    {options.showSponsorBadges && resolvedSpeaker.sponsor && (
                      <Text style={styles.sponsorBadge}>{resolvedSpeaker.sponsor}</Text>
                    )}
                  </View>
                  {resolvedSpeaker.title && (
                    <Text style={styles.speakerTitle}>{resolvedSpeaker.title}</Text>
                  )}
                  {resolvedSpeaker.affiliation && (
                    <Text style={styles.speakerAffiliation}>{resolvedSpeaker.affiliation}</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

// page header component
const PageHeader: React.FC<{
  eventTitle: string;
  eventDate: string;
  customTitle?: string;
  customSubtitle?: string;
}> = ({ eventTitle, eventDate, customTitle, customSubtitle }) => (
  <View style={styles.pageHeader} fixed>
    <Text style={styles.eventTitle}>{customTitle || eventTitle}</Text>
    <Text style={styles.eventSubtitle}>{customSubtitle || eventDate}</Text>
  </View>
);

// page footer component
const PageFooter: React.FC<{ organizationName?: string }> = ({ organizationName = 'American Defense Alliance' }) => (
  <View style={styles.pageFooter} fixed>
    <Text style={styles.footerText}>{organizationName}</Text>
    <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
  </View>
);

// split items into two columns for two-column layout
// items flow down left column first, then right column:
// 1,2,3 in left / 4,5,6 in right
function splitItemsIntoColumns(items: ScheduleItem[]): [ScheduleItem[], ScheduleItem[]] {
  const midpoint = Math.ceil(items.length / 2);
  return [items.slice(0, midpoint), items.slice(midpoint)];
}

// format time to stack time ranges on multiple lines
function formatTime(time: string): string[] {
  // check if it's a time range - handle various dash types (hyphen, en-dash, em-dash)
  const dashPatterns = [' - ', ' – ', ' — ', '-', '–', '—'];
  for (const dash of dashPatterns) {
    if (time.includes(dash)) {
      const parts = time.split(dash);
      if (parts.length === 2 && parts[0].trim() && parts[1].trim()) {
        return [`${parts[0].trim()} -`, parts[1].trim()];
      }
    }
  }
  return [time];
}

// pair items for row-by-row two-column rendering
function pairItemsForRows(items: ScheduleItem[]): [ScheduleItem, ScheduleItem | null][] {
  const midpoint = Math.ceil(items.length / 2);
  const leftItems = items.slice(0, midpoint);
  const rightItems = items.slice(midpoint);
  
  const pairs: [ScheduleItem, ScheduleItem | null][] = [];
  for (let i = 0; i < leftItems.length; i++) {
    pairs.push([leftItems[i], rightItems[i] || null]);
  }
  return pairs;
}

// main PDF document component
const SchedulePDF: React.FC<SchedulePDFProps> = ({
  schedule,
  eventTitle,
  eventDate,
  options,
  sanitySpeakerMap,
}) => {
  const filteredSchedule = schedule.filter((_, index) => options.selectedDays.includes(index));

  return (
    <Document>
      <Page
        size={options.pageSize}
        orientation={options.orientation}
        style={styles.page}
      >
        <PageHeader
          eventTitle={eventTitle}
          eventDate={eventDate}
          customTitle={options.customTitle}
          customSubtitle={options.customSubtitle}
        />

        {/* header custom image */}
        {options.customImages?.filter(img => img.position === 'header').map((img, idx) => (
          <Image
            key={`header-img-${idx}`}
            src={img.url}
            style={[styles.customImage, { height: img.height || 60 }]}
          />
        ))}

        {filteredSchedule.map((day, dayIndex) => (
          <View key={dayIndex}>
            <Text style={styles.dayHeader}>{day.date}</Text>

            {options.columnLayout === 'two' ? (
              <View style={styles.twoColumnContainer}>
                {splitItemsIntoColumns(day.items).map((columnItems, colIdx) => (
                  <View key={colIdx} style={styles.column}>
                    {columnItems.map((item, itemIdx) => (
                      <ScheduleItemComponent
                        key={itemIdx}
                        item={item}
                        options={options}
                        sanitySpeakerMap={sanitySpeakerMap}
                      />
                    ))}
                  </View>
                ))}
              </View>
            ) : (
              <View>
                {day.items.map((item, itemIdx) => (
                  <ScheduleItemComponent
                    key={itemIdx}
                    item={item}
                    options={options}
                    sanitySpeakerMap={sanitySpeakerMap}
                  />
                ))}
              </View>
            )}

            {/* between-days custom image */}
            {dayIndex < filteredSchedule.length - 1 &&
              options.customImages?.filter(img => img.position === 'between-days').map((img, idx) => (
                <Image
                  key={`between-img-${idx}`}
                  src={img.url}
                  style={[styles.customImage, { height: img.height || 60 }]}
                />
              ))}
          </View>
        ))}

        {/* footer custom image */}
        {options.customImages?.filter(img => img.position === 'footer').map((img, idx) => (
          <Image
            key={`footer-img-${idx}`}
            src={img.url}
            style={[styles.customImage, { height: img.height || 60 }]}
          />
        ))}

        <PageFooter />
      </Page>
    </Document>
  );
};

export default SchedulePDF;
