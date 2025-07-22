"use client";

import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface EventWarningNoticeProps {
  eventTitle: string;
}

const EventWarningNotice: React.FC<EventWarningNoticeProps> = ({ eventTitle }) => {
  return (
    <div className="my-4 w-full max-w-4xl mx-auto">
      <div className="bg-amber-50 border-l-4 border-amber-500 rounded-md shadow-md overflow-hidden">
        <div className="p-4 sm:p-6">
          <div className="flex items-center mb-3">
            <AlertTriangle className="h-6 w-6 text-amber-500 mr-2" />
            <h3 className="text-lg sm:text-xl font-semibold text-amber-800">
              Important Notice: Beware of Unauthorized Solicitations
            </h3>
          </div>
          
          <div className="text-amber-700 space-y-3">
            <p>
              The American Defense Alliance does not sell, rent, or publicly publish attendee list 
              information for any of its events, including the {eventTitle} or any affiliated programs. Any claims offering access to attendee or contact 
              lists are fraudulent. Please do not engage with or respond to these solicitations.
            </p>
            
            <p>
              Furthermore, all official communication from the American Defense Alliance will only come 
              from email addresses ending in <span className="font-medium">@americandefensealliance.org</span>. 
              If you receive a message from another domain claiming to represent our organization, we 
              recommend that you disregard it and report it to us.
            </p>
            
            <div className="pt-2 border-t border-amber-200 mt-4">
              <p className="font-medium">
                Thank you for your continued support!<br />
                American Defense Alliance
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventWarningNotice;
