'use client';

import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { AlertCircle } from 'lucide-react';

// Types
type BusinessSize = 
  | '1-10 employees' 
  | '11-50 employees' 
  | '51-200 employees' 
  | '201-500 employees' 
  | '501-1000 employees' 
  | '1001-5000 employees' 
  | '5001+ employees'
  | 'Government';

interface RegistrationType {
  id: string;
  name: string;
  description: string;
  price: number;
  isActive: boolean;
  requiresAttendeeInfo: boolean;
  earlyBirdPrice?: number;
  earlyBirdDeadline?: string;
}

interface Event {
  id: string;
  title: string;
  // Add other event properties as needed
}

interface RegistrationFormProps {
  event: Event;
  registrationTypes: RegistrationType[];
}

// Define the shape of the form values
interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  company: string;
  companyWebsite: string;
  businessSize: BusinessSize;
  industry: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  howDidYouHearAboutUs: string;
  interestedInSponsorship: boolean;
  interestedInSpeaking: boolean;
  agreeToTerms: boolean;
  agreeToPhotoRelease: boolean;
  tickets: Array<{ ticketId: string; quantity: number }>;
  paymentMethod: 'creditCard' | 'free';
  promoCode?: string;
}

// Constants
const BUSINESS_SIZES: BusinessSize[] = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-500 employees',
  '501-1000 employees',
  '1001-5000 employees',
  '5001+ employees',
  'Government',
];

const INDUSTRIES = [
  'Aerospace & Defense',
  'Government',
  'Technology',
  'Manufacturing',
  'Consulting',
  'Education',
  'Other',
];

const HOW_DID_YOU_HEAR_ABOUT_US = [
  'Search Engine',
  'Social Media',
  'Email',
  'Friend/Colleague',
  'Other',
];

// Validation schema
const validationSchema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email address').required('Email is required'),
  phone: yup.string().required('Phone number is required'),
  jobTitle: yup.string().required('Job title is required'),
  company: yup.string().required('Company name is required'),
  companyWebsite: yup.string().url('Must be a valid URL'),
  businessSize: yup.string().required('Business size is required'),
  industry: yup.string().required('Industry is required'),
  address1: yup.string().required('Address is required'),
  city: yup.string().required('City is required'),
  state: yup.string().required('State is required'),
  zipCode: yup.string().required('ZIP code is required'),
  country: yup.string().required('Country is required'),
  howDidYouHearAboutUs: yup.string().required('This field is required'),
  agreeToTerms: yup.boolean().oneOf([true], 'You must accept the terms and conditions'),
  agreeToPhotoRelease: yup.boolean().oneOf([true], 'You must accept the photo release'),
  tickets: yup.array().test(
    'at-least-one-ticket',
    'Please select at least one ticket',
    (tickets) => tickets?.some(t => t && t.quantity > 0) || false
  ).required('At least one ticket is required'),
  paymentMethod: yup.string().required('Required'),
});

// Helper function to check if email is .gov or .mil
const isGovOrMilEmail = (email: string): boolean => {
  const domain = email.split('@')[1]?.toLowerCase() || '';
  return domain.endsWith('.gov') || domain.endsWith('.mil');
};

export default function RegistrationForm({ event, registrationTypes }: RegistrationFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFreeRegistration, setIsFreeRegistration] = useState(false);
  const stripe = useStripe();
  const elements = useElements();
  
  // Initialize form with Formik
  const formik = useFormik<FormValues>({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      jobTitle: '',
      company: '',
      companyWebsite: '',
      businessSize: '1-10 employees', // Default value to match BusinessSize type
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
      tickets: registrationTypes
        .filter((type) => type.isActive)
        .map((type) => ({
          ticketId: type.id,
          quantity: 0,
        })),
      paymentMethod: 'creditCard',
      promoCode: '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      try {
        setIsSubmitting(true);
        setError(null);

        // Check if it's a free registration (.gov/.mil email)
        const isFree = isGovOrMilEmail(values.email) && values.paymentMethod === 'free';
        
        // Submit registration data to your API
        const response = await fetch('/api/event-registration/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...values,
            eventId: event.id,
            // Convert tickets array to the expected format
            tickets: values.tickets.filter(t => t.quantity > 0).map(t => ({
              ticketId: t.ticketId,
              quantity: t.quantity,
            })),
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to process registration');
        }

        if (isFree) {
          // Redirect to success page for free registration
          router.push(`/event-registration/success?orderId=${data.orderId}`);
          return;
        }


        // For paid registration, process payment with Stripe
        if (!stripe || !elements) {
          throw new Error('Payment processor not available');
        }


        const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
          data.clientSecret,
          {
            payment_method: {
              card: elements.getElement(CardElement)!,
              billing_details: {
                name: `${values.firstName} ${values.lastName}`,
                email: values.email,
                phone: values.phone,
                address: {
                  line1: values.address1,
                  line2: values.address2 || '',
                  city: values.city,
                  state: values.state,
                  postal_code: values.zipCode,
                  country: 'US',
                },
              },
            },
          }
        );


        if (stripeError) {
          throw new Error(stripeError.message || 'Payment failed');
        }

        // Redirect to success page with payment intent ID
        router.push(`/event-registration/success?payment_intent=${paymentIntent?.id}`);
      } catch (err) {
        console.error('Registration error:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Check if email is .gov or .mil for free registration
  useEffect(() => {
    const email = formik.values.email.trim().toLowerCase();
    const isFree = email.endsWith('.gov') || email.endsWith('.mil');
    setIsFreeRegistration(isFree);
    
    if (isFree) {
      formik.setFieldValue('paymentMethod', 'free');
    } else if (formik.values.paymentMethod === 'free') {
      formik.setFieldValue('paymentMethod', 'creditCard');
    }
  }, [formik.values.email]);

  // Handle ticket quantity changes
  const handleTicketQuantityChange = (ticketId: string, quantity: number) => {
    const updatedTickets = formik.values.tickets.map((ticket) =>
      ticket.ticketId === ticketId ? { ...ticket, quantity } : ticket
    );
    formik.setFieldValue('tickets', updatedTickets);
  };

  // Render form fields
  const renderFormField = (fieldName: string, label: string, type = 'text', options?: string[]) => (
    <div className="mb-4">
      <label htmlFor={fieldName} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {type === 'select' ? (
        <select
          id={fieldName}
          name={fieldName}
          value={(formik.values as any)[fieldName]}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select {label.toLowerCase()}</option>
          {options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : type === 'checkbox' ? (
        <div className="flex items-center">
          <input
            type="checkbox"
            id={fieldName}
            name={fieldName}
            checked={(formik.values as any)[fieldName] || false}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </div>
      ) : (
        <input
          type={type}
          id={fieldName}
          name={fieldName}
          value={(formik.values as any)[fieldName] || ''}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={`w-full px-3 py-2 border ${
            formik.touched[fieldName as keyof typeof formik.touched] &&
            formik.errors[fieldName as keyof typeof formik.errors]
              ? 'border-red-500'
              : 'border-gray-300'
          } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
        />
      )}
      {formik.touched[fieldName as keyof typeof formik.touched] &&
        formik.errors[fieldName as keyof typeof formik.errors] && (
          <p className="mt-1 text-sm text-red-600">
            {formik.errors[fieldName as keyof typeof formik.errors] as string}
          </p>
        )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Register for {event.title}</h1>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">
          <div className="flex">
            <AlertCircle className="h-5 w-5 mr-2" />
            <p>{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={formik.handleSubmit} className="space-y-6">
        {/* Attendee Information */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Attendee Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderFormField('firstName', 'First Name')}
            {renderFormField('lastName', 'Last Name')}
            {renderFormField('email', 'Email', 'email')}
            {renderFormField('phone', 'Phone', 'tel')}
            {renderFormField('jobTitle', 'Job Title')}
            {renderFormField('company', 'Company')}
            {renderFormField('companyWebsite', 'Company Website', 'url')}
            {renderFormField('businessSize', 'Business Size', 'select', BUSINESS_SIZES)}
            {renderFormField('industry', 'Industry', 'select', INDUSTRIES)}
          </div>
        </div>

        {/* Billing Address */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Billing Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderFormField('address1', 'Address Line 1')}
            {renderFormField('address2', 'Address Line 2 (Optional)')}
            {renderFormField('city', 'City')}
            {renderFormField('state', 'State/Province')}
            {renderFormField('zipCode', 'ZIP/Postal Code')}
            {renderFormField('country', 'Country')}
          </div>
        </div>

        {/* Survey Questions */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-lg font-medium text-gray-900 mb-4">How did you hear about us?</h2>
          <div className="space-y-4">
            {renderFormField('howDidYouHearAboutUs', 'How did you hear about this event?', 'select', HOW_DID_YOU_HEAR_ABOUT_US)}
            <div className="space-y-2">
              {renderFormField('interestedInSponsorship', 'I am interested in sponsorship opportunities', 'checkbox')}
              {renderFormField('interestedInSpeaking', 'I am interested in speaking at future events', 'checkbox')}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Processing...' : 'Complete Registration'}
          </button>
        </div>
      </form>
    </div>
  );
}
