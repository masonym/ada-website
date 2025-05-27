'use client';

import { useState, useEffect } from 'react';
import { X, CreditCard } from 'lucide-react';
import { Event } from '@/types/events';
import { BillingInformation } from './BillingInformation';
import { AttendeeForm } from './AttendeeForm';
import { TermsAndConditions } from './TermsAndConditions';
import { registrationSchema } from '@/lib/event-registration/validation';
import { RegistrationFormData } from '@/types/event-registration/registration';
import { ValidationError } from 'yup';

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

interface AttendeeInfo {
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
  const [currentStep, setCurrentStep] = useState(1);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [billingInfo, setBillingInfo] = useState<BillingInfo>({
    firstName: '',
    lastName: '',
    email: '',
    confirmEmail: ''
  });
  const [attendeesByTicket, setAttendeesByTicket] = useState<Record<string, AttendeeInfo[]>>({});

  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    const initialQuantities: Record<string, number> = {};
    const initialAttendees: Record<string, AttendeeInfo[]> = {};
    
    allRegistrations.forEach((reg) => {
      initialQuantities[reg.id] = 0;
      initialAttendees[reg.id] = [];
    });
    
    setTicketQuantities(initialQuantities);
    setAttendeesByTicket(initialAttendees);
  }, [allRegistrations]);

  function createEmptyAttendee(): AttendeeInfo {
    return {
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
      speakingInterest: ''
    };
  }

  const handleIncrement = (id: string) => {
    const newQuantity = (ticketQuantities[id] || 0) + 1;
    setTicketQuantities(prev => ({
      ...prev,
      [id]: newQuantity
    }));
    
    setAttendeesByTicket(prev => ({
      ...prev,
      [id]: [...(prev[id] || []), createEmptyAttendee()]
    }));
  };

  const handleDecrement = (id: string) => {
    if (ticketQuantities[id] > 0) {
      setTicketQuantities(prev => ({
        ...prev,
        [id]: prev[id] - 1
      }));
      
      setAttendeesByTicket(prev => ({
        ...prev,
        [id]: prev[id]?.slice(0, -1) || []
      }));
    }
  };

  const handleCheckout = () => {
    setIsCheckout(true);
    setCurrentStep(1);
  };

  const handleBackToTickets = () => {
    setIsCheckout(false);
  };

  const handleNextStep = () => {
    setCurrentStep(prev => prev + 1);
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

  const handleAttendeeChange = (ticketId: string, index: number, field: string, value: string) => {
    setAttendeesByTicket(prev => ({
      ...prev,
      [ticketId]: prev[ticketId].map((attendee, i) => 
        i === index ? { ...attendee, [field]: value } : attendee
      )
    }));
  };

  const handleCopyAttendee = (ticketId: string, sourceIndex: number, targetIndex: number) => {
    setAttendeesByTicket(prev => ({
      ...prev,
      [ticketId]: prev[ticketId].map((attendee, i) => 
        i === targetIndex ? { ...prev[ticketId][sourceIndex] } : attendee
      )
    }));
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
    const firstAttendee = firstTicketId ? attendeesByTicket[firstTicketId]?.[0] : createEmptyAttendee();

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
            jobTitle: att.jobTitle,
            company: att.company,
            dietaryRestrictions: '',
            accessibilityNeeds: '',
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
          setApiError('Registration successful! Proceed to payment (Stripe integration pending).');
        } else {
          setApiError('Registration successful!');
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

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <BillingInformation 
              billingInfo={billingInfo} 
              onChange={handleBillingInfoChange} 
            />
            
            <div className="space-y-8">
              {allRegistrations
                .filter(reg => (ticketQuantities[reg.id] || 0) > 0)
                .map(registration => (
                  <div key={registration.id} className="border-t pt-6">
                    <h3 className="text-xl font-semibold mb-2">{registration.name} Attendees</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Please provide information for each {registration.name.toLowerCase()} attendee.
                    </p>
                    
                    {Array.from({ length: ticketQuantities[registration.id] || 0 }).map((_, index) => (
                      <div key={index} className="mb-6 last:mb-0">
                        <h4 className="font-medium text-gray-700 mb-3">
                          {registration.name} Attendee {index + 1}
                        </h4>
                        <AttendeeForm
                          index={index}
                          attendee={attendeesByTicket[registration.id]?.[index] || createEmptyAttendee()}
                          onChange={(i, field, value) => handleAttendeeChange(registration.id, i, field, value)}
                          onCopyFrom={(sourceIndex) => handleCopyAttendee(registration.id, sourceIndex, index)}
                          totalAttendees={ticketQuantities[registration.id] || 0}
                        />
                      </div>
                    ))}
                  </div>
                ))}
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <TermsAndConditions 
              agreed={agreedToTerms} 
              onAgree={setAgreedToTerms} 
            />
            
            <div className="border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Payment Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-4">
                  <CreditCard className="w-6 h-6 mr-2 text-gray-500" />
                  <span className="font-medium">Credit Card</span>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Number *</label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      className="w-full border rounded px-3 py-2"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date *</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full border rounded px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CVC *</label>
                      <input
                        type="text"
                        placeholder="123"
                        className="w-full border rounded px-3 py-2"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name on Card *</label>
                    <input
                      type="text"
                      placeholder="John Smith"
                      className="w-full border rounded px-3 py-2"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
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
                          onClick={() => handleDecrement(registration.id)}
                          className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                        >
                          -
                        </button>
                        <span className="mx-4">{ticketQuantities[registration.id] || 0}</span>
                        <button
                          onClick={() => handleIncrement(registration.id)}
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
                <button
                  onClick={handleCheckout}
                  disabled={calculateTotal() <= 0}
                  className={`mt-4 w-full py-3 rounded-lg font-semibold ${
                    calculateTotal() > 0
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <button
                  onClick={currentStep === 1 ? handleBackToTickets : handlePrevStep}
                  className="text-blue-600 hover:underline flex items-center mb-4"
                >
                  ← {currentStep === 1 ? 'Back to ticket selection' : 'Back'}
                </button>
                
                <div className="flex justify-between mb-8">
                  {[1, 2].map((step) => (
                    <div key={step} className="flex-1 flex flex-col items-center">
                      <div 
                        className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                          currentStep >= step 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {step}
                      </div>
                      <span className="text-sm font-medium">
                        {step === 1 ? 'Attendee Info' : 'Payment'}
                      </span>
                    </div>
                  ))}
                </div>

                {renderStep()}

                {apiError && (
                  <div className="mt-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md">
                    <p>{apiError}</p>
                  </div>
                )}

                {Object.keys(formErrors).length > 0 && (
                  <div className="mt-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md">
                    <p className="font-semibold mb-2">Please correct the following errors:</p>
                    <ul className="list-disc list-inside">
                      {Object.entries(formErrors).map(([key, message]) => (
                        <li key={key}>{`${key.replace(/tickets\[\d+\]\./, 'Ticket - ').replace(/attendeeInfo\[\d+\]\./, 'Attendee - ')}: ${message}`}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-8 pt-6 border-t flex justify-between">
                  {currentStep > 1 ? (
                    <button
                      onClick={handlePrevStep}
                      className="px-6 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Back
                    </button>
                  ) : (
                    <div></div>
                  )}
                  
                  {currentStep < 2 ? (
                    <button
                      onClick={handleNextStep}
                      className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Continue to Payment
                    </button>
                  ) : (
                    <button
                      onClick={handleCompleteRegistration}
                      disabled={!agreedToTerms || isLoading}
                      className={`ml-auto px-6 py-2 rounded-lg font-semibold ${
                        agreedToTerms && !isLoading
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {isLoading ? 'Processing...' : `Complete Registration ($${calculateTotal().toFixed(2)})`}
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
