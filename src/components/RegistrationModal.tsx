'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import * as yup from 'yup';
import { X, CreditCard, Ticket, Package, Award } from 'lucide-react';
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
import { getRegistrationsForEvent, getSponsorshipsForEvent, getExhibitorsForEvent, ModalRegistrationType as AdapterModalRegistrationType } from '@/lib/registration-adapters';

// Define a type that combines both RegistrationType and additional card props
type ModalRegistrationType = {
  id: string;
  name: string;
  description: string;
  price: number | string;
  earlyBirdPrice?: number | string;
  earlyBirdDeadline?: string;
  isActive: boolean;
  requiresAttendeeInfo: boolean;
  isGovtFreeEligible: boolean;
  perks?: string[];
  availabilityInfo?: string;
  type: 'paid' | 'free' | 'complimentary' | 'sponsor';
  title: string;
  headerImage: string;
  subtitle?: string;
  buttonText: string;
  buttonLink?: string;
  receptionPrice?: string;
  quantityAvailable?: number;
  maxQuantityPerOrder?: number;
  category?: 'ticket' | 'exhibit' | 'sponsorship'; // Made category optional to avoid breaking existing code
  sponsorPasses?: number; // Number of attendee passes included with this sponsorship
};

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
  sponsorInterest: 'yes' | 'no' | '';
  speakingInterest: 'yes' | 'no' | '';
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
  selectedRegistration: ModalRegistrationType | null; // Allow null for register button
  event: EventWithContact;
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

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

const initialBillingInfo: BillingInfo = {
  firstName: '',
  lastName: '',
  email: '',
  confirmEmail: '',
};

// Helper function to check if registration is closed
const isRegistrationClosed = (event: EventWithContact, daysBeforeToClose: number = 3): boolean => {
  // Parse event start date and time from ISO format: "YYYY-MM-DDT00:00:00Z"
  const eventStartDateTime = new Date(event.timeStart);
  
  // Calculate the cutoff date (3 days before event by default)
  const cutoffDate = new Date(eventStartDateTime);
  cutoffDate.setDate(cutoffDate.getDate() - daysBeforeToClose);
  
  // Check if current date is past the cutoff
  return new Date() >= cutoffDate;
};

const RegistrationModal = ({
  isOpen,
  onClose,
  selectedRegistration,
  event,
}: RegistrationModalProps): JSX.Element | null => {
  // Check if registration is closed for this event
  const registrationClosed = useMemo(() => isRegistrationClosed(event), [event]);
  
  // Get registrations, sponsorships, and exhibitors directly using the event ID
  const allRegistrations = useMemo<ModalRegistrationType[]>(() => getRegistrationsForEvent(event.id), [event.id]);
  const sponsorships = useMemo<ModalRegistrationType[]>(() => getSponsorshipsForEvent(event.id), [event.id]);
  const exhibitors = useMemo<ModalRegistrationType[]>(() => getExhibitorsForEvent(event.id), [event.id]);
  // State for active category tab
  const [activeCategory, setActiveCategory] = useState<'ticket' | 'exhibit' | 'sponsorship'>('ticket');
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
        // If the previous session ended with a confirmation, we need to reset for a new session
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
      // Just reset the active payment processing states
      setAttemptingStripePayment(false);
      setIsStripeReady(false);

      // Don't reset the entire state here - we'll check on next open if we need to
    }

    // Update refs last to track state for next render
    prevIsOpenRef.current = isOpen;
    prevShowConfirmationRef.current = showConfirmationView;
  }, [isOpen, showConfirmationView, paymentSuccessful]);


  // Helper to reset attendee info for a given ticket ID
  const resetAttendeesForTicket = (ticketId: string, count: number): ModalAttendeeInfo[] => {
    return Array(count).fill(null).map(() => ({ ...initialModalAttendeeInfo }));
  };

  const resetState = () => {
    setCurrentStep(0); // Or 1, depending on your initial step for attendee info
    setIsCheckout(false); // Show ticket selection first
    setTicketQuantities({});
    // Reset attendeesByTicket by re-initializing based on initial (zero) quantities or just empty
    const initialAttendees: { [key: string]: ModalAttendeeInfo[] } = {};

    // Helper function to reset attendees for any registration type
    const resetAttendeesForRegistrationType = (registrations: ModalRegistrationType[]) => {
      registrations.forEach(reg => {
        if (ticketQuantities[reg.id] && ticketQuantities[reg.id] > 0) {
          initialAttendees[reg.id] = resetAttendeesForTicket(reg.id, ticketQuantities[reg.id]);
        } else {
          initialAttendees[reg.id] = [];
        }
      });
    };

    // Reset attendees for all registration types
    resetAttendeesForRegistrationType(allRegistrations);
    resetAttendeesForRegistrationType(exhibitors);
    resetAttendeesForRegistrationType(sponsorships);
    setAttendeesByTicket(initialAttendees); // Or simply {}

    // Reset sponsor pass attendees
    setSponsorPassAttendees({});
    setBillingInfo({ ...initialBillingInfo });
    setAgreedToTerms(false);
    setFormErrors({});
    setApiError(null);
    setClientSecret(null);
    setPaymentIntentId(null);
    setPaymentSuccessful(false);
    setAttemptingStripePayment(false); // Reset payment attempt flag
    setShowConfirmationView(false);
    setConfirmationData(null);
    setPendingConfirmationData(null);
    setIsStripeReady(false); // Reset Stripe ready state
    setIsLoading(false);
  };

  // Helper function to handle payment errors in the useEffect hook
  const handlePaymentErrorInEffect = (errorMessage: string) => {
    console.error('Payment error in effect:', errorMessage);
    setApiError(`Payment error: ${errorMessage}`);
    setAttemptingStripePayment(false);
    setIsLoading(false);
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
        // Create sponsor pass attendees for this sponsorship
        const sponsorPassAttendeesList = Array(sponsor.sponsorPasses).fill(null).map(() => ({ ...initialModalAttendeeInfo }));
        setSponsorPassAttendees(prev => ({
          ...prev,
          [sponsor.id]: sponsorPassAttendeesList
        }));
      }
    });

    setTicketQuantities(initialQuantities);
    setAttendeesByTicket(initialAttendees);
  }, [allRegistrations, sponsorships, selectedRegistration, isOpen]);

  const handleIncrement = (id: string) => {
    const newQuantity = (ticketQuantities[id] || 0) + 1;
    console.log(`Incrementing ticket ${id} to quantity ${newQuantity}`);
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
        // Create or update sponsor pass attendees for this sponsorship
        const newSponsorPassAttendees = { ...sponsorPassAttendees };

        // Calculate total sponsor passes based on sponsorship quantity
        const totalSponsorPasses = selectedSponsorship.sponsorPasses * newQuantity;

        newSponsorPassAttendees[id] = Array(totalSponsorPasses).fill(null).map((_, i): ModalAttendeeInfo => {
          const existingAttendee = sponsorPassAttendees[id]?.[i];
          return existingAttendee || { ...initialModalAttendeeInfo };
        }) as ModalAttendeeInfo[];

        setSponsorPassAttendees(newSponsorPassAttendees);
        console.log(`Added ${totalSponsorPasses} sponsor pass attendees for ${selectedSponsorship.name}`);
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

  const handleDecrement = (id: string) => {
    if (ticketQuantities[id] > 0) {
      const newQuantity = ticketQuantities[id] - 1;
      setTicketQuantities(prev => ({
        ...prev,
        [id]: newQuantity
      }));

      // Check if this is a sponsorship
      const selectedSponsorship = sponsorships.find(s => s.id === id);

      if (selectedSponsorship) {
        // For sponsorships, we keep the attendeesByTicket array empty
        const newAttendees: Record<string, ModalAttendeeInfo[]> = { ...attendeesByTicket };
        newAttendees[id] = [];
        setAttendeesByTicket(newAttendees);

        // Handle sponsor passes for sponsorships
        if (selectedSponsorship.sponsorPasses && selectedSponsorship.sponsorPasses > 0) {
          // Update sponsor pass attendees for this sponsorship
          const newSponsorPassAttendees = { ...sponsorPassAttendees };

          // Recalculate the number of sponsor passes based on the new quantity
          const totalSponsorPasses = selectedSponsorship.sponsorPasses * newQuantity;

          if (newSponsorPassAttendees[id]) {
            // Reduce the number of sponsor pass attendees to match the new quantity
            newSponsorPassAttendees[id] = newSponsorPassAttendees[id].slice(0, totalSponsorPasses);
          }

          // If quantity is 0, remove all sponsor pass attendees for this sponsorship
          if (newQuantity === 0) {
            delete newSponsorPassAttendees[id];
          }

          setSponsorPassAttendees(newSponsorPassAttendees);
        }
      } else {
        // For regular tickets, update attendees as before
        const newAttendees: Record<string, ModalAttendeeInfo[]> = { ...attendeesByTicket };
        if (newAttendees[id]) {
          newAttendees[id] = newAttendees[id].slice(0, -1);
        } else {
          newAttendees[id] = [];
        }
        setAttendeesByTicket(newAttendees);
      }
    }
  };

  const handleCheckout = () => {
    // Check if registration is closed before proceeding
    if (registrationClosed) {
      setApiError('Registration for this event has closed.');
      return;
    }
    setIsCheckout(true);
    setCurrentStep(1);
  };

  const handleBackToTickets = () => {
    setIsCheckout(false);
  };

  const handleNextStep = async () => {
    setFormErrors({});
    setApiError(null);

    if (currentStep === 1) { // Moving from Billing Info to Attendee/Payment
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
        setCurrentStep(2);
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
    }
    // For other steps, direct increment is fine, or specific logic will be in their buttons
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
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
    setAttendeesByTicket(prev => {
      // Get source attendees and ensure it exists
      const sourceAttendees = prev[sourceTicketId] || [];
      // Get target attendees and ensure it exists
      const targetAttendees = prev[targetTicketId] ? [...prev[targetTicketId]] : [];

      // Check if indices are valid
      if (sourceIndex < sourceAttendees.length && targetIndex < targetAttendees.length) {
        // Copy the source attendee info to the target attendee
        targetAttendees[targetIndex] = { ...sourceAttendees[sourceIndex] };
        return {
          ...prev,
          [targetTicketId]: targetAttendees
        };
      } else {
        console.error('Failed to copy attendee: Invalid indices or ticket ID not found.', {
          sourceTicketId, sourceIndex, targetTicketId, targetIndex,
          sourceLength: sourceAttendees.length,
          targetLength: targetAttendees.length
        });
        return prev;
      }
    });
  };

  const calculateTotal = () => {
    // Calculate total from all registration types (tickets, exhibitors, sponsorships)
    const calculateSubtotal = (registrations: ModalRegistrationType[]) => {
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

        return total + (quantity * numericPrice);
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

  // Helper function to get the effective price for a registration item (considering early bird pricing)
  const getEffectivePrice = (reg: ModalRegistrationType): number | string => {
    // If price is a string (e.g., "Complimentary"), return it directly
    if (typeof reg.price === 'string') {
      return reg.price;
    }

    // Check if early bird pricing applies
    if (reg.earlyBirdPrice && reg.earlyBirdDeadline && new Date() < new Date(reg.earlyBirdDeadline)) {
      return typeof reg.earlyBirdPrice === 'string'
        ? parseFloat(reg.earlyBirdPrice.replace(/[^0-9.]/g, '')) || 0
        : reg.earlyBirdPrice;
    }

    // Otherwise return regular price
    return reg.price;
  };

  // Pre-validate complimentary tickets to ensure they have gov/mil emails

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
    const processRegistrations = (registrations: ModalRegistrationType[], category: 'ticket' | 'exhibit' | 'sponsorship') => {
      return registrations
        .filter(reg => (ticketQuantities[reg.id] || 0) > 0)
        .map(reg => {
          // Get the effective price (considering early bird pricing)
          const effectivePrice = getEffectivePrice(reg);

          // For sponsorships, ensure we pass a numeric price to the API
          // This is crucial because the API needs numeric prices for payment processing
          const processedPrice =
            category === 'sponsorship' && typeof effectivePrice === 'string'
              ? parseFloat(effectivePrice.replace(/[^0-9.]/g, '')) || reg.price
              : effectivePrice;

          return {
            ticketId: reg.id,
            ticketName: reg.title,
            ticketPrice: processedPrice,
            quantity: ticketQuantities[reg.id] || 0,
            category, // Add category to identify the type of registration
            // Ensure attendeeInfo structure matches what the schema expects for validation
            attendeeInfo: (attendeesByTicket[reg.id] || []).map(att => ({ ...att })),
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

        // Create a special ticket entry for these sponsor passes
        sponsorPassTickets.push({
          ticketId: `${sponsorId}-vip-pass`,
          ticketName: `${sponsor.name} VIP Pass`,
          ticketPrice: 'Complimentary', // These are free as part of sponsorship
          quantity: passAttendees.length,
          category: 'ticket', // Treat as tickets for processing
          isIncludedWithSponsorship: true, // Flag to identify these are from sponsorship
          sponsorshipId: sponsorId, // Reference back to the sponsorship
          attendeeInfo: passAttendees.map(att => ({ ...att })),
        });
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
        } else if (typeof effectivePrice === 'string' && reg.type === 'sponsor') {
          // For sponsorships with string prices, convert to number
          ticketPrices[reg.id] = parseFloat(effectivePrice.replace(/[^0-9.]/g, '')) || 0;
        }
      }
    });

    // Add complimentary prices for sponsor passes
    Object.keys(sponsorPassAttendees).forEach(sponsorId => {
      ticketPrices[`${sponsorId}-vip-pass`] = 0; // Sponsor passes are complimentary
    });

    // Find the first registration type that has attendees and requires attendee info
    // Check across all registration types
    const findFirstRegWithAttendees = (registrations: ModalRegistrationType[]) => {
      return registrations.find(reg =>
        reg.requiresAttendeeInfo &&
        (ticketQuantities[reg.id] || 0) > 0 &&
        (attendeesByTicket[reg.id] || []).length > 0
      )?.id;
    };

    const firstRegWithAttendeesId =
      findFirstRegWithAttendees(allRegistrations) ||
      findFirstRegWithAttendees(exhibitors) ||
      findFirstRegWithAttendees(sponsorships);

    let primaryAttendeeData: Partial<ModalAttendeeInfo> = {};
    if (firstRegWithAttendeesId && attendeesByTicket[firstRegWithAttendeesId] && attendeesByTicket[firstRegWithAttendeesId][0]) {
      primaryAttendeeData = attendeesByTicket[firstRegWithAttendeesId][0];
    }

    const totalAmount = calculateTotal();
    const determinedPaymentMethod = totalAmount === 0 && selectedRegistration?.type === 'free' ? 'free' : 'creditCard';

    const formDataToValidate: Partial<RegistrationFormData> = {
      firstName: billingInfo.firstName || primaryAttendeeData.firstName || '',
      lastName: billingInfo.lastName || primaryAttendeeData.lastName || '',
      email: billingInfo.email || primaryAttendeeData.email || '',
      phone: primaryAttendeeData.phone || 'N/A',
      jobTitle: primaryAttendeeData.jobTitle || 'N/A',
      company: primaryAttendeeData.company || 'N/A',
      companyWebsite: primaryAttendeeData.website || undefined, // Schema allows undefined, regex for valid URL if present
      businessSize: getValidatedBusinessSize(primaryAttendeeData.businessSize),
      industry: primaryAttendeeData.industry || 'N/A',
      // Address fields are not in the current yup schema, so not providing them here for validation.
      // If they were, they'd need defaults like 'N/A' or to be made optional. 
      // Survey questions - not in current modal, provide defaults
      howDidYouHearAboutUs: '',
      interestedInSponsorship: primaryAttendeeData.sponsorInterest === 'yes',
      interestedInSpeaking: primaryAttendeeData.speakingInterest === 'yes',
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
            ticketPrices, // Include the ticket prices object for accurate pricing
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
                  {/* Regular registration attendee forms - exclude sponsorships */}
                  {allRegistrationTypes
                    .filter(reg => reg.requiresAttendeeInfo && (ticketQuantities[reg.id] || 0) > 0 && reg.category !== 'sponsorship')
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
                              />
                            </div>
                          );
                        })}
                      </div>
                    ))}

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
                            />
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </>
              );
            })()}
            <TermsAndConditions
              agreed={agreedToTerms}
              onAgree={setAgreedToTerms} // Corrected prop name
            />
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
            <p className="text-gray-700">A confirmation email has been sent to {billingInfo.email}.</p>
            {paymentIntentId && <p className="text-sm text-gray-500 mt-2">Payment ID: {paymentIntentId}</p>}
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

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
      <div className="relative mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white overflow-y-auto max-h-[90vh]">
        {showConfirmationView && confirmationData ? (
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
            <div className="flex justify-between items-center pb-3 mb-4 border-b">
              <h3 className="text-xl font-semibold text-gray-900">
                {isCheckout ? `Register for ${event.title}` : `Select Tickets for ${event.title}`}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {!isCheckout ? (
              // Ticket Selection View
              <div className="flex flex-col h-[70vh]">
                {/* Category tabs */}
                <div className="flex border-b mb-4 text-base">
                  <button
                    onClick={() => setActiveCategory('ticket')}
                    className={`flex items-center px-4 py-2 ${activeCategory === 'ticket' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
                  >
                    <Ticket size={16} className="mr-2" />
                    <span>General Admission</span>
                  </button>
                  {exhibitors.length > 0 && (
                    <button
                      onClick={() => setActiveCategory('exhibit')}
                      className={`flex items-center px-4 py-2 ${activeCategory === 'exhibit' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
                    >
                      <Package size={16} className="mr-2" />
                      <span>Exhibit Space</span>
                    </button>
                  )}
                  {sponsorships.length > 0 && (
                    <button
                      onClick={() => setActiveCategory('sponsorship')}
                      className={`flex items-center px-4 py-2 ${activeCategory === 'sponsorship' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
                    >
                      <Award size={16} className="mr-2" />
                      <span>Sponsorships</span>
                    </button>
                  )}
                </div>

                <div className="flex-grow overflow-y-auto">
                  {/* Show tickets when activeCategory is 'ticket' */}
                  {activeCategory === 'ticket' && allRegistrations.filter(reg => reg.isActive).map(reg => (
                    <div key={reg.id} className="mb-4 p-4 border rounded-lg shadow-sm">
                      <h4 className="text-lg font-medium text-gray-800">{reg.name}</h4>
                      {/* Tickets, early bird pricing */}
                      {reg.earlyBirdPrice && reg.earlyBirdDeadline && new Date() < new Date(reg.earlyBirdDeadline) ? (
                        <div className="mb-2">
                          <p className="text-lg font-semibold">
                            <span className="text-green-600 mr-2">
                              ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
                                typeof reg.earlyBirdPrice === 'string'
                                  ? parseFloat(reg.earlyBirdPrice.replace(/[^0-9.]/g, '')) || 0
                                  : (typeof reg.earlyBirdPrice === 'number' ? reg.earlyBirdPrice : 0)
                              )}
                            </span>
                            <span className="line-through text-gray-500 text-base">
                              ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
                                typeof reg.price === 'string'
                                  ? parseFloat(reg.price.replace(/[^0-9.]/g, '')) || 0
                                  : (typeof reg.price === 'number' ? reg.price : 0)
                              )}
                            </span>
                          </p>
                        </div>
                      ) : reg.type === 'paid' ? (
                        // Paid tickets, after early bird deadline
                        <p className="text-lg font-semibold text-indigo-600 mb-2">
                          ${Number(reg.price).toLocaleString()}
                        </p>
                      ) : (
                        // Compliemntary tickets
                        <p className="text-lg font-semibold text-indigo-600 mb-2">
                          {reg.price}
                        </p>
                      )}

                      {reg.perks && reg.perks.length > 0 && (
                        <ul className="list-disc list-inside text-sm text-gray-500 mb-2">
                          {reg.perks.map((perk, index) => <li key={index} dangerouslySetInnerHTML={{ __html: perk }}></li>)}
                        </ul>
                      )}
                      {reg.availabilityInfo && <p className="text-xs text-gray-500 italic mb-3">{reg.availabilityInfo}</p>}
                      <div className="flex items-center">
                        <button
                          onClick={() => handleDecrement(reg.id)}
                          disabled={(ticketQuantities[reg.id] || 0) === 0 || isLoading}
                          className="px-3 py-1 border rounded-l-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                        >
                          -
                        </button>
                        <span className="px-4 py-1 border-t border-b text-center w-12">
                          {ticketQuantities[reg.id] || 0}
                        </span>
                        <button
                          onClick={() => handleIncrement(reg.id)}
                          disabled={isLoading}
                          className="px-3 py-1 border rounded-r-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Show exhibits when activeCategory is 'exhibit' */}
                  {activeCategory === 'exhibit' && exhibitors.filter(reg => reg.isActive).map(reg => (
                    <div key={reg.id} className="mb-4 p-4 border rounded-lg shadow-sm">
                      <h4 className="text-lg font-medium text-gray-800">{reg.name}</h4>
                      {reg.earlyBirdPrice && reg.earlyBirdDeadline && new Date() < new Date(reg.earlyBirdDeadline) && (
                        <div className="mb-2">
                          <p className="text-lg font-semibold">
                            <span className="text-green-600 mr-2">
                              ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(
                                typeof reg.earlyBirdPrice === 'string'
                                  ? parseFloat(reg.earlyBirdPrice.replace(/[^0-9.]/g, '')) || 0
                                  : (typeof reg.earlyBirdPrice === 'number' ? reg.earlyBirdPrice : 0)
                              )}
                            </span>
                            <span className="line-through text-gray-500 text-base">
                              ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(
                                typeof reg.price === 'string'
                                  ? parseFloat(reg.price.replace(/[^0-9.]/g, '')) || 0
                                  : (typeof reg.price === 'number' ? reg.price : 0)
                              )}
                            </span>
                          </p>
                        </div>
                      )}
                      {typeof reg.price === 'string' && (
                        <p className="text-lg font-semibold text-indigo-600 mb-2">
                          {reg.price}
                        </p>
                      )}

                      {typeof reg.price === 'number' && reg.earlyBirdPrice && reg.earlyBirdDeadline && new Date() >= new Date(reg.earlyBirdDeadline) && (
                        <div className="mb-2">
                          <p className="text-lg font-semibold text-gray-800">
                            ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(reg.price)}
                          </p>
                        </div>
                      )}
                      {reg.perks && reg.perks.length > 0 && (
                        <ul className="list-disc list-inside text-sm text-gray-500 mb-2">
                          {reg.perks.map((perk, index) => <li key={index} dangerouslySetInnerHTML={{ __html: perk }}></li>)}
                        </ul>
                      )}
                      {reg.availabilityInfo && <p className="text-xs text-gray-500 italic mb-3">{reg.availabilityInfo}</p>}
                      <div className="flex items-center">
                        <button
                          onClick={() => handleDecrement(reg.id)}
                          disabled={(ticketQuantities[reg.id] || 0) === 0 || isLoading}
                          className="px-3 py-1 border rounded-l-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                        >
                          -
                        </button>
                        <span className="px-4 py-1 border-t border-b text-center w-12">
                          {ticketQuantities[reg.id] || 0}
                        </span>
                        <button
                          onClick={() => handleIncrement(reg.id)}
                          disabled={isLoading}
                          className="px-3 py-1 border rounded-r-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Show sponsorships when activeCategory is 'sponsorship' */}
                  {/* this component has no early bird pricing */}
                  {activeCategory === 'sponsorship' && sponsorships.filter(reg => reg.isActive).map(reg => (
                    <div key={reg.id} className="mb-4 p-4 border rounded-lg shadow-sm">
                      <h4 className="text-lg font-medium text-gray-800">{reg.name}</h4>
                      {reg.price && (
                        <p className="text-lg font-semibold text-indigo-600 mb-2">
                          ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(typeof reg.price === 'string' ? parseFloat(reg.price.replace(/[^0-9.]/g, '')) || 0 : (typeof reg.price === 'number' ? reg.price : 0))}
                        </p>
                      )}
                      {reg.perks && reg.perks.length > 0 && (
                        <ul className="list-disc list-inside text-sm text-gray-500 mb-2">
                          {reg.perks.map((perk, index) => <li key={index} dangerouslySetInnerHTML={{ __html: perk }}></li>)}
                        </ul>
                      )}
                      {reg.availabilityInfo && <p className="text-xs text-gray-500 italic mb-3">{reg.availabilityInfo}</p>}
                      <div className="flex items-center">
                        <button
                          onClick={() => handleDecrement(reg.id)}
                          disabled={(ticketQuantities[reg.id] || 0) === 0 || isLoading}
                          className="px-3 py-1 border rounded-l-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                        >
                          -
                        </button>
                        <span className="px-4 py-1 border-t border-b text-center w-12">
                          {ticketQuantities[reg.id] || 0}
                        </span>
                        <button
                          onClick={() => handleIncrement(reg.id)}
                          disabled={isLoading}
                          className="px-3 py-1 border rounded-r-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
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
                              const price = getEffectivePrice(reg);
                              const formattedPrice = typeof price === 'string' ? price : `$${price.toFixed(2)}`;
                              return (
                                <li key={reg.id} className="flex justify-between">
                                  <span>{reg.name} × {ticketQuantities[reg.id]}</span>
                                  <span>{formattedPrice}</span>
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
                              const price = getEffectivePrice(reg);
                              const formattedPrice = typeof price === 'string' ? price : `$${price.toFixed(2)}`;
                              return (
                                <li key={reg.id} className="flex justify-between">
                                  <span>{reg.name} × {ticketQuantities[reg.id]}</span>
                                  <span>{formattedPrice}</span>
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
                              const price = getEffectivePrice(reg);
                              const formattedPrice = typeof price === 'string' ? price : `$${price.toFixed(2)}`;
                              return (
                                <li key={reg.id} className="flex justify-between">
                                  <span>{reg.name} × {ticketQuantities[reg.id]}</span>
                                  <span>{formattedPrice}</span>
                                </li>
                              );
                            })}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Total and checkout button */}
                  <div className="flex justify-between items-center border-t pt-3">
                    <p className="text-xl font-semibold">Total: ${calculateTotal().toFixed(2)}</p>
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
