export interface SpecialGuest {
    name: string;
    photo: string;
    bio: string;
    title?: string;  // e.g., "Astronaut", "Guest Speaker", "Special Guest"
}

export interface Feature {
    title: string;
    date?: string;
    time?: string;
    location?: string;
    description: string;
    specialGuest?: SpecialGuest;
}

export interface EventSpecialFeatures {
    id: number;
    features: Feature[];
    additionalPerks?: string[];
}
