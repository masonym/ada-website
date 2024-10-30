import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { ArrowRight } from 'lucide-react';

type EventCardProps = {
  title: string,
  date: string,
  description: string,
  image: string
  link: string
}

const EventCard = ({ title, date, description, image, link }: EventCardProps) => {
  return (
    <div className="border-2 border-gray-20 rounded-md w-full h-full">
      <Link href={link} className="block relative aspect-[5/2] w-full">
        <Image
          src={image}
          fill
          alt={`Event image for ${title}`}
          className="rounded-t-md object-fill"
        />
      </Link>
      <div className="p-6">
        <h1 className="font-gotham font-bold text-2xl md:text-3xl text-slate-900 mb-2">{title}</h1>
        <p className="font-gotham font-bold text-lg md:text-xl text-slate-700 mb-3">{date}</p>
        <p className="font-gotham text-base text-slate-500">{description}</p>
      </div>
    </div>
  )
}

export default EventCard