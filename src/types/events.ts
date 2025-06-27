import { ReactNode } from "react";
import { RegistrationType } from "./event-registration/registration";

export interface VipNetworkingReception {
    title: string;
    description: string;
    date: string;
    timeStart: string;
    timeEnd: string;
    location: string;
    additionalInfo?: string;
}

export interface Sale {
    id: string;
    title: string;
    description: string;
    promoCode?: string;
    validUntil: string; // ISO date string
    isActive: boolean;
}

export interface ExpectationItem {
    title: string;
    description: string;
}

export interface AudienceExpectations {
    audienceType: string;
    expectations: ExpectationItem[];
    expectationsText?: string;
}

export interface FeaturedTopicDetail {
    title: string;
    subItems: Array<{
        title: string;
        description: string;
    }>;
}

export interface EventTestimonial {
    type: 'video' | 'text';
    quote: string;
    name: string;
    title: string;
    affiliation: string;
    videoId?: string;
}

export interface Event {
    id: number;
    title: string;
    date: string;
    timeStart: string;
    description: string;
    eventText: ReactNode;
    aboutEventText?: ReactNode;
    topicalCoverage: Array<{ tagline: string; description: string }>;
    featuredTopics?: FeaturedTopicDetail[];
    featuredTopicsTitle?: string;
    featuredTopicsSubtitle?: string;
    image: string;
    slug: string;
    locationImage: string;
    locationAddress: string;
    testimonials?: EventTestimonial[];
    eventShorthand: string;
    registerLink: string;
    password?: string;
    registrationTypes?: RegistrationType[];
    sponsorProspectusPath?: string;
    expectations?: AudienceExpectations[];
    expectationsText?: string;
    contactInfo?: {
        contactText?: string;
        contactEmail?: string;
        contactEmail2?: string;
    };
    sponsorshipInfo?: {
        sponsorSection?: ReactNode;
        customContactText?: ReactNode;
        exhibitorSpacesText?: ReactNode;
    };
    matchmakingSessions?: {
        signUpTime: string;
        slotsPerHost: number;
        sessionDurationMinutes: number;
        signUpDate: string;
        sessions: Array<{
            sessionTime: string;
            date: string;
        }>;
    };
    customFooterText?: ReactNode;
    placeID?: string;
    directions?: Array<{ title: string; description: string }>;
    images?: Array<{ id: string; src: string; alt: string }>;
    parkingInfo?: Array<{
        title: string;
        description: string;
        link?: {
            linkText: string;
            href: string;
        }
    }>;
    parkingBox?: {
        text: string;
        imagePlaceholder: string;
    };
    countdownColour?: string;
    sales?: Sale[];
    vipNetworkingReception?: VipNetworkingReception;
}
