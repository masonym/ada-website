"use client";

import React, { useEffect, useState } from 'react';
import { EVENTS } from '@/constants/events';
import { SCHEDULES } from '@/constants/schedules';
import { notFound } from 'next/navigation';
import ScheduleAtAGlance from '@/app/components/Schedule';
import PasswordModal from '@/app/components/PasswordModal';

export default function AgendaPage({ params }: { params: { slug: string } }) {
  const event = EVENTS.find((e) => e.slug === params.slug);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [enteredPassword, setEnteredPassword] = useState('');

  if (!event) {
    notFound();
  }

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

  const eventSchedule = SCHEDULES.find((s) => s.id === event.id);

  if (!eventSchedule) {
    return (
      <div className="text-center">
        {/* <h1 className="text-3xl font-bold mb-4">{event.title} - Agenda</h1> */}
        <h1 className="text-[48px] font-gotham font-bold mb-4 text-slate-700 text-center">Schedule</h1>
        <p className="text-l font-bold text-center mb-8 text-slate-600">Schedule not available at this time. Please check back later.</p>
      </div>
    );
  }

  return (
    <div>
    <ScheduleAtAGlance
        schedule={eventSchedule.schedule}
        isAuthenticated={isAuthenticated}
        onRequestPassword={() => setShowPasswordModal(true)}
        eventStartDate={event.timeStart}
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