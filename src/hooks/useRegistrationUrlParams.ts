'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export interface RegistrationUrlParams {
  openModal: boolean;
  activeTab?: 'ticket' | 'exhibit' | 'sponsorship';
  selectedRegistrationId?: string;
  promoCode?: string;
}

/**
 * Hook to handle URL parameters for opening the registration modal
 * Example URL: /events/event-slug?register=true&tab=sponsorship
 */
export function useRegistrationUrlParams(): RegistrationUrlParams {
  const searchParams = useSearchParams();
  const [params, setParams] = useState<RegistrationUrlParams>({
    openModal: false
  });

  useEffect(() => {
    // Extract parameters from URL
    const register = searchParams?.get('register');
    const tab = searchParams?.get('tab');
    const registrationId = searchParams?.get('registration');
    const promo = searchParams?.get('promo');

    // Process register parameter
    const shouldOpenModal = register === 'true';
    
    // Process tab parameter
    let activeTab: 'ticket' | 'exhibit' | 'sponsorship' | undefined = undefined;
    if (tab === 'ticket' || tab === 'exhibit' || tab === 'sponsorship') {
      activeTab = tab;
    }

    // Update state
    setParams({
      openModal: shouldOpenModal,
      activeTab,
      selectedRegistrationId: registrationId || undefined,
      promoCode: promo || undefined
    });
  }, [searchParams]);

  return params;
}
