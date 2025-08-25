import { ReactNode } from "react";
import { RegistrationType } from "./event-registration/registration";

export interface MatchmakingSession {
    signUpTime: string;
    signUpDate: string;
    sessionDurationMinutes: number;
    slotsPerHost: number;
    sessions: Array<{
        sessionTime: string;
        date: string;
    }>;
}

export interface VipNetworkingReception {
    title: string;
    description: string;
    date: string;
    timeStart: string;
    timeEnd: string;
    additionalInfo?: string;
    additionalInfo2?: string;
    locationName?: string;
    locationAddress?: string;
    placeId?: string;
    eventPlaceId?: string;
    eventLocationName?: string;
    locationPhoto?: string;
    locationPhone?: string;
    website?: string;
    locationRoom?: string;
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
    type: 'video' | 'text' | 'image';
    /** Short quote or blurb to display in the card */
    quote: string;
    name: string;
    title: string;
    affiliation: string;
    /** YouTube video ID for video testimonials */
    videoId?: string;
    /** Image URL for image-based testimonials */
    imageUrl?: string;
    /** Alt text for the testimonial image */
    imageAlt?: string;
    /** Optional full transcript text to show in an expandable section */
    fullTranscript?: string;
}
export interface VIPReceptionProps {
        title: string;
        date: string;
        timeStart: string;
        timeEnd: string;
        description: string;
        additionalInfo?: string;
        locationName: string;
        locationAddress: string;
        placeId: string;
        eventPlaceId: string;
        eventLocationName?: string;
        locationPhoto?: string;
        locationPhone: string;
        website: string;
        locationRoom?: string;
}

export interface EventFeatures {
    showKeynoteSpeaker?: boolean;
    keynoteSpeakers?: Array<{
        speakerId: string;
        headerText: string;
    }>;
    // add stuff here later. these are flags to hide or show certain components in our dynamic route page
}

export interface Event {
    id: number;
    title: string;
    date: string;
    timeStart: string;
    timeEnd: string;
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
    venueName?: string;
    testimonials?: EventTestimonial[];
    eventShorthand: string;
    registerLink?: string;
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
    matchmakingSessions?: MatchmakingSession | undefined;
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
    shown?: boolean; // Controls whether this event should be displayed in event listings
    features?: EventFeatures;
}
