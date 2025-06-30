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
    description?: string;
    isActive?: boolean;
    requiresAttendeeInfo?: boolean;
    maxQuantityPerOrder?: number;
    isGovtFreeEligible?: boolean;
    shownOnRegistrationPage?: boolean;
}

// Define the structure for sponsorship tiers by event
export interface SponsorshipTier {
    id: number;
    primeSponsor?: Sponsorship;
    sponsorships: Sponsorship[];
}
