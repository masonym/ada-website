'use client';

import { useState } from 'react';
import { attendeePassTemplate, vipAttendeePassTemplate, exhibitorTemplate, sponsorTemplate, generateOrderSummaryHtml } from '@/lib/email/templates';
import { VipNetworkingReception } from '@/types/events';

// Mock data for the email templates
const mockData = {
  firstName: 'John',
  eventName: 'Annual Defense Summit 2025',
  eventDate: 'October 26-28, 2025',
  eventLocation: 'The Ritz-Carlton, Pentagon City, Arlington, VA',
  eventUrl: 'https://americandefensealliance.org/events/annual-defense-summit-2025',
  orderId: 'pi_1234567890',
  hotelInfo: 'https://americandefensealliance.org/events/annual-defense-summit-2025/about/venue-and-lodging',
  eventImage: '/images/events/2025-summit-banner.png',
  vipPerks: [
    'Priority seating',
    'Access to VIP reception',
    'Exclusive networking opportunities',
    'Special gift bag'
  ],
  sponsorshipLevel: 'Platinum Sponsor',
  sponsorshipPerks: [
    'Logo on all event materials',
    'Speaking opportunity',
    'Exhibit booth',
    '10 complimentary VIP passes'
  ],
  attendeePasses: 4,
  exhibitorType: 'Standard Exhibitor Booth',
  exhibitorInstructions: 'https://example.com/exhibitor-instructions.pdf',
  vipNetworkingReception: {
    title: 'VIP Networking Reception',
    date: 'October 26, 2025',
    timeStart: '6:00 PM',
    timeEnd: '8:00 PM',
    location: 'The Ritz-Carlton Ballroom',
    description: 'An exclusive networking reception for our VIPs, sponsors, and speakers. Enjoy cocktails and hors d\'oeuvres while connecting with key industry leaders.'
  } as VipNetworkingReception,
  orderSummary: {
    orderId: 'pi_1234567890',
    orderDate: new Date().toLocaleDateString(),
    items: [
      { name: 'Platinum Sponsorship', quantity: 1, price: 25000 },
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
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateName>('Standard Attendee');

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
