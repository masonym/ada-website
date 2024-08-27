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
    <div className="border-2 border-gray-20 rounded-md max-w-[640px]">
      <Link href={link}>
        <Image
          src={image}
          width={1000}
          height={400}
          alt={`Event image for ${title}`}
        />
      </Link>
      <div className="p-5">
        <h1 className="flex-1 font-gotham font-bold ss:text-[72px] text-[32px] text-slate-900">{title}</h1>
        <p className="flex-1 font-gotham font-bold ss:text-[72px] text-[24px] text-slate-700">{date}</p>
        <p className="flex-1 font-gotham font-bold ss:text-[72px] text-[16px] text-slate-500">{description}</p>

        {/* <div className="mt-4 flex items-center gap-1">
          <Link href={link} className="underline text-blue-950 font-bold flex items-center gap-1">
            <span>Learn more</span>
            <ArrowRight size={20} />
          </Link>
        </div> */}
      </div>
    </div>
  )
}

export default EventCard
