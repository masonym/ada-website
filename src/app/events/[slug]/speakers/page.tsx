import { EVENTS } from '@/constants/events';
import { notFound } from 'next/navigation';
import { getEventSpeakersPublic } from '@/lib/sanity';
import SpeakersPageClient from './SpeakersPageClient';

// revalidate every 60 seconds - no redeploy needed for speaker updates
export const revalidate = 60;

export default async function SpeakersPage({ params }: { params: { slug: string } }) {
    const event = EVENTS.find((e) => e.slug === params.slug);

    if (!event) {
        notFound();
    }

    // fetch speakers from sanity
    const speakerData = await getEventSpeakersPublic(event.id);

    return (
        <SpeakersPageClient
            event={event}
            sanitySpeakers={speakerData?.speakers || null}
            sanityKeynoteSpeakers={speakerData?.keynoteSpeakers || null}
        />
    );
}
