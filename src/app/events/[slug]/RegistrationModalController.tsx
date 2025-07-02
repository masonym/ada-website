'use client';

import { useState, useEffect } from 'react';
import { useRegistrationUrlParams } from '@/hooks/useRegistrationUrlParams';
import RegistrationModal from '@/components/RegistrationModal';
import { Event } from '@/types/events';
import { getRegistrationsForEvent, getSponsorshipsForEvent, getExhibitorsForEvent } from '@/lib/registration-adapters';

interface RegistrationModalControllerProps {
  event: Event;
}

export default function RegistrationModalController({ event }: RegistrationModalControllerProps) {
  // State to control modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Get URL parameters
  const { openModal, activeTab, selectedRegistrationId } = useRegistrationUrlParams();
  
  // Get available registrations for this event
  const allRegistrations = getRegistrationsForEvent(event.id);
  const sponsorships = getSponsorshipsForEvent(event.id);
  const exhibitors = getExhibitorsForEvent(event.id);
  
  // Find the selected registration based on ID
  const findRegistrationById = (id?: string) => {
    if (!id) return null;
    
    // Check all registration types
    return [...allRegistrations, ...sponsorships, ...exhibitors].find(reg => reg.id === id) || null;
  };
  
  // Get selected registration
  const selectedRegistration = findRegistrationById(selectedRegistrationId);
  
  // Effect to open modal when URL parameters change
  useEffect(() => {
    if (openModal) {
      setIsModalOpen(true);
    }
  }, [openModal]);
  
  // Handle close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  
  return (
    <RegistrationModal
      isOpen={isModalOpen}
      onClose={handleCloseModal}
      selectedRegistration={selectedRegistration}
      event={{
        ...event,
        contactInfo: event.contactInfo || { contactEmail: "" }
      }}
      initialActiveTab={activeTab}
    />
  );
}
