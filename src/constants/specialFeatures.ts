type SpecialFeature = {
    title: string;
    date?: string;
    time?: string;
    location?: string;
    description: string;
  };
  

type EventSpecialFeatures = {
    id: number;
    features: SpecialFeature[];
    additionalPerks?: string[];
  };

// Example data structure - this should be moved to a separate data file
export const SPECIAL_FEATURES: EventSpecialFeatures[] = [
    {
      id: 3, // Matches the event ID from events.ts
      features: [
        {
          title: "Meet & Greet Bourbon Tasting with Astronauts",
          date: "Dec 08",
          time: "6:00pm to 8:00pm",
          location: 
          `Zarrella's Italian & Wood Fired Pizza in Cape Canaveral, FL
          <br/>
          8801 Astronaut Blvd, Cape Canaveral, FL 32920
          `,
          description: "Mix and Mingle with our Guest Star Astronauts and other VIP Guests at Zarrella’s Italian & Wood Fired Pizza in Cape Canaveral, FL while Sampling Select Smooth Bourbons."
        }
      ],
      additionalPerks: [
        "Each Conference Registration includes (1) Complimentary Pass to the KSC's Visitor Center Attractions"
      ]
    }
  ];