import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getEventMatchmakingSponsors, urlFor, SanitySponsor } from '@/lib/sanity';
import { ExternalLink } from 'lucide-react';

interface MatchmakingSponsorsProps {
  eventSlug: string;
}

const MatchmakingSponsorCard: React.FC<{ sponsor: SanitySponsor; note?: string }> = ({ sponsor, note }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
      <div className="flex-shrink-0 w-40 h-40 relative flex items-center justify-center">
        <Image
          src={urlFor(sponsor.logo).url()}
          alt={`${sponsor.name} logo`}
          width={160}
          height={160}
          className="object-contain max-h-40"
          style={{ maxWidth: '100%', height: 'auto' }}
          priority={sponsor.priority}
          unoptimized={true}
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
        {note && (
          <p className="text-slate-600 italic mt-4">
            {note}
          </p>
        )}
      </div>
    </div>
  );
};

const MatchmakingSponsors = async ({ eventSlug }: MatchmakingSponsorsProps) => {
  const data = await getEventMatchmakingSponsors(eventSlug);

  if (!data || data.sponsors.length === 0) {
    return null;
  }

  return (
    <div className="mt-16">
      <h2 className="text-4xl font-bold text-slate-900 mb-6 text-center">
        {data.title || "Companies Participating in Matchmaking Sessions"}
      </h2>
      {data.description && (
        <p className="text-lg text-slate-600 max-w-4xl mx-auto text-center mb-4">
          <span dangerouslySetInnerHTML={{ __html: data.description }} />
        </p>
      )}
      <div className="space-y-6">
        {data.sponsors.map((item) => (
          <MatchmakingSponsorCard key={item.sponsor._id} sponsor={item.sponsor} note={item.note} />
        ))}
      </div>
    </div>
  );
};

export default MatchmakingSponsors;
