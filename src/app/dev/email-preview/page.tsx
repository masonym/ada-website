'use client';

import { useState } from 'react';
import { attendeePassTemplate, vipAttendeePassTemplate, exhibitorTemplate, sponsorTemplate, generateOrderSummaryHtml, govMilPassTemplate } from '@/lib/email/templates';
import { VipNetworkingReception } from '@/types/events';

// Mock data for the email templates
const mockData = {
  firstName: 'John',
  eventName: '2025 Navy Marine Corps Procurement Conference',
  eventDate: 'July 29-30, 2025',
  eventLocation: '235 E Main St, Norfolk, Virginia 23510',
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

// Define template functions that can be called with dynamic data
const templateFunctions = {
  'Standard Attendee': (data: any) => attendeePassTemplate(data),
  'VIP Attendee': (data: any) => vipAttendeePassTemplate(data),
  'Exhibitor': (data: any) => exhibitorTemplate(data),
  'Sponsor': (data: any) => sponsorTemplate(data),
  'Gov/Mil Pass': (data: any) => govMilPassTemplate(data),
};

const sponsorLevels = [
  'Small Business Sponsor',
  'Small Business Sponsor without Exhibit Space',
  'Bronze Sponsor',
  'Silver Sponsor',
  'Gold Sponsor',
  'Platinum Sponsor',
]

type TemplateName = keyof typeof templateFunctions;
type SponsorLevel = typeof sponsorLevels[number];


export default function EmailPreviewPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateName>('Sponsor');
  const [selectedSponsorLevel, setSelectedSponsorLevel] = useState<SponsorLevel>('Small Business Sponsor');

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Email Template Preview</h1>
      <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <label htmlFor="template-select" style={{ marginRight: '10px' }}>Select a template:</label>
        <select
          id="template-select"
          value={selectedTemplate}
          onChange={(e) => setSelectedTemplate(e.target.value as TemplateName)}
          style={{ padding: '8px', fontSize: '16px' }}
        >
          {Object.keys(templateFunctions).map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        {selectedTemplate === 'Sponsor' && (
          <>
            <label htmlFor="sponsor-select" style={{ marginRight: '10px' }}>Select a sponsor level:</label>
            <select
              id="sponsor-select"
              value={selectedSponsorLevel}
              onChange={(e) => setSelectedSponsorLevel(e.target.value as SponsorLevel)}
          style={{ padding: '8px', fontSize: '16px' }}
        >
          {sponsorLevels.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
          </>
        )}
      </div>
      <div style={{ border: '1px solid #ccc', height: '80vh' }}>
        <iframe
          srcDoc={templateFunctions[selectedTemplate](
            // Only update sponsorshipLevel when selectedTemplate is 'Sponsor'
            selectedTemplate === 'Sponsor' ? {
              ...mockData,
              sponsorshipLevel: selectedSponsorLevel,
              orderSummaryHtml,
            } : {
              ...mockData,
              orderSummaryHtml,
            }
  )}
          title="Email Preview"
          width="100%"
          height="100%"
          style={{ border: 'none' }}
        />
      </div>
    </div>
  );
}
