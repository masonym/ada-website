export type SponsorTier = {
    name: string;  // e.g., "Gold", "Silver", "Bronze"
    description?: string;
    style?: string;  // Tailwind classes for styling the tier label
    sponsors: Sponsor[];
};

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
    tiers: SponsorTier[];
};

export const EVENT_SPONSORS: EventSponsors[] = [
    {
        id: 3, // Matches the event ID from events.ts
        title: "Our Sponsors and Partners",
        tiers: [
            {
                name: "Gold Sponsors",
                style: "bg-amber-400 text-slate-900",
                sponsors: [
                    {
                        name: "Lockheed Martin",
                        logo: "/events/2025DTIOS/sponsors/lockheed-martin.png",
                        website: "https://www.lockheedmartin.com/",
                        width: 720,
                        height: 128,
                    }
                ],
            },
            {
                name: "Silver Sponsors",
                style: "bg-gray-300 text-slate-900",
                sponsors: [
                    {
                        name: "Anamo",
                        logo: "/events/2025DTIOS/sponsors/anamo.png",
                        website: "https://anamo.io/",
                        width: 200,
                        height: 120,
                    },
                    {
                        name: "US ProTech",
                        logo: "/events/2025DTIOS/sponsors/usprotech.png",
                        website: "https://www.usprotech.com/",
                        width: 126,
                        height: 37.5,
                    }
                ],
            },
            {
                name: "Event Partners",
                style: "bg-navy-800 text-white", // Custom styling for organizers
                sponsors: [
                    {
                        name: "National Association of Spaceports",
                        logo: "/events/2025DTIOS/sponsors/nass-logo.png",
                        website: "https://www.thenass.org/",
                        width: 400,
                        height: 133,
                    },
                    {
                        name: "American Defense Alliance",
                        logo: "/logo.png",
                        website: "https://www.americandefensealliance.org",
                        width: 150,
                        height: 150,
                    },
                    {
                        name: "The Astronauts Memorial Foundation",
                        logo: "/events/2025DTIOS/sponsors/amf-logo.png",
                        website: "https://www.amfcse.org",
                        width: 150,
                        height: 150,
                    },
                    {
                        name: "Zarrellas Italian & Wood Fired Pizza",
                        logo: "/events/2025DTIOS/sponsors/zarrellas.png",
                        website: "https://www.zarrellasitalian.com/",
                        width: 150,
                        height: 150,
                    }
                ]
            },
        ]
    }
];