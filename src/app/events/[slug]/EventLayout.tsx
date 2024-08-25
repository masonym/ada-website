// app/events/[slug]/EventLayout.tsx

import React from 'react';
import EventImage from './EventImage';
import EventNavBar from './EventNavBar'

type EventLayoutProps = {
  children: React.ReactNode;
};

export default function EventLayout({ children }: EventLayoutProps) {
  return (
    <div>
      <EventNavBar /> 
      <EventImage />
      <main>{children}</main>
    </div>
  );
}
