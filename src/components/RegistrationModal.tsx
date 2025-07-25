'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import * as yup from 'yup';
import FormattedPerk from './FormattedPerk';
import { X, CreditCard, Ticket, Package, Award, AlertTriangle, Landmark } from 'lucide-react';
import { getPriceDisplay } from '@/lib/price-formatting';
import PriceDisplay from './PriceDisplay';
import { Event } from '@/types/events';
import { BillingInformation } from './BillingInformation';
import { AttendeeForm } from './AttendeeForm';
import { TermsAndConditions } from './TermsAndConditions';
import { registrationSchema } from '@/lib/event-registration/validation';
import { RegistrationFormData, TicketSelection, AttendeeInfo as RegAttendeeInfo, RegistrationType as EventRegType, BusinessSize } from '@/types/event-registration/registration';
import { ValidationError } from 'yup';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import type { AttendeeInfo as EventAttendeeInfo, AttendeeInfo as EventRegAttendeeInfo } from '@/types/event-registration/registration';
import { Elements } from '@stripe/react-stripe-js';
import StripePaymentForm, { StripePaymentFormRef } from './StripePaymentForm';
import { getRegistrationsForEvent, getSponsorshipsForEvent, getExhibitorsForEvent, AdapterModalRegistrationType } from '@/lib/registration-adapters';
import { EVENT_SPONSORS } from '@/constants/eventSponsors';
import { validatePromoCode, isEligibleForPromoDiscount, getAutoApplyPromoCodesForEvent, type PromoCode } from '@/lib/promo-codes';
import { getEnv } from '@/lib/env';

interface EventWithContact extends Omit<Event, 'id'> {
  contactInfo?: {
    contactEmail2?: string;
  };
  eventShorthand: string;
  id: string | number;
  slug: string;
}

interface ModalAttendeeInfo {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  jobTitle: string;
  phone: string;
  website: string;
  businessSize: BusinessSize | '';
  sbaIdentification?: string;
  industry: string;
  sponsorInterest: 'Yes' | 'No' | '';
  speakingInterest: 'Yes' | 'No' | '';
  dietaryRestrictions?: string;
  accessibilityNeeds?: string;
}

interface BillingInfo {
  firstName: string;
  lastName: string;
  email: string;
  confirmEmail: string;
}

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRegistration: AdapterModalRegistrationType | null; // Allow null for register button
  event: EventWithContact;
  initialActiveTab?: 'ticket' | 'exhibit' | 'sponsorship'; // Optional tab to open initially
  initialPromoCode?: string; // Optional promo code to auto-apply from URL
}

const env = getEnv();
const stripePromise = loadStripe(env.STRIPE_PUBLISHABLE_KEY);

const initialModalAttendeeInfo: ModalAttendeeInfo = {
  firstName: '',
  lastName: '',
  email: '',
  company: '',
  jobTitle: '',
  phone: '',
  website: '',
  businessSize: '',
  sbaIdentification: '',
  industry: '',
  sponsorInterest: '',
  speakingInterest: '',
  dietaryRestrictions: '',
  accessibilityNeeds: '',
};

// Helper function to check if a sponsorship item is sold out
const isSoldOut = (item: AdapterModalRegistrationType, eventSponsors: any, eventId: string | number): boolean => {
  // If it's not a sponsorship or doesn't have slotsPerEvent defined, it's not sold out
  if (item.category !== 'sponsorship' && item.category !== 'exhibit' || !item.id || !item.quantityAvailable) {
    return false;
  }

  // Find how many slots are available for this sponsorship
  const slotsAvailable = item.quantityAvailable;

  // Count how many slots are taken by checking eventSponsors
  let slotsTaken = 0;
  const eventSponsorList = eventSponsors.find((es: any) => es.id === eventId);

  if (eventSponsorList) {
    // Check all tiers to find sponsors with this sponsorship id
    Object.values(eventSponsorList.tiers || {}).forEach((tier: any) => {
      // need to match tier.id with item.id, then if match, count length of sponsorIds
      if (tier.id === item.id) {
        slotsTaken += tier.sponsorIds.length;
      }
    });
  }

  // Item is sold out if all slots are taken
  return slotsTaken >= slotsAvailable;
};

// Helper function to get the number of remaining slots for an item
const getRemainingSlots = (item: AdapterModalRegistrationType, eventSponsors: any, eventId: string | number): number | null => {
  // If it's not a sponsorship or exhibit, or doesn't have quantityAvailable defined, return null
  if ((item.category !== 'sponsorship' && item.category !== 'exhibit') || !item.id || !item.quantityAvailable) {
    return null;
  }

  // Find how many slots are available for this item
  const slotsAvailable = item.quantityAvailable;

  // Count how many slots are taken by checking eventSponsors
  let slotsTaken = 0;
  const eventSponsorList = eventSponsors.find((es: any) => es.id === eventId);

  if (eventSponsorList) {
    // Check all tiers to find sponsors with this sponsorship id
    Object.values(eventSponsorList.tiers || {}).forEach((tier: any) => {
      if (tier.id === item.id) {
        slotsTaken = tier.sponsorIds.length;
      }
    });
  }

  // Return the number of remaining slots
  return slotsAvailable - slotsTaken;
};

// Helper function to determine if remaining slots should be shown
const shouldShowRemaining = (item: AdapterModalRegistrationType, eventSponsors: any, eventId: string | number): boolean => {
  const remainingSlots = getRemainingSlots(item, eventSponsors, eventId);
  return remainingSlots !== null && remainingSlots > 0 && remainingSlots < 10;
};

const initialBillingInfo: BillingInfo = {
  firstName: '',
  lastName: '',
  email: '',
  confirmEmail: '',
};

// Helper function to check if registration is closed
const isRegistrationClosed = (event: EventWithContact, daysBeforeToClose: number = 1): boolean => {
  // Parse event start date and time from ISO format: "YYYY-MM-DDT00:00:00Z"
  const eventStartDateTime = new Date(event.timeStart);

  // Calculate the cutoff date (3 days before event by default)
  const cutoffDate = new Date(eventStartDateTime);
  cutoffDate.setDate(cutoffDate.getDate() - daysBeforeToClose);

  // Check if current date is past the cutoff
  return new Date() >= cutoffDate;
};

// Helper function to check if a ticket has expired based on saleEndTime
const isTicketExpired = (registration: AdapterModalRegistrationType): boolean => {
  if (!registration.saleEndTime) return false;
  return new Date() > new Date(registration.saleEndTime);
};

const RegistrationModal = ({
  isOpen,
  onClose,
  selectedRegistration,
  event,
  initialActiveTab,
  initialPromoCode,
}: RegistrationModalProps): JSX.Element | null => {
  // Add state for the close confirmation dialog
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);
  // Check if registration is closed for this event
  const registrationClosed = useMemo(() => isRegistrationClosed(event), [event]);

  // Get registrations, sponsorships, and exhibitors directly using the event ID
  const allRegistrations = useMemo<AdapterModalRegistrationType[]>(() => getRegistrationsForEvent(event.id), [event.id]);
  const sponsorships = useMemo<AdapterModalRegistrationType[]>(() => getSponsorshipsForEvent(event.id), [event.id]);
  const exhibitors = useMemo<AdapterModalRegistrationType[]>(() => getExhibitorsForEvent(event.id), [event.id]);

  // We'll use the original sponsorships list without sorting
  // State for active category tab
  const [activeCategory, setActiveCategory] = useState<'ticket' | 'exhibit' | 'sponsorship'>(initialActiveTab || 'ticket');

  const [ticketQuantities, setTicketQuantities] = useState<Record<string, number>>({});
  const [isCheckout, setIsCheckout] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [billingInfo, setBillingInfo] = useState<BillingInfo>({
    firstName: '',
    lastName: '',
    email: '',
    confirmEmail: ''
  });
  const [attendeesByTicket, setAttendeesByTicket] = useState<Record<string, ModalAttendeeInfo[]>>({});
  // Track attendees for sponsor passes separately
  const [sponsorPassAttendees, setSponsorPassAttendees] = useState<Record<string, ModalAttendeeInfo[]>>({});
  const [attendeeCountStep, setAttendeeCountStep] = useState(false);
  const [sponsorAttendeesToRegister, setSponsorAttendeesToRegister] = useState<Record<string, number>>({});

  // For order ID validation
  const [orderIdInput, setOrderIdInput] = useState<Record<string, string>>({});
  type ValidationState = 'idle' | 'validating' | 'valid' | 'invalid';
  const [validationStatus, setValidationStatus] = useState<Record<string, ValidationState>>({});
  const [validationError, setValidationError] = useState<Record<string, string | null>>({});

  // For code validation (add-ons that require special codes)
  const [codeInput, setCodeInput] = useState<Record<string, string>>({});
  const [codeValidationStatus, setCodeValidationStatus] = useState<Record<string, ValidationState>>({});
  const [codeValidationError, setCodeValidationError] = useState<Record<string, string | null>>({});

  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [paymentSuccessful, setPaymentSuccessful] = useState(false);
  const [showConfirmationView, setShowConfirmationView] = useState(false);
  const [confirmationData, setConfirmationData] = useState<any>(null);
  const [pendingConfirmationData, setPendingConfirmationData] = useState<any>(null);
  const [attemptingStripePayment, setAttemptingStripePayment] = useState(false);
  const stripeFormRef = useRef<StripePaymentFormRef>(null);
  
  // Promo code state
  const [promoCode, setPromoCode] = useState<string>('');
  const [promoCodeValid, setPromoCodeValid] = useState<boolean>(false);
  const [promoCodeError, setPromoCodeError] = useState<string | null>(null);
  const [applyingPromoCode, setApplyingPromoCode] = useState<boolean>(false);
  const [activePromoCode, setActivePromoCode] = useState<PromoCode | null>(null);

  // Handler function for applying promo code
  const handleApplyPromoCode = async () => {
    // Reset previous error/success states
    setPromoCodeError(null);
    setApplyingPromoCode(true);
    
    // Trim and normalize code
    const normalizedCode = promoCode.trim().toUpperCase();
    
    // Empty code validation
    if (!normalizedCode) {
      setPromoCodeError('Please enter a promo code');
      setApplyingPromoCode(false);
      return;
    }
    
    try {
      // Call the backend API for validation
      const response = await fetch('/api/event-registration/validate-promo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promoCode: normalizedCode,
          eventId: event.id,
          tickets: Object.entries(ticketQuantities)
            .filter(([_, quantity]) => quantity > 0)
            .map(([ticketId, quantity]) => ({ ticketId, quantity }))
        }),
      });
      
      const result = await response.json();
      
      if (result.valid) {
        // Always accept valid promo codes - the discount logic will handle eligibility per ticket
        setPromoCodeValid(true);
        setPromoCodeError(null);
        setActivePromoCode({
          code: normalizedCode,
          discountPercentage: result.discountPercentage,
          eligibleTicketTypes: result.eligibleTicketTypes,
          expirationDate: new Date(result.expirationDate),
          description: result.description,
          eligibleEventIds: [event.id],
          isActive: true
        });
      } else {
        setPromoCodeValid(false);
        setActivePromoCode(null);
        setPromoCodeError(result.error || 'Invalid promo code');
      }
    } catch (error) {
      console.error('Error validating promo code:', error);
      setPromoCodeValid(false);
      setActivePromoCode(null);
      setPromoCodeError('Error validating promo code. Please try again.');
    }
    
    setApplyingPromoCode(false);
  };

  // Memoize Stripe Elements appearance to prevent unnecessary re-initialization
  const appearance = useMemo(() => ({
    theme: 'stripe' as const, // Or 'night', 'flat', etc. Explicitly type for safety.
    // Add other appearance configurations if needed, e.g.:
    // variables: { colorPrimaryText: '#262626' }
  }), []);
  const [isStripeReady, setIsStripeReady] = useState(false); // New state for Stripe readiness

  const handleStripeReady = useCallback((ready: boolean) => {
    setIsStripeReady(ready);

  }, [attemptingStripePayment, clientSecret]); // Include dependencies to react to payment attempt state

  // Track previous modal open state to help with state management
  const prevIsOpenRef = useRef(isOpen);
  const prevShowConfirmationRef = useRef(showConfirmationView);
  


  // Effect to manage state when modal is opened or closed
  useEffect(() => {
    // When the modal is opened
    if (isOpen) {
      // If this is a fresh opening (was previously closed)
      if (!prevIsOpenRef.current) {
        // If the previous session ended with a confirmation or payment was successful, we need to reset for a new session
        if (prevShowConfirmationRef.current || paymentSuccessful) {
          resetState();
        } else {
          // Just opening normally - clear errors but keep existing form data
          setApiError(null);
          setAttemptingStripePayment(false);
          setClientSecret(null);
          setPendingConfirmationData(null);
        }
      }
    } else {
      // When modal is closed, just reset payment-related states
      setAttemptingStripePayment(false);
      setIsStripeReady(false);

      // Don't reset the entire state here - we'll check on next open if we need to
    }

    // Update refs last to track state for next render
    prevIsOpenRef.current = isOpen;
    prevShowConfirmationRef.current = showConfirmationView;
  }, [isOpen, showConfirmationView, paymentSuccessful]);

  const hasEligibleTicketInCart = () => {
    const eligibleInCart = [...exhibitors, ...sponsorships].some(reg => {
      return (reg.category === 'exhibit' || reg.category === 'sponsorship') && !reg.requiresValidation && (ticketQuantities[reg.id] || 0) > 0;
    });
    return eligibleInCart;
  };

  // Track manually validated tickets to prevent auto-invalidation
  const [manuallyValidatedTickets, setManuallyValidatedTickets] = useState<Record<string, boolean>>({});

  // Automatically validate or invalidate discounted passes based on cart contents
  useEffect(() => {
    const isEligible = hasEligibleTicketInCart();

    // Get all tickets that could require validation
    const ticketsToProcess = [...exhibitors, ...sponsorships].filter(
      (reg) => reg.requiresValidation
    );

    let statusUpdates: Record<string, ValidationState> = {};
    let errorUpdates: Record<string, string | null> = {};
    let needsUpdate = false;

    ticketsToProcess.forEach((reg) => {
      const quantity = ticketQuantities[reg.id] || 0;
      const currentStatus = validationStatus[reg.id] || 'idle';
      const isManuallyValidated = manuallyValidatedTickets[reg.id] === true;

      if (quantity > 0) {
        // Ticket is in the cart, its validation depends on eligibility
        if (isEligible) {
          // If eligible, the pass should be marked valid
          if (currentStatus !== 'valid') {
            statusUpdates[reg.id] = 'valid';
            errorUpdates[reg.id] = null;
            needsUpdate = true;
          }
        } else {
          // If not eligible and NOT manually validated, any auto-validation is revoked
          // But preserve manually validated tickets even if no eligible item in cart
          if (currentStatus === 'valid' && !isManuallyValidated) {
            statusUpdates[reg.id] = 'idle';
            needsUpdate = true;
          }
        }
      } else {
        // Ticket is not in the cart, ensure its validation state is reset
        // Also clear the manually validated flag since the ticket is no longer in cart
        if (currentStatus !== 'idle') {
          statusUpdates[reg.id] = 'idle';
          errorUpdates[reg.id] = null;
          needsUpdate = true;
          
          // Remove from manually validated tickets if not in cart anymore
          if (isManuallyValidated) {
            setManuallyValidatedTickets(prev => {
              const updated = { ...prev };
              delete updated[reg.id];
              return updated;
            });
          }
        }
      }
    });

    if (needsUpdate) {
      setValidationStatus((prev) => ({ ...prev, ...statusUpdates }));
      if (Object.keys(errorUpdates).length > 0) {
        setValidationError((prev) => ({ ...prev, ...errorUpdates }));
      }
    }
  }, [ticketQuantities, validationStatus, exhibitors, sponsorships, manuallyValidatedTickets]);

  // Automatic promo code application (URL-based and event-based)
  useEffect(() => {
    if (!isOpen || promoCodeValid || activePromoCode || promoCode !== '') {
      return; // Don't auto-apply if modal is closed, promo already applied, or user has entered a code
    }

    let codeToApply: string | null = null;
    
    // Priority 1: URL parameter promo code
    if (initialPromoCode) {
      codeToApply = initialPromoCode.trim().toUpperCase();
    } else {
      // Priority 2: Event-based auto-apply promo codes
      const autoApplyCodes = getAutoApplyPromoCodesForEvent(event.id);
      if (autoApplyCodes.length > 0) {
        // Use the first auto-apply code found
        codeToApply = autoApplyCodes[0].code;
      }
    }

    if (!codeToApply) {
      return; // No promo code to auto-apply
    }
      
    // Set the promo code in the input field
    setPromoCode(codeToApply);
    
    // Automatically apply the promo code
    const autoApplyPromoCode = async () => {
      setPromoCodeError(null);
      setApplyingPromoCode(true);
      
      try {
        const response = await fetch('/api/event-registration/validate-promo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            promoCode: codeToApply,
            eventId: event.id,
          }),
        });
        
        const result = await response.json();
        
        if (result.valid) {
          // Always accept valid promo codes - the discount logic will handle eligibility per ticket
          setPromoCodeValid(true);
          setPromoCodeError(null);
          setActivePromoCode({
            code: codeToApply,
            discountPercentage: result.discountPercentage,
            eligibleTicketTypes: result.eligibleTicketTypes,
            expirationDate: new Date(result.expirationDate),
            description: result.description,
            eligibleEventIds: [event.id],
            isActive: true
          });
        } else {
          setPromoCodeValid(false);
          setActivePromoCode(null);
          setPromoCodeError(result.error || 'Invalid promo code');
        }
      } catch (error) {
        console.error('Error auto-applying promo code:', error);
        setPromoCodeValid(false);
        setActivePromoCode(null);
        setPromoCodeError('Error applying promo code. Please try again.');
      }
      
      setApplyingPromoCode(false);
    };
    
    // Apply the promo code automatically
    autoApplyPromoCode();
  }, [isOpen, initialPromoCode, promoCodeValid, activePromoCode, promoCode, event.id]);

  // Code validation function for add-ons that require special codes
  const validateCode = (registrationId: string, inputCode: string) => {
    const registration = allRegistrations.find(reg => reg.id === registrationId);
    if (!registration || !registration.requiresCode || !registration.validationCode) {
      return false;
    }
    
    // Simple case-insensitive comparison
    return inputCode.trim().toUpperCase() === registration.validationCode.toUpperCase();
  };

  // Handle code validation
  const handleCodeValidation = (registrationId: string) => {
    const inputCode = codeInput[registrationId] || '';
    
    if (!inputCode.trim()) {
      setCodeValidationStatus(prev => ({ ...prev, [registrationId]: 'invalid' }));
      setCodeValidationError(prev => ({ ...prev, [registrationId]: 'Please enter a code' }));
      return;
    }
    
    setCodeValidationStatus(prev => ({ ...prev, [registrationId]: 'validating' }));
    
    // Simulate validation (in real app, this might be an API call)
    setTimeout(() => {
      const isValid = validateCode(registrationId, inputCode);
      
      if (isValid) {
        setCodeValidationStatus(prev => ({ ...prev, [registrationId]: 'valid' }));
        setCodeValidationError(prev => ({ ...prev, [registrationId]: null }));
      } else {
        setCodeValidationStatus(prev => ({ ...prev, [registrationId]: 'invalid' }));
        const registration = allRegistrations.find(reg => reg.id === registrationId);
        const errorMessage = registration?.codeValidationMessage || 'Invalid code. Please check and try again.';
        setCodeValidationError(prev => ({ ...prev, [registrationId]: errorMessage }));
      }
    }, 500);
  };

  const handleValidateOrderId = async (ticketId: string) => {
    const orderId = orderIdInput[ticketId];
    if (!orderId) {
      setValidationError(prev => ({ ...prev, [ticketId]: 'Please enter an Order ID.' }));
      return;
    }

    setValidationStatus(prev => ({ ...prev, [ticketId]: 'validating' }));
    setValidationError(prev => ({ ...prev, [ticketId]: null }));

    try {
      const response = await fetch('/api/validate-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, eventId: event.id }),
      });

      const result = await response.json();

      if (response.ok && result.isValid) {
        setValidationStatus(prev => ({ ...prev, [ticketId]: 'valid' }));
        // Mark this ticket as manually validated to prevent automatic invalidation
        setManuallyValidatedTickets(prev => ({ ...prev, [ticketId]: true }));
      } else {
        setValidationStatus(prev => ({ ...prev, [ticketId]: 'invalid' }));
        setValidationError(prev => ({ ...prev, [ticketId]: result.message || 'Invalid or expired Order ID.' }));
      }
    } catch (error) {
      console.error('Validation API call failed:', error);
      setValidationStatus(prev => ({ ...prev, [ticketId]: 'invalid' }));
      setValidationError(prev => ({ ...prev, [ticketId]: 'An error occurred during validation.' }));
    }
  };

  const renderValidationUI = (reg: AdapterModalRegistrationType) => {
    if (!reg.requiresValidation || (ticketQuantities[reg.id] || 0) === 0) {
      return null;
    }

    const isEligibleFromCart = hasEligibleTicketInCart();

    if (isEligibleFromCart) {
      return null;
    }

    const status = validationStatus[reg.id] || 'idle';
    const error = validationError[reg.id];

    return (
      <div className="mt-2 p-3 bg-white border border-gray-200 rounded-md">
        <label htmlFor={`order-id-${reg.id}`} className="block text-sm font-medium text-gray-700">
          Enter previous Order ID to unlock
        </label>
        <div className="mt-1 flex items-center space-x-2">
          <input
            type="text"
            id={`order-id-${reg.id}`}
            value={orderIdInput[reg.id] || ''}
            onChange={(e) => setOrderIdInput(prev => ({ ...prev, [reg.id]: e.target.value }))}
            className="flex-grow block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            placeholder="e.g., pi_xxxxxxxx"
            disabled={status === 'validating' || status === 'valid'}
          />
          <button
            onClick={() => handleValidateOrderId(reg.id)}
            disabled={status === 'validating' || status === 'valid'}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
          >
            {status === 'validating' ? 'Verifying...' : status === 'valid' ? 'Verified' : 'Verify'}
          </button>
        </div>
        {status === 'valid' && !isEligibleFromCart && (
          <p className="mt-2 text-sm text-green-600">✓ Order ID verified. Discount applied.</p>
        )}
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  };

  // Render code validation UI for tickets that require a code
  const renderCodeValidationUI = (reg: AdapterModalRegistrationType) => {
    if (!reg.requiresCode) {
      return null;
    }

    const status = codeValidationStatus[reg.id] || 'idle';
    const error = codeValidationError[reg.id];
    const currentQuantity = ticketQuantities[reg.id] || 0;

    // Only show code validation UI after ticket is selected (quantity > 0)
    if (currentQuantity === 0) {
      return null;
    }

    return (
      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <label htmlFor={`code-${reg.id}`} className="block text-sm font-medium text-gray-700">
          {reg.codeValidationMessage || 'Enter access code to unlock this ticket'}
        </label>
        <div className="mt-1 flex items-center space-x-2">
          <input
            type="text"
            id={`code-${reg.id}`}
            value={codeInput[reg.id] || ''}
            onChange={(e) => setCodeInput(prev => ({ ...prev, [reg.id]: e.target.value }))}
            className="flex-grow block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            placeholder="Enter code"
            disabled={status === 'validating' || status === 'valid'}
          />
          <button
            onClick={() => handleCodeValidation(reg.id)}
            disabled={status === 'validating' || status === 'valid' || !(codeInput[reg.id]?.trim())}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
          >
            {status === 'validating' ? 'Validating...' : status === 'valid' ? 'Validated' : 'Validate'}
          </button>
        </div>
        {status === 'valid' && (
          <p className="mt-2 text-sm text-green-600">✓ Code validated. You can now register for this ticket.</p>
        )}
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
        {status !== 'valid' && (
          <p className="mt-2 text-sm text-orange-600">
            ⚠️ Please enter the required access code.
          </p>
        )}
      </div>
    );
  };

  // Helper to reset attendee info for a given ticket ID
  const resetAttendeesForTicket = (ticketId: string, count: number): ModalAttendeeInfo[] => {
    return Array(count).fill(null).map(() => ({ ...initialModalAttendeeInfo }));
  };

  const resetState = () => {
    setCurrentStep(1); // Set to 1 to ensure consistent reset
    setIsCheckout(false); // Show ticket selection first
    setTicketQuantities({});
    setActiveCategory('ticket'); // Reset to default tab
    
    // Reset all validation-related state
    setValidationStatus({});
    setValidationError({});
    setOrderIdInput({});
    setManuallyValidatedTickets({});
    
    // Reset code validation state
    setCodeValidationStatus({});
    setCodeValidationError({});
    setCodeInput({});
    
    // Reset attendeesByTicket to empty
    setAttendeesByTicket({});

    // Reset sponsor pass attendees
    setSponsorPassAttendees({});
    setSponsorAttendeesToRegister({});
    setAttendeeCountStep(false);
    setBillingInfo({ ...initialBillingInfo });
    setAgreedToTerms(false);
    setFormErrors({});
    setApiError(null);
    setClientSecret(null);
    setPaymentIntentId(null);
    setPaymentSuccessful(false);
    setAttemptingStripePayment(false);
    setShowConfirmationView(false);
    setConfirmationData(null);
    setPendingConfirmationData(null);
    setIsStripeReady(false);
    setIsLoading(false);
    
    // Reset promo code state
    setPromoCode('');
    setPromoCodeValid(false);
    setPromoCodeError(null);
    setApplyingPromoCode(false);
  };

  // Helper function to handle payment errors in the useEffect hook
  const handlePaymentErrorInEffect = (errorMessage: string) => {
    console.error('Payment error in effect:', errorMessage);
    setApiError(`Payment error: ${errorMessage}`);
    setAttemptingStripePayment(false);
    setIsLoading(false);
  };

  // Helper function to get effective price including early bird and promo discounts
const getEffectivePrice = (registration: AdapterModalRegistrationType): number => {
    const isEarlyBird = registration.earlyBirdDeadline && new Date() < new Date(registration.earlyBirdDeadline);
    const displayPrice = isEarlyBird && registration.earlyBirdPrice !== undefined ? registration.earlyBirdPrice : registration.price;
    // Convert displayPrice to number if it's a string
    const numericPrice = typeof displayPrice === 'string' ? parseFloat(displayPrice.replace(/[^0-9.]/g, '')) || 0 : displayPrice;
    
    // Note: Promo code discount is applied in calculateTotal() to avoid double application
    
    return numericPrice;
  };

  // Helper function to render price display with strikethrough for discounted items
  const renderPriceDisplay = (reg: AdapterModalRegistrationType, quantity: number) => {
    const effectivePrice = getEffectivePrice(reg);
    
    // Handle string prices (like "Contact for pricing")
    if (typeof effectivePrice === 'string') {
      return <span>{effectivePrice}</span>;
    }
    
    // Calculate original price (early bird or regular, but without promo discount)
    const isEarlyBird = reg.earlyBirdDeadline && new Date() < new Date(reg.earlyBirdDeadline);
    const originalPrice = isEarlyBird && reg.earlyBirdPrice !== undefined ? reg.earlyBirdPrice : reg.price;
    const originalPriceNum = typeof originalPrice === 'number' ? originalPrice : 
      (typeof originalPrice === 'string' ? parseFloat(originalPrice.replace(/[^0-9.]/g, '')) || 0 : 0);
    
    const effectivePriceNum = typeof effectivePrice === 'number' ? effectivePrice : 0;
    const originalTotal = originalPriceNum * quantity;
    const effectiveTotal = effectivePriceNum * quantity;
    
    // Check if promo discount is applied
    const isDiscounted = promoCodeValid && activePromoCode && 
      isEligibleForPromoDiscount(reg.id, activePromoCode.eligibleTicketTypes) && 
      originalPriceNum > effectivePriceNum;
    
    if (isDiscounted) {
      return (
        <span className="text-right flex flex-row">
          <div className="text-sm text-gray-500 line-through">
            ${originalTotal.toLocaleString()}
          </div>
          <div className="text-green-600 font-medium ml-2">
            ${effectiveTotal.toLocaleString()}
          </div>
        </span>
      );
    }
    
    return <span>${effectiveTotal.toLocaleString()}</span>;
  };

  useEffect(() => {
    if (attemptingStripePayment && clientSecret && stripeFormRef.current && isStripeReady) { // Added isStripeReady check
      try {
        stripeFormRef.current.triggerSubmit();
        // DO NOT reset attemptingStripePayment here. It should be reset in handlePaymentSuccess/handlePaymentError.
      } catch (error) {
        console.error('Error triggering Stripe payment submission:', error);
        handlePaymentErrorInEffect('Failed to initiate payment process. Please try again.');
      }
    } else if (attemptingStripePayment && clientSecret && !isStripeReady) {
      // Create a timeout to check again in case the state update for isStripeReady is delayed
      const checkAgainTimeout = setTimeout(() => {
        if (stripeFormRef.current && !isStripeReady) {
        }
      }, 2000); // Check again after 2 seconds

      return () => clearTimeout(checkAgainTimeout);
    }
  }, [attemptingStripePayment, clientSecret, isStripeReady]);

  useEffect(() => {
    const initialQuantities: Record<string, number> = {};
    const initialAttendees: Record<string, ModalAttendeeInfo[]> = {};

    allRegistrations.forEach((reg) => {
      // If this is the selected registration and we're opening the modal, initialize with quantity 1
      const isSelected = selectedRegistration && reg.id === selectedRegistration.id;
      initialQuantities[reg.id] = isSelected && isOpen ? 1 : 0;

      // Initialize attendee info array based on quantity
      if (reg.requiresAttendeeInfo) {
        initialAttendees[reg.id] = isSelected && isOpen ?
          [{ ...initialModalAttendeeInfo }] : // Add one initial attendee
          []; // Empty array by default
      }
    });

    // Initialize sponsorships with quantity 0 by default
    sponsorships.forEach((sponsor) => {
      // If this is the selected sponsorship and we're opening the modal, initialize with quantity 1
      const isSelected = selectedRegistration && sponsor.id === selectedRegistration.id;
      initialQuantities[sponsor.id] = isSelected && isOpen ? 1 : 0;

      // For sponsorships, we don't add any attendees by default - only sponsor passes
      initialAttendees[sponsor.id] = [];

      // Initialize sponsor passes if this is the selected sponsorship
      if (isSelected && isOpen && sponsor.sponsorPasses && sponsor.sponsorPasses > 0) {
        // Attendee passes are now handled in the new intermediary step, so we don't pre-populate them here.
      }
    });

    // setTicketQuantities(initialQuantities);
    // setAttendeesByTicket(initialAttendees);
  }, [allRegistrations, sponsorships, selectedRegistration, isOpen]);

  const handleIncrement = (id: string, type?: string) => {
    const newQuantity = (ticketQuantities[id] || 0) + 1;
    setTicketQuantities(prev => ({
      ...prev,
      [id]: newQuantity
    }));

    // Check if this is a sponsorship
    const selectedSponsorship = sponsorships.find(s => s.id === id);

    if (selectedSponsorship) {
      // For sponsorships, we don't add regular attendees, only sponsor passes
      // Keep the attendeesByTicket array empty for sponsorships
      const newAttendees: Record<string, ModalAttendeeInfo[]> = { ...attendeesByTicket };
      newAttendees[id] = [];
      setAttendeesByTicket(newAttendees);

      // Handle sponsor passes for sponsorships
      if (selectedSponsorship.sponsorPasses && selectedSponsorship.sponsorPasses > 0) {
        // Sponsor pass attendees are now handled in the new attendee count step,
        // so we don't need to manipulate them here.
      }
    } else {
      // For regular tickets, update attendees as before
      const newAttendees: Record<string, ModalAttendeeInfo[]> = { ...attendeesByTicket };
      newAttendees[id] = Array(newQuantity).fill(null).map((_, i): ModalAttendeeInfo => {
        const existingAttendee = attendeesByTicket[id]?.[i];
        return existingAttendee || { ...initialModalAttendeeInfo };
      }) as ModalAttendeeInfo[];
      setAttendeesByTicket(newAttendees);
    }
  };

  const handleDecrement = (ticketId: string, type?: string) => {
    const currentQuantity = ticketQuantities[ticketId] || 0;
    if (currentQuantity > 0) {
      const newQuantity = currentQuantity - 1;
      setTicketQuantities(prev => ({ ...prev, [ticketId]: newQuantity }));

      const registration = [...allRegistrations, ...exhibitors, ...sponsorships].find(r => r.id === ticketId);
      if (registration?.requiresValidation && newQuantity === 0) {
        // Clear validation status and also remove from manually validated list
        setValidationStatus(prev => ({ ...prev, [ticketId]: 'idle' }));
        setValidationError(prev => ({ ...prev, [ticketId]: null }));
        setOrderIdInput(prev => ({ ...prev, [ticketId]: '' }));
        setManuallyValidatedTickets(prev => {
          const updated = { ...prev };
          delete updated[ticketId];
          return updated;
        });
      }
      
      // Clear code validation state if quantity reaches zero
      if (registration?.requiresCode && newQuantity === 0) {
        setCodeValidationStatus(prev => ({ ...prev, [ticketId]: 'idle' }));
        setCodeValidationError(prev => ({ ...prev, [ticketId]: null }));
        setCodeInput(prev => ({ ...prev, [ticketId]: '' }));
      }
      
      // Check if this is a sponsorship
      const selectedSponsorship = sponsorships.find(s => s.id === ticketId);
      
      if (selectedSponsorship) {
        // For sponsorships, we keep the attendeesByTicket array empty
        const newAttendees: Record<string, ModalAttendeeInfo[]> = { ...attendeesByTicket };
        newAttendees[ticketId] = [];
        setAttendeesByTicket(newAttendees);
        
        // Clear sponsor pass attendees when quantity reaches zero
        if (newQuantity === 0) {
          // Remove this sponsorship from sponsorPassAttendees
          setSponsorPassAttendees(prev => {
            const updated = { ...prev };
            delete updated[ticketId];
            return updated;
          });
          
          // Also clear any sponsorAttendeesToRegister counts
          setSponsorAttendeesToRegister(prev => {
            const updated = { ...prev };
            delete updated[ticketId];
            return updated;
          });
        }
      } else {
        // For regular tickets, update attendees array to match new quantity
        if (newQuantity === 0) {
          // If quantity is now 0, set to empty array
          setAttendeesByTicket(prev => ({
            ...prev,
            [ticketId]: []
          }));
        } else {
          // Otherwise, keep only the first newQuantity attendees
          setAttendeesByTicket(prev => {
            const currentAttendees = prev[ticketId] || [];
            return {
              ...prev,
              [ticketId]: currentAttendees.slice(0, newQuantity)
            };
          });
        }
      }
    }
  };

  const handleCheckout = () => {
    const ticketsToValidate = [...allRegistrations, ...exhibitors, ...sponsorships].filter(
      (reg) => ((reg.requiresCode && (ticketQuantities[reg.id] || 0) > 0) || (reg.requiresValidation && (ticketQuantities[reg.id] || 0) > 0))
    );

    const isValidationPending = ticketsToValidate.some(
      (reg) => {
        if (reg.requiresCode && codeValidationStatus[reg.id] !== 'valid') {
          return true;
        }
        if (reg.requiresValidation && validationStatus[reg.id] !== 'valid') {
          return true;
        }
        return false;
      }
    );

    if (isValidationPending) {
      alert(
        'You have selected a discounted pass that requires validation. Please verify your previous order ID or add an eligible exhibitor/sponsor package to your cart.'
      );
      // Highlight the tickets that need validation
      ticketsToValidate.forEach((reg) => {
        if (reg.requiresCode && codeValidationStatus[reg.id] !== 'valid') {
          setCodeValidationError((prev) => ({
            ...prev,
            [reg.id]:
              prev[reg.id] ||
              'This ticket requires code validation before checkout.',
          }));
        }
        if (reg.requiresValidation && validationStatus[reg.id] !== 'valid') {
          setValidationError((prev) => ({
            ...prev,
            [reg.id]:
              prev[reg.id] ||
              'This ticket requires validation before checkout.',
          }));
        }
      });
      return;
    }

    if (getTotalTickets() > 0) {
      // Always proceed to checkout first regardless of sponsorship passes
      setIsCheckout(true);
    }
  };

  const handleBackToTickets = () => {
    setIsCheckout(false);
  };

  const handleNextStep = async () => {
    setFormErrors({});
    setApiError(null);

    if (currentStep === 1) { // Moving from Billing Info to Attendee Count or Attendee/Payment
      // Validate Billing Info
      try {
        const billingInfoSchema = yup.object().shape({
          firstName: yup.string().required('First name is required.'),
          lastName: yup.string().required('Last name is required.'),
          email: yup.string().email('Invalid email format.').required('Email is required.'),
          confirmEmail: yup.string()
            .oneOf([yup.ref('email')], 'Emails must match.')
            .required('Please confirm your email.'),
        });
        await billingInfoSchema.validate(billingInfo, { abortEarly: false });

        // Check if we need to show attendee count step for sponsorships with passes
        const selectedSponsorshipsWithPasses = sponsorships.filter(
          s => (ticketQuantities[s.id] || 0) > 0 && s.sponsorPasses && s.sponsorPasses > 0
        );

        if (selectedSponsorshipsWithPasses.length > 0) {
          // Initialize attendee count for sponsorships
          const initialToRegister: Record<string, number> = {};
          selectedSponsorshipsWithPasses.forEach(s => {
            if (s.sponsorPasses) {
              const totalPasses = s.sponsorPasses * (ticketQuantities[s.id] || 0);
              initialToRegister[s.id] = totalPasses;
            }
          });
          setSponsorAttendeesToRegister(initialToRegister);
          setAttendeeCountStep(true);
        } else {
          // Skip attendee count step if no sponsorships with passes
          setCurrentStep(2);
        }
      } catch (error) {
        if (error instanceof ValidationError) {
          const errors: Record<string, string> = {};
          error.inner.forEach(err => {
            // Yup paths for direct object validation are direct field names
            if (err.path) errors[`billingInfo.${err.path}`] = err.message;
          });
          setFormErrors(errors);
        } else {
          setApiError('An unexpected error occurred during billing validation.');
        }
        return; // Ensure we don't proceed if billing validation fails
      }
    } else if (currentStep === 2) { // If we're on step 2 (Attendee Info) and want to move to step 3
      setCurrentStep(3);
    }
    // For other steps, direct increment is fine, or specific logic will be in their buttons
  };

  const handlePrevStep = () => {
    // Check if we need to go back to attendee count step
    const selectedSponsorshipsWithPasses = sponsorships.filter(
      s => (ticketQuantities[s.id] || 0) > 0 && s.sponsorPasses && s.sponsorPasses > 0
    );

    if (currentStep === 2 && selectedSponsorshipsWithPasses.length > 0) {
      // If we're on step 2 and have sponsorships with passes, go back to attendee count
      setAttendeeCountStep(true);
    } else {
      // Otherwise, just go back one step
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleBillingInfoChange = (field: string, value: string) => {
    setBillingInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAttendeeChange = (registrationId: string, index: number, field: keyof EventAttendeeInfo, value: string) => {
    setAttendeesByTicket(prev => {
      const attendeesList = prev[registrationId] || []; // Default to empty array if undefined
      const currentQuantity = ticketQuantities[registrationId] || 0;

      // Create a new list ensuring it matches currentQuantity, populating with existing or initial info
      const newAttendeesList = Array(currentQuantity).fill(null).map((_, i) => {
        return attendeesList[i] || { ...initialModalAttendeeInfo };
      });

      // Apply the update to the correct attendee in the new list
      if (index < newAttendeesList.length) {
        newAttendeesList[index] = {
          ...(newAttendeesList[index]), // Spread existing fields of the specific attendee
          [field]: value,
        };
      } else {
        // This case should ideally not happen if AttendeeForms are rendered based on currentQuantity
        console.error(`Attendee index ${index} is out of bounds for ticket ${registrationId} with quantity ${currentQuantity}. Change not applied.`);
        return { ...prev, [registrationId]: attendeesList };
      }

      const finalState = {
        ...prev,
        [registrationId]: newAttendeesList,
      };
      return finalState;
    });
  };

  const handleCopyAttendee = (sourceTicketId: string, sourceIndex: number, targetTicketId: string, targetIndex: number) => {
    // Create mapping between different ID formats
    const getPossibleTicketIds = (id: string) => {
      const possibleIds = [id];
      
      // Handle sponsor tickets with or without -passes suffix
      if (id.includes('-sponsor-passes')) {
        possibleIds.push(id.replace('-passes', ''));
      } else if (id.includes('-sponsor')) {
        possibleIds.push(id + '-passes');
      }
      
      // Handle VIP passes that might be formatted differently
      if (id.includes('-vip-pass')) {
        possibleIds.push(id.replace('-vip-pass', '-sponsor'));
      } else if (id.includes('-sponsor')) {
        possibleIds.push(id.replace('-sponsor', '-vip-pass'));
      }
      
      return possibleIds;
    };
    
    // Find the source attendee checking all possible formats
    let sourceAttendee = null;
    const possibleSourceIds = getPossibleTicketIds(sourceTicketId);
    
    // First check attendeesByTicket
    for (const id of possibleSourceIds) {
      if (attendeesByTicket[id] && attendeesByTicket[id][sourceIndex]) {
        sourceAttendee = attendeesByTicket[id][sourceIndex];
        break;
      }
    }
    
    // If not found, check sponsorPassAttendees
    if (!sourceAttendee) {
      for (const id of possibleSourceIds) {
        if (sponsorPassAttendees[id] && sponsorPassAttendees[id][sourceIndex]) {
          sourceAttendee = sponsorPassAttendees[id][sourceIndex];
          break;
        }
      }
    }
    
    if (!sourceAttendee) {
      console.error('Failed to copy attendee: Source attendee not found.', {
        sourceTicketId, sourceIndex,
        possibleIds: possibleSourceIds,
        attendeesByTicket: Object.keys(attendeesByTicket),
        sponsorPassAttendees: Object.keys(sponsorPassAttendees)
      });
      return; // Exit if source attendee not found
    }
    
    // For the target, we need to find the right state object to update
    const possibleTargetIds = getPossibleTicketIds(targetTicketId);
    
    // Determine if we should update attendeesByTicket or sponsorPassAttendees
    let foundTarget = false;
    
    // First try the primary target ID in attendeesByTicket
    if (attendeesByTicket[targetTicketId] !== undefined) {
      setAttendeesByTicket(prev => {
        let targetAttendees = prev[targetTicketId] ? [...prev[targetTicketId]] : [];
        
        // Ensure target has enough entries by padding with empty attendees if needed
        while (targetIndex >= targetAttendees.length) {
          targetAttendees.push({ ...initialModalAttendeeInfo });
        }
        
        // Copy the source attendee info to the target attendee
        targetAttendees[targetIndex] = { ...sourceAttendee };
        
        return {
          ...prev,
          [targetTicketId]: targetAttendees
        };
      });
      foundTarget = true;
    }
    
    // If not found, try sponsorPassAttendees
    else if (!foundTarget) {
      for (const id of possibleTargetIds) {
        if (sponsorPassAttendees[id] !== undefined) {
          setSponsorPassAttendees(prev => {
            let targetAttendees = prev[id] ? [...prev[id]] : [];
            
            // Ensure target has enough entries by padding with empty attendees if needed
            while (targetIndex >= targetAttendees.length) {
              targetAttendees.push({ ...initialModalAttendeeInfo });
            }
            
            // Copy the source attendee info to the target attendee
            targetAttendees[targetIndex] = { ...sourceAttendee };
            
            return {
              ...prev,
              [id]: targetAttendees
            };
          });
          foundTarget = true;
          break;
        }
      }
    }
    
    // If target wasn't found in either state object
    if (!foundTarget) {
      console.error('Failed to copy attendee: Target ticket ID not found', {
        targetTicketId,
        possibleTargetIds,
        availableRegular: Object.keys(attendeesByTicket),
        availableSponsor: Object.keys(sponsorPassAttendees)
      });
    }
  };

  const calculateTotal = () => {
    // Calculate total from all registration types (tickets, exhibitors, sponsorships)
    const calculateSubtotal = (registrations: AdapterModalRegistrationType[]) => {
      return registrations.reduce((total, reg) => {
        const quantity = ticketQuantities[reg.id] || 0;

        // Skip calculation for items with no quantity or complimentary/string prices
        if (quantity === 0 || reg.type === 'complimentary' || typeof reg.price === 'string') {
          return total;
        }

        // Check if early bird pricing applies
        const isEarlyBird = reg.earlyBirdPrice && reg.earlyBirdDeadline && new Date() < new Date(reg.earlyBirdDeadline);
        // Use early bird price if available and date is valid, otherwise use regular price
        const ticketPrice = isEarlyBird && reg.earlyBirdPrice !== undefined ? reg.earlyBirdPrice : reg.price;

        // Handle string or number price values
        const numericPrice = typeof ticketPrice === 'string' ?
          parseFloat(ticketPrice.replace(/[^0-9.]/g, '')) || 0 :
          ticketPrice;
          
        // Apply promo discount if valid code is entered and registration is eligible
        let finalPrice = numericPrice;
        if (promoCodeValid && activePromoCode) {
          if (isEligibleForPromoDiscount(reg.id, activePromoCode.eligibleTicketTypes)) {
            // Apply discount percentage
            finalPrice = finalPrice * (1 - activePromoCode.discountPercentage / 100);
          }
        }

        return total + (quantity * finalPrice);
      }, 0);
    };

    // Calculate subtotals for each registration type
    const ticketsTotal = calculateSubtotal(allRegistrations);
    const exhibitorsTotal = calculateSubtotal(exhibitors);
    const sponsorshipsTotal = calculateSubtotal(sponsorships);

    // Return the combined total
    return ticketsTotal + exhibitorsTotal + sponsorshipsTotal;
  };

  const getTotalTickets = () => {
    // Count all tickets across all registration types (tickets, exhibitors, sponsorships)
    return Object.values(ticketQuantities).reduce((sum, qty) => sum + qty, 0);
  };



  const handlePaymentSuccess = (paymentIntentId: string) => {
    setApiError(null); // Clear any previous payment errors
    setPaymentSuccessful(true);
    setAttemptingStripePayment(false); // Reset payment attempt flag
    setIsLoading(false); // Ensure loading stops

    // Update confirmation data
    if (pendingConfirmationData) {
      setConfirmationData(pendingConfirmationData);
    } else {
      setConfirmationData({ paymentIntentId, message: 'Payment confirmed. Thank you!' });
    }

    // Important: These state updates should trigger a re-render to show confirmation view
    setShowConfirmationView(true);
    setPendingConfirmationData(null); // Clear pending data

    // Force any pending state updates to be applied
  };

  const handlePaymentError = (errorMessage: string) => {
    console.error('Payment failed (Client):', errorMessage);
    setApiError(`Payment failed: ${errorMessage}`);
    setPendingConfirmationData(null); // Clear pending data on error
    setPaymentSuccessful(false);
    setAttemptingStripePayment(false); // Reset payment attempt flag
  };

  const getValidatedBusinessSize = (size?: BusinessSize | ''): BusinessSize => {
    const validSizes: BusinessSize[] = ['Small Business', 'Medium-Sized Business', 'Large-Sized Business', 'Government Agency', 'Military Component'];
    if (size && validSizes.includes(size as BusinessSize)) {
      return size as BusinessSize;
    }
    return 'Small Business'; // Default value
  };

  const handleFinalSubmit = async () => {
    // Double-check that registration is still open before final submission
    if (registrationClosed) {
      setApiError('Registration for this event has closed.');
      setIsLoading(false);
      return;
    }

    setFormErrors({});
    setApiError(null);
    setIsLoading(true);

    // Helper function to process registrations of any type
    const processRegistrations = (registrations: AdapterModalRegistrationType[], category: 'ticket' | 'exhibit' | 'sponsorship') => {
      return registrations
        .filter(reg => (ticketQuantities[reg.id] || 0) > 0)
        .map(reg => {
          // Get the effective price (considering early bird pricing)
          const effectivePrice = getEffectivePrice(reg);

          // For sponsorships, ensure we pass a numeric price to the API
          // This is crucial because the API needs numeric prices for payment processing

          // For sponsorships, check if there are sponsor pass attendees and use the first one as the POC
          let attendeeInfo = (attendeesByTicket[reg.id] || []).map(att => ({ ...att }));
          
          // If this is a sponsorship and it has sponsor passes, use the first attendee as the POC
          if (category === 'sponsorship' && sponsorPassAttendees[reg.id] && sponsorPassAttendees[reg.id].length > 0) {
            attendeeInfo = [{ ...sponsorPassAttendees[reg.id][0] }];
          }

          return {
            ticketId: reg.id,
            ticketName: reg.title,
            ticketPrice: effectivePrice,
            quantity: ticketQuantities[reg.id] || 0,
            category, // Add category to identify the type of registration
            attendeeInfo,
            // Include type information for the backend to properly identify sponsorships
            type: reg.type,
          };
        });
    };

    // Helper function to process sponsor pass attendees
    const processSponsorPasses = () => {
      const sponsorPassTickets: any[] = [];

      // For each sponsorship with passes
      Object.keys(sponsorPassAttendees).forEach(sponsorId => {
        const sponsor = sponsorships.find(s => s.id === sponsorId);
        if (!sponsor) return;

        const passAttendees = sponsorPassAttendees[sponsorId] || [];
        if (passAttendees.length === 0) return;

        // REMOVED: no longer creating a separate sponsor ticket for the first attendee
        // Instead, the attendee info will be added to the main sponsorship ticket in processRegistrations()

        // Handle additional attendees - labeled as "Additional Sponsor Attendee Pass"
        if (passAttendees.length > 1) {
          sponsorPassTickets.push({
            ticketId: `${sponsorId}-additional-pass`,
            ticketName: 'Additional Sponsor Attendee Pass',
            ticketPrice: 'Complimentary', // These are free as part of sponsorship
            quantity: passAttendees.length - 1,
            category: 'ticket', // Treat as tickets for processing
            isIncludedWithSponsorship: true, // Flag to identify these are from sponsorship
            sponsorshipId: sponsorId, // Reference back to the sponsorship
            attendeeInfo: passAttendees.slice(1).map(att => ({ ...att })),
          });
        }
      });

      return sponsorPassTickets;
    };

    // Consolidate all data for validation from all registration types
    const ticketsForValidation = [
      ...processRegistrations(allRegistrations, 'ticket'),
      ...processRegistrations(exhibitors, 'exhibit'),
      ...processRegistrations(sponsorships, 'sponsorship'),
      ...processSponsorPasses() // Add sponsor pass attendees
    ];

    // Add ticket prices explicitly to ensure the backend has the correct price information
    const ticketPrices: Record<string, number> = {};

    // Add prices for regular tickets
    [...allRegistrations, ...exhibitors, ...sponsorships].forEach(reg => {
      if (ticketQuantities[reg.id] && ticketQuantities[reg.id] > 0) {
        const effectivePrice = getEffectivePrice(reg);
        // Ensure we have a numeric price
        if (typeof effectivePrice === 'number') {
          ticketPrices[reg.id] = effectivePrice;
        }
      }
    });

    // Add complimentary prices for sponsor passes
    Object.keys(sponsorPassAttendees).forEach(sponsorId => {
      ticketPrices[`${sponsorId}-vip-pass`] = 0; // Sponsor passes are complimentary
    });

    console.log(ticketPrices);

    // Find the first registration type that has attendees and requires attendee info
    // Check across all registration types
    const findFirstRegWithAttendees = (registrations: AdapterModalRegistrationType[]) => {
      return registrations.find(reg =>
        reg.requiresAttendeeInfo &&
        (ticketQuantities[reg.id] || 0) > 0 &&
        ((attendeesByTicket[reg.id] || []).length > 0 || (sponsorPassAttendees[reg.id] || []).length > 0)
      )?.id;
    };
    console.log(allRegistrations);
    console.log(exhibitors);
    console.log(sponsorships);

    const firstRegWithAttendeesId =
      findFirstRegWithAttendees(allRegistrations) ||
      findFirstRegWithAttendees(exhibitors) ||
      findFirstRegWithAttendees(sponsorships);
    console.log("firstRegWithAttendeesId: ", firstRegWithAttendeesId);

    let primaryAttendeeData: Partial<ModalAttendeeInfo> = {};
    // First check attendeesByTicket
    if (firstRegWithAttendeesId && attendeesByTicket[firstRegWithAttendeesId] && attendeesByTicket[firstRegWithAttendeesId][0]) {
      primaryAttendeeData = attendeesByTicket[firstRegWithAttendeesId][0];
    }
    // If not found, check sponsorPassAttendees
    else if (firstRegWithAttendeesId && sponsorPassAttendees[firstRegWithAttendeesId] && sponsorPassAttendees[firstRegWithAttendeesId][0]) {
      primaryAttendeeData = sponsorPassAttendees[firstRegWithAttendeesId][0];
    }

    const totalAmount = calculateTotal();
    const determinedPaymentMethod = totalAmount === 0 && selectedRegistration?.type === 'free' ? 'free' : 'creditCard';
    console.log("primaryAttendeeData: ", primaryAttendeeData);

    const formDataToValidate: Partial<RegistrationFormData> = {
      eventId: event.id.toString(),
      firstName: billingInfo.firstName || primaryAttendeeData.firstName || '',
      lastName: billingInfo.lastName || primaryAttendeeData.lastName || '',
      email: billingInfo.email || primaryAttendeeData.email || '',
      phone: primaryAttendeeData.phone || 'N/A',
      jobTitle: primaryAttendeeData.jobTitle || 'N/A',
      company: primaryAttendeeData.company || 'N/A',
      companyWebsite: primaryAttendeeData.website || 'N/A', // Schema allows undefined, regex for valid URL if present
      businessSize: getValidatedBusinessSize(primaryAttendeeData.businessSize),
      industry: primaryAttendeeData.industry || 'N/A',
      // Address fields are not in the current yup schema, so not providing them here for validation.
      // If they were, they'd need defaults like 'N/A' or to be made optional. 
      // Survey questions - not in current modal, provide defaults
      howDidYouHearAboutUs: '',
      interestedInSponsorship: primaryAttendeeData.sponsorInterest === 'Yes',
      interestedInSpeaking: primaryAttendeeData.speakingInterest === 'Yes',
      agreeToPhotoRelease: false, // Defaulting, consider adding to form

      tickets: ticketsForValidation,
      agreeToTerms: agreedToTerms,
      paymentMethod: determinedPaymentMethod,
      // ticketQuantities might not be needed directly if 'tickets' array is comprehensive for validation
      // but can be kept if the schema expects it separately for some reason.
      // For now, let's assume the schema can infer quantities from the tickets array or doesn't need it explicitly here.
    };

    try {
      // Validate all relevant parts before proceeding to payment intent creation
      await registrationSchema.validate(formDataToValidate, { abortEarly: false });

      // Check terms AFTER general validation
      if (!agreedToTerms) {
        setFormErrors(prev => ({ ...prev, agreedToTerms: 'You must agree to the terms and conditions.' }));
        setIsLoading(false);
        return;
      }

      // If all validations pass, create payment intent or complete free registration
      try { // Nested try for payment/API calls
        // For ALL registrations (free or paid initial submission), call the /api/event-registration/register endpoint.
        // The backend will handle whether a payment intent is needed.
        // if (totalAmount === 0 && selectedRegistration.type === 'free') { ... }
        // The distinction between free/paid is now primarily handled by the API response (presence of clientSecret).
        // Thus, the structure for the initial API call can be unified.

        // The following block will now handle both free and paid initial submissions:
        // else if (totalAmount > 0) { ... } becomes the main path for API call.
        // If it's a free registration, the response 'result' won't have a clientSecret, 
        // and it will fall into the 'else' block (around line 553 in previous diff) for immediate confirmation.

        // Unified API call path:
        // Note: The original 'if (totalAmount === 0 && selectedRegistration.type === 'free')' block is removed.
        // The 'else if (totalAmount > 0)' effectively becomes the primary path for calling the register API.
        // We assume totalAmount >= 0. If totalAmount is 0, the API will treat it as free.
        // The following block now directly executes as the unified path:
        // Create payment intent for paid registrations (or handle free ones via API response)
        const response = await fetch('/api/event-registration/register', {
          // Note: eventId is now part of formDataToValidate from previous steps, ensure it's there or add it explicitly if not.
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formDataToValidate, // Send the whole validated form data
            eventId: event.id, // Make sure eventId is included
            eventTitle: event.title, // Include event name for clarity
            eventImage: event.image,
            ticketPrices, // Include the ticket prices object for accurate pricing
            promoCode: activePromoCode?.code || null, // Pass the active promo code to the backend for validation
            // The register endpoint will calculate amount and use necessary fields from formDataToValidate
          }),
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
          console.error('Failed to process registration. Status:', response.status, 'Error data:', result);

          // Handle validation errors from the server
          if (result.errors && typeof result.errors === 'object') {
            setFormErrors(result.errors);

            // Create a user-friendly error message from the validation errors
            const errorMessages = Object.values(result.errors).join('\n');
            setApiError(errorMessages || 'Please correct the errors in the form.');
          } else {
            // Use result.error or result.message if provided by the backend, otherwise a generic message
            setApiError(result.error || result.message || `API Error: ${response.status} - ${response.statusText}`);
          }

          setIsLoading(false); // Stop loading on API error
          return; // Stop further execution
        }

        // If successful and a clientSecret is returned, it's a paid flow needing Stripe UI
        if (result.clientSecret) {
          setPendingConfirmationData(result); // Store data for after Stripe success
          setIsStripeReady(false); // Explicitly set Stripe to not ready, awaiting re-initialization

          // Set clientSecret last as it triggers the Elements re-render
          setClientSecret(result.clientSecret);

          // Give Elements time to initialize before attempting payment
          setTimeout(() => {
            setAttemptingStripePayment(true); // This will trigger the useEffect to call Stripe submit
          }, 500);
        } else { // Free flow or $0 paid (e.g. 100% discount) - already handled by /api/event-registration/register
          setConfirmationData(result);
          setShowConfirmationView(true);
          setIsLoading(false);
          // The /api/event-registration/register call has already handled this.
          // No further call to handleCompleteRegistrationApiCall needed here.
        }
      } catch (apiCallError) { // Catch for payment intent / API call
        if (apiCallError instanceof Error) {
          setApiError(apiCallError.message);
        } else {
          setApiError('An unexpected error occurred while preparing payment or registration.');
        }
        setIsLoading(false); // Ensure loading is stopped on API error
      }
    } catch (validationError) { // Catch for Yup validation
      if (validationError instanceof ValidationError) {
        const errors: Record<string, string> = {};
        validationError.inner.forEach(err => {
          if (err.path) errors[err.path] = err.message;
        });
        setFormErrors(errors);
      } else {
        setApiError('An unexpected error occurred during validation.');
      }
      setIsLoading(false); // Always stop loading on validation error
    }
    // Note: setIsLoading(true) is at the start. 
    // setIsLoading(false) is handled in validation catch, API call catch,
    // and should also be handled by StripePaymentForm callbacks or handleCompleteRegistrationApiCall.
  };

  const handleAddSponsorAttendee = (sponsorshipId: string) => {
    const sponsorship = sponsorships.find(s => s.id === sponsorshipId);
    if (!sponsorship || !sponsorship.sponsorPasses) return;

    const maxAttendees = sponsorship.sponsorPasses * (ticketQuantities[sponsorshipId] || 0);
    const currentCount = sponsorAttendeesToRegister[sponsorshipId] || 0;

    if (currentCount < maxAttendees) {
      setSponsorAttendeesToRegister(prev => ({ ...prev, [sponsorshipId]: currentCount + 1 }));
      setSponsorPassAttendees(prev => ({
        ...prev,
        [sponsorshipId]: [...(prev[sponsorshipId] || []), { ...initialModalAttendeeInfo }]
      }));
    }
  };

  const handleRemoveSponsorAttendee = (sponsorshipId: string, index: number) => {
    const currentCount = sponsorAttendeesToRegister[sponsorshipId] || 0;
    if (currentCount > 1) { // Always keep at least one attendee
      setSponsorAttendeesToRegister(prev => ({ ...prev, [sponsorshipId]: currentCount - 1 }));
      setSponsorPassAttendees(prev => {
        const updatedAttendees = [...(prev[sponsorshipId] || [])];
        updatedAttendees.splice(index, 1);
        return { ...prev, [sponsorshipId]: updatedAttendees };
      });
    }
  };

  const handleSponsorPassAttendeeChange = (sponsorshipId: string, index: number, field: keyof EventAttendeeInfo, value: string) => {
    setSponsorPassAttendees(prev => {
      const attendeesList = prev[sponsorshipId] || []; // Default to empty array if undefined
      const currentQuantity = ticketQuantities[sponsorshipId] || 0;

      // Create a new list ensuring it matches currentQuantity, populating with existing or initial info
      const newAttendeesList = Array(currentQuantity).fill(null).map((_, i) => {
        return attendeesList[i] || { ...initialModalAttendeeInfo };
      });

      // Apply the update to the correct attendee in the new list
      if (index < newAttendeesList.length) {
        newAttendeesList[index] = {
          ...(newAttendeesList[index]), // Spread existing fields of the specific attendee
          [field]: value,
        };
      } else {
        // This case should ideally not happen if AttendeeForms are rendered based on currentQuantity
        console.error(`Attendee index ${index} is out of bounds for ticket ${sponsorshipId} with quantity ${currentQuantity}. Change not applied.`);
        return prev;
      }

      const finalState = {
        ...prev,
        [sponsorshipId]: newAttendeesList,
      };
      return finalState;
    });
  };

  const renderAttendeeCountStep = () => {
    const selectedSponsorships = sponsorships.filter(
      s => (ticketQuantities[s.id] || 0) > 0 && s.sponsorPasses && s.sponsorPasses > 0
    );

    return (
      <div className="p-6">
        <h3 className="text-2xl font-bold text-gray-900">Confirm Attendee Count</h3>
        <p className="mt-2 text-sm text-gray-600">
          Your sponsorship includes complimentary attendee passes. Please specify how many you would like to register now. You can always provide the remaining attendee details later by contacting us.
        </p>
        <div className="mt-6 space-y-4">
          {selectedSponsorships.map(s => {
            if (!s.sponsorPasses) return null;
            const totalPasses = s.sponsorPasses * (ticketQuantities[s.id] || 0);
            const currentCount = sponsorAttendeesToRegister[s.id] || totalPasses;
            return (
              <div key={s.id} className="p-4 border border-gray-200 rounded-lg bg-gray-200">
                <label htmlFor={`attendee-count-${s.id}`} className="block text-md font-medium text-gray-800">
                  {s.name}
                </label>
                <p className="text-sm text-gray-500">You have up to {totalPasses} attendee passes.</p>

                <div className="flex items-center mt-2">
                  <button
                    onClick={() => {
                      const newCount = Math.max(1, (sponsorAttendeesToRegister[s.id] || totalPasses) - 1);
                      setSponsorAttendeesToRegister(prev => ({ ...prev, [s.id]: newCount }));
                    }}
                    className="p-2 bg-gray-200 rounded-l-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 font-bold"
                    aria-label="Decrease attendee count"
                  >
                    -
                  </button>
                  <div className="px-4 py-2 bg-white border-t border-b border-gray-300 text-center min-w-[60px]">
                    {currentCount}
                  </div>
                  <button
                    onClick={() => {
                      const newCount = Math.min(totalPasses, (sponsorAttendeesToRegister[s.id] || totalPasses) + 1);
                      setSponsorAttendeesToRegister(prev => ({ ...prev, [s.id]: newCount }));
                    }}
                    className="p-2 bg-gray-200 rounded-r-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 font-bold"
                    aria-label="Increase attendee count"
                    disabled={currentCount >= totalPasses}
                  >
                    +
                  </button>
                  <span className="ml-3 text-sm text-gray-600">{currentCount} {currentCount === 1 ? 'Attendee' : 'Attendees'}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-8 flex justify-between items-center">
          <button
            type="button"
            onClick={() => {
              setAttendeeCountStep(false);
              setCurrentStep(1); // Go back to billing info
            }}
            className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => {
              const newSponsorPassAttendees: Record<string, ModalAttendeeInfo[]> = {};
              Object.keys(sponsorAttendeesToRegister).forEach(sponsorshipId => {
                const count = sponsorAttendeesToRegister[sponsorshipId];
                newSponsorPassAttendees[sponsorshipId] = Array(count).fill(null).map(() => ({ ...initialModalAttendeeInfo }));
              });
              setSponsorPassAttendees(prev => ({ ...prev, ...newSponsorPassAttendees }));
              setAttendeeCountStep(false);
              setCurrentStep(2); // Move to attendee info step
            }}
            className="bg-blue-600 text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-base font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Continue
          </button>
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Billing Information
        return (
          <BillingInformation
            billingInfo={billingInfo}
            onChange={handleBillingInfoChange} // Prop name changed
          />
        );
      case 2: // Attendee Info, Terms, and Payment
        return (
          <>
            {/* Helper function to render attendee forms for any registration type */}
            {(() => {
              // Combine all registration types that require attendee info
              const allRegistrationTypes = [
                ...allRegistrations.map(reg => ({ ...reg, categoryName: 'Ticket' })),
                ...exhibitors.map(reg => ({ ...reg, categoryName: 'Exhibitor' })),
                ...sponsorships.map(reg => ({ ...reg, categoryName: 'Sponsorship' }))
              ];

              // Create a consolidated list of all attendees for copy functionality
              const consolidatedAttendees = allRegistrationTypes
                .filter(r => r.requiresAttendeeInfo && (ticketQuantities[r.id] || 0) > 0)
                .map(r => ({
                  ticketId: r.id,
                  ticketName: `${r.name} (${r.categoryName})`,
                  attendees: attendeesByTicket[r.id] || []
                }));

              // Add sponsor pass attendees to the consolidated list
              const sponsorPassesInfo = Object.keys(sponsorPassAttendees).map(sponsorId => {
                const sponsor = sponsorships.find(s => s.id === sponsorId);
                return {
                  ticketId: `${sponsorId}-passes`,
                  ticketName: `${sponsor?.name || 'Sponsor'} (VIP Passes)`,
                  attendees: sponsorPassAttendees[sponsorId] || []
                };
              });

              const allAttendeesForCopy = [...consolidatedAttendees, ...sponsorPassesInfo];

              return (
                <>

                  {/* Sponsor pass attendee forms */}
                  {Object.keys(sponsorPassAttendees).map(sponsorId => {
                    const sponsor = sponsorships.find(s => s.id === sponsorId);
                    const passAttendees = sponsorPassAttendees[sponsorId] || [];

                    if (passAttendees.length === 0) return null;

                    return (
                      <div key={`${sponsorId}-passes`}>
                        <h4 className="text-lg font-medium mt-4 mb-2 text-indigo-700">
                          {sponsor?.name} - VIP Attendee Passes ({passAttendees.length})
                        </h4>
                        <p className="text-sm text-gray-500 mb-3">
                          These passes are included with your {sponsor?.name} sponsorship package.
                        </p>
                        {passAttendees.map((attendeeData, index) => (
                          <div key={`${sponsorId}-pass-${index}`} className="mb-4 border-b border-indigo-100 pb-4">
                            <AttendeeForm
                              attendee={attendeeData}
                              index={index}
                              onChange={(attendeeIdx, fieldName, fieldValue) => {
                                // Create a handler for sponsor pass attendee changes
                                const newSponsorPassAttendees = { ...sponsorPassAttendees };
                                if (!newSponsorPassAttendees[sponsorId]) {
                                  newSponsorPassAttendees[sponsorId] = [];
                                }
                                if (!newSponsorPassAttendees[sponsorId][attendeeIdx]) {
                                  newSponsorPassAttendees[sponsorId][attendeeIdx] = { ...initialModalAttendeeInfo };
                                }
                                newSponsorPassAttendees[sponsorId][attendeeIdx] = {
                                  ...newSponsorPassAttendees[sponsorId][attendeeIdx],
                                  [fieldName]: fieldValue
                                };
                                setSponsorPassAttendees(newSponsorPassAttendees);
                              }}
                              onCopyFrom={(sourceTicketId, sourceAttendeeIdx) => {
                                // Create a handler for copying to sponsor pass attendees
                                let sourceAttendee;

                                // Check if source is a regular attendee
                                const regularSource = consolidatedAttendees.find(item => item.ticketId === sourceTicketId);
                                if (regularSource) {
                                  sourceAttendee = regularSource.attendees[sourceAttendeeIdx];
                                } else {
                                  // Check if source is another sponsor pass attendee
                                  const sponsorPassSource = sponsorPassesInfo.find(item => item.ticketId === sourceTicketId);
                                  if (sponsorPassSource) {
                                    sourceAttendee = sponsorPassSource.attendees[sourceAttendeeIdx];
                                  }
                                }

                                if (sourceAttendee) {
                                  const newSponsorPassAttendees = { ...sponsorPassAttendees };
                                  if (!newSponsorPassAttendees[sponsorId]) {
                                    newSponsorPassAttendees[sponsorId] = [];
                                  }
                                  newSponsorPassAttendees[sponsorId][index] = { ...sourceAttendee };
                                  setSponsorPassAttendees(newSponsorPassAttendees);
                                }
                              }}
                              totalAttendees={passAttendees.length}
                              allAttendees={allAttendeesForCopy}
                              currentTicketId={`${sponsorId}-passes`}
                              formErrors={formErrors}
                              isComplimentaryTicket={true} // Sponsor passes are complimentary
                              ticketType="sponsorship"
                            />
                          </div>
                        ))}
                      </div>
                    );
                  })}

                  {/* Regular registration attendee forms - exclude regular sponsorships but include Additional Sponsor Attendee passes */}
                  {/* This might be kind of hacky, but it works for now */}
                  {/* TODO: Refactor this. One idea is to change the `category` field of the adapted Sponsor in `registration-adapters.ts` to `sponsorship-pass` */}
                  {/* Unsure if this would break things elsewhere */}
                  {allRegistrationTypes
                    .filter(reg => reg.requiresAttendeeInfo && (ticketQuantities[reg.id] || 0) > 0 && 
                      (reg.category !== 'sponsorship' || (reg.name && reg.name.includes('Additional Sponsor Attendee'))))
                    .map(reg => (
                      <div key={reg.id}>
                        <h4 className="text-lg font-medium mt-4 mb-2">{reg.name} - {reg.categoryName} Attendees</h4>
                        {Array.from({ length: ticketQuantities[reg.id] || 0 }).map((_, index) => {
                          const attendeeData = attendeesByTicket[reg.id]?.[index] || initialModalAttendeeInfo;
                          return (
                            <div key={`${reg.id}-${index}`} className="mb-4 border-b pb-4">
                              <AttendeeForm
                                attendee={attendeeData}
                                index={index}
                                onChange={(attendeeIdx, fieldName, fieldValue) => handleAttendeeChange(reg.id, attendeeIdx, fieldName as keyof EventAttendeeInfo, fieldValue)}
                                onCopyFrom={(sourceTicketId, sourceAttendeeIdx) => handleCopyAttendee(sourceTicketId, sourceAttendeeIdx, reg.id, index)}
                                totalAttendees={(attendeesByTicket[reg.id] || []).length}
                                allAttendees={allAttendeesForCopy}
                                currentTicketId={reg.id}
                                formErrors={formErrors}
                                isComplimentaryTicket={reg.type === 'complimentary'}
                                ticketType={reg.category}
                              />
                            </div>
                          );
                        })}
                      </div>
                    ))}

                </>
              );
            })()}
            <TermsAndConditions
              agreed={agreedToTerms}
              onAgree={setAgreedToTerms} // Corrected prop name
            />
            {/* Disclaimer about credit card info */}
            <div className="mt-4 mb-6 bg-gray-100 p-4 rounded flex flex-col">
            <p className="text-sm text-gray-600">
            <strong>Disclaimer:</strong> All transactions are processed through <strong>Stripe</strong>, a third-party payment processor. The American Defense Alliance does not store or have access to your payment details. For more information on Stripe’s security measures, please visit <a href="https://docs.stripe.com/security" className="text-blue-600 hover:underline">Stripe’s website</a>.
            </p>
            {/* this is how it will show up on your bank statement */}
            <div className="flex flex-row items-center mt-2">
            <Landmark className="text-sm text-gray-600 mr-2"></Landmark>
            <p className="text-sm text-gray-600">This transaction will appear on your bank statement as <strong className="whitespace-nowrap">AMER. DEFENSE ALLIANCE</strong>.</p>
            </div>
            </div>
            {calculateTotal() > 0 && (
              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-2 text-gray-800">Payment Details</h3>
                {/* Don't use key prop on Elements - it causes the component to remount and lose card state */}
                <Elements stripe={stripePromise} options={clientSecret ? { clientSecret, appearance } : undefined}>
                  <StripePaymentForm
                    ref={stripeFormRef}
                    clientSecret={clientSecret} // Pass the clientSecret obtained from your server
                    eventId={event.id.toString()}
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                    onPaymentProcessing={setIsLoading} // Or a more specific handler for payment in progress
                    onStripeReady={handleStripeReady}
                  />
                </Elements>
              </div>
            )}
          </>
        );
      case 3: // Confirmation
        return (
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-green-600 mb-4">Registration Complete!</h2>
            <p className="text-gray-700 mb-2">Thank you for registering for {event.title}.</p>
            {confirmationData.paymentIntentId && <p className="text-sm text-gray-500 mt-2">Payment ID: {confirmationData.paymentIntentId}</p>}
          </div>
        );
      default:
        return null;
    }
  };

  const renderStepButtons = () => {
    if (currentStep === 1) {
      return (
        <div className="flex justify-between">
          <button
            type="button"
            onClick={handleBackToTickets}
            className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={isLoading}
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleNextStep}
            className="ml-4 px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Next'}
          </button>
        </div>
      );
    } else if (currentStep === 2) {
      return (
        <div className="flex justify-between">
          <button
            type="button"
            onClick={handlePrevStep}
            className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={isLoading}
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleFinalSubmit}
            className="ml-4 px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Complete Registration'}
          </button>
        </div>
      );
    } else if (currentStep === 3) {
      return (
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Close
        </button>
      );
    }
    return null;
  };

  if (!isOpen) return null;

  // If registration is closed, show a message
  if (registrationClosed && !showConfirmationView) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none bg-black bg-opacity-50">
        <div className="relative w-full max-w-md mx-auto my-6">
          <div className="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-lg outline-none focus:outline-none">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-solid rounded-t border-slate-200">
              <h3 className="text-xl font-semibold text-red-600">Registration Closed</h3>
              <button
                className="p-1 ml-auto bg-transparent border-0 text-black float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                onClick={onClose}
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Body */}
            <div className="relative p-6 flex-auto">
              <p className="my-4 text-slate-700 text-lg leading-relaxed">
                Registration for this event has closed.
              </p>
              <p className="my-4 text-slate-600 text-base leading-relaxed text-center">
                The event is scheduled for: <br /> {event.date}.
              </p>
              <p className="my-4 text-slate-600 text-base leading-relaxed">
                For any questions or special registration requests, please contact the event organizers at{' '}
                <a href={`mailto:${event.contactInfo?.contactEmail2 || 'info@americandefensealliance.org'}`} className="text-blue-600 hover:text-blue-800">
                  {event.contactInfo?.contactEmail2 || 'info@americandefensealliance.org'}
                </a>
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end p-6 border-t border-solid rounded-b border-slate-200">
              <button
                className="px-6 py-2 mb-1 mr-1 text-sm font-bold text-white uppercase transition-all duration-150 ease-linear bg-blue-600 rounded shadow outline-none hover:shadow-lg focus:outline-none"
                type="button"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }



  // Function to handle the confirmation dialog result
  const handleCloseConfirmation = (saveChanges: boolean) => {
    if (!saveChanges) {
      // Only reset state if user chooses to discard changes
      resetState();
    }
    setShowCloseConfirmation(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
      {/* Close confirmation dialog */}
      {showCloseConfirmation && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Unsaved Changes</h3>
            <p className="text-sm text-gray-600 mb-5">
              When closing this window, you can choose to save your changes and come back to them, or discard them and start over.
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => handleCloseConfirmation(true)} 
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors text-sm"
              >
                Save & Close
              </button>
              <button 
                onClick={() => handleCloseConfirmation(false)} 
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 transition-colors text-sm"
              >
                Discard Changes
              </button>
              <button 
                onClick={() => setShowCloseConfirmation(false)} 
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="relative mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white overflow-y-auto h-fit max-h-[100vh] sm:max-h-[90vh]">
        {attendeeCountStep ? renderAttendeeCountStep() : showConfirmationView && confirmationData ? (
          // Confirmation View
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-green-600 mb-4">Registration Confirmed!</h2>
            <p className="text-gray-700 mb-2">{confirmationData.message || `Thank you for registering for ${event.title}.`}</p>
            {confirmationData.paymentIntentId && <p className="text-sm text-gray-500 mt-2">Payment ID: {confirmationData.paymentIntentId}</p>}
            <p className="text-gray-700">A confirmation email has been sent to {billingInfo.email}.</p>
            <button
              onClick={onClose}
              className="mt-6 px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Close
            </button>
          </div>
        ) : (
          // Main Registration Flow
          <>
            <div className="flex justify-between items-center pb-3 border-b">
              <h3 className="text-base sm:text-xl font-semibold text-gray-900">
                {isCheckout ? `Register for ${event.title}` : `Select Tickets for ${event.title}`}
              </h3>
              <button
                onClick={() => {
                  // Check if there are any unsaved changes before closing
                  const hasUnsavedChanges = 
                    Object.values(ticketQuantities).some(qty => qty > 0) || 
                    Object.keys(attendeesByTicket).some(key => attendeesByTicket[key].length > 0) ||
                    Object.keys(sponsorPassAttendees).length > 0 ||
                    billingInfo.firstName || billingInfo.lastName || billingInfo.email || billingInfo.confirmEmail ||
                    isCheckout;
                    
                  if (hasUnsavedChanges && !showConfirmationView && !paymentSuccessful) {
                    setShowCloseConfirmation(true);
                  } else {
                    // No changes or already completed, close directly
                    onClose();
                  }
                }}
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {!isCheckout ? (
              // Ticket Selection View
              <div className="flex flex-col h-fit">
                {/* Category tabs */}
                <div className="flex border-b mb-4 flex-col sm:flex-row text-sm sm:text-base">
                  <button
                    onClick={() => setActiveCategory('ticket')}
                    className={`flex items-center px-4 py-2 ${activeCategory === 'ticket' ? 'border-l-2 sm:border-b-2 sm:border-l-0 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
                  >
                    <Ticket size={16} className="mr-2" />
                    <span>General Admission</span>
                  </button>
                  {exhibitors.length > 0 && (
                    <button
                      onClick={() => setActiveCategory('exhibit')}
                      className={`flex items-center px-4 py-2 ${activeCategory === 'exhibit' ? 'border-l-2 sm:border-b-2 sm:border-l-0 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
                    >
                      <Package size={16} className="mr-2" />
                      <span>Exhibit Space</span>
                    </button>
                  )}
                  {sponsorships.length > 0 && (
                    <button
                      onClick={() => {
                        setActiveCategory('sponsorship');
                      }}
                      className={`flex items-center px-4 py-2 ${activeCategory === 'sponsorship' ? 'border-l-2 sm:border-b-2 sm:border-l-0 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
                    >
                      <Award size={16} className="mr-2" />
                      <span>Sponsorships</span>
                    </button>
                  )}
                </div>

                <div className="flex-grow overflow-y-auto">
                  {/* Show tickets when activeCategory is 'ticket' */}
                  {activeCategory === 'ticket' && allRegistrations.filter(reg => reg.isActive).map(reg => {
                    const ticketIsExpired = isTicketExpired(reg);
                    return (
                      <div key={reg.id} className={`mb-4 p-4 border rounded-lg shadow-sm ${ticketIsExpired ? 'opacity-75 bg-gray-200' : ''}`}>
                        <div className="flex items-center">
                          <h4 className="text-lg font-medium text-gray-800 mr-2">{reg.name} <span className="hidden sm:inline text-gray-500">-</span></h4>
                          <PriceDisplay registration={reg} />
                          {ticketIsExpired && (
                            <span className="text-center inline-flex items-center px-2 py-1 ml-2 rounded-full text-xs font-medium bg-red-200 text-red-800">
                              SOLD OUT
                            </span>
                          )}
                        </div>
                      {reg.perks && reg.perks.length > 0 && (
                        <ul className="list-none text-sm text-gray-500 mb-2">
                          {reg.perks.map((perk, index) => (
                            <li key={index} className="py-0.5">
                              <FormattedPerk content={perk} />
                            </li>
                          ))}
                        </ul>
                      )}
                      {reg.availabilityInfo && <p className="text-xs text-gray-500 italic mb-3">{reg.availabilityInfo}</p>}
                      <div className="flex items-center">
                        <button
                          onClick={() => handleDecrement(reg.id, reg.type)}
                          disabled={(ticketQuantities[reg.id] || 0) === 0 || isLoading}
                          className="px-3 py-1 border rounded-l-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                        >
                          -
                        </button>
                        <span className="px-4 py-1 border-t border-b text-center w-12">
                          {ticketQuantities[reg.id] || 0}
                        </span>
                        <button
                          onClick={() => handleIncrement(reg.id, reg.type)}
                          disabled={isSoldOut(reg, EVENT_SPONSORS, event.id) || isTicketExpired(reg) || isLoading || ticketQuantities[reg.id] >= reg.maxQuantityPerOrder}
                          className="px-3 py-1 border rounded-r-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>
                      {renderValidationUI(reg)}
                      {renderCodeValidationUI(reg)}
                    </div>
                    )
                  })}

                  {/* Show exhibitors when activeCategory is 'exhibit' */}
                  {activeCategory === 'exhibit' && exhibitors.filter(reg => reg.isActive).map(reg => {
                    const itemIsSoldOut = isSoldOut(reg, EVENT_SPONSORS, event.id);
                    const isSaleEnded = isTicketExpired(reg);
                    return (
                      <div key={reg.id} className={`mb-4 p-4 border rounded-lg shadow-sm ${itemIsSoldOut || isSaleEnded ? 'opacity-75 bg-gray-200' : ''}`}>
                        <div className="flex items-center">
                          <h4 className="text-lg font-medium text-gray-800 mr-2">{reg.name} <span className="hidden sm:inline text-gray-500">-</span></h4>
                          <PriceDisplay registration={reg} />
                            {itemIsSoldOut ? (
                              <span className="text-center inline-flex items-center px-2 py-1 ml-2 rounded-full text-xs font-medium bg-red-200 text-red-800">
                                SOLD OUT
                              </span>
                            ) : isSaleEnded ? (
                              <span className="text-center inline-flex items-center px-2 py-1 ml-2 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                SALE ENDED
                              </span>
                            ) : shouldShowRemaining(reg, EVENT_SPONSORS, event.id) ? (
                              <span className="text-center inline-flex items-center px-2 py-1 ml-2 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                {getRemainingSlots(reg, EVENT_SPONSORS, event.id)} remaining
                              </span>
                            ) : null}
                        </div>
                        {reg.perks && reg.perks.length > 0 && (
                          <ul className="list-none text-sm text-gray-500 mb-2">
                            {reg.perks.map((perk, index) => <li key={index} className="py-0.5">
                                <FormattedPerk content={perk} />
                              </li>)}
                          </ul>
                        )}
                        {reg.availabilityInfo && <p className="text-xs text-gray-500 italic mb-3">{reg.availabilityInfo}</p>}
                        <div className="flex items-center">
                          <button
                            onClick={() => handleDecrement(reg.id, reg.type)}
                            disabled={(ticketQuantities[reg.id] || 0) === 0 || isLoading}
                            className="px-3 py-1 border rounded-l-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                          >
                            -
                          </button>
                          <span className="px-4 py-1 border-t border-b text-center w-12">
                            {ticketQuantities[reg.id] || 0}
                          </span>
                          <button
                            onClick={() => handleIncrement(reg.id, reg.type)}
                            disabled={isSoldOut(reg, EVENT_SPONSORS, event.id) || isSaleEnded || isLoading || ticketQuantities[reg.id] >= reg.maxQuantityPerOrder}
                            className="px-3 py-1 border rounded-r-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                          >
                            +
                          </button>
                        </div>
                        {renderValidationUI(reg)}
                      </div>
                    )
                  })}

                  {/* Show sponsorships when activeCategory is 'sponsorship' */}
                  {activeCategory === 'sponsorship' && sponsorships.filter(reg => reg.isActive).map(reg => {
                    const itemIsSoldOut = isSoldOut(reg, EVENT_SPONSORS, event.id);
                    const isSaleEnded = isTicketExpired(reg);
                    return (
                      <div key={reg.id} className={`mb-4 p-4 border rounded-lg shadow-sm ${itemIsSoldOut || isSaleEnded ? 'opacity-75 bg-gray-200' : ''}`}>
                        <div className="flex justify-between items-start">
                          <div className="flex items-center">
                            <h4 className="text-lg font-medium text-gray-800 mr-2">
                              {reg.name} <span className="hidden sm:inline text-gray-500">-</span>
                            </h4>
                            <PriceDisplay registration={reg} />

                            {itemIsSoldOut ? (
                              <span className="text-center inline-flex items-center px-2 py-1 ml-2 rounded-full text-xs font-medium bg-red-200 text-red-800">
                                SOLD OUT
                              </span>
                            ) : isSaleEnded ? (
                              <span className="text-center inline-flex items-center px-2 py-1 ml-2 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                SALE ENDED
                              </span>
                            ) : shouldShowRemaining(reg, EVENT_SPONSORS, event.id) ? (
                              <span className="text-center inline-flex items-center px-2 py-1 ml-2 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                {getRemainingSlots(reg, EVENT_SPONSORS, event.id)} remaining
                              </span>
                            ) : null}
                          </div>

                        </div>
                        {reg.perks && reg.perks.length > 0 && (
                          <ul className="list-none text-sm text-gray-500 mb-2">
                            {reg.perks.map((perk, index) => <li key={index} className="py-0.5">
                                <FormattedPerk content={perk} />
                              </li>)}
                          </ul>
                        )}
                        {reg.availabilityInfo && <p className="text-xs text-gray-500 italic mb-3">{reg.availabilityInfo}</p>}
                        <div className="flex items-center">
                          <button
                            onClick={() => handleDecrement(reg.id, reg.type)}
                            disabled={(ticketQuantities[reg.id] || 0) === 0 || isLoading}
                            className="px-3 py-1 border rounded-l-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                          >
                            -
                          </button>
                          <span className="px-4 py-1 border-t border-b text-center w-12">
                            {ticketQuantities[reg.id] || 0}
                          </span>
                          <button
                            onClick={() => handleIncrement(reg.id, reg.type)}
                            disabled={isSoldOut(reg, EVENT_SPONSORS, event.id) || isSaleEnded || isLoading || ticketQuantities[reg.id] >= reg.maxQuantityPerOrder}
                            className="px-3 py-1 border rounded-r-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                          >
                            +
                          </button>
                        </div>
                        {renderValidationUI(reg)}
                      </div>
                    )
                  })}
                </div>
                {/* Total and checkout button at bottom of modal */}
                <div className="mt-auto border-t pt-4 bg-white">
                  {/* Summary of selected items */}
                  <div className="mb-3">
                    <h4 className="text-lg font-medium mb-2">Registration Summary</h4>

                    {/* Tickets summary */}
                    {allRegistrations.some(reg => (ticketQuantities[reg.id] || 0) > 0) && (
                      <div className="mb-2">
                        <h5 className="text-sm font-medium flex items-center"><Ticket size={14} className="mr-1" /> General Admission</h5>
                        <ul className="text-sm pl-5">
                          {allRegistrations
                            .filter(reg => (ticketQuantities[reg.id] || 0) > 0)
                            .map(reg => {
                              const quantity = ticketQuantities[reg.id] || 0;
                              return (
                                <li key={reg.id} className="flex justify-between items-center">
                                  <span>{reg.name} × {quantity}</span>
                                  {renderPriceDisplay(reg, quantity)}
                                </li>
                              );
                            })}
                        </ul>
                      </div>
                    )}

                    {/* Exhibitors summary */}
                    {exhibitors.some(reg => (ticketQuantities[reg.id] || 0) > 0) && (
                      <div className="mb-2">
                        <h5 className="text-sm font-medium flex items-center"><Package size={14} className="mr-1" /> Exhibit Space</h5>
                        <ul className="text-sm pl-5">
                          {exhibitors
                            .filter(reg => (ticketQuantities[reg.id] || 0) > 0)
                            .map(reg => {
                              const quantity = ticketQuantities[reg.id] || 0;
                              return (
                                <li key={reg.id} className="flex justify-between items-center">
                                  <span>{reg.name} × {quantity}</span>
                                  {renderPriceDisplay(reg, quantity)}
                                </li>
                              );
                            })}
                        </ul>
                      </div>
                    )}

                    {/* Sponsorships summary */}
                    {sponsorships.some(reg => (ticketQuantities[reg.id] || 0) > 0) && (
                      <div className="mb-2">
                        <h5 className="text-sm font-medium flex items-center"><Award size={14} className="mr-1" /> Sponsorships</h5>
                        <ul className="text-sm pl-5">
                          {sponsorships
                            .filter(reg => (ticketQuantities[reg.id] || 0) > 0)
                            .map(reg => {
                              const quantity = ticketQuantities[reg.id] || 0;
                              return (
                                <li key={reg.id} className="flex justify-between items-center">
                                  <span>{reg.name} × {quantity}</span>
                                  {renderPriceDisplay(reg, quantity)}
                                </li>
                              );
                            })}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Promo code section */}
                  <div className="mb-4">
                    <h5 className="text-sm font-medium mb-2">Promo Code</h5>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="Enter promo code"
                        className="text-sm flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        disabled={promoCodeValid || applyingPromoCode}
                      />
                      <button
                        onClick={() => handleApplyPromoCode()}
                        disabled={!promoCode || promoCodeValid || applyingPromoCode}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                      >
                        {applyingPromoCode ? 'Applying...' : promoCodeValid ? 'Applied' : 'Apply'}
                      </button>
                    </div>
                    {promoCodeError && (
                      <p className="text-sm text-red-600 mt-1">{promoCodeError}</p>
                    )}
                  </div>

                  {/* Total and checkout button */}
                  <div className="flex justify-between items-center border-t pt-3">
                    <div>
                      <p className="text-xl font-semibold">Total: ${calculateTotal().toLocaleString()}</p>
                      {promoCodeValid && (
                        <p className="text-sm text-green-600">{activePromoCode?.discountPercentage}% discount applied to eligible passes!</p>
                      )}
                    </div>
                    <button
                      onClick={handleCheckout}
                      disabled={getTotalTickets() === 0 || isLoading}
                      className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {isLoading ? 'Processing...' : 'Checkout'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // Checkout Steps View (Billing, Attendee Info, Payment, Confirmation)
              <div>
                {renderStepContent()}
                {apiError && <p className="text-red-500 text-sm mt-2">{apiError}</p>}
                {Object.keys(formErrors).length > 0 && (
                  <div className="mt-2 text-red-500 text-sm">
                    <p>Please correct the following errors:</p>
                    <ul>
                      {Object.entries(formErrors).map(([key, message]) => (
                        <li key={key}>- {message}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="mt-6 pt-4 border-t">
                  {renderStepButtons()}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div >
  );
};

export default RegistrationModal;
