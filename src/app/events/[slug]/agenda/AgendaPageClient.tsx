"use client";

import React, { useEffect, useState } from 'react';
import ScheduleAtAGlance from '@/app/components/Schedule';
import PasswordModal from '@/app/components/PasswordModal';
import { Event } from '@/types/events';
import { EventSpeakerPublic } from '@/lib/sanity';

type ScheduleItem = {
  time: string;
  title: string;
  location?: string;
  duration?: string;
  speakers?: any[];
  description?: string;
  sponsorLogo?: string;
};

type Props = {
  event: Event;
  schedule: {
    date: string;
    items: ScheduleItem[];
  }[];
  sanitySpeakers: EventSpeakerPublic[] | null;
};

export default function AgendaPageClient({ event, schedule, sanitySpeakers }: Props) {
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
      <ScheduleAtAGlance
        schedule={schedule}
        isAuthenticated={isAuthenticated}
        onRequestPassword={() => setShowPasswordModal(true)}
        event={event}
        sanitySpeakers={sanitySpeakers}
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
