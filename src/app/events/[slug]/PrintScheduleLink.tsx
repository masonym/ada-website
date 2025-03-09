import React from 'react';
import Link from 'next/link';
import { Printer } from 'lucide-react';
import { EVENTS } from '@/constants/events';

interface PrintScheduleLinkProps {
  slug: string;
}

const PrintScheduleLink: React.FC<PrintScheduleLinkProps> = ({ slug }) => {
  // Find the event ID from the slug
  const event = EVENTS.find(e => e.slug === slug);
  
  if (!event) {
    return null;
  }
  
  return (
    <Link
      href={`/print-schedule/${event.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 bg-navy-800 text-white px-4 py-2 rounded-md hover:bg-navy-700 transition-colors"
    >
      <Printer size={16} />
      <span>Printable Schedule</span>
    </Link>
  );
};

export default PrintScheduleLink;
