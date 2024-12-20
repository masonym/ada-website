import { EventTestimonial } from "@/app/components/EventTestimonials";
import { ReactNode } from "react";

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
        sessionTime: string;
        date: string;
        slotsPerHost: number;
        sessionDurationMinutes: number;
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
}
