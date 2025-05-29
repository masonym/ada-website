'use client';

import { useState, useEffect, useRef } from 'react';
import * as yup from 'yup';
import { X, CreditCard } from 'lucide-react';
import { Event } from '@/types/events';
import { BillingInformation } from './BillingInformation';
import { AttendeeForm } from './AttendeeForm';
import { TermsAndConditions } from './TermsAndConditions';
import { registrationSchema } from '@/lib/event-registration/validation';
import { RegistrationFormData, TicketSelection, AttendeeInfo as RegAttendeeInfo, RegistrationType as EventRegType, BusinessSize } from '@/types/event-registration/registration';
import { ValidationError } from 'yup';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
// import { initialAttendeeInfo } from '@/types/registration'; // Replaced by local initialModalAttendeeInfo
import type { AttendeeInfo as EventAttendeeInfo, AttendeeInfo as EventRegAttendeeInfo } from '@/types/event-registration/registration';
import { Elements } from '@stripe/react-stripe-js';
import StripePaymentForm, { StripePaymentFormRef } from './StripePaymentForm';

// Define a type that combines both RegistrationType and additional card props
type ModalRegistrationType = {
  id: string;
  name: string;
  description: string;
  price: number;
  earlyBirdPrice?: number;
  earlyBirdDeadline?: string;
  isActive: boolean;
  requiresAttendeeInfo: boolean;
  isGovtFreeEligible: boolean;
  perks?: string[];
  availabilityInfo?: string;
  type: 'paid' | 'free' | 'sponsor';
  title: string;
  headerImage: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  regularPrice: number;
  receptionPrice?: string;
};

interface EventWithContact extends Omit<Event, 'id'> {
  contactInfo?: {
    contactEmail2?: string;
  };
  eventShorthand: string;
  id: string | number;
  slug: string;
}

interface ModalAttendeeInfo { // Renamed to avoid conflict with imported AttendeeInfo
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  jobTitle: string;
  phone: string;
  website: string;
  businessSize: BusinessSize | ''; // Allow empty string for initial form state, will be defaulted if empty
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
  selectedRegistration: ModalRegistrationType;
  event: EventWithContact;
  allRegistrations: ModalRegistrationType[];
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

const RegistrationModal = ({
  isOpen,
  onClose,
  selectedRegistration,
  event,
  allRegistrations,
}: RegistrationModalProps): JSX.Element | null => {
  const [promoCode, setPromoCode] = useState('');
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
  const [isStripeReady, setIsStripeReady] = useState(false); // New state for Stripe readiness

  const handleStripeReady = (ready: boolean) => {
    console.log(`StripePaymentForm ready status: ${ready}`);
    setIsStripeReady(ready);
  };

  // Effect to reset state when modal is closed externally or re-opened
  useEffect(() => {
    if (isOpen) {
      // Optional: If you want to reset every time it opens, call resetState() here.
      // For now, just ensure confirmation isn't shown on reopen and clear old errors.
      setShowConfirmationView(false);
      setApiError(null);
    } else {
      // Optional: Consider if a full resetState() is needed when closing, 
      // if not already handled by handleCloseAndReset.
    }
  }, [isOpen]);

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
    allRegistrations.forEach(reg => {
      if (ticketQuantities[reg.id] && ticketQuantities[reg.id] > 0) {
        initialAttendees[reg.id] = resetAttendeesForTicket(reg.id, ticketQuantities[reg.id]);
      } else {
        initialAttendees[reg.id] = [];
      }
    });
    setAttendeesByTicket(initialAttendees); // Or simply {}
    setBillingInfo({ ...initialBillingInfo });
    setAgreedToTerms(false);
    setFormErrors({});
    setApiError(null);
    setClientSecret(null);
    setPaymentIntentId(null); // Assuming you have this state
    setPaymentSuccessful(false);
    setShowConfirmationView(false);
    setConfirmationData(null);
    setPendingConfirmationData(null);
    setAttemptingStripePayment(false);
    setIsLoading(false);
  };

  const handleCloseAndReset = () => {
    resetState();
    onClose();
  };

  useEffect(() => {
    console.log('useEffect for Stripe payment submission triggered. attemptingStripePayment:', attemptingStripePayment, 'clientSecret:', clientSecret, 'isStripeReady:', isStripeReady);
    if (attemptingStripePayment && clientSecret && stripeFormRef.current && isStripeReady) { // Added isStripeReady check
      console.log('Attempting to call stripeFormRef.current.triggerSubmit() as clientSecret is available and Stripe is ready.');
      stripeFormRef.current.triggerSubmit();
      console.log('Called stripeFormRef.current.triggerSubmit().');
      setAttemptingStripePayment(false); // Reset after attempting
      console.log('Reset attemptingStripePayment to false.');
    } else if (attemptingStripePayment && clientSecret && !isStripeReady) {
      console.log('Stripe not ready yet, will retry when it is or inform user.');
      // Optionally, set an error or a flag to indicate waiting for Stripe
      // For now, we'll rely on the existing error handling in StripePaymentForm if triggerSubmit is called too early
      // but this condition prevents calling it if we know Stripe isn't ready.
    }
  }, [attemptingStripePayment, clientSecret, isStripeReady]); // Added isStripeReady to dependency array

  useEffect(() => {
    const initialQuantities: Record<string, number> = {};
    const initialAttendees: Record<string, ModalAttendeeInfo[]> = {};
    
    allRegistrations.forEach((reg) => {
      initialQuantities[reg.id] = 0;
      if (reg.requiresAttendeeInfo) {
        initialAttendees[reg.id] = []; // Ensure key exists for tickets requiring attendee info
      }
    });
    
    setTicketQuantities(initialQuantities);
    setAttendeesByTicket(initialAttendees);
  }, [allRegistrations]);

  const handleIncrement = (id: string) => {
    const newQuantity = (ticketQuantities[id] || 0) + 1;
    setTicketQuantities(prev => ({
      ...prev,
      [id]: newQuantity
    }));
    
    const newAttendees: Record<string, ModalAttendeeInfo[]> = { ...attendeesByTicket };
    newAttendees[id] = Array(newQuantity).fill(null).map((_, i): ModalAttendeeInfo => {
      const existingAttendee = attendeesByTicket[id]?.[i];
      return existingAttendee || { ...initialModalAttendeeInfo };
    }) as ModalAttendeeInfo[];
    setAttendeesByTicket(newAttendees);
  };

  const handleDecrement = (id: string) => {
    if (ticketQuantities[id] > 0) {
      const newQuantity = ticketQuantities[id] - 1;
      setTicketQuantities(prev => ({
        ...prev,
        [id]: newQuantity
      }));
      
      const newAttendees: Record<string, ModalAttendeeInfo[]> = { ...attendeesByTicket };
      if (newAttendees[id]) {
        newAttendees[id] = newAttendees[id].slice(0, -1);
      } else {
        newAttendees[id] = [];
      }
      setAttendeesByTicket(newAttendees);
    }
  };

  const handleCheckout = () => {
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
    console.log('handleAttendeeChange called with:', { registrationId, index, field, value });
    setAttendeesByTicket(prev => {
      console.log('setAttendeesByTicket - prev:', JSON.parse(JSON.stringify(prev)));
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
        console.log('setAttendeesByTicket - out of bounds, returning prev for this ticketId:', { ...prev, [registrationId]: attendeesList });
        return { ...prev, [registrationId]: attendeesList }; 
      }

      const finalState = {
        ...prev,
        [registrationId]: newAttendeesList,
      };
      console.log('setAttendeesByTicket - final state for this ticketId:', JSON.parse(JSON.stringify(finalState)));
      return finalState;
    });
  };

  const handleCopyAttendee = (registrationId: string, sourceIndex: number, targetIndex: number) => {
    setAttendeesByTicket(prev => {
      const currentAttendeesForTicket = prev[registrationId] ? [...prev[registrationId]] : [];
      if (sourceIndex < currentAttendeesForTicket.length && targetIndex < currentAttendeesForTicket.length) {
        // Ensure we are creating a new object for the target attendee
        currentAttendeesForTicket[targetIndex] = { ...currentAttendeesForTicket[sourceIndex] };
      } else {
        console.error('Failed to copy attendee: Invalid indices or ticket ID not found.', { registrationId, sourceIndex, targetIndex, currentLength: currentAttendeesForTicket.length });
        return { ...prev, [registrationId]: prev[registrationId] || [] }; 
      }
      return { ...prev, [registrationId]: currentAttendeesForTicket }; 

    });
  };

  const calculateTotal = () => {
    return allRegistrations.reduce((total, reg) => {
      const quantity = ticketQuantities[reg.id] || 0;
      return total + (quantity * reg.price);
    }, 0);
  };

  const getTotalTickets = () => {
    return Object.values(ticketQuantities).reduce((sum, qty) => sum + qty, 0);
  };

  const handleCompleteRegistration = async () => {
    setIsLoading(true);
    setFormErrors({});
    setApiError(null);

    const firstTicketId = Object.keys(attendeesByTicket).find(id => (ticketQuantities[id] || 0) > 0);
    const firstAttendee = firstTicketId ? attendeesByTicket[firstTicketId]?.[0] : { ...initialModalAttendeeInfo };

    const formData: RegistrationFormData = {
      firstName: billingInfo.firstName || firstAttendee.firstName,
      lastName: billingInfo.lastName || firstAttendee.lastName,
      email: billingInfo.email || firstAttendee.email,
      phone: firstAttendee.phone || '',
      jobTitle: firstAttendee.jobTitle || '',
      company: firstAttendee.company || '',
      companyWebsite: firstAttendee.website || '',
      businessSize: (firstAttendee.businessSize as RegistrationFormData['businessSize']) || '1-10 employees',
      industry: firstAttendee.industry || '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      howDidYouHearAboutUs: '',
      interestedInSponsorship: firstAttendee.sponsorInterest === 'yes',
      interestedInSpeaking: firstAttendee.speakingInterest === 'yes',
      agreeToTerms: agreedToTerms,
      agreeToPhotoRelease: false,
      tickets: allRegistrations
        .filter(reg => (ticketQuantities[reg.id] || 0) > 0)
        .map(reg => ({
          ticketId: reg.id,
          quantity: ticketQuantities[reg.id] || 0,
          attendeeInfo: (attendeesByTicket[reg.id] || []).map(att => ({
            firstName: att.firstName,
            lastName: att.lastName,
            email: att.email,
            phone: att.phone || '',
            website: att.website || '',
            businessSize: att.businessSize || '',
            industry: att.industry || '',
            sponsorInterest: att.sponsorInterest || '',
            speakingInterest: att.speakingInterest || '',
            jobTitle: att.jobTitle,
            company: att.company,
            dietaryRestrictions: att.dietaryRestrictions || '',
            accessibilityNeeds: att.accessibilityNeeds || '',
          })),
        })),
      paymentMethod: calculateTotal() === 0 ? 'free' : 'creditCard',
      promoCode: promoCode || undefined,
    };

    try {
      await registrationSchema.validate(formData, { abortEarly: false });
      
      const response = await fetch('/api/event-registration/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, eventId: event.id }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        console.log('Registration successful:', result);
        if (result.clientSecret) {
          setClientSecret(result.clientSecret);
          setApiError(null); // Clear previous errors, rely on Payment form UI
          setCurrentStep(4); // Move to a conceptual payment step
        } else {
          // Free registration success path
          setApiError('Registration successful!'); // This could be a success message instead
          setPaymentSuccessful(true); // Indicate success for UI change
          // Potentially close modal or show a final success message
        }
      } else {
        const errorMsg = result.error || (result.errors && Object.values(result.errors).join(', ')) || 'Registration failed. Please try again.';
        setApiError(errorMsg);
        if (result.errors) {
          setFormErrors(result.errors);
        }
      }
    } catch (error) {
      if (error instanceof ValidationError) {
        const yupErrors: Record<string, string> = {};
        error.inner.forEach(err => {
          if (err.path) {
            yupErrors[err.path] = err.message;
          }
        });
        setFormErrors(yupErrors);
        setApiError('Please correct the errors in the form.');
      } else {
        console.error('Registration submission error:', error);
        setApiError('An unexpected error occurred. Please try again.');
      }
    }

    setIsLoading(false);
  };

  const handlePaymentSuccess = (paymentIntentId: string) => {
    console.log('Payment successful (Client):', paymentIntentId);
    setApiError(null); // Clear any previous payment errors
    setPaymentSuccessful(true);
    // Here you might want to update UI, e.g. show a thank you message, close modal
    // Potentially call logRegistration for paid event if not handled by webhook
    if (pendingConfirmationData) {
      setConfirmationData(pendingConfirmationData);
    } else {
      // Fallback or fetch confirmation details if needed, though pendingConfirmationData should exist for paid Stripe flow
      // For now, we assume pendingConfirmationData holds what we need or could be enhanced.
      setConfirmationData({ paymentIntentId, message: 'Payment confirmed. Thank you!' }); 
    }
    setShowConfirmationView(true);
    setPendingConfirmationData(null); // Clear pending data
    setIsLoading(false); // Ensure loading stops
  };

  const handlePaymentError = (errorMessage: string) => {
    console.error('Payment failed (Client):', errorMessage);
    setApiError(`Payment failed: ${errorMessage}`);
    setPendingConfirmationData(null); // Clear pending data on error
    setPaymentSuccessful(false);
  };

  const handlePaymentProcessing = (isProcessing: boolean) => {
    setIsLoading(isProcessing);
  };

  const getValidatedBusinessSize = (size?: BusinessSize | ''): BusinessSize => {
    const validSizes: BusinessSize[] = ['Small Business', 'Medium-Sized Business', 'Large-Sized Business', 'Government Agency', 'Military Component'];
    if (size && validSizes.includes(size as BusinessSize)) {
      return size as BusinessSize;
    }
    return 'Small Business'; // Default value
  };

  const handleFinalSubmit = async () => {
    console.log('handleFinalSubmit called');
    setFormErrors({});
    setApiError(null);
    setIsLoading(true);

    // Consolidate all data for validation
    const ticketsForValidation = allRegistrations
      .filter(reg => (ticketQuantities[reg.id] || 0) > 0)
      .map(reg => ({
        ticketId: reg.id,
        quantity: ticketQuantities[reg.id] || 0,
        // Ensure attendeeInfo structure matches what the schema expects for validation
        // This might be a simplified version or need full AttendeeInfo details
        attendeeInfo: (attendeesByTicket[reg.id] || []).map(att => ({ ...att })),
      }));

    // Find the first registration type that has attendees and requires attendee info
    const firstRegWithAttendeesId = allRegistrations.find(reg => 
      reg.requiresAttendeeInfo && 
      (ticketQuantities[reg.id] || 0) > 0 && 
      (attendeesByTicket[reg.id] || []).length > 0
    )?.id;

    let primaryAttendeeData: Partial<ModalAttendeeInfo> = {};
    if (firstRegWithAttendeesId && attendeesByTicket[firstRegWithAttendeesId] && attendeesByTicket[firstRegWithAttendeesId][0]) {
      primaryAttendeeData = attendeesByTicket[firstRegWithAttendeesId][0];
    }

    const totalAmount = calculateTotal();
    const determinedPaymentMethod = totalAmount === 0 && selectedRegistration.type === 'free' ? 'free' : 'creditCard';

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
      console.log('Attempting validation with formData:', JSON.stringify(formDataToValidate, null, 2));
      await registrationSchema.validate(formDataToValidate, { abortEarly: false });
      console.log('Validation successful');

      // Check terms AFTER general validation
      console.log('Checking terms. Agreed:', agreedToTerms);
      if (!agreedToTerms) {
        setFormErrors(prev => ({ ...prev, agreedToTerms: 'You must agree to the terms and conditions.' }));
        setIsLoading(false);
        return;
      }
      
      // If all validations pass, create payment intent or complete free registration
      try { // Nested try for payment/API calls
        const totalAmount = calculateTotal();
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
          console.log('Creating payment intent for amount:', totalAmount, 'with email:', billingInfo.email, 'event:', event.title);
          console.log('Before calling register endpoint for payment intent...');
          const response = await fetch('/api/event-registration/register', {
            // Note: eventId is now part of formDataToValidate from previous steps, ensure it's there or add it explicitly if not.
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...formDataToValidate, // Send the whole validated form data
              eventId: event.id, // Make sure eventId is included
              // The register endpoint will calculate amount and use necessary fields from formDataToValidate
            }),
          });
          console.log('After /api/event-registration/register call');
          const result = await response.json();

          if (!response.ok || !result.success) {
            console.error('Failed to process registration. Status:', response.status, 'Error data:', result);
            // Use result.error or result.message if provided by the backend, otherwise a generic message.
            setApiError(result.error || result.message || `API Error: ${response.status} - ${response.statusText}`);
            setIsLoading(false); // Stop loading on API error
            return; // Stop further execution
          }

          console.log('/api/event-registration/register response status:', response.status, 'data:', result);
          // If successful and a clientSecret is returned, it's a paid flow needing Stripe UI
          if (result.clientSecret) {
            setClientSecret(result.clientSecret);
          setPendingConfirmationData(result); // Store data for after Stripe success
          setAttemptingStripePayment(true); // This will trigger the useEffect to call Stripe submit
        } else { // Free flow or $0 paid (e.g. 100% discount) - already handled by /api/event-registration/register
          console.log('Registration processed by API, clientSecret not present or not needed.');
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
        console.log('Validation failed:', JSON.stringify(validationError, null, 2));
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

  const handleCompleteRegistrationApiCall = async (paymentIntentId: string | null) => {
    const registrationData: RegistrationFormData = {
      firstName: billingInfo.firstName,
      lastName: billingInfo.lastName,
      email: billingInfo.email,
      phone: '',
      jobTitle: '',
      company: '',
      companyWebsite: '',
      businessSize: 'Small Business', // Changed to a valid BusinessSize type
      industry: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      howDidYouHearAboutUs: '',
      interestedInSponsorship: false,
      interestedInSpeaking: false,
      agreeToTerms: agreedToTerms,
      agreeToPhotoRelease: false,
      tickets: allRegistrations
        .filter(reg => (ticketQuantities[reg.id] || 0) > 0)
        .map(reg => ({
          ticketId: reg.id,
          quantity: ticketQuantities[reg.id] || 0,
          attendeeInfo: (attendeesByTicket[reg.id] || []).map(att => ({
            firstName: att.firstName,
            lastName: att.lastName,
            email: att.email,
            phone: att.phone || '',
            website: att.website || '',
            businessSize: att.businessSize || '',
            industry: att.industry || '',
            sponsorInterest: att.sponsorInterest || '',
            speakingInterest: att.speakingInterest || '',
            jobTitle: att.jobTitle,
            company: att.company,
            dietaryRestrictions: att.dietaryRestrictions || '',
            accessibilityNeeds: att.accessibilityNeeds || '',
          })),
          registrationType: reg.type === 'paid' ? (reg.isGovtFreeEligible && billingInfo.email.endsWith('.gov') ? 'free' : 'paid') : reg.type,
        })),
      paymentMethod: calculateTotal() === 0 ? 'free' : 'creditCard',
      promoCode: promoCode || undefined,
    };

    console.log('Submitting registration data:', registrationData);
    setIsLoading(true);
    setApiError(null);

    try {
      const response = await fetch('/api/event-registration/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit registration.');
      }

      setPaymentSuccessful(true);
      setCurrentStep(3); // Move to confirmation step
    } catch (error) {
      if (error instanceof Error) {
        setApiError(error.message);
      } else {
        setApiError('An unexpected error occurred during final registration.');
      }
    }
    setIsLoading(false);
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
          {allRegistrations.filter(reg => reg.requiresAttendeeInfo && (ticketQuantities[reg.id] || 0) > 0).map(reg => (
            <div key={reg.id}>
              <h4 className="text-lg font-medium mt-4 mb-2">{reg.name} - Attendees</h4>
              {Array.from({ length: ticketQuantities[reg.id] || 0 }).map((_, index) => {
                const attendeeData = attendeesByTicket[reg.id]?.[index] || initialModalAttendeeInfo;
                return (
                  <div key={`${reg.id}-${index}`} className="mb-4 border-b pb-4">
                    <AttendeeForm
                      attendee={attendeeData}
                      index={index}
                      
                      onChange={(attendeeIdx, fieldName, fieldValue) => handleAttendeeChange(reg.id, attendeeIdx, fieldName as keyof EventAttendeeInfo, fieldValue)}
                      onCopyFrom={(sourceAttendeeIdx) => handleCopyAttendee(reg.id, sourceAttendeeIdx, index)}
                      totalAttendees={(attendeesByTicket[reg.id] || []).length}
                    />
                  </div>
                );
              })}
            </div>
          ))}
          <TermsAndConditions
            agreed={agreedToTerms}
            onAgree={setAgreedToTerms} // Corrected prop name
          />            
          {calculateTotal() > 0 && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Payment</h3>
              <Elements key={clientSecret} stripe={stripePromise} options={clientSecret ? { clientSecret } : undefined}>
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
            <div>
              {allRegistrations.map((reg) => (
                <div key={reg.id} className="mb-4 p-4 border rounded-lg shadow-sm">
                  <h4 className="text-lg font-medium text-gray-800">{reg.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{reg.description}</p>
                  <p className="text-lg font-semibold text-indigo-600 mb-2">
                    ${reg.price.toFixed(2)}
                  </p>
                  {reg.perks && reg.perks.length > 0 && (
                    <ul className="list-disc list-inside text-sm text-gray-500 mb-2">
                      {reg.perks.map((perk, index) => <li key={index}>{perk}</li>)}
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
              <div className="mt-6 text-right">
                <p className="text-xl font-semibold mb-2">Total: ${calculateTotal().toFixed(2)}</p>
                <button
                  onClick={handleCheckout}
                  disabled={getTotalTickets() === 0 || isLoading}
                  className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : 'Checkout'}
                </button>
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
  </div>
  );
};

export default RegistrationModal;
