export interface Sponsorship {
    id: string;
    title: string;
    cost: number;
    perks: { tagline: string; description: string; }[];
    colour?: string;
    slotsPerEvent?: number;
    showOnSponsorshipPage?: boolean;
    showRemaining?: boolean;
}
