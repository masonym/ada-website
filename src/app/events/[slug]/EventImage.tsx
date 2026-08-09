import { getCdnPath } from '@/utils/image';
import Image from 'next/image';
import React from 'react';

/**
 * Event hero image.
 *
 * Takes the two fields it needs rather than looking the event up: it used to be
 * a client component importing all of EVENTS and searching by useParams().slug,
 * which is a lot of bundle for one <Image>. It is a server component now, so it
 * costs no client JavaScript at all.
 */
type EventImageProps = {
  /** Event image path, relative to the CDN root. */
  src: string;
  /** Event title, used for the alt text. */
  title: string;
};

const EventImage = ({ src, title }: EventImageProps) => (
  <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex flex-col items-center">
      <div className="w-full mb-6 relative aspect-[5/2]">
        <Image
          src={getCdnPath(src)}
          alt={`Event image for ${title}`}
          fill
          sizes="(max-width: 1280px) 100vw, 1280px"
          className="rounded-lg object-contain"
          priority
        />
      </div>
    </div>
  </div>
);

export default EventImage;
