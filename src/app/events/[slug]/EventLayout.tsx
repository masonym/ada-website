// app/events/[slug]/EventLayout.tsx

import React from 'react';
import { Event } from '@/types/events';
import EventImage from './EventImage';
import EventNavBar from './EventNavBar';

type NavItem = {
  label: string;
  path?: string;
  subItems?: Array<{ label: string; path: string }>;
};

type EventLayoutProps = {
  children: React.ReactNode;
  event: Event;
  navItems: NavItem[];
};

export default function EventLayout({ children, event, navItems }: EventLayoutProps) {
  return (
    <div>
      <EventNavBar event={event} navItems={navItems} />
      <EventImage src={event.image} title={event.title} />
      <main>{children}</main>
    </div>
  );
}
