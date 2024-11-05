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
          location: "Zarrella's Italian & Wood Fired Pizza in Cape Canaveral, FL",
          description: "Mix and mingle with our guest star astronauts while sampling select and smooth bourbons."
        }
      ],
      additionalPerks: [
        "Each conference registration includes one complimentary pass to the KSC's Visitor Center attractions."
      ]
    }
  ];