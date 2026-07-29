# Printable Schedule Generator Spec

## Overview
Create a printable schedule PDF generator for conferences/events that supports both single and two-column layouts. The tool should fetch speaker data from Sanity CMS and generate a downloadable PDF with proper pagination.

## Key Requirements

### Data Sources
- **Schedule Data**: Static schedule items with times, titles, locations, and speakers
- **Speaker Data**: Fetch from Sanity CMS using speaker references
- **Event Data**: Static event information (title, date, location)

### Core Features
1. **Print View**: Browser-native print styling with CSS print media queries
2. **PDF Export**: Generate downloadable PDF using @react-pdf/renderer
3. **Customization Options**:
   - Show/hide speakers
   - Show/hide locations
   - Select specific days to include
   - Custom title and subtitle
   - Single or two-column layout

### Layout Requirements
- **Two-Column Pagination**: Items must flow from left to right column before starting new page
- **Page Headers**: Event title and date on each page
- **Page Footers**: Organization branding
- **Speaker Display**: Name, title, affiliation, photo (from Sanity), and sponsor badge

### Technical Implementation
- **Framework**: Next.js with TypeScript
- **PDF Library**: @react-pdf/renderer
- **Styling**: Tailwind CSS for web, StyleSheet for PDF
- **Image Handling**: 
  - Sanity images: Convert to JPG for PDF compatibility
  - Legacy images: Handle WebP to PNG conversion or skip in PDF

### Known Challenges & Solutions
1. **Pagination**: Use conservative height estimates and item count limits
2. **Images**: Sanity images work best, legacy WebP images may need conversion
3. **Column Flow**: Fill left column first, then right, then new page

### File Structure
```
src/
├── components/
│   ├── PrintableSchedule.tsx     # Main component with print view
│   └── SchedulePDF.tsx           # PDF generation logic
└── app/(print-layout)/print-schedule/[eventId]/page.tsx
```

### API Integration
- `getEventSpeakersPublic(eventId)` from Sanity CMS
- Resolve speakers using `speakerId` references in schedule items

### Edge Cases
- Handle missing speaker data gracefully
- Support both Sanity-managed and legacy speaker entries
- Ensure PDF works with various content lengths
