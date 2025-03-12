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
    <div>{children}</div>
  );
}
