import React from 'react'
import VIPReceptionSection from '@/app/components/VIPReceptionSection'
import { EVENTS } from '@/constants/events'
import { notFound } from 'next/navigation'

const VIPNetworkingReception = async ({ params }: { params: Promise<{ slug: string }> }) => {
    const { slug } = await params;
    const event = EVENTS.find((e) => e.slug === slug);

    if (!event) {
        notFound();
    }

    return (
        event.vipNetworkingReception && (
            <VIPReceptionSection vipNetworkingReception={event.vipNetworkingReception} />
        )
    )
}

export default VIPNetworkingReception