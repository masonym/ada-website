import React from 'react';
import './print-styles.css';

export const metadata = {
  title: 'Printable Schedule',
  description: 'Printable schedule for ADA events',
};

// This is a special layout that doesn't include the main layout components
export default function PrintScheduleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="print-schedule-page">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>{children}</body>
    </html>
  );
}
