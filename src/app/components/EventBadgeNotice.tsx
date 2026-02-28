import React from 'react';
import { EventBadge } from '@/types/events';

interface EventBadgeNoticeProps {
  badge: EventBadge;
  eventDate: string;
}

const getBadgeStyles = (color: EventBadge['color']) => {
  switch (color) {
    case 'green':
      return 'bg-green-100 border-green-500 text-green-800';
    case 'blue':
      return 'bg-blue-100 border-blue-500 text-blue-800';
    case 'red':
      return 'bg-red-100 border-red-500 text-red-800';
    case 'yellow':
      return 'bg-yellow-100 border-yellow-500 text-yellow-800';
    default:
      return 'bg-green-100 border-green-500 text-green-800';
  }
};

const EventBadgeNotice: React.FC<EventBadgeNoticeProps> = ({ badge, eventDate }) => {
  return (
    <div className={`w-full max-w-4xl mx-auto mb-8 p-6 border-2 rounded-lg ${getBadgeStyles(badge.color)}`}>
      <div className="flex items-center justify-center">
        <span className="text-2xl font-bold text-center">
          {badge.text} {eventDate}
        </span>
      </div>
    </div>
  );
};

export default EventBadgeNotice;
