import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Event } from '@/types/events';
import { urlFor, getEventSponsors, getEventTierSponsors, SanitySponsor } from '@/lib/sanity';

type RecapSponsorGridProps = {
    event: Event;
};

const FEATURED_TIER_KEYWORDS = ['platinum', 'diamond', 'gold', 'silver', 'bronze'];

const isFeaturedTier = (tierName: string) =>
    FEATURED_TIER_KEYWORDS.some((kw) => tierName.toLowerCase().includes(kw));

const SponsorLogo = ({ sponsor, width, height }: { sponsor: SanitySponsor; width: number; height: number }) => {
    const img = (
        <Image
            src={urlFor(sponsor.logo).url()}
            alt={`${sponsor.name} Logo`}
            width={width}
            height={height}
            unoptimized={true}
            className="object-contain max-w-full max-h-full"
        />
    );
    if (sponsor.website) {
        return (
            <Link
                href={sponsor.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full h-full hover:opacity-80 transition-opacity"
            >
                {img}
            </Link>
        );
    }
    return img;
};

const RecapSponsorGrid = async ({ event }: RecapSponsorGridProps) => {
    const eventSponsors = await getEventSponsors(event.id);

    if (!eventSponsors || eventSponsors.tiers.length === 0) {
        return null;
    }

    const featuredSeen = new Set<string>();
    const featuredSponsors: SanitySponsor[] = [];
    const allSeen = new Set<string>();
    const allSponsors: SanitySponsor[] = [];

    for (const tier of eventSponsors.tiers) {
        const tierSponsors = await getEventTierSponsors(event.id, tier.id);
        const featured = isFeaturedTier(tier.name);

        for (const sponsor of tierSponsors) {
            if (!sponsor?.logo) continue;

            if (featured && !featuredSeen.has(sponsor._id)) {
                featuredSeen.add(sponsor._id);
                featuredSponsors.push(sponsor);
            }

            if (!allSeen.has(sponsor._id)) {
                allSeen.add(sponsor._id);
                allSponsors.push(sponsor);
            }
        }
    }

    if (allSponsors.length === 0) {
        return null;
    }

    featuredSponsors.sort((a, b) => a.name.localeCompare(b.name));
    allSponsors.sort((a, b) => a.name.localeCompare(b.name));

    // Sponsors shown in the featured box should not repeat in the full grid
    const remainingSponsors = allSponsors.filter((s) => !featuredSeen.has(s._id));

    return (
        <div className="w-full max-w-7xl mx-auto mt-12 px-4">
            <div className="relative mb-8">
                <div className="relative flex justify-center">
                    <h2 className="bg-sb-100 rounded-full px-6 py-2 text-2xl md:text-3xl font-bold text-center text-slate-700">
                        Thank You to Our Sponsors &amp; Exhibitors
                    </h2>
                </div>
            </div>

            {/* Featured sponsors box */}
            {featuredSponsors.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-4">
                    <div className="flex flex-wrap justify-center gap-6">
                        {featuredSponsors.map((sponsor) => (
                            <div
                                key={sponsor._id}
                                className="flex items-center justify-center p-3 hover:scale-105 transition-transform duration-200 w-[calc(50%-1.5rem)] sm:w-[calc(33%-1.5rem)] md:w-[calc(25%-1.5rem)] lg:w-[calc(20%-1.5rem)]"
                                title={sponsor.name}
                            >
                                <SponsorLogo sponsor={sponsor} width={220} height={120} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* All remaining sponsors grid */}
            {remainingSponsors.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex flex-wrap justify-center gap-4">
                        {remainingSponsors.map((sponsor) => (
                            <div
                                key={sponsor._id}
                                className="flex items-center justify-center p-2 hover:scale-105 transition-transform duration-200 w-[calc(33%-1rem)] sm:w-[calc(25%-1rem)] md:w-[calc(16.66%-1rem)] lg:w-[calc(12.5%-1rem)]"
                                title={sponsor.name}
                            >
                                <SponsorLogo sponsor={sponsor} width={140} height={80} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecapSponsorGrid;
