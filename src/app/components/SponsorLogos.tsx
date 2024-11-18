import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { EVENT_SPONSORS } from '@/constants/eventSponsors';
import { EventProps } from './Speakers';

type SponsorProps = {
    event: EventProps;
    showTiers?: string[];
    titleOverride?: string;
};

const SponsorLogos = ({ event, showTiers, titleOverride }: SponsorProps) => {
    const eventSponsors = EVENT_SPONSORS.find((e) => e.id === event.id);

    if (!eventSponsors || eventSponsors.tiers.length === 0) {
        return null;
    }

    const filteredTiers = showTiers 
        ? eventSponsors.tiers.filter(tier => showTiers.includes(tier.name))
        : eventSponsors.tiers;

    if (filteredTiers.length === 0) {
        return null;
    }

    const getDefaultTierStyle = (tierName: string) => {
        if (tierName.toLowerCase().includes('gold')) return 'bg-amber-400 text-slate-900';
        if (tierName.toLowerCase().includes('silver')) return 'bg-gray-300 text-slate-900';
        if (tierName.toLowerCase().includes('bronze')) return 'bg-amber-700 text-white';
        if (tierName.toLowerCase().includes('premier')) return 'bg-purple-600 text-white';
        if (tierName.toLowerCase().includes('platinum')) return 'bg-gray-100 text-slate-900';
        if (tierName.toLowerCase().includes('diamond')) return 'bg-blue-500 text-white';
        return 'bg-blue-600 text-white';
    };

    // Helper function to determine grid columns based on number of sponsors
    const getGridCols = (sponsorCount: number) => {
        if (sponsorCount === 1) return 'grid-cols-1';
        if (sponsorCount === 2) return 'grid-cols-1 sm:grid-cols-2';
        if (sponsorCount === 3) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
    };

    return (
        <div className="w-full max-w-7xl mx-auto mt-4 px-4">
            {(titleOverride || eventSponsors.title) && (
                <div className="relative mb-8 md:mb-12">
                    <div className="text-slate-700 relative flex justify-center">
                        <h2 className="px-4 md:px-8 py-2 md:py-3 text-xl md:text-2xl lg:text-3xl font-bold text-center">
                            {titleOverride || eventSponsors.title}
                        </h2>
                    </div>
                </div>
            )}
            
            {eventSponsors.description && (
                <p className="text-center text-slate-600 mb-6 md:mb-8 max-w-3xl mx-auto px-4 text-sm md:text-base">
                    {eventSponsors.description}
                </p>
            )}

            {filteredTiers.map((tier, tierIndex) => (
                <div key={tierIndex} className="mb-6 md:mb-8 last:mb-0">
                    <div className="relative mb-6 md:mb-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className={`px-4 md:px-6 py-2 text-lg md:text-xl lg:text-2xl font-bold rounded-full ${tier.style || getDefaultTierStyle(tier.name)}`}>
                                {tier.name}
                            </span>
                        </div>
                    </div>
                    
                    {tier.description && (
                        <p className="text-center text-slate-600 mb-4 md:mb-6 max-w-2xl mx-auto px-4 text-sm md:text-base">
                            {tier.description}
                        </p>
                    )}

                    <div className="bg-white p-4 md:p-8 rounded-lg shadow-md">
                        <div className={`grid ${getGridCols(tier.sponsors.length)} gap-2 justify-items-center`}>
                            {tier.sponsors.map((sponsor, sponsorIndex) => (
                                <div 
                                    key={sponsorIndex} 
                                    className={`flex items-center justify-center w-full transition-transform hover:scale-105 duration-300
                                        ${tier.sponsors.length === 1 ? 'mx-auto' : 'max-w-md'}`}
                                >
                                    {sponsor.website ? (
                                        <Link 
                                            href={sponsor.website} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="transition-opacity hover:opacity-80 w-full flex justify-center"
                                        >
                                            <Image
                                                src={sponsor.logo}
                                                alt={`${sponsor.name} Logo`}
                                                width={sponsor.width || 300}
                                                height={sponsor.height || 150}
                                                className="w-auto max-h-40 object-contain filter drop-shadow-md"
                                                priority={sponsor.priority}
                                                style={{ maxWidth: '100%' }}
                                            />
                                        </Link>
                                    ) : (
                                        <Image
                                            src={sponsor.logo}
                                            alt={`${sponsor.name} Logo`}
                                            width={sponsor.width || 300}
                                            height={sponsor.height || 150}
                                            className="w-auto max-h-40 object-contain filter drop-shadow-md"
                                            priority={sponsor.priority}
                                            style={{ maxWidth: '100%' }}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SponsorLogos;