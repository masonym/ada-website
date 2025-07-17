'use client';

import React from 'react'
import VIPReceptionSection from '@/app/components/VIPReceptionSection'
import { EVENTS } from '@/constants/events'
import { notFound } from 'next/navigation'

const VIPNetworkingReception = ({ params }: { params: { slug: string } }) => {
    const event = EVENTS.find((e) => e.slug === params.slug);

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