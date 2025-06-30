import { Event } from '../events';

export interface RegistrationFormData {
  eventId: string;
  // Attendee Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  company: string;
  companyWebsite: string;
  businessSize: BusinessSize;
  industry: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;

  // Survey Questions
  howDidYouHearAboutUs: string;
  interestedInSponsorship: boolean;
  interestedInSpeaking: boolean;

  // Terms and Conditions
  agreeToTerms: boolean;
  agreeToPhotoRelease: boolean;

  // Tickets
  tickets: TicketSelection[];

  // Payment
  paymentMethod: 'creditCard' | 'free';
  promoCode?: string;
}

export interface TicketSelection {
  ticketId: string;
  ticketName: string;
  ticketPrice: string | number; // Can be a string (e.g., "Complimentary")
  quantity: number;
  category?: 'ticket' | 'exhibit' | 'sponsorship';
  isIncludedWithSponsorship?: boolean;
  sponsorshipId?: string;
  attendeeInfo?: AttendeeInfo[];
}

export interface AttendeeInfo {
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  company: string;
  phone: string; // Changed to required
  website: string; // Changed to required
  businessSize: string; // Changed to required, using string to match ModalAttendeeInfo
  sbaIdentification?: string; // Added for SBA identification
  industry: string; // Changed to required
  sponsorInterest: 'yes' | 'no' | ''; // Changed to required
  speakingInterest: 'yes' | 'no' | ''; // Changed to required
  dietaryRestrictions?: string;
  accessibilityNeeds?: string;
}

export type BusinessSize =
  | 'Small Business'
  | 'Medium-Sized Business'
  | 'Large-Sized Business'
  | 'Government Agency'
  | 'Military Component';

export interface EventRegistrationProps {
  event: Event;
  registrationTypes: RegistrationType[];
}

export interface RegistrationType {
  // Core fields
  id: string;
  name: string;
  description: string;
  price: number;
  earlyBirdPrice?: number;
  earlyBirdDeadline?: string;
  isActive: boolean;
  quantityAvailable?: number;
  requiresAttendeeInfo: boolean;
  maxQuantityPerOrder?: number;
  isGovtFreeEligible: boolean;

  // UI-related fields
  title?: string;
  headerImage?: string;
  perks?: string[];
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  type?: 'paid' | 'free' | 'complimentary' | 'sponsor';
  receptionPrice?: string;
  availabilityInfo?: string;
  category: 'ticket' | 'exhibit' | 'sponsorship';
}
