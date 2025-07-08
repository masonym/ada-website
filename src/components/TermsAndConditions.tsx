import React from 'react';

interface TermsAndConditionsProps {
  agreed: boolean;
  onAgree: (agreed: boolean) => void;
}

export const TermsAndConditions: React.FC<TermsAndConditionsProps> = ({
  agreed,
  onAgree
}) => {
  const termsText = `Please note that all event registrations are final upon purchase. We do not offer refunds under any circumstances, including but not limited to personal reasons, scheduling conflicts, or changes in circumstances. However, if you are unable to attend, all registered attendees will receive access to the speaker presentations following the event to the registered email address.

We recognize that unforeseen situations may occur. Therefore, we permit the transfer of your registration to another individual or request for an Event Credit up to one week (7 days) prior to the event date. To request a transfer, please contact our team at info@americandefensealliance.org, providing the full name and contact details of the individual to whom you wish to transfer your registration. All transfer requests must be submitted in writing and are subject to approval.

In the unlikely event that the American Defense Alliance cancels or significantly alters the date of an event, you will be promptly notified. In such cases, you will have the option to transfer your registration to a future event or another individual, but refunds will not be provided. Should you have any questions or need to request a registration transfer, please reach out to our team at info@americandefensealliance.org or (771) 474-1077. By registering for an event with the American Defense Alliance, you acknowledge and agree to this No Refund Policy.

American Defense Alliance reserves the right to use any photograph/video taken at any organized or sponsored event, without the expressed written permission of those included within the photograph/video. American Defense Alliance may use the photograph/video in publications or other media material produced, used or contracted by the American Defense Alliance including but not limited to: brochures, invitations, newspapers, magazines, presentations, websites, etc.

A person attending an American Defense Alliance event who does not wish to have their image recorded for distribution should make their wishes known to the photographer, and/or the event organizers at info@americandefensealliance.org

By participating in an American Defense Alliance event or by failing to notify the American Defense Alliance, in writing, your desire to not have your photograph used by the American Defense Alliance, you are agreeing to release, hold harmless and indemnify the American Defense Alliance from any and all claims involving the use of your picture or likeness.`;

  return (
    <div className="border rounded-lg p-6 mb-6">
      <h3 className="text-xl font-semibold mb-4">Terms & Conditions</h3>
      <div className="border rounded p-4 h-40 overflow-y-auto mb-4 text-sm bg-gray-200">
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
