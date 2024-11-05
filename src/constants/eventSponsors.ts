export type Sponsor = {
    name: string;
    logo: string;
    website?: string;
    description?: string;
    width?: number;
    height?: number;
    priority?: boolean;
  };
  
  export type EventSponsors = {
    id: number;
    title?: string;
    description?: string;
    sponsors: Sponsor[];
  };
  
  export const EVENT_SPONSORS: EventSponsors[] = [
    {
      id: 3, // Matches the event ID from events.ts
      title: "Sponsors and Event Partners",
      sponsors: [
        {
          name: "National Association of Spaceports",
          logo: "/logos/nass-logo.png",
          website: "https://www.thenass.org/",
          width: 400,
          height: 133
        },
        {
          name: "American Defense Alliance",
          logo: "/logo.png",
          website: "https://www.americandefensealliance.org",
          width: 150,
          height: 150
        },
        {
          name: "The Astronauts Memorial Foundation",
          logo: "/logos/amf-logo.png",
          website: "https://www.amfcse.org",
          width: 150,
          height: 150
        }
      ]
    }
    // Add more event sponsor groups as needed
  ];