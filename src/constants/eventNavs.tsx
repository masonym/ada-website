import path from "path";

export const EVENT_NAVS = [
  {
    eventId: 1, // This should match the event ID from EVENTS
    items: [
      { label: 'Event Overview', path: '/' },
      {
        label: 'About',
        subItems: [
          { label: 'About the Event', path: 'about-the-event' },
          { label: 'Location & Parking', path: 'venue' },
          { label: 'FAQs', path: 'faqs' },
          { label: 'Event Recap', path: 'event-recap' },
        ],
      },
      { label: 'Agenda', path: 'agenda' },
      { label: 'Speakers', path: 'speakers' },
      {
        label: 'Sponsors & Exhibitors',
        subItems: [
          { label: "Sponsorship Opportunities", path: 'sponsorship-opportunities' },
          { label: "Exhibitor Opportunities", path: 'exhibitor-opportunities' },
        ],
      },
    ],
  },
  {
    eventId: 2, // 2025SDPC
    items: [
      { label: 'Event Overview', path: '/' },
      {
        label: 'About',
        subItems: [
          { label: 'About the Event', path: 'about-the-event' },
          { label: 'Matchmaking Sessions', path: 'matchmaking-sessions' },
          { label: 'FAQs', path: 'faqs' },
          { label: 'Event Recap', path: 'event-recap' },
        ],
      },
      { label: 'Venue & Lodging', path: 'venue-and-lodging' },
      { label: 'Agenda', path: 'agenda' },
      { label: 'Speakers', path: 'speakers' },
      {
        label: 'Sponsors & Exhibitors',
        subItems: [
          { label: "Sponsorship Opportunities", path: 'sponsorship-opportunities' },
          { label: "Exhibitor Opportunities", path: 'exhibitor-opportunities' },
        ],
      },
    ],
  },
  {
    eventId: 3, // 2025DTIOS
    items: [
      { label: 'Event Overview', path: '/' },
      {
        label: 'About',
        subItems: [
          { label: 'Hotel Lodging', path: 'lodging' },
          { label: 'Location & Parking', path: 'venue' },
        ],
      },
      { label: 'Agenda', path: 'agenda' },
      { label: 'Speakers', path: 'speakers' },
      {
        label: 'Sponsors & Exhibitors',
        subItems: [
          { label: "Sponsor Prospectus", path: 'sponsorship-opportunities' },
          // { label: "Exhibitor Opportunities", path: 'exhibitor-opportunities' },
        ],
      },
    ],
  },
  {
    eventId: 4, // 2025NMCPC
    items: [
      { label: 'Event Overview', path: '/' },
      {
        label: 'About',
        subItems: [
          { label: 'About the Event', path: 'about-the-event' },
          { label: 'Matchmaking Sessions', path: 'matchmaking-sessions' },
          { label: "VIP Networking Reception", path: 'vip-networking-reception' },
          { label: 'FAQs', path: 'faqs' },
          { label: 'Event Recap', path: 'event-recap' },
        ],
      },
      { label: 'Venue & Lodging', path: '/venue-and-lodging' },
      { label: 'Agenda', path: 'agenda' },
      { label: 'Speakers', path: 'speakers' },
      {
        label: 'Sponsors & Exhibitors',
        subItems: [
          { label: "Sponsorship Opportunities", path: 'sponsorship-opportunities' },
          { label: "Exhibitor Opportunities", path: 'exhibitor-opportunities' },
        ],
      },
    ],
  },
  {
    eventId: 5, // 2025DTAPC
    items: [
      { label: 'Event Overview', path: '/' },
      {
        label: 'About',
        subItems: [
          { label: 'About the Event', path: 'about-the-event' },
          { label: 'Matchmaking Sessions', path: 'matchmaking-sessions' },
          { label: "VIP Networking Reception", path: 'vip-networking-reception' },
          { label: 'FAQs', path: 'faqs' },
          { label: 'Event Recap', path: 'event-recap' },
        ],
      },
      { label: 'Venue & Lodging', path: '/venue-and-lodging' },
      { label: 'Agenda', path: 'agenda' },
      { label: 'Speakers', path: 'speakers' },
      {
        label: 'Sponsors & Exhibitors',
        subItems: [
          { label: "Sponsorship Opportunities", path: 'sponsorship-opportunities' },
          { label: "Exhibitor Opportunities", path: 'exhibitor-opportunities' },
        ],
      },
    ],
  },
  {
    eventId: 6, // 2026NMCPC
    items: [
      { label: 'Event Overview', path: '/' },
      {
        label: 'About',
        subItems: [
          { label: 'About the Event', path: 'about-the-event' },
          { label: 'Matchmaking Sessions', path: 'matchmaking-sessions' },
          { label: "VIP Networking Reception", path: 'vip-networking-reception' },
          { label: 'FAQs', path: 'faqs' },
          { label: 'Event Recap', path: 'event-recap' },
        ],
      },
      { label: 'Venue & Lodging', path: '/venue-and-lodging' },
      { label: 'Agenda', path: 'agenda' },
      { label: 'Speakers', path: 'speakers' },
      {
        label: 'Sponsors & Exhibitors',
        subItems: [
          { label: "Sponsorship Opportunities", path: 'sponsorship-opportunities' },
          { label: "Exhibitor Opportunities", path: 'exhibitor-opportunities' },
        ],
      },
    ],
  },
  {
    eventId: 7, // 2026AFSFPC
    items: [
      { label: 'Event Overview', path: '/' },
      {
        label: 'About',
        subItems: [
          { label: 'About the Event', path: 'about-the-event' },
          { label: 'Matchmaking Sessions', path: 'matchmaking-sessions' },
          { label: "VIP Networking Reception", path: 'vip-networking-reception' },
          { label: 'FAQs', path: 'faqs' },
          { label: 'Event Recap', path: 'event-recap' },
        ],
      },
      { label: 'Venue & Lodging', path: '/venue-and-lodging' },
      { label: 'Agenda', path: 'agenda' },
      { label: 'Speakers', path: 'speakers' },
      {
        label: 'Sponsors & Exhibitors',
        subItems: [
          { label: "Sponsorship Opportunities", path: 'sponsorship-opportunities' },
          { label: "Exhibitor Opportunities", path: 'exhibitor-opportunities' },
        ],
      },
    ],
  },
];
