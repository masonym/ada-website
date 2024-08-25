// app/events/[slug]/EventLayout.tsx

import React from 'react';
import EventNavBar from './EventNavBar';

type EventLayoutProps = {
  children: React.ReactNode;
};

export default function EventLayout({ children }: EventLayoutProps) {
  return (
    <div>
      <EventNavBar /> 
      <main>{children}</main>
    </div>
  );
}
