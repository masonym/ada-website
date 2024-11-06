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
          logo: "/events/2025DTIOS/sponsors/nass-logo.png",
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
          logo: "/events/2025DTIOS/sponsors/amf-logo.png",
          website: "https://www.amfcse.org",
          width: 150,
          height: 150
        },
        {
            name: "Zarrellas Italian & Wood Fired Pizza",
            logo: "/events/2025DTIOS/sponsors/zarrellas.png",
        }
      ]
    }
    // Add more event sponsor groups as needed
  ];