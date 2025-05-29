import type { AttendeeInfo as EventRegAttendeeInfo } from '@/types/event-registration/registration';

interface AttendeeFormProps {
  registrationId: string;
  attendee: EventRegAttendeeInfo;
  index: number;
  onChange: (registrationId: string, index: number, field: keyof EventRegAttendeeInfo, value: string) => void;
  errors?: Record<string, string>;
}

export const AttendeeForm: React.FC<AttendeeFormProps> = ({
  registrationId,
  attendee,
  index,
  onChange,
  errors = {},
}) => {
  const fieldError = (field: string) => errors[`attendees.${index}.${field}`];

  return (
    <div className="space-y-4 border-t border-gray-200 pt-4">
      <h4 className="text-md font-medium">Attendee {index + 1}</h4>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor={`${registrationId}-firstName-${index}`}
            className="block text-sm font-medium text-gray-700"
          >
            First Name *
          </label>
          <input
            type="text"
            id={`${registrationId}-firstName-${index}`}
            value={attendee.firstName}
            onChange={(e) =>
              onChange(registrationId, index, 'firstName', e.target.value)
            }
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              fieldError('firstName') ? 'border-red-500' : ''
            }`}
            required
          />
          {fieldError('firstName') && (
            <p className="mt-1 text-sm text-red-600">{fieldError('firstName')}</p>
          )}
        </div>
        <div>
          <label
            htmlFor={`${registrationId}-lastName-${index}`}
            className="block text-sm font-medium text-gray-700"
          >
            Last Name *
          </label>
          <input
            type="text"
            id={`${registrationId}-lastName-${index}`}
            value={attendee.lastName}
            onChange={(e) =>
              onChange(registrationId, index, 'lastName', e.target.value)
            }
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              fieldError('lastName') ? 'border-red-500' : ''
            }`}
            required
          />
          {fieldError('lastName') && (
            <p className="mt-1 text-sm text-red-600">{fieldError('lastName')}</p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor={`${registrationId}-email-${index}`}
            className="block text-sm font-medium text-gray-700"
          >
            Email *
          </label>
          <input
            type="email"
            id={`${registrationId}-email-${index}`}
            value={attendee.email}
            onChange={(e) =>
              onChange(registrationId, index, 'email', e.target.value)
            }
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              fieldError('email') ? 'border-red-500' : ''
            }`}
            required
          />
          {fieldError('email') && (
            <p className="mt-1 text-sm text-red-600">{fieldError('email')}</p>
          )}
        </div>
        <div>
          <label
            htmlFor={`${registrationId}-phone-${index}`}
            className="block text-sm font-medium text-gray-700"
          >
            Phone
          </label>
          <input
            type="tel"
            id={`${registrationId}-phone-${index}`}
            value={attendee.phone}
            onChange={(e) =>
              onChange(registrationId, index, 'phone', e.target.value)
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor={`${registrationId}-jobTitle-${index}`}
            className="block text-sm font-medium text-gray-700"
          >
            Job Title
          </label>
          <input
            type="text"
            id={`${registrationId}-jobTitle-${index}`}
            value={attendee.jobTitle}
            onChange={(e) =>
              onChange(registrationId, index, 'jobTitle', e.target.value)
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label
            htmlFor={`${registrationId}-company-${index}`}
            className="block text-sm font-medium text-gray-700"
          >
            Company
          </label>
          <input
            type="text"
            id={`${registrationId}-company-${index}`}
            value={attendee.company}
            onChange={(e) =>
              onChange(registrationId, index, 'company', e.target.value)
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>
    </div>
  );
};
