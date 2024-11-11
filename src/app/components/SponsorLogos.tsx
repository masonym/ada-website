import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { EVENT_SPONSORS, SponsorTier } from '@/constants/eventSponsors';
import { EventProps } from './Speakers';

type SponsorProps = {
    event: EventProps;
    showTiers?: string[];  // Array of tier names to show
    titleOverride?: string;  // Optional title override
};

const SponsorLogos = ({ 
    event, 
    showTiers,
    titleOverride 
}: SponsorProps) => {
    const eventSponsors = EVENT_SPONSORS.find((e) => e.id === event.id);

    if (!eventSponsors || eventSponsors.tiers.length === 0) {
        return null;
    }

    // Filter tiers if showTiers is provided
    const filteredTiers = showTiers 
        ? eventSponsors.tiers.filter(tier => showTiers.includes(tier.name))
        : eventSponsors.tiers;

    if (filteredTiers.length === 0) {
        return null;
    }

    return (
        <div className="w-full max-w-7xl mx-auto mt-12 px-4">
            {(titleOverride || eventSponsors.title) && (
                <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-center font-gotham text-slate-700 mb-8">
                    {titleOverride || eventSponsors.title}
                </h2>
            )}
            
            {eventSponsors.description && (
                <p className="text-center text-slate-600 mb-8">
                    {eventSponsors.description}
                </p>
            )}

            {filteredTiers.map((tier, tierIndex) => (
                <div key={tierIndex} className="mb-12 last:mb-0">
                    <h3 className="text-2xl sm:text-4xl font-bold text-center text-slate-700 mt-4 mb-2">
                        {tier.name}
                    </h3>
                    
                    {tier.description && (
                        <p className="text-center text-slate-600 mb-6">
                            {tier.description}
                        </p>
                    )}

                    <div className="flex justify-center items-center gap-8 flex-wrap">
                        {tier.sponsors.map((sponsor, sponsorIndex) => (
                            <div 
                                key={sponsorIndex} 
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
            ))}
        </div>
    );
};

export default SponsorLogos;