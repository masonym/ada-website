import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

interface StripePaymentFormProps {
  clientSecret: string;
  eventId: string; // To potentially use in return_url or pass back on success
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (errorMessage: string) => void;
  onPaymentProcessing: (isProcessing: boolean) => void;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  clientSecret,
  eventId,
  onPaymentSuccess,
  onPaymentError,
  onPaymentProcessing,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!stripe || !elements) {
      onPaymentError('Stripe.js has not loaded yet. Please try again in a moment.');
      return;
    }

    setIsProcessingPayment(true);
    onPaymentProcessing(true);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      onPaymentError('Card element not found. Please contact support.');
      setIsProcessingPayment(false);
      onPaymentProcessing(false);
      return;
    }

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
  };

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
    <form onSubmit={handleSubmit}>
      <h3 className="text-xl font-semibold mb-6 text-gray-800">Complete Your Payment</h3>
      <div className="mb-6 p-4 border border-gray-300 rounded-lg bg-white shadow-sm">
        <CardElement options={cardElementOptions} />
      </div>
      
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessingPayment}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition duration-150 ease-in-out"
      >
        {isProcessingPayment ? 'Processing Payment...' : 'Pay Now'}
      </button>
    </form>
  );
};

export default StripePaymentForm;
