// Define the perk formatting structure to match exhibitors format
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

export interface Sponsorship {
    id: string;
    title: string;
    cost: number;
    perks: Array<Perk>;
    colour?: string;
    slotsPerEvent?: number;
    showOnSponsorshipPage?: boolean;
    showRemaining?: boolean;
    headerImage?: string;
    buttonText?: string;
    buttonLink?: string;
    earlyBirdPrice?: number;
    earlyBirdDeadline?: string;
    saleEndTime?: string;
    description?: string;
    isActive?: boolean;
    requiresAttendeeInfo?: boolean;
    maxQuantityPerOrder?: number;
    isGovtFreeEligible?: boolean;
    shownOnRegistrationPage?: boolean;
    sponsorPasses?: number; // Number of attendee passes included with this sponsorship
}

// Define the structure for additional passes
export interface AdditionalPassType {
    name?: string;
    title?: string;
    description?: string;
    price?: number;
    saleEndTime?: string;
    headerImage?: string;
    buttonText?: string;
    maxQuantityPerOrder?: number;
    perks?: Array<string | {formatted: FormattedPerk[]}>;
}

// Define the structure for sponsorship tiers by event
export interface SponsorshipTier {
    id: number;
    primeSponsor?: Sponsorship;
    sponsorships: Sponsorship[];
    additionalPass?: AdditionalPassType;
}
