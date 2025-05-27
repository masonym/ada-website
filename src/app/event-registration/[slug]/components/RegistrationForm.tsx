'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Event } from '@/types/events';
import { RegistrationType } from '@/types/event-registration/registration';

interface RegistrationFormProps {
  event: Event;
  registrationTypes: RegistrationType[];
}

export default function RegistrationForm({ event, registrationTypes }: RegistrationFormProps) {
  const [selectedType, setSelectedType] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const selectedRegistration = registrationTypes.find(rt => rt.id === selectedType);
  const isEarlyBird = selectedRegistration?.earlyBirdDeadline && 
    new Date() < new Date(selectedRegistration.earlyBirdDeadline);
  
  // Ensure we have a valid price, defaulting to 0 if not available
  const price = selectedRegistration 
    ? (isEarlyBird && selectedRegistration.earlyBirdPrice !== undefined 
        ? selectedRegistration.earlyBirdPrice 
        : selectedRegistration.price || 0)
    : 0;
  
  const total = price * quantity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedType || !selectedRegistration) {
      setError('Please select a registration type');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // TODO: Implement the actual registration logic with Stripe
      // For now, we'll just log the registration details
      console.log({
        eventId: event.id,
        registrationTypeId: selectedType,
        quantity,
        total,
      });

      // Redirect to the payment page
      router.push(`/event-registration/${event.slug}/checkout?type=${selectedType}&quantity=${quantity}`);
    } catch (err) {
      console.error('Registration error:', err);
      setError('An error occurred during registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Select Registration Type</h2>
        <div className="space-y-4">
          {registrationTypes.map((regType) => (
            <div 
              key={regType.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedType === regType.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => setSelectedType(regType.id)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{regType.name}</h3>
                  <p className="text-sm text-gray-600">{regType.description}</p>
                  {regType.perks && (
                    <ul className="mt-2 text-sm text-gray-600 space-y-1">
                      {regType.perks.map((perk, i) => (
                        <li key={i} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{perk}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="text-right">
                  {isEarlyBird && regType.earlyBirdPrice ? (
                    <>
                      <span className="text-gray-400 line-through">${regType.price}</span>
                      <div className="text-lg font-bold">${regType.earlyBirdPrice}</div>
                      <span className="text-xs text-green-600">Early Bird!</span>
                    </>
                  ) : (
                    <div className="text-lg font-bold">${regType.price}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedType && (
        <div>
          <div className="mb-4">
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
              Quantity
            </label>
            <select
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-20 p-2 border rounded-md"
              disabled={isLoading}
            >
              {Array.from(
                { length: selectedRegistration?.maxQuantityPerOrder || 10 },
                (_, i) => i + 1
              ).map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>

          <div className="border-t pt-4 mt-6">
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium">Total:</span>
              <span className="text-xl font-bold">${total.toFixed(2)}</span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-6 rounded-md text-white font-medium ${
                isLoading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? 'Processing...' : 'Continue to Checkout'}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      )}
    </form>
  );
}
