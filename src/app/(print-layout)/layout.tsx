import React from 'react';
import '../print-schedule/print-styles.css';

export const metadata = {
  title: 'Printable Schedule',
  description: 'Printable schedule for ADA events',
};

export default function PrintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="print-layout">
        {children}
      </body>
    </html>
  );
}
