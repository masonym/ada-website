import Image from 'next/image'
import React from 'react'

type EventCardProps = {
  title: string,
  date: string,
  description: string,
  image: string
}


const EventCard = ({ title, date, description, image }: EventCardProps ) => {
  return (
    <div className="border-2 border-red-500 rounded-md p-10 max-w-[640px]">
      <Image
      src={image}
      width={1000}
      height={400}
      alt={`Event image for ${title}`}
      />
      <p>{title}</p>
      <p>{date}</p>
      <p>{description}</p>
    </div>
  )
}

export default EventCard