import { ModalRegistrationType } from '@/types/registration';

interface RegistrationSummaryProps {
  selectedRegistration: Record<string, number>;
  registrations: ModalRegistrationType[];
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const RegistrationSummary: React.FC<RegistrationSummaryProps> = ({
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
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Order Summary</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          {Object.entries(selectedRegistration).map(([id, quantity]) => {
            const registration = registrations.find((r) => r.id === id);
            if (!registration || quantity <= 0) return null;
            
            return (
              <div key={id} className="flex justify-between py-2">
                <div>
                  <p className="font-medium">{registration.name}</p>
                  <p className="text-sm text-gray-600">Qty: {quantity}</p>
                </div>
                <p className="font-medium">
                  ${(registration.price * quantity).toFixed(2)}
                </p>
              </div>
            );
          })}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="flex justify-between font-medium">
              <p>Total</p>
              <p>${totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          disabled={isSubmitting}
        >
          Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Processing...' : 'Complete Registration'}
        </button>
      </div>
    </div>
  );
};
