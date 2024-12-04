import { EventSpecialFeatures } from '@/types/specialFeatures';


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
          description: "Mix and Mingle with our Guest Star Astronauts and other VIP Guests at Zarrella's Italian & Wood Fired Pizza in Cape Canaveral, FL while Sampling Select Smooth Bourbons.",
          specialGuest: {
            name: "Robert Clyde Springer", // Replace with actual guest name
            title: "Astronaut", // Optional title
            photo: "robert_springer.webp", // Replace with actual photo URL
            bio: "Robert Clyde Springer is a retired American astronaut and test pilot who flew as a mission specialist on two NASA Space Shuttle missions in 1989 and 1990. He is a decorated aviator in the United States Marine Corps who also flew more than 500 combat sorties during the Vietnam War. He has logged over 237 hours in space and 4,500 hours flying time, including 3,500 hours in jet aircraft." // Replace with actual bio
          }
        }
      ],
      additionalPerks: [
        "Each Conference Registration includes (1) Complimentary Pass to the Kennedy Space Center's Visitor Center Attractions"
      ]
    }
  ];