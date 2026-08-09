import SponsorOptions from '@/app/components/SponsorOptions'
import SponsorLogos from '@/app/components/SponsorLogos'
import { EVENTS } from '@/constants/events';
import { getEventSponsors } from '@/lib/sanity';
import { getEventDocumentUrls } from '@/lib/s3/event-documents';
import { notFound } from 'next/navigation';
import React from 'react'



const page = async ({ params }: { params: Promise<{ slug: string }> }) => {
    const { slug } = await params;
    const event = EVENTS.find((e) => e.slug === slug);

    if (!event) {
        notFound();
    }

    const [eventSponsors, documents] = await Promise.all([
        getEventSponsors(event.id),
        getEventDocumentUrls(event.eventShorthand),
    ]);
    const sponsorTierStyles = eventSponsors?.tiers.reduce<Record<string, string>>((acc, tier) => {
        if (tier.style) {
            acc[tier.id] = tier.style;
        }

        return acc;
    }, {});

    return (
        <>
            <SponsorOptions
                event={event}
                sponsorTierStyles={sponsorTierStyles}
                prospectusUrl={documents.prospectus}
                exhibitInstructionsUrl={documents.exhibitInstructions}
            />
            
            <SponsorLogos event={event} showTiers={['Sponsor', 'Partner']} />
        </>
    )
}

export default page