import { REGISTRATION_TYPES } from '@/constants/registrations';
import { SPONSORSHIP_TYPES } from '@/constants/sponsorships';
import { EXHIBITOR_TYPES, ExhibitorType } from '@/constants/exhibitors';

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

export interface SponsorshipType {
  id: string;
  title: string;
  cost: number | string;
  perks?: PerkType[];
  colour?: string;
  sponsorPasses?: number; // Number of attendee passes included with this sponsorship
};

type PrimeSponsorType = SponsorshipType;

// Define the common type for all registration items
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
  requiresValidation?: boolean; // New flag for special validation
  // Add any other fields that might be needed
  colour?: string;
  sponsorPasses?: number; // Number of attendee passes included with this sponsorship
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

  const adaptedSponsors = allSponsors.map((sponsor: SponsorshipType | PrimeSponsorType): ModalRegistrationType => {
    // Process perks to handle both string and object types
    const processedPerks = sponsor.perks ? sponsor.perks.map((perk: PerkType) =>
      typeof perk === 'string'
        ? perk
        : `<b>${perk.tagline}</b>: ${perk.description}`
    ) : [];
    
    // Extract sponsorPasses from perks if not explicitly defined
    let sponsorPasses = sponsor.sponsorPasses;
    if (!sponsorPasses) {
      // Try to extract from perks that mention "Event Access" or similar
      const eventAccessPerk = sponsor.perks?.find(perk => 
        typeof perk !== 'string' && 
        perk.tagline.includes('Event Access'));
      
      if (eventAccessPerk && typeof eventAccessPerk !== 'string') {
        // Extract the number from descriptions like "(3) conference passes"
        const match = eventAccessPerk.description.match(/\((\d+)\)/);
        if (match && match[1]) {
          sponsorPasses = parseInt(match[1], 10);
        }
      }
    }

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
      sponsorPasses: sponsorPasses || 0, // Include sponsorPasses in the returned object
      colour: 'colour' in sponsor ? sponsor.colour : undefined,
    };
  });

  // If there are any sponsorships, add the discounted VIP pass
  if (adaptedSponsors.length > 0) {
    adaptedSponsors.push(
      {
      id: 'vip-discount-sponsor',
      name: 'Additional Sponsor Attendee Pass',
      title: 'Additional Sponsor Attendee Pass',
      description: 'For registered Sponsors. Purchase additional Sponsor passes for your team at a discounted rate. A valid order ID from a previous Exhibitor or Sponsor registration is required.',
      price: 395,
      isActive: true,
      requiresAttendeeInfo: true,
      isGovtFreeEligible: false,
      type: 'paid',
      headerImage: 'vip.webp',
      buttonText: 'Add',
      category: 'sponsorship',
      requiresValidation: true,
      maxQuantityPerOrder: 10, // Example limit
      perks: [
        "(1) VIP Attendee Pass",
        "Access to General Sessions",
        "Access to Exhibit Area",
        "Onsite Sign-up for Matchmaking Sessions",
        "Breakfast & Buffet Lunch",
        "Post-Event Access to Photos, Videos, and Speaker Presentation Slides",
        "<b>Access to VIP Networking Reception on July 29, 2025 from 6:00 PM - 8:00 PM</b>",
      ],
    },
  );
  }
  
  return adaptedSponsors;
}

/**
 * Converts exhibitor data from constants to the format expected by RegistrationModal
 * @param eventId The ID of the event
 * @returns An array of ModalRegistrationType objects for exhibitors
 */
export function getExhibitorsForEvent(eventId: number | string): ModalRegistrationType[] {
  const eventData = EXHIBITOR_TYPES.find(event => event.id.toString() === eventId.toString());
  if (!eventData) return [];

  const adaptedExhibitors = eventData.exhibitors.map((exhibitor: ExhibitorType): ModalRegistrationType => {
    // Process perks to handle both string and object types
    const processedPerks = exhibitor.perks ? exhibitor.perks.map((perk: PerkType) =>
      typeof perk === 'string'
        ? perk
        : perk.description
    ) : [];

    return {
      id: exhibitor.id,
      name: exhibitor.title,
      title: exhibitor.title,
      description: exhibitor.description || `${exhibitor.title} - ${exhibitor.cost}`,
      price: exhibitor.cost,
      earlyBirdPrice: exhibitor.earlyBirdPrice,
      earlyBirdDeadline: exhibitor.earlyBirdDeadline,
      isActive: exhibitor.isActive ?? true,
      requiresAttendeeInfo: exhibitor.requiresAttendeeInfo ?? true,
      isGovtFreeEligible: exhibitor.isGovtFreeEligible ?? false,
      type: 'paid',
      headerImage: exhibitor.headerImage || 'exhibit.webp',
      buttonText: exhibitor.buttonText || 'Select',
      buttonLink: exhibitor.buttonLink,
      perks: processedPerks,
      category: 'exhibit',
      quantityAvailable: exhibitor.slotsPerEvent || 1,
      maxQuantityPerOrder: exhibitor.maxQuantityPerOrder || 1,
      colour: exhibitor.colour,
    };
  });

  // If there are any exhibitor options, add the discounted VIP pass
  if (adaptedExhibitors.length > 0) {
    adaptedExhibitors.push({
      id: 'vip-discount-exhibitor',
      name: 'Additional Exhibitor Attendee Pass',
      title: 'Additional Exhibitor Attendee Pass',
      description: 'For registered Exhibitors. Purchase additional Exhibitor passes for your team at a discounted rate. A valid order ID from a previous Exhibitor or Sponsor registration is required.',
      price: 395,
      isActive: true,
      requiresAttendeeInfo: true,
      isGovtFreeEligible: false,
      type: 'paid',
      headerImage: 'vip.webp',
      buttonText: 'Add',
      category: 'exhibit',
      requiresValidation: true,
      maxQuantityPerOrder: 10, // Example limit
    });
  }

  return adaptedExhibitors;
}
