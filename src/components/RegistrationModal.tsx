'use client';

import { useState, useEffect, useCallback } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { CreditCard } from 'lucide-react';
import { Event } from '@/types/events';
import { BillingInformation } from './BillingInformation';
import { AttendeeForm } from './AttendeeForm';
import { TermsAndConditions } from './TermsAndConditions';
import { registrationSchema } from '@/lib/event-registration/validation';
import { RegistrationFormData } from '@/types/event-registration/registration';
import { ValidationError } from 'yup';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripeCardInput from './StripeCardInput';
import StripePaymentForm from './StripePaymentForm';

interface ModalRegistrationType {
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
}

interface EventWithContact extends Omit<Event, 'id'> {
  contactInfo?: {
    contactEmail2?: string;
  };
  eventShorthand: string;
  id: string | number;
  slug: string;
}

interface UpdatedAttendeeInfo {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  jobTitle: string;
  phone: string;
  website: string;
  businessSize: string;
  industry: string;
  sponsorInterest: 'yes' | 'no' | '';
  speakingInterest: 'yes' | 'no' | '';
  ticketSelections: {
    ticketId: string;
    quantity: number;
  }[];
}

interface BillingInfo {
  firstName: string;
  lastName: string;
  email: string;
  confirmEmail: string;
  companyName?: string;
  companyWebsite?: string;
  businessSize?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  stateProvince?: string;
  postalCode: string;
  country: string;
  howHeard?: string;
  phone?: string;
  paymentMethod: 'card' | 'free';
}

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRegistration: ModalRegistrationType;
  event: EventWithContact;
  allRegistrations: ModalRegistrationType[];
}

interface ModalFormContentProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventWithContact;
  selectedRegistration: ModalRegistrationType;
  allRegistrations: ModalRegistrationType[];
  initialBillingInfo: BillingInfo;
  initialAttendees: UpdatedAttendeeInfo[];
  initialTicketQuantities: Record<string, number>;
  calculateTotal: () => number;
  handleCheckout: () => void;
  isCheckout: boolean;
  handleBackToTickets: () => void;
  handleDecrement: (id: string) => void;
  handleIncrement: (id: string) => void;
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

const ModalFormContent: React.FC<ModalFormContentProps> = ({
  isOpen, 
  onClose, 
  event, 
  selectedRegistration, 
  allRegistrations,
  initialBillingInfo,
  initialAttendees,
  initialTicketQuantities,
  calculateTotal,
  handleCheckout,
  isCheckout,
  handleBackToTickets,
  handleDecrement,
  handleIncrement,
}) => {
  const [billingInfo, setBillingInfo] = useState<BillingInfo>(initialBillingInfo);
  const [attendees, setAttendees] = useState<UpdatedAttendeeInfo[]>(initialAttendees);
  const [ticketQuantities, setTicketQuantities] = useState<Record<string, number>>(initialTicketQuantities);

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [paymentSuccessful, setPaymentSuccessful] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setCurrentStep(1);
    setBillingInfo(initialBillingInfo);
    setAttendees(initialAttendees);
    setTicketQuantities(initialTicketQuantities);
    setApiError(null);
    setPaymentSuccessful(false);
    setIsLoading(false);
    setPromoCode('');
    setAgreedToTerms(false);
    setFormErrors({});
  }, [isOpen, event, initialBillingInfo, initialAttendees, initialTicketQuantities]);
  
  const handleTicketQuantityChange = (ticketId: string, quantity: number) => {
    setTicketQuantities(prev => ({ ...prev, [ticketId]: Math.max(0, quantity) }));
    setAttendees(prevAttendees => {
      const newAttendees = [...prevAttendees];
      const existingAttendeeIndex = newAttendees.findIndex(att => att.ticketSelections.some(ts => ts.ticketId === ticketId));
      
      if (quantity > 0 && existingAttendeeIndex === -1) {
        // Add a new attendee structure if one doesn't exist for this ticket type
      } else if (quantity === 0 && existingAttendeeIndex !== -1) {
        // Remove or clear attendee info if quantity is zero
      }
      // Update quantities within attendee ticketSelections
      return newAttendees.map(att => ({
        ...att,
        ticketSelections: att.ticketSelections.map(ts => 
          ts.ticketId === ticketId ? { ...ts, quantity } : ts
        )
      }));
    });
  };

  const handleAttendeeInfoChange = (attendeeIndex: number, field: keyof UpdatedAttendeeInfo, value: string | string[] | boolean) => {
    setAttendees(prev => 
      prev.map((att, i) => (i === attendeeIndex ? { ...att, [field]: value } : att))
    );
  };

  const handleBillingInfoChange = (field: keyof BillingInfo, value: any) => {
    setBillingInfo(prev => ({ ...prev, [field]: value }));
    setFormErrors(prev => ({ ...prev, [`billingInfo.${field}`]: '' }));
  };

  const handleNextStep = async () => {
    setApiError(null);
    setFormErrors({});
    let isValid = true;

    if (currentStep === 1) { // Validate Attendee Info
      // Add Yup validation for attendees if needed
    } else if (currentStep === 2) { // Validate Billing Info (excluding card, Stripe handles that)
      try {
        await registrationSchema.validate({ billingInfo }, { abortEarly: false });
      } catch (err) {
        if (err instanceof ValidationError) {
          const yupErrors: Record<string, string> = {};
          err.inner.forEach(e => { if (e.path) yupErrors[e.path] = e.message; });
          setFormErrors(yupErrors);
          isValid = false;
        }
      }
    }
    if (isValid) setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => setCurrentStep(prev => prev - 1);

  const isStepDataComplete = () => {
    if (currentStep === 1) return attendees.every(att => att.firstName && att.lastName && att.email);
    if (currentStep === 2) return billingInfo.firstName && billingInfo.lastName && billingInfo.email && billingInfo.addressLine1 && billingInfo.city && billingInfo.postalCode && billingInfo.country && (billingInfo.paymentMethod === 'free' || billingInfo.paymentMethod === 'card');
    if (currentStep === 3) return agreedToTerms;
    return false;
  };

  const handleCompleteRegistration = async () => {
    setApiError(null);
    setFormErrors({});
    setIsLoading(true);

    const finalFormData: RegistrationFormData = {
      eventId: event.id.toString(),
      tickets: Object.entries(ticketQuantities)
        .filter(([, qty]) => qty > 0)
        .map(([ticketId, quantity]) => ({
          ticketId,
          quantity,
          attendeeInfo: attendees.filter(att => att.ticketSelections.some(ts => ts.ticketId === ticketId && ts.quantity > 0))
        })),
      attendees,
      billingInfo,
      promoCode: promoCode || undefined,
      agreedToTerms,
    };

    try {
      await registrationSchema.validate(finalFormData, { abortEarly: false });
    } catch (err) {
      if (err instanceof ValidationError) {
        const yupErrors: Record<string, string> = {};
        err.inner.forEach(e => { if (e.path) yupErrors[e.path] = e.message; });
        setFormErrors(yupErrors);
        setApiError('Please correct the highlighted errors.');
      }
      setIsLoading(false);
      return;
    }

    try {
      const apiResponse = await fetch('/api/event-registration/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalFormData),
      });
      const result = await apiResponse.json();

      if (apiResponse.ok && result.success) {
        if (result.clientSecret) {
          // Handle Stripe payment
        } else { // Free registration or non-card payment successful via API
          setPaymentSuccessful(true);
        }
      } else {
        setApiError(result.error || (result.errors && Object.values(result.errors).join(', ')) || 'Registration submission failed.');
        setPaymentSuccessful(false);
      }
    } catch (error) {
      console.error('Registration processing error:', error);
      setApiError('An unexpected error occurred. Please try again.');
      setPaymentSuccessful(false);
    }
    setIsLoading(false);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1: // Attendee Information
        return (
          <div>
            <h3 className="text-xl font-semibold mb-4">Attendee Information</h3>
            {attendees.map((attendee, index) => (
              <div key={index} className="mb-4 p-4 border rounded-md">
                <h4 className="font-medium mb-2">Attendee {index + 1}</h4>
                <AttendeeForm
                  index={index}
                  attendee={attendee}
                  onChange={(i, field, value) => handleAttendeeInfoChange(i, field as keyof UpdatedAttendeeInfo, value)}
                  onCopyFrom={(sourceIndex: number) => {
                    if (attendees[sourceIndex]) {
                      const copiedAttendee = { ...attendees[sourceIndex], ticketSelections: [...attendees[sourceIndex].ticketSelections] };
                      setAttendees(prev => prev.map((att, idx) => idx === index ? copiedAttendee : att));
                    }
                  }}
                  totalAttendees={attendees.length}
                />
              </div>
            ))}
          </div>
        );
      case 2: // Billing Information
        return (
          <div>
            <h3 className="text-xl font-semibold mb-4">Billing Information</h3>
            <BillingInformation 
              billingInfo={billingInfo} 
              onChange={(field, value) => handleBillingInfoChange(field as keyof BillingInfo, value)}
            />
            <div className="mt-4">
              <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">Payment Method</label>
              <select 
                id="paymentMethod" 
                name="paymentMethod"
                value={billingInfo.paymentMethod}
                onChange={(e) => handleBillingInfoChange('paymentMethod', e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="card">Credit Card</option>
                <option value="free">Free (if eligible)</option>
              </select>
            </div>
            {billingInfo.paymentMethod === 'card' && <StripeCardInput />}
            {formErrors['billingInfo.paymentMethod'] && <p className="text-red-500 text-xs mt-1">{formErrors['billingInfo.paymentMethod']}</p>}
          </div>
        );
      case 3: // Review & Confirm
        return (
          <div>
            <h3 className="text-xl font-semibold mb-4">Review & Confirm</h3>
            <TermsAndConditions agreed={agreedToTerms} onAgree={setAgreedToTerms} /> 
          </div>
        );
      default: return null;
    }
  };

  const modalTitle = paymentSuccessful ? 'Registration Complete!' : `Step ${currentStep} of 3: ${currentStep === 1 ? 'Attendee Info' : currentStep === 2 ? 'Billing & Payment' : 'Review & Confirm'}`;

  if (!isOpen && !isCheckout) return null;
  if (isCheckout && paymentSuccessful) {
     return (
        <div className="p-6 text-center">
            <h3 className="text-xl font-semibold text-green-600">Thank You!</h3>
            <p className="mt-2 text-gray-700">Your registration and payment were successful.</p>
            <button onClick={onClose} className="mt-6 bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700">
                Close
            </button>
        </div>
     );
  }
  if (isCheckout && !paymentSuccessful) {
    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{modalTitle}</h2>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><XMarkIcon className="w-6 h-6" /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); if (currentStep === 3) handleCompleteRegistration(); }}>
                {renderStep()}
                {apiError && <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">{apiError}</div>}
                {Object.keys(formErrors).length > 0 && !apiError && (
                    <div className="mt-4 p-3 bg-yellow-100 text-yellow-700 rounded-md text-sm">
                        Please review the highlighted fields.
                    </div>
                )}
                <div className="mt-8 pt-6 border-t flex justify-between items-center">
                    <button type="button" onClick={currentStep === 1 ? handleBackToTickets : handlePrevStep} disabled={isLoading || (currentStep === 1 && !isCheckout)} className="px-6 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                        Back
                    </button>
                    {currentStep < 3 ? (
                        <button type="button" onClick={handleNextStep} disabled={isLoading || !isStepDataComplete()} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                            Next
                        </button>
                    ) : (
                        <button type="submit" disabled={isLoading || !agreedToTerms} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                            {isLoading ? 'Processing...' : `Complete Registration ($${calculateTotal().toFixed(2)})`}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
  }

  // Initial ticket selection part (if not in checkout mode)
  return (
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
            {allRegistrations.map((reg) => (
                <div key={reg.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="font-semibold">{reg.name}</h4>
                            <p className="text-sm text-gray-600">{reg.description}</p>
                            <p className="text-lg font-bold mt-2">
                                ${reg.price.toFixed(2)}
                                {reg.earlyBirdPrice && (
                                    <span className="ml-2 text-sm text-green-600">
                                        Early Bird (Save ${(reg.regularPrice - reg.price).toFixed(2)})
                                    </span>
                                )}
                            </p>
                        </div>
                        <div className="flex items-center">
                            <button
                                onClick={() => handleDecrement(reg.id)}
                                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                            >
                                -
                            </button>
                            <span className="mx-4">{ticketQuantities[reg.id] || 0}</span>
                            <button
                                onClick={() => handleIncrement(reg.id)}
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
                <span className="text-xl font-bold">${calculateTotal().toFixed(2)}</span>
            </div>
            <button onClick={handleCheckout} disabled={calculateTotal() <= 0} className={`mt-4 w-full py-3 rounded-lg font-semibold ${calculateTotal() > 0 ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
                Proceed to Checkout
            </button>
        </div>
    </div>
  );
};

export default function RegistrationModal({
  isOpen,
  onClose,
  selectedRegistration,
  event,
  allRegistrations,
}: RegistrationModalProps) {
  const [promoCode, setPromoCode] = useState('');
  const [ticketQuantities, setTicketQuantities] = useState<Record<string, number>>({});
  const [isCheckout, setIsCheckout] = useState(false);
  const [initialBillingInfo, setInitialBillingInfo] = useState<BillingInfo>({
    firstName: '',
    lastName: '',
    email: '',
    confirmEmail: '',
    paymentMethod: 'card',
    addressLine1: '',
    city: '',
    postalCode: '',
    country: '',
    companyName: undefined,
    companyWebsite: undefined,
    businessSize: undefined,
    addressLine2: undefined,
    stateProvince: undefined,
    howHeard: undefined,
    phone: undefined,
  });
  const [initialAttendees, setInitialAttendees] = useState<UpdatedAttendeeInfo[]>([]);

  const calculateTotal = () => {
    return allRegistrations.reduce((total, reg) => {
      const quantity = ticketQuantities[reg.id] || 0;
      return total + (quantity * reg.price);
    }, 0);
  };

  const handleCheckout = () => {
    const attendeesArray: UpdatedAttendeeInfo[] = [];
    Object.entries(ticketQuantities).forEach(([ticketId, quantity]) => {
      for (let i = 0; i < quantity; i++) {
        attendeesArray.push({
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
          ticketSelections: [{ ticketId, quantity: 1 }]
        });
      }
    });
    setInitialAttendees(attendeesArray);
    setIsCheckout(true);
  };

  const handleBackToTickets = () => {
    setIsCheckout(false);
  };

  const handleDecrement = (id: string) => {
    if (ticketQuantities[id] > 0) {
      setTicketQuantities(prev => ({
        ...prev,
        [id]: prev[id] - 1
      }));
      setInitialAttendees(prev => prev.slice(0, -1));
    }
  };

  const handleIncrement = (id: string) => {
    const newQuantity = (ticketQuantities[id] || 0) + 1;
    setTicketQuantities(prev => ({
      ...prev,
      [id]: newQuantity
    }));
    setInitialAttendees(prev => [...prev, {
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
      ticketSelections: [{ ticketId: id, quantity: 1 }]
    }]);
  };

  if (!isOpen) return null;

  return (
    <Elements stripe={stripePromise}>
      <ModalFormContent 
        isOpen={isOpen} 
        onClose={onClose} 
        event={event} 
        selectedRegistration={selectedRegistration} 
        allRegistrations={allRegistrations}
        initialBillingInfo={initialBillingInfo}
        initialAttendees={initialAttendees}
        initialTicketQuantities={ticketQuantities}
        calculateTotal={calculateTotal}
        handleCheckout={handleCheckout}
        isCheckout={isCheckout}
        handleBackToTickets={handleBackToTickets}
        handleDecrement={handleDecrement}
        handleIncrement={handleIncrement}
      />
    </Elements>
  );
}
