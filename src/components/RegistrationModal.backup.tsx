'use client';

import { useState, useEffect, FC, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';

// Core Types
interface EventData {
  id: string;
  name: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  description?: string;
  price?: number;
  isActive?: boolean;
  requiresAttendeeInfo?: boolean;
}

interface ModalRegistrationType {
  id: string;
  name: string;
  description: string;
  price: number;
  isActive: boolean;
  requiresAttendeeInfo: boolean;
  type?: 'paid' | 'free' | 'sponsor';
}

// Form Data Types
interface AttendeeInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  company: string;
  companyWebsite?: string;
  businessSize?: string;
  industry?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  howDidYouHearAboutUs?: string;
  interestedInSponsorship?: boolean;
  interestedInSpeaking?: boolean;
  sponsorInterest?: string;
  speakingInterest?: string;
  website?: string;
  agreeToTerms?: boolean;
  agreeToPhotoRelease?: boolean;
  dietaryRestrictions?: string;
  accessibilityRequirements?: string;
}

interface BillingInfo {
  firstName: string;
  lastName: string;
  email: string;
  confirmEmail: string;
  phone: string;
  company: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  paymentMethod: 'creditCard' | 'invoice';
  sameAsBilling: boolean;
  notes?: string;
}

// Component Props
interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRegistration: Record<string, number>;
  event?: EventData;
  allRegistrations?: ModalRegistrationType[];
}

interface BillingInformationProps {
  billingInfo: BillingInfo;
  formErrors: Record<string, string>;
  onChange: (field: keyof BillingInfo, value: string | boolean) => void;
}

interface AttendeeFormProps {
  registrationId: string;
  attendee: AttendeeInfo;
  index: number;
  onChange: (registrationId: string, index: number, field: keyof AttendeeInfo, value: string) => void;
  errors?: Record<string, string>;
}

interface TermsAndConditionsProps {
  agreed: boolean;
  onChange: (agreed: boolean) => void;
  error?: string;
}

interface RegistrationSummaryProps {
  selectedRegistration: Record<string, number>;
  registrations: ModalRegistrationType[];
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

// Helper Types
type Step = 1 | 2 | 3; // For tracking registration steps

// Initial States
const initialBillingInfo: BillingInfo = {
  firstName: '',
  lastName: '',
  email: '',
  confirmEmail: '',
  phone: '',
  company: '',
  address1: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'United States',
  paymentMethod: 'creditCard',
  sameAsBilling: true,
};

const initialAttendeeInfo: AttendeeInfo = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  jobTitle: '',
  company: '',
};

// Sub-components
const BillingInformation: FC<BillingInformationProps> = ({
  billingInfo,
  formErrors,
  onChange,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Billing Information</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            First Name *
          </label>
          <input
            type="text"
            id="firstName"
            value={billingInfo.firstName}
            onChange={(e) => onChange('firstName', e.target.value)}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              formErrors.firstName ? 'border-red-500' : ''
            }`}
            required
          />
          {formErrors.firstName && (
            <p className="mt-1 text-sm text-red-600">{formErrors.firstName}</p>
          )}
        </div>
        {/* Add more fields as needed */}
      </div>
    </div>
  );
};

const AttendeeForm: FC<AttendeeFormProps> = ({
  registrationId,
  attendee,
  index,
  onChange,
  errors = {},
}) => {
  const fieldError = (field: string) => errors[`attendees.${index}.${field}`];

  return (
    <div className="space-y-4 border-t border-gray-200 pt-4">
      <h4 className="text-md font-medium">Attendee {index + 1}</h4>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor={`${registrationId}-firstName-${index}`}
            className="block text-sm font-medium text-gray-700"
          >
            First Name *
          </label>
          <input
            type="text"
            id={`${registrationId}-firstName-${index}`}
            value={attendee.firstName}
            onChange={(e) =>
              onChange(registrationId, index, 'firstName', e.target.value)
            }
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              fieldError('firstName') ? 'border-red-500' : ''
            }`}
            required
          />
          {fieldError('firstName') && (
            <p className="mt-1 text-sm text-red-600">{fieldError('firstName')}</p>
          )}
        </div>
        {/* Add more fields as needed */}
      </div>
    </div>
  );
};

const TermsAndConditions: FC<TermsAndConditionsProps> = ({
  agreed,
  onChange,
  error,
}) => (
  <div className="mt-4">
    <div className="flex items-start">
      <div className="flex items-center h-5">
        <input
          id="terms"
          name="terms"
          type="checkbox"
          checked={agreed}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
      </div>
      <div className="ml-3 text-sm">
        <label htmlFor="terms" className="font-medium text-gray-700">
          I agree to the Terms and Conditions and Privacy Policy *
        </label>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  </div>
);

const RegistrationSummary: FC<RegistrationSummaryProps> = ({
  selectedRegistration,
  registrations,
  onBack,
  onSubmit,
  isSubmitting,
}) => {
  const totalAmount = Object.entries(selectedRegistration).reduce(
    (sum, [id, quantity]) => {
      const registration = registrations.find((r) => r.id === id);
      return sum + (registration?.price || 0) * quantity;
    },
    0
  );

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Order Summary</h3>
      <div className="space-y-4">
        {Object.entries(selectedRegistration).map(([id, quantity]) => {
          const registration = registrations.find((r) => r.id === id);
          if (!registration || quantity <= 0) return null;
          return (
            <div key={id} className="flex justify-between">
              <span>
                {registration.name} × {quantity}
              </span>
              <span>${(registration.price * quantity).toFixed(2)}</span>
            </div>
          );
        })}
      </div>
      <div className="border-t border-gray-200 pt-4">
        <div className="flex justify-between text-lg font-medium">
          <span>Total</span>
          <span>${totalAmount.toFixed(2)}</span>
        </div>
      </div>
      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? 'Processing...' : 'Complete Registration'}
        </button>
      </div>
    </div>
  );
};

interface AttendeeFormProps {
  registrationId: string;
  attendee: AttendeeInfo;
  index: number;
  onChange: (registrationId: string, index: number, field: keyof AttendeeInfo, value: string) => void;
}

interface TermsAndConditionsProps {
  agreed: boolean;
const BillingInformation: React.FC<BillingInformationProps> = ({
  billingInfo,
  formErrors,
  onChange,
}) => (
  <div className="space-y-4">
    <h3 className="text-lg font-medium">Billing Information</h3>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
          First Name *
        </label>
        <input
          type="text"
          id="firstName"
          value={billingInfo.firstName}
          onChange={(e) => onChange('firstName', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
        {formErrors.firstName && (
          <p className="mt-1 text-sm text-red-600">{formErrors.firstName}</p>
        )}
      </div>
      <div>
        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
          Last Name *
        </label>
        <input
          type="text"
          id="lastName"
          value={billingInfo.lastName}
          onChange={(e) => onChange('lastName', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
        {formErrors.lastName && (
          <p className="mt-1 text-sm text-red-600">{formErrors.lastName}</p>
        )}
      </div>
    </div>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email *
        </label>
        <input
          type="email"
          id="email"
          value={billingInfo.email}
          onChange={(e) => onChange('email', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
        {formErrors.email && (
          <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
        )}
      </div>
      <div>
        <label htmlFor="confirmEmail" className="block text-sm font-medium text-gray-700">
          Confirm Email *
        </label>
        <input
          type="email"
          id="confirmEmail"
          value={billingInfo.confirmEmail}
          onChange={(e) => onChange('confirmEmail', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
        {formErrors.confirmEmail && (
          <p className="mt-1 text-sm text-red-600">{formErrors.confirmEmail}</p>
        )}
      </div>
    </div>
  </div>
);

// Attendee Form Component
const AttendeeForm: React.FC<AttendeeFormProps> = ({
  registrationId,
  attendee,
  index,
  onChange,
}) => (
  <div className="space-y-4 rounded-lg border border-gray-200 p-4">
    <h4 className="text-md font-medium">Attendee {index + 1}</h4>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label className="block text-sm font-medium text-gray-700">First Name *</label>
        <input
          type="text"
          value={attendee.firstName}
          onChange={(e) => onChange(registrationId, index, 'firstName', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Last Name *</label>
        <input
          type="text"
          value={attendee.lastName}
          onChange={(e) => onChange(registrationId, index, 'lastName', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>
    </div>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label className="block text-sm font-medium text-gray-700">Email *</label>
        <input
          type="email"
          value={attendee.email}
          onChange={(e) => onChange(registrationId, index, 'email', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Job Title</label>
        <input
          type="text"
          value={attendee.jobTitle}
          onChange={(e) => onChange(registrationId, index, 'jobTitle', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>
    </div>
  </div>
);

// Terms and Conditions Component
const TermsAndConditions: React.FC<TermsAndConditionsProps> = ({
  agreed,
  onChange,
  error,
}) => (
  <div className="space-y-4">
    <h3 className="text-lg font-medium">Terms & Conditions</h3>
    <div className="rounded-lg border border-gray-200 p-4">
      <p className="text-sm text-gray-600">
        By registering for this event, you agree to our terms and conditions and privacy policy.
        All ticket sales are final. No refunds will be issued.
      </p>
      <div className="mt-4">
        <div className="flex items-start">
          <div className="flex h-5 items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              checked={agreed}
              onChange={(e) => onChange(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="terms" className="font-medium text-gray-700">
              I agree to the terms and conditions
            </label>
            {!agreed && error && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Main Registration Modal Component
const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  selectedRegistration,
  event,
  allRegistrations = [],
}) => {
  if (!isOpen) return null;

  // Form state with explicit types
  const [promoCode, setPromoCode] = useState<string>('');
  const [billingInfo, setBillingInfo] = useState<BillingInfo>({
    firstName: '',
    lastName: '',
    email: '',
    confirmEmail: '',
    phone: '',
    company: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    paymentMethod: 'creditCard',
    sameAsBilling: true,
    notes: '',
  });

  const [ticketQuantities, setTicketQuantities] = useState<Record<string, number>>({});
  const [attendeesByTicket, setAttendeesByTicket] = useState<Record<string, AttendeeInfo[]>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Create an empty attendee object with proper typing
  const createEmptyAttendee = (): AttendeeInfo => ({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: '',
    company: '',
    companyWebsite: '',
    businessSize: '',
    industry: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    howDidYouHearAboutUs: '',
    interestedInSponsorship: false,
    interestedInSpeaking: false,
    agreeToTerms: false,
    agreeToPhotoRelease: false,
    dietaryRestrictions: '',
    accessibilityRequirements: '',
  });

  // Validation functions
  const validateBillingInfo = (): boolean => {
    const errors: Record<string, string> = {};

    if (!billingInfo.firstName.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!billingInfo.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }

    if (!billingInfo.email.trim() || !/\S+@\S+\.\S+/.test(billingInfo.email)) {
      errors.email = 'Valid email is required';
    }

    if (billingInfo.email !== billingInfo.confirmEmail) {
      errors.confirmEmail = 'Emails do not match';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateAttendees = (): boolean => {
    const errors: Record<string, string> = {};
    let hasErrors = false;

    Object.entries(ticketQuantities).forEach(([regId, qty]) => {
      const registration = allRegistrations.find((reg) => reg.id === regId);
      if (!registration || qty <= 0) return;

      const attendees = attendeesByTicket[regId] || [];

      for (let i = 0; i < qty; i++) {
        const attendee = attendees[i] || createEmptyAttendee();

        if (!attendee.firstName.trim()) {
          errors[`attendee_${regId}_${i}_firstName`] = 'First name is required';
          hasErrors = true;
        }
        if (!attendee.lastName.trim()) {
          errors[`attendee_${regId}_${i}_lastName`] = 'Last name is required';
          hasErrors = true;
        }
        if (!attendee.email.trim() || !/\S+@\S+\.\S+/.test(attendee.email)) {
          errors[`attendee_${regId}_${i}_email`] = 'Valid email is required';
          hasErrors = true;
        }
      }
    });
      ...prev,
      [field]: ''
    }));
  }
}

// ...

// Handle form submission
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Basic validation
  if (currentStep === 1) {
    const errors: Record<string, string> = {};
    if (!billingInfo.firstName) errors.firstName = 'First name is required';
    if (!billingInfo.lastName) errors.lastName = 'Last name is required';
    if (!billingInfo.email) errors.email = 'Email is required';
    if (!billingInfo.phone) errors.phone = 'Phone number is required';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
  }
  
  // Process registration
  try {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
      return;
    }
    
    // Final submission
    console.log('Submitting registration...');
    // TODO: Implement API call for registration
    alert('Registration successful!');
    onClose();
  } catch (error) {
    console.error('Error processing registration:', error);
    alert('Error processing registration. Please try again.');
  }
}

// ...

// Navigation between steps
const goToNextStep = () => {
  if (currentStep < 3) {
    setCurrentStep(prev => {
      // Add validation before proceeding
      if (currentStep === 1) {
        const errors: Record<string, string> = {};
        if (!billingInfo.firstName) errors.firstName = 'First name is required';
        if (!billingInfo.lastName) errors.lastName = 'Last name is required';
        if (!billingInfo.email) errors.email = 'Email is required';
        if (!billingInfo.phone) errors.phone = 'Phone number is required';

      // Prepare the registration data
      const registrationData = {
        eventId: event.id,
        billingInfo,
        attendees: Object.values(attendeesByTicket).flat(),
        promoCode: promoCode || undefined,
        totalAmount: calculateTotal(),
        registrationDate: new Date().toISOString(),
        paymentStatus: 'pending',
        status: 'pending',
      };

      const allAttendees = Object.values(attendeesByTicket).flat();
      const attendeeData = allAttendees.map((attendee, index) => ({
        id: `${event.id}-${index}`,
        firstName: attendee.firstName,
        lastName: attendee.lastName,
        email: attendee.email,
        phone: attendee.phone || '',
        jobTitle: attendee.jobTitle || '',
        company: attendee.company || '',
        companyWebsite: attendee.companyWebsite || '',
        businessSize: attendee.businessSize || 'Small Business',
        industry: attendee.industry || 'Other',
        address1: '',
        address2: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'United States',
        howDidYouHearAboutUs: 'Other',
        interestedInSponsorship: attendee.sponsorInterest === 'yes',
        interestedInSpeaking: attendee.speakingInterest === 'yes',
        company: allAttendees[0]?.company || '', // Use first attendee's company if available
        companyWebsite: allAttendees[0]?.website || '', // Use first attendee's website if available
        businessSize: allAttendees[0]?.businessSize || 'Small Business', // Default to Small Business
        industry: allAttendees[0]?.industry || 'Other', // Default to Other
        address1: '', // Not collected in current form
        address2: '', // Not collected in current form
        city: '', // Not collected in current form
        state: '', // Not collected in current form
        zipCode: '', // Not collected in current form
        country: 'United States', // Default
        
        // Survey/Interest Questions
        howDidYouHearAboutUs: 'Other', // Default
        interestedInSponsorship: allAttendees.some(attendee => attendee.sponsorInterest === 'yes'),
        interestedInSpeaking: allAttendees.some(attendee => attendee.speakingInterest === 'yes'),
        
        // Terms and Conditions
        agreeToTerms: agreedToTerms,
        agreeToPhotoRelease: false, // Not collected in current form
        
        // Tickets
        tickets: Object.entries(attendeesByTicket).flatMap(([ticketId, ticketAttendees]) => 
          ticketAttendees.map(attendee => ({
            ticketId,
            quantity: 1, // Each attendee is one ticket
            attendeeInfo: [{
              firstName: attendee.firstName,
              lastName: attendee.lastName,
              email: attendee.email,
              jobTitle: attendee.jobTitle || '',
              company: attendee.company || '',
              dietaryRestrictions: '', // Not collected in current form
              accessibilityNeeds: '' // Not collected in current form
            }]
          }))
        ),
        
        // Payment
        paymentMethod: 'creditCard', // Default to credit card
        promoCode: '' // Not collected in current form
      });

      console.log('Submitting registration:', registrationData);
      
      const response = await fetch('/api/event-registration/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError);
        const text = await response.text();
        console.error('Raw response:', text);
        throw new Error(`Invalid response from server: ${response.status} ${response.statusText}`);
      }

      if (!response.ok) {
        console.error('Registration failed:', {
          status: response.status,
          statusText: response.statusText,
          error: result,
          requestData: registrationData
        });
        throw new Error(result.message || result.error || `Failed to submit registration: ${response.status} ${response.statusText}`);
      }
      
      // If payment is required, redirect to Stripe Checkout
      if (result.paymentRequired && result.sessionUrl) {
        window.location.href = result.sessionUrl;
        return;
      }
      
      // If no payment required, show success message and close modal
      onClose();
      alert('Registration successful! You will receive a confirmation email shortly.');
      
    } catch (error) {
      console.error('Registration error:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const renderContent = () => {
    if (!allRegistrations) {
      return <div className="text-center py-4">Loading registration options...</div>;
    }

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Registration Details</h3>
        {allRegistrations.map((registration) => (
          <div key={registration.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">{registration.name}</h4>
                <p className="text-sm text-gray-600">${registration.price}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(registration.id, -1)}
                  className="p-1 rounded-md border border-gray-300"
                >
                  <MinusIcon className="h-4 w-4" />
                </button>
                <span>{ticketQuantities[registration.id] || 0}</span>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(registration.id, 1)}
                  className="p-1 rounded-md border border-gray-300"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        <div className="border-t pt-4">
          <div className="flex justify-between font-medium">
            <span>Total:</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  const renderRegistrationContent = () => {
    if (!allRegistrations || allRegistrations.length === 0) {
      return (
        <div className="text-center py-4">
          <p>No registration options available.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="space-y-4">
          {allRegistrations.map((registration) => (
            <div key={registration.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-gray-900">{registration.name}</h4>
                  <p className="text-sm text-gray-600">${(registration.price || 0).toFixed(2)}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(registration.id, -1)}
                    className="p-1 rounded-md border border-gray-300 hover:bg-gray-50"
                    disabled={!ticketQuantities[registration.id]}
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                  <span className="w-6 text-center">
                    {ticketQuantities[registration.id] || 0}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(registration.id, 1)}
                    className="p-1 rounded-md border border-gray-300 hover:bg-gray-50"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="border-t pt-4">
          <div className="flex justify-between font-medium text-lg">
            <span>Total:</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                      {event?.name || 'Event Registration'}
                    </Dialog.Title>
                    {error && (
                      <div className="mt-2 p-2 bg-red-50 text-red-700 text-sm rounded">
                        {error}
                      </div>
                    )}
                    <div className="mt-4">
                      {renderRegistrationContent()}
                    </div>
                    <div className="mt-5 sm:mt-6">
                      <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Processing...' : 'Complete Registration'}
                      </button>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {!isCheckout ? 'Register for Event' : 'Complete Your Registration'}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>

          {!isCheckout ? (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Promo Code</h3>
                <div className="flex">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter promo code"
                    className="flex-1 border rounded-l px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700 transition-colors">
                    Apply
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Select Tickets</h3>
                {allRegistrations.map((registration) => (
                  <div key={registration.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{registration.name}</h4>
                        <p className="text-sm text-gray-600">{registration.description}</p>
                        <p className="text-lg font-bold mt-2">
                          ${registration.price.toFixed(2)}
                          {registration.earlyBirdPrice && (
                            <span className="ml-2 text-sm text-green-600">
                              Early Bird (Save ${(registration.regularPrice - registration.price).toFixed(2)})
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <button
                          onClick={() => handleQuantityChange(registration.id, -1)}
                          className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                        >
                          -
                        </button>
                        <span className="mx-4">{ticketQuantities[registration.id] || 0}</span>
                        <button
                          onClick={() => handleQuantityChange(registration.id, 1)}
                          className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total:</span>
                  <span className="text-xl font-bold">${totalAmount.toFixed(2)}</span>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={totalAmount <= 0}
                  className={`mt-4 w-full py-3 rounded-lg font-semibold ${
                  }`}
                >
                  {currentStep > 1 ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    1
                  )}
                </div>
                <span className="mt-2 text-sm text-gray-600">Step 1: Select Tickets</span>
              </div>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
