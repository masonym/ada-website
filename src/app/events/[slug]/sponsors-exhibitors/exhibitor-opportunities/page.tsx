import { EVENTS } from '@/constants/events';
import { notFound } from 'next/navigation';
import React from 'react'
import ExhibitorOptions from '@/app/components/ExhibitorOptions';
import SponsorLogos from '@/app/components/SponsorLogos';
import { getEventSponsors } from '@/lib/sanity';



const page = async ({ params }: { params: Promise<{ slug: string }> }) => {
    const { slug } = await params;
    const event = EVENTS.find((e) => e.slug === slug);

    if (!event) {
        notFound();
    }

    const eventSponsors = await getEventSponsors(event.id);
    const exhibitorTierStyles = eventSponsors?.tiers.reduce<Record<string, string>>((acc, tier) => {
        if (tier.style) {
            acc[tier.id] = tier.style;

            if (tier.name.toLowerCase().includes('exhibitor') && !tier.name.toLowerCase().includes('spotlight')) {
                acc.exhibit = tier.style;
                acc['table-top-exhibit-space'] = tier.style;
            }
        }

        return acc;
    }, {});

    return (
        <>
            {/* <div className="max-container mx-auto pt-8 px-4 flex flex-col items-start underline">
                <Link href={`/events/${params.slug}`} className="text-[24px] items-center font-bold text-gray-700 hover:text-gray-900 flex">
                    <ChevronLeft /> Back
                </Link>
            </div> */}

            <ExhibitorOptions
                event={event}
                exhibitorTierStyles={exhibitorTierStyles}
            />
            
            <SponsorLogos event={event} showTiers={["Exhibitors", "Exhibitor Spotlight"]} />
        </>
    )
}

export default page