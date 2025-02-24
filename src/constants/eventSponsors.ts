export type SponsorTier = {
    name: string;  // e.g., "Gold", "Silver", "Bronze"
    description?: string;
    style?: string;  // Tailwind classes for styling the tier label
    sponsors: Sponsor[];
    topTier?: boolean;  // Indicates if this is the highest tier for the event
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
        id: 2,
        title: "Our Sponsors and Partners",
        tiers: [
            {
                name: "Platinum Sponsor",
                sponsors: [
                    {
                        name: "Modtech Solutions",
                        logo: "/events/2025SDPC/sponsors/modtech-scaled.webp",
                        website: "https://modtechhawaii.com",
                        width: 800,
                        height: 200,
                        description: "<b>Modtech Solutions is a Trusted Defense Technology Integrator specializing in Command and Control through Unified Communications (UC), High-Security Facilities, and Telecommunications Infrastructure</b>. Our mission—<b>\"To empower the warfighter for a safer world\"</b>— drives us to develop cutting-edge solutions that enhance security, operational readiness, and decision-making for the men and women serving our nation. In an environment where the fog of war can obscure clarity, Modtech Solutions delivers dependability to dominate the modern battle-space by ensuring the right information reaches <b>the right people at the right time—without doubt, delay, or disruption.</b>"
                    },
                ],
                topTier: true
            },
            {
                name: "Small Business Sponsors",
                style: "bg-sb-100 text-slate-900",
                sponsors: [
                    {
                        name: "PGI Steel",
                        logo: "/events/2025SDPC/sponsors/pgi-steel.webp",
                        website: "https://pgisteel.com/",
                        width: 200,
                        height: 200,
                    },
                    {
                        name: "Deschamps",
                        logo: "/events/2025SDPC/sponsors/mobimat.webp",
                        website: "https://defense.mobi-mat.com/",
                        width: 250,
                        height: 75,
                    },
                    {
                        name: "Zero Waste Solutions",
                        logo: "/events/2025SDPC/sponsors/zero-waste.webp",
                        website: "https://www.zerowastesolutions.com/",
                        width: 280,
                        height: 51,
                    },
                    {
                        name: "Iuvo Systems",
                        logo: "/events/2025SDPC/sponsors/iuvo-systems.webp",
                        website: "https://www.iuvosystems.com/",
                        width: 400,
                        height: 100,
                    },
                    {
                        name: "Atlas Flags",
                        logo: "/events/2025SDPC/sponsors/atlas-signature.webp",
                        website: "https://atlassignature.com/",
                        width: 300,
                        height: 200,
                    },
                    {
                        name: "Integration Technologies Group",
                        logo: "/events/2025SDPC/sponsors/itg.webp",
                        website: "https://www.itgonline.com/",
                        width: 400,
                        height: 100,
                    },

                    {
                        name: "The Avery Group",
                        logo: "/events/2025SDPC/sponsors/avery-group.webp",
                        website: "https://theaverygroupllc.com/",
                        width: 300,
                        height: 300,
                    },


                    {
                        name: "PMB Machine Works",
                        logo: "/events/2025SDPC/sponsors/pmb-machine-works.webp",
                        website: "https://pmbmachineworks.com/",
                        width: 300,
                        height: 200,
                    }
                ],
            },
            {
                name: "Exhibitors",
                style: "bg-navy-800 text-white", // Custom styling for organizers
                sponsors: [
                    {
                        name: "PGI Steel",
                        logo: "/events/2025SDPC/sponsors/pgi-steel.webp",
                        website: "https://pgisteel.com/",
                        width: 200,
                        height: 200,
                    },
                    {
                        name: "IMSM",
                        logo: "/events/2025SDPC/sponsors/imsm.webp",
                        website: "https://www.imsm.com/",
                        width: 175,
                        height: 45,
                    },
                    {
                        name: "Deschamps",
                        logo: "/events/2025SDPC/sponsors/mobimat.webp",
                        website: "https://defense.mobi-mat.com/",
                        width: 200,
                        height: 50,
                    },
                    {
                        name: "PSA, Inc./CMPRO",
                        logo: "/events/2025SDPC/sponsors/CMPRO.webp",
                        website: "https://psasys.com/",
                        width: 280,
                        height: 51,
                    },
                    {
                        name: "Safe Structure Designs",
                        logo: "/events/2025SDPC/sponsors/safe-structure.webp",
                        website: "https://www.safestructuredesigns.com/",
                        width: 200,
                        height: 50,
                    },
                    {
                        name: "Hungerford & Terry",
                        logo: "/events/2025SDPC/sponsors/ht.webp",
                        website: "https://www.hungerfordterry.com/",
                        width: 200,
                        height: 50,
                    },
                    {
                        name: "DreamSeat",
                        logo: "/events/2025SDPC/sponsors/dreamseat.webp",
                        website: "https://www.dreamseat.com/",
                        width: 200,
                        height: 50,
                    },
                    {
                        name: "Zero Waste Solutions",
                        logo: "/events/2025SDPC/sponsors/zero-waste.webp",
                        website: "https://www.zerowastesolutions.com/",
                        width: 280,
                        height: 51,
                    },
                    {
                        name: "Medava",
                        logo: "/events/2025SDPC/sponsors/medava-dark.webp",
                        website: "https://medavausa.com/",
                        width: 600,
                        height: 150,
                    },
                    {
                        name: "Iuvo Systems",
                        logo: "/events/2025SDPC/sponsors/iuvo-systems.webp",
                        website: "https://www.iuvosystems.com/",
                        width: 400,
                        height: 100,
                    },
                    {
                        name: "Atlas Flags",
                        logo: "/events/2025SDPC/sponsors/atlas-signature.webp",
                        website: "https://atlassignature.com/",
                        width: 300,
                        height: 150,
                    },
                    {
                        name: "Solid Platforms",
                        logo: "/events/2025SDPC/sponsors/solid-platforms.webp",
                        website: "https://www.solidplatforms.com/",
                        width: 200,
                        height: 200,
                    },
                    {
                        name: "Integration Technologies Group",
                        logo: "/events/2025SDPC/sponsors/itg.webp",
                        website: "https://www.itgonline.com/",
                        width: 400,
                        height: 100,
                    },
                    {
                        name: "GT Apex",
                        logo: "/events/2025SDPC/sponsors/gt-apex.webp",
                        website: "https://gtapexaccelerator.org/",
                        width: 200,
                        height: 300,
                    },
                    {
                        name: "National Energy",
                        logo: "/events/2025SDPC/sponsors/national-energy.webp",
                        website: "https://nationalenergyusa.com/",
                        width: 200,
                        height: 300,
                    },
                    {
                        name: "Modtech Solutions",
                        logo: "/events/2025SDPC/sponsors/modtech.webp",
                        website: "https://modtechhawaii.com",
                        width: 300,
                        height: 200,
                    },

                    {
                        name: "Precision Resource",
                        logo: "/events/2025SDPC/sponsors/precision-resource.webp",
                        website: "https://www.precisionresource.com/",
<<<<<<< HEAD
                        width: 300,
=======
                        width: 200,
>>>>>>> 063c2df3d0e0064e64431e12045b54cec905afbb
                        height: 300,
                    },
                    {
                        name: "PMB Machine Works",
                        logo: "/events/2025SDPC/sponsors/pmb-machine-works.webp",
                        website: "https://pmbmachineworks.com/",
                        width: 300,
                        height: 200,
<<<<<<< HEAD
                    },

                    {
                        name: "The Avery Group",
                        logo: "/events/2025SDPC/sponsors/avery-group.webp",
                        website: "https://theaverygroupllc.com/",
                        width: 300,
                        height: 300,
                    },

=======
                    }
>>>>>>> 063c2df3d0e0064e64431e12045b54cec905afbb

                ]
            }
        ]
    },
    {
        id: 3, // 2025DTIOS
        title: "This event is Organized and Presented by",
        tiers: [
            {
                name: "Gold Sponsor",
                style: "bg-amber-400 text-slate-900",
                sponsors: [
                    {
                        name: "Lockheed Martin",
                        logo: "/events/2025DTIOS/sponsors/lockheed-martin.webp",
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
                        logo: "/events/2025DTIOS/sponsors/anamo.webp",
                        website: "https://anamo.io/",
                        width: 200,
                        height: 100,
                    },
                    {
                        name: "US ProTech",
                        logo: "/events/2025DTIOS/sponsors/usprotech.webp",
                        website: "https://www.usprotech.com/",
                        width: 170,
                        height: 50,
                    },
                    {
                        name: "Neat and Nifty",
                        logo: "/events/2025DTIOS/sponsors/neat-and-nifty.webp",
                        website: "https://www.neatandnifty.com/",
                        width: 150,
                        height: 150,
                    }
                ],
            },
            {
                name: "Event Partners",
                style: "bg-navy-800 text-white", // Custom styling for organizers
                sponsors: [
                    {
                        name: "National Association of Spaceports",
                        logo: "/events/2025DTIOS/sponsors/nass-logo.webp",
                        website: "https://www.thenass.org/",
                        width: 225,
                        height: 84,
                    },
                    {
                        name: "American Defense Alliance",
                        logo: "/logo.webp",
                        website: "https://www.americandefensealliance.org",
                        width: 150,
                        height: 150,
                    },
                    {
                        name: "The Astronauts Memorial Foundation",
                        logo: "/events/2025DTIOS/sponsors/amf-logo.webp",
                        website: "https://www.amfcse.org",
                        width: 150,
                        height: 150,
                    },
                    {
                        name: "Zarrellas Italian & Wood Fired Pizza",
                        logo: "/events/2025DTIOS/sponsors/zarrellas.webp",
                        website: "https://www.zarrellasitalian.com/",
                        width: 150,
                        height: 150,
                    }
                ]
            },
        ]
    }
];
