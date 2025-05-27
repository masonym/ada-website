import React from 'react';
import { CardElement } from '@stripe/react-stripe-js';

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

const StripeCardInput: React.FC = () => {
  return (
    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Card Details
      </label>
      <div className="p-3 border border-gray-300 rounded-md bg-white shadow-sm">
        <CardElement options={cardElementOptions} />
      </div>
    </div>
  );
};

export default StripeCardInput;
