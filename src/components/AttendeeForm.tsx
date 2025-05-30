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
  onCopyFrom: (sourceIndex: number) => void;
  totalAttendees: number;
}

export const AttendeeForm: React.FC<AttendeeFormProps> = ({
  index,
  attendee,
  onChange,
  onCopyFrom,
  totalAttendees
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
    const sourceIndex = parseInt(e.target.value);
    if (!isNaN(sourceIndex)) {
      onCopyFrom(sourceIndex);
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
        {index > 0 && totalAttendees > 1 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Copy from:</span>
            <select 
              className="border rounded px-2 py-1 text-sm"
              onChange={handleCopyFromChange}
              value=""
            >
              <option value="">Select attendee</option>
              {Array.from({ length: index }).map((_, i) => (
                <option key={i} value={i}>Attendee {i + 1}</option>
              ))}
            </select>
            <Copy className="w-4 h-4 text-gray-500" />
          </div>
        )}
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input
            type="email"
            className="w-full border rounded px-3 py-2"
            name="email"
            value={attendee.email}
            onChange={handleChange}
            required
          />
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
