import { Event } from '../events';

export interface RegistrationFormData {
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
  quantity: number;
  attendeeInfo?: AttendeeInfo[];
}

export interface AttendeeInfo {
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  company: string;
  dietaryRestrictions?: string;
  accessibilityNeeds?: string;
}

export type BusinessSize = 
  | '1-10 employees' 
  | '11-50 employees' 
  | '51-200 employees' 
  | '201-500 employees' 
  | '501-1000 employees' 
  | '1001-5000 employees' 
  | '5001+ employees'
  | 'Government';

export interface EventRegistrationProps {
  event: Event;
  registrationTypes: RegistrationType[];
}

export interface RegistrationType {
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
}
