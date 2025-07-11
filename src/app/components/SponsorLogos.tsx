import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getEventSponsors } from '@/constants/eventSponsors';
import { getSponsor, SPONSOR_SIZES, Sponsor, SponsorSize } from '@/constants/sponsors';
import { Event } from '@/types/events';
import { getCdnPath } from '@/utils/image';

type SponsorProps = {
    event: Event;
    showTiers?: string[];
    titleOverride?: string;
};

const SponsorLogos = ({ event, showTiers, titleOverride }: SponsorProps) => {
    const eventSponsors = getEventSponsors(event.id);

    if (!eventSponsors || eventSponsors.tiers.length === 0) {
        return null;
    }

    const filteredTiers = showTiers
        ? eventSponsors.tiers.filter(tier =>
            showTiers.some(showTier =>
                tier.name.toLowerCase().includes(showTier.toLowerCase())
            )
        )
        : eventSponsors.tiers;

    if (filteredTiers.length === 0) {
        return null;
    }

    // Process tiers and load sponsor data
    const processedTiers = filteredTiers.map(tier => {
        const sponsors = tier.sponsorIds
            .map(id => getSponsor(id))
            .filter(sponsor => sponsor !== undefined)
            .sort((a, b) => a!.name.localeCompare(b!.name));

        return {
            ...tier,
            sponsors
        };
    });

    const getDefaultTierStyle = (tierName: string) => {
        if (tierName.toLowerCase().includes('small')) return 'bg-sb-100 text-slate-900';
        if (tierName.toLowerCase().includes('gold')) return 'bg-amber-400 text-slate-900';
        if (tierName.toLowerCase().includes('silver')) return 'bg-gray-300 text-slate-900';
        if (tierName.toLowerCase().includes('bronze')) return 'bg-amber-700 text-white';
        if (tierName.toLowerCase().includes('premier')) return 'bg-purple-600 text-white';
        if (tierName.toLowerCase().includes('platinum')) return 'bg-sky-300 text-slate-900';
        if (tierName.toLowerCase().includes('diamond')) return 'bg-blue-500 text-white';
        return 'bg-blue-600 text-white';
    };

    const getTierGridClass = (tierId: string, sponsorCount: number) => {
        // Base grid class
        let gridClass = 'grid ';

        // Responsive columns based on tier type and sponsor count
        if (tiersWithDescriptions.includes(tierId) || sponsorCount === 1) {
            gridClass += 'grid-cols-1';
        } else if (sponsorCount === 2) {
            gridClass += 'grid-cols-1 sm:grid-cols-2';
        } else if (sponsorCount === 3) {
            gridClass += 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
        } else {
            gridClass += 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
        }

        return gridClass;
    };

    const getSponsorImageSize = (sponsor: Sponsor) => {
        // If sponsor has a standard size, use those dimensions
        if (sponsor.size && Object.keys(SPONSOR_SIZES).includes(sponsor.size)) {
            const sizeConfig = SPONSOR_SIZES[sponsor.size as SponsorSize];
            return {
                width: sizeConfig.maxWidth,
                height: sizeConfig.maxHeight
            };
        }

        // Otherwise, use custom dimensions
        return {
            width: sponsor.width || 300,
            height: 200 // Default height
        };
    };



    // List of sponsor tiers that should display descriptions
    const tiersWithDescriptions = [
        'gold-sponsor', 'silver-sponsor', 'bronze-sponsor', 'platinum-sponsor', 'diamond-sponsor', 'premier', 'vip-networking-reception-sponsor'
    ];

    return (
        <div className="w-full max-w-7xl mx-auto mt-4 px-4">
            {(titleOverride || eventSponsors.title) && (
                <div className="relative mb-2">
                    <div className="text-slate-700 relative flex justify-center">
                        <h2 className="px-4 md:px-8 py-2 md:py-3 text-2xl md:text-3xl lg:text-4xl font-bold text-center">
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

            {processedTiers.map((tier, tierIndex) => (
                <div key={tierIndex} className="mb-6 md:mb-8 last:mb-8">
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
                        <div className={getTierGridClass(tier.id, tier.sponsors.length)}>
                            {tier.sponsors.map((sponsor, sponsorIndex) => {

                                const allSponsorsHaveDescriptions = tier.sponsors.every(s => !!s.description);
                                const imageSize = getSponsorImageSize(sponsor);
                                const isTopTier = tier.topTier;

                                return (
                                    <div
                                        key={sponsorIndex}
                                        className={`flex flex-col items-center justify-center p-4 transition-transform hover:scale-105 duration-300 ${isTopTier
                                            ? 'relative p-6 rounded-xl  '
                                            : ''
                                            }`}
                                    >
                                        {isTopTier && (
                                            <div className="w-fit text-nowrap absolute -top-1 md:-top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-900 px-4 py-1 rounded-full text-sm font-semibold ">
                                                ★ Featured Sponsor
                                            </div>
                                        )}
                                        {sponsor.website ? (
                                            <Link
                                                href={sponsor.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full flex justify-center items-center hover:opacity-80 transition-opacity"
                                            >
                                                <Image
                                                    src={getCdnPath(sponsor.logo)}
                                                    alt={`${sponsor.name} Logo`}
                                                    width={imageSize.width}
                                                    height={imageSize.height}
                                                    priority={sponsor.priority || isTopTier}
                                                    unoptimized={true}
                                                    sizes={`(max-width: 640px) 280px, (max-width: 1024px) 400px, 720px`}
                                                    className={`object-contain max-w-full max-h-full `}
                                                />
                                            </Link>
                                        ) : (
                                            <Image
                                                src={getCdnPath(sponsor.logo)}
                                                alt={`${sponsor.name} Logo`}
                                                width={imageSize.width}
                                                height={imageSize.height}
                                                priority={sponsor.priority || isTopTier}
                                                unoptimized={true}
                                                sizes={`(max-width: 640px) 280px, (max-width: 1024px) 400px, 720px`}
                                                className={`object-contain max-w-full max-h-full ${isTopTier ? 'drop-shadow-md' : ''}`}
                                            />
                                        )}
                                        {tiersWithDescriptions.includes(tier.id) && sponsor.description && (
                                            <div className="text-lg mt-4 text-center text-pretty text-slate-600">
                                                <span dangerouslySetInnerHTML={{ __html: sponsor.description }}></span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SponsorLogos;
