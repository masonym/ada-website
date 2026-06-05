import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Event } from '@/types/events';
import { urlFor, getEventSponsors, getEventTierSponsors, SanitySponsor } from '@/lib/sanity';

type RecapSponsorGridProps = {
    event: Event;
};

const RecapSponsorGrid = async ({ event }: RecapSponsorGridProps) => {
    const eventSponsors = await getEventSponsors(event.id);

    if (!eventSponsors || eventSponsors.tiers.length === 0) {
        return null;
    }

    // Flatten all sponsors across all tiers into one deduplicated list
    const seen = new Set<string>();
    const allSponsors: SanitySponsor[] = [];

    for (const tier of eventSponsors.tiers) {
        const tierSponsors = await getEventTierSponsors(event.id, tier.id);
        for (const sponsor of tierSponsors) {
            if (sponsor?.logo && !seen.has(sponsor._id)) {
                seen.add(sponsor._id);
                allSponsors.push(sponsor);
            }
        }
    }

    if (allSponsors.length === 0) {
        return null;
    }

    allSponsors.sort((a, b) => a.name.localeCompare(b.name));

    return (
        <div className="w-full max-w-7xl mx-auto mt-12 px-4">
            <div className="relative mb-8">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center">
                    <h2 className="bg-white px-6 py-2 text-2xl md:text-3xl font-bold text-center text-slate-700">
                        Thank You to Our Sponsors &amp; Exhibitors
                    </h2>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-wrap justify-center gap-4">
                    {allSponsors.map((sponsor) => {
                        const logo = (
                            <Image
                                src={urlFor(sponsor.logo).url()}
                                alt={`${sponsor.name} Logo`}
                                width={140}
                                height={80}
                                unoptimized={true}
                                className="object-contain max-w-full max-h-full"
                            />
                        );

                        return (
                            <div
                                key={sponsor._id}
                                className="flex items-center justify-center p-2 hover:scale-105 transition-transform duration-200 w-[calc(33%-1rem)] sm:w-[calc(25%-1rem)] md:w-[calc(16.66%-1rem)] lg:w-[calc(12.5%-1rem)]"
                                title={sponsor.name}
                            >
                                {sponsor.website ? (
                                    <Link
                                        href={sponsor.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center w-full h-full hover:opacity-80 transition-opacity"
                                    >
                                        {logo}
                                    </Link>
                                ) : (
                                    logo
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default RecapSponsorGrid;
