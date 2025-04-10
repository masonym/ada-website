import { Sponsor } from './sponsors';

export type SponsorTier = {
    id: string;
    name: string;  // e.g., "Gold", "Silver", "Bronze"
    description?: string;
    style?: string;  // Tailwind classes for styling the tier label
    sponsorIds: string[];  // References to sponsor IDs from sponsors.ts
    topTier?: boolean;  // Indicates if this is the highest tier for the event
};

export type EventSponsors = {
    id: number;
    title?: string;
    description?: string;
    tiers: SponsorTier[];
};

export const EVENT_SPONSORS: EventSponsors[] = [
    {
        id: 2,
        title: "Our Sponsors and Partners",
        tiers: [
            {
                id: "platinum",
                name: "Platinum Sponsor",
                sponsorIds: ["modtech-solutions"],
                topTier: true
            },
            {
                id: "silver",
                name: "Silver Sponsor",
                sponsorIds: ["secure-itsm"],
            },
            {
                id: "small-business",
                name: "Small Business Sponsors",
                style: "bg-sb-100 text-slate-900",
                sponsorIds: [
                    "pgi-steel",
                    "deschamps",
                    "zero-waste",
                    "iuvo-systems",
                    "atlas-flags",
                    "itg",
                    "avery-group",
                    "pmb-machine-works",
                    "redstone",
                    "perimeter",
                    "css-energy",
                    "kdm",
                ],
            },
            {
                id: "collaborating-agency",
                name: "Collaborating Agency",
                style: "bg-sb-100 text-slate-900",
                sponsorIds: [
                    "mbda",
                ],
            },
            {
                id: "exhibitors",
                name: "Exhibitors",
                style: "bg-navy-800 text-white", // Custom styling for organizers
                sponsorIds: [
                    "pgi-steel",
                    "imsm",
                    "deschamps",
                    "cmpro",
                    "safe-structure",
                    "hungerford-terry",
                    "dreamseat",
                    "zero-waste",
                    "medava",
                    "iuvo-systems",
                    "atlas-flags",
                    "solid-platforms",
                    "itg",
                    "gt-apex",
                    "national-energy",
                    "modtech-solutions",
                    "precision-resource",
                    "pmb-machine-works",
                    "the-avery-group",
                    "ardmore",
                    "secure-itsm",
                    "redstone",
                    "six-axis",
                    "usace",
                    "perimeter",
                    "foundation-technologies"
                ],
            }
        ]
    },
    {
        id: 3,
        title: "This event is Organized and Presented by",
        tiers: [
            {
                id: "gold",
                name: "Gold Sponsor",
                style: "bg-amber-400 text-slate-900",
                sponsorIds: ["lockheed-martin"],
            },
            {
                id: "silver",
                name: "Silver Sponsors",
                style: "bg-gray-300 text-slate-900",
                sponsorIds: [
                    "anamo",
                    "usprotech",
                    "neat-and-nifty"
                ],
            },
            {
                id: "event-partners",
                name: "Event Partners",
                style: "bg-navy-800 text-white", // Custom styling for organizers
                sponsorIds: [
                    "national-association-of-spaceports",
                    "american-defense-alliance",
                    "the-astronauts-memorial-foundation",
                    "zarrellas-italian-and-wood-fired-pizza"
                ],
            }
        ]
    },
    {
        id: 4, // NMPCPC
        tiers: [
            {
                id: "bronze",
                name: "Bronze Sponsor",
                style: "bg-amber-400 text-slate-900",
                sponsorIds: [
                    "pmb-machine-works",
                ],
            },
            {
                id: "small-business",
                name: "Small Business Sponsors",
                style: "bg-sb-100 text-slate-900",
                sponsorIds: [
                    "zero-waste",
                    "jbc-corp",
                    "cpisys",
                    "normandeau",
                    "us-hazmat-rentals",
                    "hartwood-consulting-group",
                ],
            },
            {
                id: "exhibitors",
                name: "Exhibitors",
                style: "bg-navy-800 text-white", // Custom styling for organizers
                sponsorIds: [
                    "zero-waste",
                    "jbc-corp",
                    "centurion-consulting-group",
                    "cpisys",
                    "unicor",
                    "melrose",
                    "normandeau",
                    "new-wave",
                    "absolute-supply",
                    "advance-safety-equipment",
                    "us-hazmat-rentals",
                    "pmb-machine-works",
                ],
            }
        ]
    }
];

// Helper function to find event sponsors by event ID
export const getEventSponsors = (eventId: number): EventSponsors | undefined => {
    return EVENT_SPONSORS.find(event => event.id === eventId);
};

// Helper function to get sponsors for a specific tier in an event
export const getEventTierSponsors = (eventId: number, tierId: string): string[] => {
    const event = getEventSponsors(eventId);
    if (!event) return [];

    const tier = event.tiers.find(t => t.id === tierId);
    return tier ? tier.sponsorIds : [];
};
