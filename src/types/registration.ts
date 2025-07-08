export interface EventData {
  id: string;
  name: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  description?: string;
  price?: number;
  isActive?: boolean;
  requiresAttendeeInfo?: boolean;
}

export interface ModalRegistrationType {
  id: string;
  name: string;
  description: string;
  price: number | string;
  earlyBirdPrice?: number | string;
  earlyBirdDeadline?: string;
  isActive: boolean;
  requiresAttendeeInfo: boolean;
  isGovtFreeEligible: boolean;
  /**
   * Perks can be either plain strings or formatted objects
   * - Strings can contain <b> tags for bold and use indentation for hierarchy
   * - Formatted objects use a structured approach with content, bold, and indent properties
   */
  perks?: (string | {formatted: {content: string; bold?: boolean; indent?: number;}[]})[];
  availabilityInfo?: string;
  type: 'paid' | 'free' | 'complimentary' | 'sponsor';
  title: string;
  headerImage: string;
  subtitle?: string;
  buttonText: string;
  buttonLink?: string;
  receptionPrice?: string;
  quantityAvailable?: number;
  maxQuantityPerOrder?: number;
  category: 'ticket' | 'exhibit' | 'sponsorship';
  sponsorPasses?: number;
  requiresValidation?: boolean;
  slotsPerEvent?: number; // Number of available slots for this event sponsorship
};


export interface AttendeeInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  company: string;
  companyWebsite?: string;
  businessSize?: string;
  industry?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  howDidYouHearAboutUs?: string;
  interestedInSponsorship?: boolean;
  interestedInSpeaking?: boolean;
  sponsorInterest?: string;
  speakingInterest?: string;
  website?: string;
  agreeToTerms?: boolean;
  agreeToPhotoRelease?: boolean;
  dietaryRestrictions?: string;
  accessibilityRequirements?: string;
}

export interface BillingInfo {
  firstName: string;
  lastName: string;
  email: string;
  confirmEmail: string;
  phone: string;
  company: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  paymentMethod: 'creditCard' | 'invoice';
  sameAsBilling: boolean;
  notes?: string;
}

export type RegistrationStep = 1 | 2 | 3 | 4;

export const initialBillingInfo: BillingInfo = {
  firstName: '',
  lastName: '',
  email: '',
  confirmEmail: '',
  phone: '',
  company: '',
  address1: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'United States',
  paymentMethod: 'creditCard',
  sameAsBilling: true,
};

export const initialAttendeeInfo: AttendeeInfo = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  jobTitle: '',
  company: '',
};
