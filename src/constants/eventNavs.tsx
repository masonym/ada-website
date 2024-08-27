export const EVENT_NAVS = [
  {
    eventId: 1, // This should match the event ID from EVENTS
    items: [
      { label: 'Home', path: '/' },
      {
        label: 'About',
        subItems: [
          { label: 'About the Event', path: 'about' },
          { label: 'Location & Venue', path: 'venue' },
          { label: 'FAQs', path: 'faqs' },
          { label: 'Event Recap', path: 'event-recap' },
        ],
      },
      { label: 'Agenda', path: 'agenda' },
      { label: 'Speakers', path: 'speakers' },
      {
        label: 'Sponsors',
        subItems: [
          { label: "Sponsorship Opportunities", path: 'sponsor' }
        ],
      },
    ],
  },
  // Add more event-specific navigation items here
];
