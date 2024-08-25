"use client";

import React, { useState, useEffect } from 'react';
import { EVENTS } from '@/constants/events';
import { notFound } from 'next/navigation';
import Speakers from '@/app/components/Speakers';
import PasswordModal from '@/app/components/PasswordModal';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import Image from 'next/image';

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
            {/* <div className="max-container mx-auto pt-8 px-4 flex flex-col items-start underline">
                <Link href={`/events/${params.slug}`} className="text-[24px] items-center font-bold text-gray-700 hover:text-gray-900 flex">
                    <ChevronLeft /> Back
                </Link>
            </div> */}
            <div className="py-8 flex flex-col items-center">
                <Image
                    src={event.image}
                    width={1000}
                    height={400}
                    alt={`Event image for ${event.title}`}
                    unoptimized={true}
                    className="mb-6 w-full max-w-[1536px]"
                />

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
