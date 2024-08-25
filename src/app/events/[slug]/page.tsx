import React from 'react';
import { EVENTS } from '@/constants/events';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Button from '@/app/components/Button';
import Speakers from '@/app/components/Speakers';

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
    <div className="max-w-4xl mx-auto py-8 px-4 flex flex-col items-center">
      <h1 className="text-[48px] font-gotham font-bold mb-2  text-slate-700">{event.title}</h1>
      <p className="text-[28px] mb-4  text-slate-700">{event.date}</p>
      <Image
        src={event.image}
        width={1000}
        height={400}
        alt={`Event image for ${event.title}`}
        className="mb-6"
      />
      <div className="flex sm:flex-row flex-col my-8 gap-4 w-full">
        <Button
          title="REGISTER"
          // icon="/logo.png"
          variant="btn_sqr_blue"
          link={event.registerLink}
        />

        <Button
          title="SPONSORSHIP OPPORTUNITIES"
          // icon="/logo.png"
          variant="btn_sqr_red"
          link={event.registerLink}
        />
      </div>
      <h2 className="text-[48px] font-bold font-gotham text-slate-700">
        Event Info
      </h2>
      <div
        dangerouslySetInnerHTML={{ __html: event.eventText }}
        className="prose prose-zinc max-w-none mb-12"
      />

      <Speakers id={event.id}></Speakers>

      {/* register */}
      <div className="">
        <h3 className="text-[32px] font-bold font-gotham text-red-500 mb-4">
          Register Now!
        </h3>
        <Button
          title="REGISTER"
          // icon="/logo.png"
          variant="btn_blue"
          link={event.registerLink}
        />
      </div>
    </div>
  );
}