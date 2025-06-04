import { REGISTRATION_TYPES } from '@/constants/registrations';
import { SPONSORSHIP_TYPES } from '@/constants/sponsorships';
import { EXHIBITOR_TYPES } from '@/constants/exhibitors';

// Define types based on the structure of the constants files
type RegistrationType = {
  id: string;
  title: string;
  name?: string;
  description?: string;
  price: number | string;
  earlyBirdPrice?: number | string;
  earlyBirdDeadline?: string;
  isActive?: boolean;
  requiresAttendeeInfo?: boolean;
  isGovtFreeEligible?: boolean;
  perks?: string[];
  availabilityInfo?: string;
  type?: 'paid' | 'free' | 'complimentary' | 'sponsor';
  headerImage?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  receptionPrice?: string;
  quantityAvailable?: number;
  maxQuantityPerOrder?: number;
};

type PerkType = string | {
  tagline: string;
  description: string;
};

type SponsorshipType = {
  id: string;
  title: string;
  cost: number | string;
  perks?: PerkType[];
  colour?: string;
};

type PrimeSponsorType = SponsorshipType;

type ExhibitorType = {
  id: string;
  title: string;
  cost: number | string;
  perks?: PerkType[];
  colour?: string;
};

// Define the common type for all registration items
export type ModalRegistrationType = {
  id: string;
  name: string;
  description: string;
  price: number | string;
  earlyBirdPrice?: number | string;
  earlyBirdDeadline?: string;
  isActive: boolean;
  requiresAttendeeInfo: boolean;
  isGovtFreeEligible: boolean;
  perks?: string[];
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
  // Add any other fields that might be needed
  colour?: string;
};

/**
 * Converts registration data from constants to the format expected by RegistrationModal
 * @param eventId The ID of the event
 * @returns An array of ModalRegistrationType objects for tickets
 */
export function getRegistrationsForEvent(eventId: number | string): ModalRegistrationType[] {
  const eventData = REGISTRATION_TYPES.find(event => event.id.toString() === eventId.toString());
  if (!eventData) return [];

  return eventData.registrations.map((reg: any): ModalRegistrationType => ({
    id: reg.id,
    name: reg.name || reg.title,
    title: reg.title,
    description: reg.description || '',
    price: reg.price,
    earlyBirdPrice: reg.earlyBirdPrice,
    earlyBirdDeadline: reg.earlyBirdDeadline,
    isActive: reg.isActive ?? true,
    requiresAttendeeInfo: reg.requiresAttendeeInfo ?? true,
    isGovtFreeEligible: reg.isGovtFreeEligible ?? false,
    perks: reg.perks || [],
    availabilityInfo: reg.availabilityInfo,
    type: reg.type || 'paid',
    headerImage: reg.headerImage || 'default.webp',
    subtitle: reg.subtitle,
    buttonText: reg.buttonText || 'Register',
    buttonLink: reg.buttonLink,
    receptionPrice: reg.receptionPrice,
    quantityAvailable: reg.quantityAvailable,
    maxQuantityPerOrder: reg.maxQuantityPerOrder,
    category: 'ticket',
  }));
}

/**
 * Converts sponsorship data from constants to the format expected by RegistrationModal
 * @param eventId The ID of the event
 * @returns An array of ModalRegistrationType objects for sponsorships
 */
export function getSponsorshipsForEvent(eventId: number | string): ModalRegistrationType[] {
  const eventData = SPONSORSHIP_TYPES.find(event => event.id.toString() === eventId.toString());
  if (!eventData) return [];

  // Handle both regular sponsorships and prime sponsor if it exists
  const allSponsors = [
    ...(eventData.primeSponsor ? [eventData.primeSponsor] : []),
    ...(eventData.sponsorships || []),
  ];

  return allSponsors.map((sponsor: SponsorshipType | PrimeSponsorType): ModalRegistrationType => {
    // Process perks to handle both string and object types
    const processedPerks = sponsor.perks ? sponsor.perks.map((perk: PerkType) =>
      typeof perk === 'string'
        ? perk
        : `<b>${perk.tagline}</b>: ${perk.description}`
    ) : [];

    return {
      id: sponsor.id,
      name: sponsor.title,
      title: sponsor.title,
      description: `${sponsor.title} Sponsorship Package`,
      price: sponsor.cost,
      isActive: true,
      requiresAttendeeInfo: true,
      isGovtFreeEligible: false,
      type: 'paid',
      headerImage: 'sponsor.webp', // Default image
      buttonText: 'Select',
      perks: processedPerks,
      category: 'sponsorship',
      quantityAvailable: 1, // Default to 1 if slotsPerEvent is not provided
      maxQuantityPerOrder: 1,
      colour: 'colour' in sponsor ? sponsor.colour : undefined,
    };
  });
}

/**
 * Converts exhibitor data from constants to the format expected by RegistrationModal
 * @param eventId The ID of the event
 * @returns An array of ModalRegistrationType objects for exhibitors
 */
export function getExhibitorsForEvent(eventId: number | string): ModalRegistrationType[] {
  const eventData = EXHIBITOR_TYPES.find(event => event.id.toString() === eventId.toString());
  if (!eventData) return [];

  return eventData.exhibitors.map((exhibitor: ExhibitorType): ModalRegistrationType => {
    // Process perks to handle both string and object types
    const processedPerks = exhibitor.perks ? exhibitor.perks.map((perk: PerkType) =>
      typeof perk === 'string'
        ? perk
        : `<b>${perk.tagline}</b>: ${perk.description}`
    ) : [];

    return {
      id: exhibitor.id,
      name: exhibitor.title,
      title: exhibitor.title,
      description: `${exhibitor.title} - ${exhibitor.cost}`,
      price: exhibitor.cost,
      isActive: true,
      requiresAttendeeInfo: true,
      isGovtFreeEligible: false,
      type: 'paid',
      headerImage: 'exhibit.webp', // Default image
      buttonText: 'Select',
      perks: processedPerks,
      category: 'exhibit',
      quantityAvailable: 1, // Default to 1 if slotsPerEvent is not provided
      maxQuantityPerOrder: 1,
      colour: 'colour' in exhibitor ? exhibitor.colour : undefined,
    };
  });
}
