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
                id: "platinum-sponsor",
                name: "Platinum Sponsor",
                sponsorIds: ["modtech-solutions"],
                topTier: true
            },
            {
                id: "silver-sponsor",
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
                    "the-avery-group",
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
                id: "gold-sponsor",
                name: "Gold Sponsor",
                style: "bg-amber-400 text-slate-900",
                sponsorIds: ["lockheed-martin"],
            },
            {
                id: "silver-sponsor",
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
                id: "platinum-sponsor",
                name: "Platinum Sponsor",
                sponsorIds: ["hanwha-defense-usa"],
                topTier: true
            },
            {
                id: "gold-sponsor",
                name: "Gold Sponsor",
                style: "bg-amber-400 text-slate-900",
                sponsorIds: [
                    "blue-yonder",
                    "dmg-mori",
                ],
            },
            {
                id: "bronze-sponsor",
                name: "Bronze Sponsor",
                style: "bg-amber-700 text-slate-900",
                sponsorIds: [
                    "pmb-machine-works",
                ],
            },
            {
                id: "vip-networking-reception-sponsor",
                name: "VIP Networking Reception Sponsor",
                style: "bg-sky-300 text-slate-900",
                sponsorIds: [
                    "mcs-government-services",
                ],
            },
            {
                id: "small-business-sponsor",
                name: "Small Business Sponsors",
                style: "bg-sb-100 text-slate-900",
                sponsorIds: [
                    "zero-waste",
                    "jbc-corp",
                    "cpisys",
                    "normandeau",
                    "us-hazmat-rentals",
                    "hartwood-consulting-group",
                    "wise-technical-innovations",
                    "smart-choice-technologies",
                    "yadejs",
                    "avanti",
                    "westwind",
                    "ana-sourcing",
                    "cp2s-alytic",
                    "oak-theory",
                    "metgreen-solutions",
                    "turbo-federal",
                    "big-top",
                    "ari-hetra",
                    "kdm",
                    "heller",
                    "gov-solutions",
                    "css-energy",
                ],
            },
            {
                id: "exhibit",
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
                    "wise-technical-innovations",
                    "deschamps",
                    "bn-inspection",
                    "yadejs",
                    "lysol",
                    "north-american-rescue",
                    "curtis-power-solutions",
                    "nib",
                    "westwind",
                    "training-concepts",
                    "dronexus",
                    "ana-sourcing",
                    "allied-materials",
                    "reel-coh",
                    "cp2s-alytic",
                    "imsm",
                    "mcs-government-services",
                    "virginia-apex",
                    "oak-theory",
                    "admark",
                    "mass-virtual",
                    "lgh",
                    "iti",
                    "conductive-containers",
                    "cinch",
                    "didlake",
                    "equipment-share",
                    "dmg-mori",
                    "precision-resource",
                    "marmc", // this and don osbp are the same thing with diff logos/names
                    "navsup-fleet-logistics-center-norfolk",
                    "norfolk-naval-shipyard",
                    "cignys",
                    "metgreen-solutions",
                    "marzen-group-llc",
                    "rite-in-the-rain",
                    "bounce-imaging",
                    "hanwha-defense-usa",
                    "trust-consulting-services",
                    "pc-campana",
                    "pferd-tools",
                    "turbo-federal",
                    "amazon-business",
                    "isi-defense",
                    "big-top",
                    "heller",
                    "gov-solutions",
                    "isn-corp",
                    "neptune-shield",
                    "css-energy",
                    "finley-asphalt-concrete",
                    "blue-yonder",
                ],
            },
            {
                id: "supporting-organizations",
                name: "Supporting Organizations",
                style: "bg-navy-800 text-white",
                sponsorIds: [
                    "hampton-roads-alliance",
                    "visit-norfolk",
                ]
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
