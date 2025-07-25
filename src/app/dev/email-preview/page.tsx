'use client';

import { useState } from 'react';
import { attendeePassTemplate, vipAttendeePassTemplate, exhibitorTemplate, sponsorTemplate, generateOrderSummaryHtml, govMilPassTemplate, AttendeeDetails, generateAttendeeDetailsHtml } from '@/lib/email/templates';
import { VipNetworkingReception } from '@/types/events';

// Mock data for the email templates
const mockData = {
  firstName: 'John',
  eventName: '2025 Navy Marine Corps Procurement Conference',
  eventDate: 'July 29-30, 2025',
  eventLocation: '235 E Main St, Norfolk, Virginia 23510',
  venueName: 'Norfolk Waterside Marriott',
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
  exhibitorInstructions: '/events/2025NMCPC/2025%20Navy%20&%20Marine%20Corps%20Procurement%20Conference%20-%20Exhibitor%20Instructions.pdf',
    vipReception: {
      title: "VIP Networking Reception",
      date: "July 29, 2025",
      timeStart: "6:00 PM",
      timeEnd: "8:00 PM",
      description: "The VIP Networking Reception is available to all Speakers, Sponsors, Exhibitors, VIP Attendee Passes, and Special Guests.",
      additionalInfo: "Join us for the VIP Networking Reception at The Harbor Club featuring a cash bar, one complimentary drink ticket, and a selection of hors d’oeuvres.",
      locationName: "The Harbor Club",
      locationAddress: "333 Waterside Dr Suite 200, Norfolk, VA 23510, USA",
      placeId: "ChIJI8LspwuYuokR79KzVtIGqlY", // Google Maps Place ID for the reception venue
      eventPlaceId: "ChIJBdD-jwuYuokRyjyu_hU0jUg", // Google Maps Place ID for the main event venue
      eventLocationName: "Norfolk Waterside Marriott", // Optional name for the main event location
      locationPhoto: "/locations/harbor_club.webp",
      locationPhone: "(757) 426-7433",
      website: "https://watersidedistrict.com/private-events/the-harbor-club",
    } as VipNetworkingReception,
  orderSummary: {
    orderId: 'pi_1234567890',
    orderDate: new Date().toLocaleDateString(),
    items: [
      { name: 'Platinum Sponsorship', quantity: 1, price: 10000 },
      { name: 'VIP Attendee Pass', quantity: 2, price: 550 },
    ],
    subtotal: 11100,
    discount: 0,
    total: 11100,
  },
  attendees: [
    {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      company: 'Acme Corporation',
      jobTitle: 'Chief Technology Officer',
      phone: '(555) 123-4567',
      website: 'https://example.com',
      businessSize: 'Large Business',
      industry: 'Defense',
    },
    {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      company: 'Tech Innovations LLC',
      jobTitle: 'Director of Operations',
      phone: '(555) 987-6543',
      website: 'https://techinnovations.example.com',
      businessSize: 'Small Business',
      sbaIdentification: 'WOSB',
      industry: 'Aerospace',
    }
  ],
    vipNetworkingReception: {
      title: "VIP Networking Reception",
      date: "July 29, 2025",
      timeStart: "6:00 PM",
      timeEnd: "8:00 PM",
      description: "The VIP Networking Reception is available to all Speakers, Sponsors, Exhibitors, VIP Attendee Passes, and Special Guests.",
      additionalInfo: "Join us at The Harbor Club featuring a cash bar, one complimentary drink ticket, and a selection of hors d’oeuvres.",
      locationName: "The Harbor Club",
      locationAddress: "333 Waterside Dr Suite 200, Norfolk, VA 23510, USA",
      placeId: "ChIJI8LspwuYuokR79KzVtIGqlY", // Google Maps Place ID for the reception venue
      eventPlaceId: "ChIJBdD-jwuYuokRyjyu_hU0jUg", // Google Maps Place ID for the main event venue
      eventLocationName: "Norfolk Waterside Marriott", // Optional name for the main event location
      locationPhoto: "/locations/harbor_club.webp",
      locationPhone: "(757) 426-7433",
      website: "https://watersidedistrict.com/private-events/the-harbor-club",
    } as VipNetworkingReception
};

const orderSummaryHtml = generateOrderSummaryHtml(mockData.orderSummary);
const attendeeDetailsHtml = generateAttendeeDetailsHtml(mockData.attendees);

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
  'VIP Networking Reception Sponsor',
  'Networking Luncheon Sponsor'
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
              attendeeDetailsHtml,
            } : {
              ...mockData,
              orderSummaryHtml,
              attendeeDetailsHtml,
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
