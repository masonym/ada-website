// app/events/[slug]/page.tsx

import React from 'react';
import { EVENTS } from '@/constants/events';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Button from '@/app/components/Button';
import SponsorOptions from '@/app/components/SponsorOptions';
import CountdownTimer from '@/app/components/CountdownTimer';
import RegistrationOptions from '@/app/components/RegistrationOptions';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export async function generateStaticParams() {
  return EVENTS.map((event) => ({
    slug: event.slug,
  }));
}

export default function EventPage({ params }: { params: { slug: string } }) {
  const event = EVENTS.find((e) => e.slug === params.slug);

  if (!event) {
    notFound();
  }

  return (
    <div>
      <div className="max-container mx-auto pt-8 px-4 flex flex-row gap-8 items-start">
        <Button
          title="REGISTER"
          variant="btn_sqr_blue"
          link={event.registerLink}
        />
        <Button
          title="SPONSORSHIP OPPORTUNITIES"
          variant="btn_sqr_navy_blue"
          link={`/events/${event.slug}/sponsor`}
        />
        <Button
          title="EVENT SPEAKERS"
          variant="btn_sqr_navy_blue"
          link={`/events/${event.slug}/speakers`}
        />
      </div>
      <div className="py-8 flex flex-col items-center">
        <Image
          src={event.image}
          width={1000}
          height={400}
          alt={`Event image for ${event.title}`}
          className="mb-6 w-full max-w-[1536px]"
        />

        <CountdownTimer
          targetDate={event.timeStart}
        >

        </CountdownTimer>

        <h2 className="text-[48px] font-bold text-center font-gotham text-slate-700 ">
          Event Info
        </h2>
        <div className="flex flex-col leading-loose text-slate-600 max-w-4xl">
          {event.eventText}
        </div>

        <RegistrationOptions
          event={event}
        >

        </RegistrationOptions>

        {/* register */}
        <div className="">
          <h3 className="text-[32px] font-bold font-gotham text-red-500 mb-4">
            Register Now!
          </h3>
          <Button
            title="REGISTER"
            variant="btn_blue"
            link={event.registerLink}
          />
        </div>
      </div>
    </div>
  );
}