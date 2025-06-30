// Define the exhibitor type with all necessary fields for registration display
interface FormattedPerk {
    content: string;       // The actual text content
    bold?: boolean;        // Whether to bold the entire content
    indent?: number;       // Level of indentation (0 = no indent, 1 = first level, etc.)
}

interface Perk {
    tagline?: string;       // For backward compatibility
    description?: string;   // For backward compatibility
    formatted?: FormattedPerk[]; // New formatted structure
}
export interface ExhibitorType {
    id: string;
    title: string;
    cost: number;
    perks: Array<Perk>;
    colour?: string;
    slotsPerEvent?: number;
    showRemaining?: boolean;
    headerImage?: string;
    buttonText?: string;
    buttonLink?: string;
    earlyBirdPrice?: number;
    earlyBirdDeadline?: string;
    description?: string;
    isActive?: boolean;
    requiresAttendeeInfo?: boolean;
    maxQuantityPerOrder: number | 100;
    isGovtFreeEligible?: boolean;
    shownOnRegistrationPage?: boolean;
}

// Define the structure for exhibitor types by event
export interface ExhibitorEventType {
    id: number;
    exhibitors: ExhibitorType[];
}

export const EXHIBITOR_TYPES: ExhibitorEventType[] = [
    {
        id: 1,
        exhibitors: [
            {
                id: "table-top-exhibit-space",
                title: "Display Table",
                cost: 1000,
                headerImage: "display-table-pass.webp",
                buttonText: "Register Now",
                description: "Display Table for your organization",
                isActive: true,
                requiresAttendeeInfo: true,
                maxQuantityPerOrder: 1,
                isGovtFreeEligible: false,
                perks: [
                    { tagline: "Team Access", description: "Registration for 2 People" },
                    { tagline: "Networking", description: "2 VIP Networking Reception Passes" },
                    { tagline: "Display Space", description: "6' Display Table in General Session" },
                    { tagline: "Full Access", description: "Access to All Event Sessions" },
                    { tagline: "Resources", description: "Speaker Presentations and Materials" },
                    { tagline: "Documentation", description: "Digital/Physical Copies of Agenda" },
                    { tagline: "Dining", description: "Buffet Lunch" },
                    { tagline: "Media Access", description: "Access to Photos & Videos from Conference" },
                ],
                shownOnRegistrationPage: true,
            },
        ]
    },
    {
        id: 2,
        exhibitors: [
            {
                id: "table-top-exhibit-space",
                title: "Table-Top Exhibit Space",
                cost: 1250,
                headerImage: "exhibit-table-pass.webp",
                buttonText: "Register Now",
                description: "Table-Top Exhibit Space for your organization",
                isActive: true,
                requiresAttendeeInfo: true,
                maxQuantityPerOrder: 1,
                isGovtFreeEligible: false,
                perks: [
                    { tagline: "Event Access", description: " (1) Exhibitor Pass. Additional Passes can be Purchased for $395 each" },
                    { tagline: "Exhibit Space", description: "8'x10' Exhibit Space Placed in Exhibit Area/Foyer. 6' Exhibit Table and Chairs" },
                    { tagline: "Brand Visibility", description: "Logo Placement on select Conference Materials, including Marketing Emails and Website" },
                    { tagline: "Recognition", description: "Acknowledgement before Networking Breaks at the Conference" },
                    { tagline: "Media Coverage", description: "Photographs of your Participation" },
                ],
                colour: "#3FB4E6",
                shownOnRegistrationPage: true,
            },
        ]
    },
    {
        id: 4,
        exhibitors: [
            {
                id: "exhibit",
                title: "Table-Top Exhibit Space",
                cost: 1250,
                earlyBirdPrice: 1000,
                earlyBirdDeadline: "2025-01-18T08:00:00Z",
                headerImage: "exhibit-table-pass.webp",
                buttonText: "Register Now",
                description: "Table-Top Exhibit Space for your organization",
                isActive: true,
                requiresAttendeeInfo: true,
                maxQuantityPerOrder: 1,
                isGovtFreeEligible: false,
                slotsPerEvent: 50,
                showRemaining: true,
                perks: [
                    { formatted: [
                        { content: " (1) Exhibitor Pass." },
                        { content: "Additional Exhibitor Passes can be purchased for $395 each below.", indent: 1 },
                    ]},
                    { formatted: [
                        { content: "8’x10' Table-Top Exhibit Space in Exhibit Area/Foyer" },
                        { content: "6' Tableclothed Table and Chairs", indent: 1 },
                    ]},
                    { formatted: [
                        { content: "Logo Placement on select Conference Materials" },
                        { content: "Marketing Emails and Website", indent: 1 },
                    ]},
                    { formatted: [
                        { content: "Acknowledgement before Networking Breaks at the Conference" },
                    ]},
                    { formatted: [
                        { content: "Photographs of your Participation" },
                    ]},
                ],
                colour: "#3FB4E6",
                shownOnRegistrationPage: true,
            },
        ]
    }
];
