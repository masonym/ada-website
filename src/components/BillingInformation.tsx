import React from 'react';

interface BillingInformationProps {
  billingInfo: {
    firstName: string;
    lastName: string;
    email: string;
    confirmEmail: string;
  };
  onChange: (field: string, value: string) => void;
}

export const BillingInformation: React.FC<BillingInformationProps> = ({
  billingInfo,
  onChange
}) => {
  return (
    <div className="border rounded-lg p-6 mb-6">
      <h3 className="text-xl font-semibold mb-4">Billing Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={billingInfo.firstName}
            onChange={(e) => onChange('firstName', e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={billingInfo.lastName}
            onChange={(e) => onChange('lastName', e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
          <input
            type="email"
            className="w-full border rounded px-3 py-2"
            value={billingInfo.email}
            onChange={(e) => onChange('email', e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Email Address *</label>
          <input
            type="email"
            className={`w-full border rounded px-3 py-2 ${
              billingInfo.email && billingInfo.confirmEmail && billingInfo.email !== billingInfo.confirmEmail 
                ? 'border-red-500' 
                : ''
            }`}
            value={billingInfo.confirmEmail}
            onChange={(e) => onChange('confirmEmail', e.target.value)}
            required
          />
          {billingInfo.email && billingInfo.confirmEmail && billingInfo.email !== billingInfo.confirmEmail && (
            <p className="text-red-500 text-xs mt-1">Email addresses do not match</p>
          )}
        </div>
      </div>
    </div>
  );
};
