"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getEventMatchmakingSponsors, getEventMatchmakingMetadata } from '@/constants/matchmaking-sponsors';
import { Sponsor } from '@/constants/sponsors';
import { ExternalLink } from 'lucide-react';
import { getCdnPath } from '@/utils/image';

interface MatchmakingSponsorsProps {
  eventSlug: string;
}

const MatchmakingSponsorCard: React.FC<{ sponsor: Sponsor }> = ({ sponsor }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
      <div className="flex-shrink-0 w-40 h-40 relative flex items-center justify-center">
        <Image
          src={getCdnPath(sponsor.logo)}
          alt={`${sponsor.name} logo`}
          width={160}
          height={160}
          className="object-contain max-h-40"
          style={{ maxWidth: '100%', height: 'auto' }}
          priority={sponsor.priority}
        />
      </div>
      <div className="flex-grow">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-semibold text-navy-800">{sponsor.name}</h3>
          {sponsor.website && (
            <Link 
              href={sponsor.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700 flex items-center text-sm"
            >
              <span className="mr-1">Visit Website</span>
              <ExternalLink size={14} />
            </Link>
          )}
        </div>
        {sponsor.description ? (
          <div 
            className="text-slate-600"
            dangerouslySetInnerHTML={{ __html: sponsor.description }}
          />
        ) : (
          <p className="text-slate-600 italic">
            This company will be participating in matchmaking sessions. Visit their website to learn more.
          </p>
        )}
      </div>
    </div>
  );
};

const MatchmakingSponsors: React.FC<MatchmakingSponsorsProps> = ({ eventSlug }) => {
  const sponsors = getEventMatchmakingSponsors(eventSlug);
  const metadata = getEventMatchmakingMetadata(eventSlug);

  if (sponsors.length === 0) {
    return null;
  }

  return (
    <div className="mt-16">
      <h2 className="text-4xl font-bold text-slate-900 mb-6 text-center">
        {metadata.title || "Companies Participating in Matchmaking Sessions"}
      </h2>
      {metadata.description && (
        <p className="text-lg text-slate-600 max-w-4xl mx-auto text-center mb-10">
          <span dangerouslySetInnerHTML={{ __html: metadata.description }} />
        </p>
      )}
      <div className="space-y-6">
        {sponsors.map((sponsor) => (
          <MatchmakingSponsorCard key={sponsor.id} sponsor={sponsor} />
        ))}
      </div>
    </div>
  );
};

export default MatchmakingSponsors;
