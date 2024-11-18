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

        // Get tier style from the tier object, fallback to default styling
    const getDefaultTierStyle = (tierName: string) => {
        if (tierName.toLowerCase().includes('gold')) return 'bg-amber-400 text-slate-900';
        if (tierName.toLowerCase().includes('silver')) return 'bg-gray-300 text-slate-900';
        if (tierName.toLowerCase().includes('bronze')) return 'bg-amber-700 text-white';
        if (tierName.toLowerCase().includes('premier')) return 'bg-purple-600 text-white';
        if (tierName.toLowerCase().includes('platinum')) return 'bg-gray-100 text-slate-900';
        if (tierName.toLowerCase().includes('diamond')) return 'bg-blue-500 text-white';
        return 'bg-blue-600 text-white';
    };

    return (
        <div className="w-full max-w-7xl mx-auto mt-4 px-4">
            {(titleOverride || eventSponsors.title) && (
                <div className="relative mb-12">
                    {/* <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div> */}
                    <div className="text-slate-700 relative flex justify-center">
                        <div className="px-8 py-3 text-2xl sm:text-3xl lg:text-4xl font-bold rounded-full">
                            {titleOverride || eventSponsors.title}
                        </div>
                    </div>
                </div>
            )}
            
            {eventSponsors.description && (
                <p className="text-center text-slate-600 mb-8 max-w-3xl mx-auto">
                    {eventSponsors.description}
                </p>
            )}

            {filteredTiers.map((tier, tierIndex) => (
                <div key={tierIndex} className="mb-16 last:mb-0">
                    <div className="relative mb-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className={`px-6 py-2 text-xl sm:text-2xl font-bold rounded-full ${tier.style || getDefaultTierStyle(tier.name)}`}>
                                {tier.name}
                            </span>
                        </div>
                    </div>
                    
                    {tier.description && (
                        <p className="text-center text-slate-600 mb-6 max-w-2xl mx-auto">
                            {tier.description}
                        </p>
                    )}

                    <div className="flex justify-center items-center gap-8 flex-wrap bg-white p-8 rounded-lg shadow-md">
                        {tier.sponsors.map((sponsor, sponsorIndex) => (
                            <div 
                                key={sponsorIndex} 
                                className="relative transition-transform hover:scale-105 duration-300"
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
                                            className="filter drop-shadow-md"
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
                                        className="filter drop-shadow-md"
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