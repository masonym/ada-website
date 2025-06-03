import React from 'react';
import { X, Copy } from 'lucide-react';

interface AttendeeInfo {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  jobTitle: string;
  phone: string;
  website: string;
  businessSize: string;
  sbaIdentification?: string; // Added for SBA identification
  industry: string;
  sponsorInterest: 'yes' | 'no' | '';
  speakingInterest: 'yes' | 'no' | '';
}

interface AttendeeFormProps {
  index: number;
  attendee: AttendeeInfo;
  onChange: (index: number, field: string, value: string) => void;
  onCopyFrom: (sourceTicketId: string, sourceIndex: number) => void;
  totalAttendees: number;
  allAttendees: {
    ticketId: string;
    ticketName: string;
    attendees: AttendeeInfo[];
  }[];
  currentTicketId: string;
  formErrors?: Record<string, string>; // Add formErrors prop
  isComplimentaryTicket?: boolean; // Add flag for complimentary tickets
}

export const AttendeeForm: React.FC<AttendeeFormProps> = ({
  index,
  attendee,
  onChange,
  onCopyFrom,
  totalAttendees,
  allAttendees,
  currentTicketId,
  formErrors = {},
  isComplimentaryTicket = false
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange(index, name, value);

    // If businessSize is changed and it's not 'Small Business', clear sbaIdentification
    if (name === 'businessSize' && value !== 'Small Business') {
      onChange(index, 'sbaIdentification', '');
    }
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Extract the base field name without the index
    const fieldName = e.target.name.split('-')[0];
    onChange(index, fieldName, e.target.value);
  };
  
  const handleCopyFromChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value) {
      const [ticketId, sourceIndex] = value.split('|');
      const parsedIndex = parseInt(sourceIndex);
      if (!isNaN(parsedIndex)) {
        onCopyFrom(ticketId, parsedIndex);
      }
    }
    e.target.value = ''; // Reset the select
  };
  const businessSizes = [
    'Small Business',
    'Medium-Sized Business',
    'Large-Sized Business',
    'Government Agency',
    'Military Component'
  ];

  const sbaOptions = [
    '8(a) Small Business',
    'HUBZone Small Business',
    'Service-Disabled Veteran-owned Small Business (SDVOSB)',
    'Veteran-owned Small Business (VOSB)',
    'Women-owned Small Business (WOSB)',
    'Other',
  ];

  const industries = [
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Manufacturing',
    'Retail',
    'Hospitality',
    'Other'
  ];

  return (
    <div className="border rounded-lg p-4 mb-4 relative">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Attendee {index + 1}</h3>
        {/* Calculate if there are any attendees to copy from across all ticket types */}
        {(() => {
          // Count all attendees across all ticket types
          const availableAttendees = allAttendees.reduce((count, ticketGroup) => {
            // For each ticket group, count attendees that aren't this one
            const validAttendees = ticketGroup.attendees.filter((_, i) => {
              // Skip self (current ticket + current index)
              return !(ticketGroup.ticketId === currentTicketId && i === index);
            }).length;
            return count + validAttendees;
          }, 0);
          
          // Only show copy option if there are attendees to copy from
          return availableAttendees > 0 ? (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Copy from:</span>
              <select 
                className="border rounded px-2 py-1 text-sm"
                onChange={handleCopyFromChange}
                value=""
              >
                <option value="">Select attendee</option>
                {allAttendees.map(ticketGroup => {
                  // Skip the current attendee
                  const isCurrentTicket = ticketGroup.ticketId === currentTicketId;
                  const attendees = ticketGroup.attendees;
                  
                  // Create a group of options for each ticket type
                  return attendees.map((_, i) => {
                    // Skip self (current ticket + current index)
                    if (isCurrentTicket && i === index) return null;
                    
                    return (
                      <option key={`${ticketGroup.ticketId}-${i}`} value={`${ticketGroup.ticketId}|${i}`}>
                        {ticketGroup.ticketName} - Attendee {i + 1}
                      </option>
                    );
                  }).filter(Boolean);
                })}
              </select>
              <Copy className="w-4 h-4 text-gray-500" />
            </div>
          ) : null;
        })()}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            name="firstName"
            value={attendee.firstName}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            name="lastName"
            value={attendee.lastName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email * {isComplimentaryTicket && <span className="text-xs text-indigo-600">(Government or military email required)</span>}
          </label>
          <input
            type="email"
            className={`w-full border rounded px-3 py-2 ${formErrors[`tickets.${currentTicketId}.attendeeInfo.${index}.email`] ? 'border-red-500' : ''}`}
            name="email"
            value={attendee.email}
            onChange={handleChange}
            required
            placeholder={isComplimentaryTicket ? "Enter .gov or .mil email address" : "Enter email address"}
          />
          {formErrors[`tickets.${currentTicketId}.attendeeInfo.${index}.email`] && (
            <p className="text-red-500 text-xs mt-1">{formErrors[`tickets.${currentTicketId}.attendeeInfo.${index}.email`]}</p>
          )}
          {isComplimentaryTicket && !formErrors[`tickets.${currentTicketId}.attendeeInfo.${index}.email`] && (
            <p className="text-gray-500 text-xs mt-1">Complimentary tickets require a .gov or .mil email address</p>
          )}
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            name="company"
            value={attendee.company}
            onChange={handleChange}
            required
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            name="jobTitle"
            value={attendee.jobTitle}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cell Phone *</label>
          <input
            type="tel"
            className="w-full border rounded px-3 py-2"
            name="phone"
            value={attendee.phone}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
          <input
            type="url"
            className="w-full border rounded px-3 py-2"
            name="website"
            value={attendee.website}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Business Size *</label>
          <select
            className="w-full border rounded px-3 py-2"
            name="businessSize"
            value={attendee.businessSize}
            onChange={handleChange}
            required
          >
            <option value="">Select size</option>
            {businessSizes.map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
        {attendee.businessSize === 'Small Business' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SBA Identification *</label>
            <select
              className="w-full border rounded px-3 py-2"
              name="sbaIdentification"
              value={attendee.sbaIdentification || ''}
              onChange={handleChange}
              required
            >
              <option value="">Select SBA identification</option>
              {sbaOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Industry *</label>
          <select
            className="w-full border rounded px-3 py-2"
            name="industry"
            value={attendee.industry}
            onChange={handleChange}
            required
          >
            <option value="">Select industry</option>
            {industries.map((industry) => (
              <option key={industry} value={industry}>{industry}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Are you interested in becoming a Sponsor or Exhibitor? *
          </label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                name={`sponsorInterest-${index}`}
                value="yes"
                checked={attendee.sponsorInterest === 'yes'}
                onChange={handleRadioChange}
                required={attendee.sponsorInterest === ''}
              />
              <span className="ml-2">Yes, please contact us</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                name={`sponsorInterest-${index}`}
                value="no"
                checked={attendee.sponsorInterest === 'no'}
                onChange={handleRadioChange}
              />
              <span className="ml-2">No</span>
            </label>
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Are you interested in becoming a Speaking Opportunity? *
          </label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                name={`speakingInterest-${index}`}
                value="yes"
                checked={attendee.speakingInterest === 'yes'}
                onChange={handleRadioChange}
                required={attendee.speakingInterest === ''}
              />
              <span className="ml-2">Yes, please contact us</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                name={`speakingInterest-${index}`}
                value="no"
                checked={attendee.speakingInterest === 'no'}
                onChange={handleRadioChange}
              />
              <span className="ml-2">No</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
