'use client';

import React, { useState } from 'react';
import Button from '@/app/components/Button';
import RegistrationModal from '@/components/RegistrationModal';
import { getRegistrationsForEvent } from '@/lib/registration-adapters';
import { Event } from '@/types/events';

type RegisterButtonModalProps = {
  event: Event;
  className?: string;
  title?: string;
  variant?: string;
};

export default function RegisterButtonModal({ 
  event, 
  className = "max-w-xs sm:max-w-sm",
  title = "REGISTER",
  variant = "btn_blue"
}: RegisterButtonModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenRegistration = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const registrationOptions = getRegistrationsForEvent(event.id);

  return (
    <>
      <Button
        title={title}
        variant={variant}
        onClick={handleOpenRegistration}
        className={className}
      />

      {/* Registration Modal */}
      <div className="text-left">
      {registrationOptions && registrationOptions.length > 0 && (
        <RegistrationModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          selectedRegistration={registrationOptions[0]}
          event={event}
        />
      )}
      </div>
    </>
  );
}
