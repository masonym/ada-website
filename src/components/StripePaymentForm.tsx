import React, { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

export interface StripePaymentFormRef {
  triggerSubmit: () => Promise<void>;
}

interface StripePaymentFormProps {
  clientSecret: string | null; // Allow null initially
  eventId: string; 
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (errorMessage: string) => void;
  onPaymentProcessing: (isProcessing: boolean) => void;
  onStripeReady: (isReady: boolean) => void; // New prop
}

const StripePaymentForm = forwardRef<StripePaymentFormRef, StripePaymentFormProps>((
  { clientSecret, eventId, onPaymentSuccess, onPaymentError, onPaymentProcessing, onStripeReady }, 
  ref
) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false); // Internal processing state

  useEffect(() => {
    if (stripe && elements) {
      onStripeReady(true);
    } else {
      onStripeReady(false);
    }
  }, [stripe, elements, onStripeReady]);

  useImperativeHandle(ref, () => ({
    async triggerSubmit() {
      setErrorMessage(null);

      if (!stripe || !elements) {
        onPaymentError('Stripe.js has not loaded yet. Please try again in a moment.');
        return;
      }

      if (!clientSecret) {
        onPaymentError('Payment information is not ready. Client secret is missing.');
        return;
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        onPaymentError('Card element not found. Please contact support.');
        return;
      }
      
      setIsProcessingPayment(true);
      onPaymentProcessing(true);

      // const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          // billing_details: { // Optional: Collect billing details if needed
          //   name: 'Jenny Rosen',
          //   email: 'jenny.rosen@example.com',
          // },
        },
        // return_url: `${siteUrl}/event/${eventId}/payment-confirmation`, // Example return URL
      });

      if (error) {
        const msg = error.message || 'An unexpected error occurred during payment.';
        setErrorMessage(msg);
        onPaymentError(msg);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onPaymentSuccess(paymentIntent.id);
      } else if (paymentIntent) {
        const msg = `Payment status: ${paymentIntent.status}. Please try again or contact support.`;
        setErrorMessage(msg);
        onPaymentError(msg);
      } else {
        const msg = 'An unexpected error occurred. Payment intent not found.';
        setErrorMessage(msg);
        onPaymentError(msg);
      }

      setIsProcessingPayment(false);
      onPaymentProcessing(false);
    }
  }));

  const cardElementOptions = {
    style: {
      base: {
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    },
  };

  return (
    <div className="w-full">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Payment Details</h3>
      <div className="mb-4 p-3 border border-gray-300 rounded-lg bg-white shadow-sm">
        <CardElement options={cardElementOptions} />
      </div>
      
      {errorMessage && (
        <div className="mb-3 p-2 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm">
          {errorMessage}
        </div>
      )}
      {/* The 'Pay Now' button is removed. Submission is handled programmatically. */}
      {isProcessingPayment && <p className="text-sm text-blue-600">Processing payment...</p>}
    </div>
  );
});

export default StripePaymentForm;
