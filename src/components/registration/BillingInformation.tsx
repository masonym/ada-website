import { BillingInfo } from '@/types/registration';

interface BillingInformationProps {
  billingInfo: BillingInfo;
  formErrors: Record<string, string>;
  onChange: (field: keyof BillingInfo, value: string | boolean) => void;
}

export const BillingInformation: React.FC<BillingInformationProps> = ({
  billingInfo,
  formErrors,
  onChange,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Billing Information</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            First Name *
          </label>
          <input
            type="text"
            id="firstName"
            value={billingInfo.firstName}
            onChange={(e) => onChange('firstName', e.target.value)}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              formErrors.firstName ? 'border-red-500' : ''
            }`}
            required
          />
          {formErrors.firstName && (
            <p className="mt-1 text-sm text-red-600">{formErrors.firstName}</p>
          )}
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
            Last Name *
          </label>
          <input
            type="text"
            id="lastName"
            value={billingInfo.lastName}
            onChange={(e) => onChange('lastName', e.target.value)}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              formErrors.lastName ? 'border-red-500' : ''
            }`}
            required
          />
          {formErrors.lastName && (
            <p className="mt-1 text-sm text-red-600">{formErrors.lastName}</p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email *
          </label>
          <input
            type="email"
            id="email"
            value={billingInfo.email}
            onChange={(e) => onChange('email', e.target.value)}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              formErrors.email ? 'border-red-500' : ''
            }`}
            required
          />
          {formErrors.email && (
            <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
          )}
        </div>
        <div>
          <label htmlFor="confirmEmail" className="block text-sm font-medium text-gray-700">
            Confirm Email *
          </label>
          <input
            type="email"
            id="confirmEmail"
            value={billingInfo.confirmEmail}
            onChange={(e) => onChange('confirmEmail', e.target.value)}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              formErrors.confirmEmail ? 'border-red-500' : ''
            }`}
            required
          />
          {formErrors.confirmEmail && (
            <p className="mt-1 text-sm text-red-600">{formErrors.confirmEmail}</p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone *
          </label>
          <input
            type="tel"
            id="phone"
            value={billingInfo.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700">
            Company *
          </label>
          <input
            type="text"
            id="company"
            value={billingInfo.company}
            onChange={(e) => onChange('company', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>
      </div>
    </div>
  );
};
