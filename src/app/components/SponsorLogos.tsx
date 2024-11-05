import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { EVENT_SPONSORS } from '@/constants/eventSponsors';
import { EventProps } from './Speakers';

type SponsorProps = {
  event: EventProps;
};

const SponsorLogos = ({ event }: SponsorProps) => {
  const eventSponsors = EVENT_SPONSORS.find((e) => e.id === event.id);

  if (!eventSponsors || eventSponsors.sponsors.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-7xl mx-auto mt-12 px-4">
      {eventSponsors.title && (
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center font-gotham text-slate-700 mb-8">
          {eventSponsors.title}
        </h2>
      )}
      
      {eventSponsors.description && (
        <p className="text-center text-slate-600 mb-8">
          {eventSponsors.description}
        </p>
      )}

      <div className="flex justify-center items-center gap-8 flex-wrap">
        {eventSponsors.sponsors.map((sponsor, index) => (
          <div 
            key={index} 
            className="relative"
            style={{ 
              width: sponsor.width || 'auto',
              height: sponsor.height || 'auto' 
            }}
          >
            {sponsor.website ? (
              <Link 
                href={sponsor.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="transition-opacity hover:opacity-80"
              >
                <Image
                  src={sponsor.logo}
                  alt={`${sponsor.name} Logo`}
                  width={sponsor.width || 100}
                  height={sponsor.height || 100}
                  style={{ maxWidth: '100%', height: 'auto' }}
                  priority={sponsor.priority}
                />
              </Link>
            ) : (
              <Image
                src={sponsor.logo}
                alt={`${sponsor.name} Logo`}
                width={sponsor.width || 100}
                height={sponsor.height || 100}
                style={{ maxWidth: '100%', height: 'auto' }}
                priority={sponsor.priority}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SponsorLogos;