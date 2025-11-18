import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { ArrowRight } from 'lucide-react';
import { getCdnPath } from '@/utils/image';
import { EventBadge } from '@/types/events';

type EventCardProps = {
  title: string,
  date: string,
  description: string,
  image: string
  link: string
  badge?: EventBadge
}

const getBadgeStyles = (color: EventBadge['color']) => {
  switch (color) {
    case 'green':
      return 'bg-green-500 text-white';
    case 'blue':
      return 'bg-blue-500 text-white';
    case 'red':
      return 'bg-red-500 text-white';
    case 'yellow':
      return 'bg-yellow-400 text-slate-900';
    default:
      return 'bg-green-500 text-white';
  }
};

const EventCard = ({ title, date, description, image, link, badge }: EventCardProps) => {
  return (
    <div className="border-2 border-gray-20 rounded-md w-full h-full">
      <Link href={link} className="block relative aspect-[5/2] w-full">
        <Image
          src={getCdnPath(image)}
          fill
          alt={`Event image for ${title}`}
          className="rounded-t-md object-fill"
        />
      </Link>
      <div className="p-6">
        <h1 className="font-gotham font-bold text-2xl md:text-3xl text-slate-900 mb-2">{title}</h1>
        <div className="flex items-center gap-2 mb-3">
          {badge && (
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${getBadgeStyles(badge.color)}`}>
              {badge.text}
            </span>
          )}
          <p className="font-gotham font-bold text-lg md:text-xl text-slate-700">{date}</p>
        </div>
        <p className="font-gotham text-base text-slate-500">{description}</p>
      </div>
    </div>
  )
}

export default EventCard