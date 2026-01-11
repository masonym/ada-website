"use client";

import React, { useState, useEffect } from 'react';
import Speakers from '@/app/components/Speakers';
import PasswordModal from '@/app/components/PasswordModal';
import { Event } from '@/types/events';
import { EventSpeakerPublic } from '@/lib/sanity';

type Props = {
    event: Event;
    sanitySpeakers: EventSpeakerPublic[] | null;
    sanityKeynoteSpeakers: EventSpeakerPublic[] | null;
};

export default function SpeakersPageClient({ event, sanitySpeakers, sanityKeynoteSpeakers }: Props) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [error, setError] = useState('');
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    useEffect(() => {
        const storedAuth = localStorage.getItem(`auth-${event.slug}`);
        if (storedAuth === 'true') {
            setIsAuthenticated(true);
        }
    }, [event.slug]);

    const handlePasswordSubmit = (password: string) => {
        if (password === event.password) {
            setIsAuthenticated(true);
            setError('');
            setShowPasswordModal(false);
            localStorage.setItem(`auth-${event.slug}`, 'true');
        } else {
            setError('Incorrect password. Please try again.');
        }
    };

    return (
        <div>
            <Speakers
                event={event}
                isAuthenticated={isAuthenticated}
                onRequestPassword={() => setShowPasswordModal(true)}
                sanitySpeakers={sanitySpeakers}
                sanityKeynoteSpeakers={sanityKeynoteSpeakers}
            />

            <PasswordModal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                onSubmit={handlePasswordSubmit}
                error={error}
                setEnteredPassword={() => {}}
            />
        </div>
    );
}
