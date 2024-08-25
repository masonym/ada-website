"use client";

import React, { useState, useEffect } from 'react';
import { EVENTS } from '@/constants/events';
import { notFound } from 'next/navigation';
import Speakers from '@/app/components/Speakers';
import PasswordModal from '@/app/components/PasswordModal';

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
    <div className="max-w-4xl mx-auto py-8 px-4 flex flex-col items-center">
      <h1 className="text-[48px] font-gotham font-bold mb-2 text-slate-700">
        {event.title} - Speakers
      </h1>

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
  );
}
