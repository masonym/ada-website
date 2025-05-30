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
  const [isCardElementMountedAndReady, setIsCardElementMountedAndReady] = useState(false);
  const [isCardDetailsComplete, setIsCardDetailsComplete] = useState(false);

  useEffect(() => {
    // Signal true readiness when stripe, elements, AND the CardElement are ready (not requiring card details completion)
    console.log('Checking Stripe readiness:', {
      stripe: !!stripe,
      elements: !!elements,
      isCardElementMountedAndReady,
      isCardDetailsComplete
    });
    
    if (stripe && elements && isCardElementMountedAndReady) {
      console.log('StripePaymentForm: All critical components ready, signaling readiness');
      onStripeReady(true);
    } else {
      console.log('StripePaymentForm: Not fully ready yet');
      onStripeReady(false);
    }
    
    // Cleanup: Signal not ready if component unmounts or dependencies change to a non-ready state.
    return () => {
      onStripeReady(false);
    };
  }, [stripe, elements, isCardElementMountedAndReady, onStripeReady]);

  // Effect to handle clientSecret changes
  useEffect(() => {
    // Only reset state when clientSecret first becomes available, not on every change
    // This prevents losing card state during the payment flow
    if (clientSecret) {
      console.log('Client secret is now available, but NOT resetting card state');
      // We don't reset the card element state here anymore, as it causes issues with card validation
      // Let the card element maintain its own state for validation
    }
  }, [clientSecret]);


  useImperativeHandle(ref, () => ({
    async triggerSubmit() {
      setErrorMessage(null);

      console.log(
        'StripePaymentForm: Inside triggerSubmit. Checking readiness:',
        {
          isStripeHookAvailable: !!stripe,
          isElementsHookAvailable: !!elements,
          isCardElementMountedAndReady: isCardElementMountedAndReady,
          isCardDetailsComplete: isCardDetailsComplete,
          isProcessingPayment: isProcessingPayment,
        }
      );
      
      // Only check for the bare minimum requirements
      if (!stripe || !elements) {
        console.error('Stripe or Elements not available');
        onPaymentError('Payment system is not available. Please try again in a moment.');
        return;
      }
      
      if (isProcessingPayment) {
        console.log('Payment is already processing');
        return;
      }
      
      console.log('Proceeding with payment submission regardless of card completion status.');


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
        <CardElement 
          options={cardElementOptions} 
          onReady={() => {
            console.log('StripePaymentForm: CardElement is now mounted and ready (onReady callback fired).');
            setIsCardElementMountedAndReady(true);
          }}
          onChange={(event) => {
            console.log('StripePaymentForm CardElement onChange event:', event);
            console.log('Card details complete?', event.complete, 'Card brand:', event.brand, 'Error:', event.error);
            setErrorMessage(event.error ? event.error.message : null);
            console.log(event.complete)
            setIsCardDetailsComplete(event.complete);
            
            // Only show validation errors locally in the form, don't propagate them upward
            // This prevents form validation errors from stopping the checkout flow
            if (event.error && event.error.type !== 'validation_error') {
              onPaymentError(event.error.message);
            }
          }}
        />
      </div>
      
      {errorMessage && (
        <div className="mb-3 p-2 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm">
          {errorMessage}
        </div>
      )}
      
      {isProcessingPayment && <p className="text-sm text-blue-600">Processing payment...</p>}
    </div>
  );
});

export default StripePaymentForm;
