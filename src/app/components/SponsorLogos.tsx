import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { EVENT_SPONSORS } from '@/constants/eventSponsors';
import { Event } from '@/types/events';
import { getCdnPath } from '@/utils/image';

type SponsorProps = {
    event: Event;
    showTiers?: string[];
    titleOverride?: string;
};

const SponsorLogos = ({ event, showTiers, titleOverride }: SponsorProps) => {
    const eventSponsors = EVENT_SPONSORS.find((e) => e.id === event.id);

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

    const sortedTiers = filteredTiers.map(tier => ({

        ...tier,
        sponsors: [...tier.sponsors].sort((a, b) => a.name.localeCompare(b.name))
    }));

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

    const getGridCols = (sponsorCount: number) => {
        if (sponsorCount === 1) return 'grid-cols-1';
        if (sponsorCount === 2) return 'grid-cols-1 sm:grid-cols-2';
        if (sponsorCount === 3) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
    };

    const getSponsorImageSize = (sponsor: any, isMobile: boolean) => {
        // Calculate responsive dimensions while maintaining aspect ratio
        const aspectRatio = sponsor.width / sponsor.height;
        const maxWidth = isMobile ? 280 : sponsor.width || 300;
        const height = Math.round(maxWidth / aspectRatio);

        return {
            width: maxWidth,
            height: height
        };
    };

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

            {sortedTiers.map((tier, tierIndex) => (
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
                        <div className={`grid ${getGridCols(tier.sponsors.length)} gap-4 justify-items-center`}>
                            {tier.sponsors.map((sponsor, sponsorIndex) => {
                                const mobileSize = getSponsorImageSize(sponsor, true);
                                const desktopSize = getSponsorImageSize(sponsor, false);
                                const isTopTier = tier.topTier;

                                return (
                                    <div
                                        key={sponsorIndex}
                                        className={`flex flex-col items-center justify-center w-full transition-transform hover:scale-105 duration-300 
                                            ${isTopTier ? 'relative p-6 rounded-xl bg-gradient-to-r from-slate-50 to-white ' : ''}`}
                                    >
                                        {isTopTier && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-900 px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                                                ★ Featured Sponsor
                                            </div>
                                        )}
                                        {sponsor.website ? (
                                            <Link
                                                href={sponsor.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="transition-opacity hover:opacity-80 w-full flex justify-center items-center"
                                            >
                                                <div className="relative w-full flex items-center justify-center">
                                                    <Image
                                                        src={getCdnPath(sponsor.logo)}
                                                        alt={`${sponsor.name} Logo`}
                                                        width={isTopTier ? desktopSize.width * 1.2 : desktopSize.width}
                                                        height={isTopTier ? desktopSize.height * 1.2 : desktopSize.height}
                                                        priority={sponsor.priority || isTopTier}
                                                        unoptimized={true}
                                                        sizes={`${isTopTier ?
                                                            '(max-width: 640px) 320px, (max-width: 1024px) 480px, 860px' :
                                                            '(max-width: 640px) 280px, (max-width: 1024px) 400px, 720px'}`}
                                                        className={`${isTopTier ? 'drop-shadow-md' : ''}`}
                                                    />
                                                </div>
                                            </Link>
                                        ) : (
                                            <div className="relative w-full flex items-center justify-center">
                                                <Image
                                                    src={getCdnPath(sponsor.logo)}
                                                    alt={`${sponsor.name} Logo`}
                                                    width={isTopTier ? desktopSize.width * 1.2 : desktopSize.width}
                                                    height={isTopTier ? desktopSize.height * 1.2 : desktopSize.height}
                                                    priority={sponsor.priority || isTopTier}
                                                    unoptimized={true}
                                                    sizes={`${isTopTier ?
                                                        '(max-width: 640px) 320px, (max-width: 1024px) 480px, 860px' :
                                                        '(max-width: 640px) 280px, (max-width: 1024px) 400px, 720px'}`}
                                                    className={`${isTopTier ? 'drop-shadow-md' : ''}`}
                                                />
                                            </div>
                                        )}
                                        {isTopTier && sponsor.description && (
                                            <div className="text-lg mt-4 text-center text-slate-600 ">
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
