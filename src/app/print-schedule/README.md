# Printable Schedule Feature

This directory contains the components and styles for the printable schedule feature of the ADA website.

## Features

- Generate a printable version of event schedules
- Customize the printable schedule with options for:
  - Showing/hiding speakers and locations
  - Showing/hiding speaker images
  - Adjusting font size
  - Selecting specific days to include
  - Adding custom title and subtitle
  - Two-column layout option

## Print-Specific Considerations

The printable schedule is designed with the following print-specific features:

1. **Page Breaks**: Each day and schedule item is configured to avoid breaking across pages
2. **Print Styles**: Custom CSS in `print-styles.css` ensures proper printing
3. **No Headers/Footers**: The layout is configured to remove browser-added headers and footers
4. **Color Adjustment**: Background colors and images are preserved in print
5. **Two-Column Layout**: The two-column layout is preserved in print mode

## Usage

The printable schedule can be accessed at `/print-schedule/[eventId]` where `eventId` is the ID of the event.

## Components

- `layout.tsx`: Sets up the print-specific HTML structure and meta tags
- `[eventId]/page.tsx`: The page component that renders the printable schedule
- `print-styles.css`: Print-specific styles for the schedule

## Implementation Notes

- The `PrintableSchedule` component in `src/components/PrintableSchedule.tsx` handles the rendering of the schedule
- The two-column layout organizes items by day, ensuring that all items from a day are kept together
- Print controls are hidden when printing using the `no-print` class
