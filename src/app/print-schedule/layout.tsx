import React from 'react';
import './print-styles.css';

export const metadata = {
  title: 'Printable Schedule',
  description: 'Printable schedule for ADA events',
};

export default function PrintScheduleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>{children}</body>
    </html>
  );
}
