export const EVENT_NAVS = [
    {
      eventId: 1, // This should match the event ID from EVENTS
      items: [
        {
          label: 'About',
          path: '/',
          subItems: [
            { label: 'FAQs', path: 'faqs' },
            { label: 'Venue', path: 'venue' },
            { label: 'Event Recap', path: 'event-recap' },
          ],
        },
        { label: 'Agenda', path: 'agenda' },
        { label: 'Speakers', path: 'speakers' },
        { label: 'Sponsorship', path: 'sponsor' },
      ],
    },
    // Add more event-specific navigation items here
  ];
  