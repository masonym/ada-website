'use client';

import { useState } from 'react';
import { attendeePassTemplate, vipAttendeePassTemplate, exhibitorTemplate, sponsorTemplate, generateOrderSummaryHtml } from '@/lib/email/templates';
import { VipNetworkingReception } from '@/types/events';

// Mock data for the email templates
const mockData = {
  firstName: 'John',
  eventName: '2025 Navy Marine Corps Procurement Conference',
  eventDate: 'October 26-28, 2025',
  eventLocation: 'The Ritz-Carlton, Pentagon City, Arlington, VA',
  eventUrl: 'https://americandefensealliance.org/events/2025-navy-marine-corps-procurement-conference',
  orderId: 'pi_1234567890',
  hotelInfo: 'https://americandefensealliance.org/events/2025-navy-marine-corps-procurement-conference/about/venue-and-lodging',
  eventImage: '/2025NMCPC_wide.webp',
  vipPerks: [
    'Priority seating',
    'Access to VIP reception',
    'Exclusive networking opportunities',
    'Special gift bag'
  ],
  sponsorshipLevel: 'Platinum Sponsor',
matchmakingSessions: {
      signUpTime: "7:30 AM",
      signUpDate: "July 29, 2025",
      sessionDurationMinutes: 10,
      slotsPerHost: 9,
      sessions: [
        {
          date: "July 29",
          sessionTime: "4:00 PM - 5:30 PM",
        },
        {
          date: "July 30",
          sessionTime: "12:30 PM - 1:30 PM",
        },
      ]
    },

  // TODO: is this passed in normally? idk
  attendeePasses: 4,
  exhibitorType: 'Standard Exhibitor Booth',
  exhibitorInstructions: 'https://americandefensealliance.org/events/2025-navy-marine-corps-procurement-conference/about/exhibitor-instructions',
  vipNetworkingReception: {
      title: "VIP Networking Reception",
      description: "The VIP Networking Reception is available to all Speakers, Sponsors, Exhibitors, VIP Attendee Passes, and Special Guests. The Reception will take place on July 29, 2025 from 6:00 PM - 8:00 PM at The Harbor Club located at 333 Waterside Dr. Suite 200, Norfolk, VA 23510. It is a short walking distance from the Norfolk Waterside Marriott.",
      date: "July 29, 2025",
      timeStart: "6:00 PM",
      timeEnd: "8:00 PM",
      location: "The Harbor Club, Norfolk, VA",
      additionalInfo: "It is a short walking distance from the Norfolk Waterside Marriott."
    } as VipNetworkingReception,
  orderSummary: {
    orderId: 'pi_1234567890',
    orderDate: new Date().toLocaleDateString(),
    items: [
      { name: 'Bronze Sponsorship', quantity: 1, price: 25000 },
      { name: 'Additional VIP Pass', quantity: 2, price: 999 },
    ],
    subtotal: 26998,
    discount: 0,
    total: 26998,
  }
};

const orderSummaryHtml = generateOrderSummaryHtml(mockData.orderSummary);

const templates = {
  'Standard Attendee': attendeePassTemplate({
    ...mockData,
    orderSummaryHtml,
  }),
  'VIP Attendee': vipAttendeePassTemplate({
    ...mockData,
    orderSummaryHtml,
  }),
  'Exhibitor': exhibitorTemplate({
    ...mockData,
    orderSummaryHtml,
  }),
  'Sponsor': sponsorTemplate({
    ...mockData,
    orderSummaryHtml,
  }),
};

type TemplateName = keyof typeof templates;

export default function EmailPreviewPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateName>('Sponsor');

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Email Template Preview</h1>
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="template-select" style={{ marginRight: '10px' }}>Select a template:</label>
        <select
          id="template-select"
          value={selectedTemplate}
          onChange={(e) => setSelectedTemplate(e.target.value as TemplateName)}
          style={{ padding: '8px', fontSize: '16px' }}
        >
          {Object.keys(templates).map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>
      <div style={{ border: '1px solid #ccc', height: '80vh' }}>
        <iframe
          srcDoc={templates[selectedTemplate]}
          title="Email Preview"
          width="100%"
          height="100%"
          style={{ border: 'none' }}
        />
      </div>
    </div>
  );
}
