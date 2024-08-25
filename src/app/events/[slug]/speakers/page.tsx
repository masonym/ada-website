"use client";

import React, { useState, useEffect } from 'react';
import { EVENTS } from '@/constants/events';
import { notFound } from 'next/navigation';
import Speakers from '@/app/components/Speakers';
import PasswordModal from '@/app/components/PasswordModal';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function SpeakersPage({ params }: { params: { slug: string } }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [error, setError] = useState('');
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [enteredPassword, setEnteredPassword] = useState('');

    const event = EVENTS.find((e) => e.slug === params.slug);

    if (!event) {
        notFound();
    }

    // Check local storage for authentication state
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
            // Store authentication state in local storage
            localStorage.setItem(`auth-${event.slug}`, 'true');
        } else {
            setError('Incorrect password. Please try again.');
        }
    };

    return (
        <div>

            <div className="max-w-4xl mx-auto pt-8 px-4 flex flex-col items-start underline">
                <Link href={`/events/${params.slug}`} className="text-[24px] items-center font-bold text-gray-700 hover:text-gray-900 flex">
                    <ChevronLeft /> Back
                </Link>
            </div>
            <div className="max-w-4xl mx-auto py-8 px-4 flex flex-col items-center ">
                <h1 className="text-[48px] font-gotham font-bold mb-2  text-slate-700 text-center">{event.title}</h1>
                <p className="text-[28px] mb-4  text-slate-700">{event.date}</p>

                <Speakers
                    event={event}
                    isAuthenticated={isAuthenticated}
                    onRequestPassword={() => setShowPasswordModal(true)}
                />

                <PasswordModal
                    isOpen={showPasswordModal}
                    onClose={() => setShowPasswordModal(false)}
                    onSubmit={handlePasswordSubmit}
                    error={error}
                    setEnteredPassword={setEnteredPassword}
                />
            </div>
        </div>
    );
}
