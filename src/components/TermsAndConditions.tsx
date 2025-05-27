import React from 'react';

interface TermsAndConditionsProps {
  agreed: boolean;
  onAgree: (agreed: boolean) => void;
}

export const TermsAndConditions: React.FC<TermsAndConditionsProps> = ({
  agreed,
  onAgree
}) => {
  const termsText = `
    TERMS AND CONDITIONS

    1. Registration and Payment
    All registrations are subject to availability and will be confirmed via email. Payment must be made in full at the time of registration.

    2. Cancellation Policy
    Cancellations received in writing more than 30 days before the event will receive a full refund, less a $50 administrative fee. No refunds will be given for cancellations received within 30 days of the event.

    3. Substitutions
    Substitutions of attendees may be made at any time by contacting the event organizers.

    4. Event Changes
    The organizers reserve the right to make changes to the event program, speakers, or venue if necessary. In the unlikely event of cancellation, liability will be limited to the registration fee paid.

    5. Data Protection
    By registering for this event, you agree that your contact details may be shared with event sponsors and partners. You can opt out of this by contacting the organizers.

    6. Photography and Recording
    Please be advised that photographs and video may be taken during the event for use in future marketing materials. If you do not wish to be photographed, please inform the event staff.

    7. Code of Conduct
    All attendees are expected to behave professionally and respectfully towards other attendees, speakers, and staff. The organizers reserve the right to remove any attendee who violates this code of conduct.
  `;

  return (
    <div className="border rounded-lg p-6 mb-6">
      <h3 className="text-xl font-semibold mb-4">Terms & Conditions</h3>
      <div className="border rounded p-4 h-40 overflow-y-auto mb-4 text-sm bg-gray-50">
        <pre className="whitespace-pre-wrap font-sans">{termsText.trim()}</pre>
      </div>
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id="terms"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            checked={agreed}
            onChange={(e) => onAgree(e.target.checked)}
            required
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="terms" className="font-medium text-gray-700">
            I have read and agree to the Terms & Conditions *
          </label>
        </div>
      </div>
    </div>
  );
};
