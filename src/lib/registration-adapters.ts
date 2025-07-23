import { REGISTRATION_TYPES } from '@/constants/registrations';
import { SPONSORSHIP_TYPES } from '@/constants/sponsorships';
import { EXHIBITOR_TYPES, ExhibitorType, AdditionalPassType as ExhibitorAdditionalPassType } from '@/constants/exhibitors';
import { ModalRegistrationType } from '@/types/registration';
import { AdditionalPassType as SponsorAdditionalPassType } from '@/types/sponsorships';

// Define types based on the structure of the constants files
interface FormattedPerkType {
  content: string;
  bold?: boolean;
  indent?: number;
}

/**
 * PerkType matches both the FormattedPerk component's props structure and legacy format:
 * - string: Simple text with optional <b> tags and indentation via spaces
 * - object with formatted: Structured content with bold/indent properties for FormattedPerk
 * - object with tagline/description: Legacy format used in sponsorships
 */
type PerkType = string | { 
  formatted?: FormattedPerkType[];
  tagline?: string;
  description?: string;
};

export interface SponsorshipType {
  id: string;
  title: string;
  cost: number | string;
  perks?: PerkType[];
  colour?: string;
  sponsorPasses?: number; // Number of attendee passes included with this sponsorship
  slotsPerEvent?: number;
};

type PrimeSponsorType = SponsorshipType;

// Define the common type for all registration items
export interface AdapterModalRegistrationType extends ModalRegistrationType {
  id: string;
  name: string;
  description: string;
  price: number | string;
  earlyBirdPrice?: number | string;
  earlyBirdDeadline?: string;
  isActive: boolean;
  requiresAttendeeInfo: boolean;
  isGovtFreeEligible: boolean;
  perks?: (string | {formatted: FormattedPerkType[]})[];
  availabilityInfo?: string;
  type: 'paid' | 'free' | 'complimentary' | 'sponsor';
  title: string;
  headerImage: string;
  subtitle?: string;
  buttonText: string;
  buttonLink?: string;
  receptionPrice?: string;
  quantityAvailable?: number;
  maxQuantityPerOrder: number;
  category: 'ticket' | 'exhibit' | 'sponsorship';
  requiresValidation?: boolean; // New flag for special validation
  // Add any other fields that might be needed
  colour?: string;
  sponsorPasses?: number; // Number of attendee passes included with this sponsorship
  shownOnRegistrationPage?: boolean;
  saleEndTime?: string;
};

/**
 * Converts registration data from constants to the format expected by RegistrationModal
 * @param eventId The ID of the event
 * @returns An array of AdapterModalRegistrationType objects for tickets
 */
export function getRegistrationsForEvent(eventId: number | string): AdapterModalRegistrationType[] {
  const eventData = REGISTRATION_TYPES.find(event => event.id.toString() === eventId.toString());
  if (!eventData) return [];

  return eventData.registrations.map((reg: any): AdapterModalRegistrationType => ({
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
    shownOnRegistrationPage: reg.shownOnRegistrationPage,
    saleEndTime: reg.saleEndTime,
  }));
}

/**
 * Converts sponsorship data from constants to the format expected by RegistrationModal
 * @param eventId The ID of the event
 * @returns An array of AdapterModalRegistrationType objects for sponsorships
 */
export function getSponsorshipsForEvent(eventId: number | string): AdapterModalRegistrationType[] {
  const eventData = SPONSORSHIP_TYPES.find(event => event.id.toString() === eventId.toString());
  if (!eventData) return [];

  // Handle both regular sponsorships and prime sponsor if it exists
  const allSponsors = [
    ...(eventData.primeSponsor ? [eventData.primeSponsor] : []),
    ...(eventData.sponsorships || []),
  ];

  const adaptedSponsors = allSponsors.map((sponsor: SponsorshipType | PrimeSponsorType): AdapterModalRegistrationType => {
    // Process perks to handle all perk formats (string, tagline/description, and formatted arrays)
    const processedPerks = sponsor.perks ? sponsor.perks.map((perk: PerkType): string => {
      if (typeof perk === 'string') {
        return perk;
      } else if (perk.formatted && perk.formatted.length > 0) {
        // Handle new formatted perks structure - convert to HTML-like format
        return perk.formatted.map((formattedPerk) => {
          const prefix = formattedPerk.indent ? '  '.repeat(formattedPerk.indent) : '';
          const content = formattedPerk.bold ? `<b>${formattedPerk.content}</b>` : formattedPerk.content;
          return `${prefix}${content}`;
        }).join('\n');
      } else if (perk.description) {
        // Handle legacy format - combine tagline (bold) and description
        return perk.tagline ? `<b>${perk.tagline}</b>: ${perk.description}` : perk.description;
      } else {
        // Fallback
        return perk.tagline || '';
      }
    }).filter(Boolean) : [];
    
    // Get sponsorPasses from the explicit field or default to 0
    const sponsorPasses = sponsor.sponsorPasses || 0;

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
      quantityAvailable: sponsor.slotsPerEvent || 1, // Default to 1 if slotsPerEvent is not provided
      maxQuantityPerOrder: 1,
      sponsorPasses: sponsorPasses || 0, // Include sponsorPasses in the returned object
      colour: 'colour' in sponsor ? sponsor.colour : undefined,
    };
  });

  // If there are any sponsorships, look for event-specific additional pass or use default
  if (adaptedSponsors.length > 0) {
    const eventSpecificAdditionalPass: SponsorAdditionalPassType | undefined = eventData.additionalPass;
    
    if (eventSpecificAdditionalPass) {
      // Use the event-specific additional pass
      adaptedSponsors.push({
        id: 'vip-discount-sponsor',
        name: eventSpecificAdditionalPass.name || 'Additional Sponsor Attendee Pass',
        title: eventSpecificAdditionalPass.title || 'Additional Sponsor Attendee Pass',
        description: eventSpecificAdditionalPass.description || 'For registered Sponsors. Purchase additional Sponsor passes for your team at a discounted rate. A valid order ID from a previous Exhibitor or Sponsor registration is required.',
        price: eventSpecificAdditionalPass.price || 395,
        isActive: true,
        requiresAttendeeInfo: true,
        isGovtFreeEligible: false,
        type: 'paid',
        headerImage: eventSpecificAdditionalPass.headerImage || 'vip.webp',
        buttonText: eventSpecificAdditionalPass.buttonText || 'Add',
        category: 'sponsorship',
        requiresValidation: true,
        maxQuantityPerOrder: eventSpecificAdditionalPass.maxQuantityPerOrder || 10,
        perks: eventSpecificAdditionalPass.perks || [],
      });
    } else {
      // Fallback to default if no event-specific additional pass is defined
      adaptedSponsors.push({
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
        maxQuantityPerOrder: 10,
        perks: [
          { formatted: [
                { content: "Event Access: (1) VIP Attendee Pass", bold: true },
                { content: "Access to General Sessions", indent: 1 },
                { content: "Access to Exhibit Area", indent: 1 },
                { content: "Onsite Sign-up for Matchmaking Sessions", indent: 1 },
                { content: "Breakfast & Buffet Lunch", indent: 1 },
                { content: "Post-Event Access to Photos, Videos, and Speaker Presentation Slides", indent: 1 },
          ]},
        ],
      });
    }
  }
  
  return adaptedSponsors;
}

/**
 * Converts exhibitor data from constants to the format expected by RegistrationModal
 * @param eventId The ID of the event
 * @returns An array of AdapterModalRegistrationType objects for exhibitors
 */
export function getExhibitorsForEvent(eventId: number | string): AdapterModalRegistrationType[] {
  const eventData = EXHIBITOR_TYPES.find(event => event.id.toString() === eventId.toString());
  if (!eventData) return [];

  const adaptedExhibitors = eventData.exhibitors.map((exhibitor: ExhibitorType): AdapterModalRegistrationType => {
    // Process perks to handle both string and object types
    const processedPerks = exhibitor.perks ? exhibitor.perks.map((perk: PerkType): string => {
      if (typeof perk === 'string') {
        return perk;
      } else if (perk.formatted && perk.formatted.length > 0) {
        // Handle new formatted perks structure - convert to HTML-like format
        // that can be processed by the FormattedPerk component
        return perk.formatted.map((formattedPerk) => {
          const prefix = formattedPerk.indent ? '  '.repeat(formattedPerk.indent) : '';
          const content = formattedPerk.bold ? `<b>${formattedPerk.content}</b>` : formattedPerk.content;
          return `${prefix}${content}`;
        }).join('\n');
      } else if (perk.description) {
        // Handle legacy format - combine tagline (bold) and description
        return perk.tagline ? `<b>${perk.tagline}:</b> ${perk.description}` : perk.description;
      } else {
        // Fallback
        return perk.tagline || '';
      }
    }).filter(Boolean) : [];

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
      shownOnRegistrationPage: exhibitor.shownOnRegistrationPage || true,
    };
  });

  // If there are any exhibitor options, look for event-specific additional pass or use default
  if (adaptedExhibitors.length > 0) {
    const eventSpecificAdditionalPass: ExhibitorAdditionalPassType | undefined = eventData.additionalPass;
    
    if (eventSpecificAdditionalPass) {
      // Use the event-specific additional pass
      adaptedExhibitors.push({
        id: 'vip-discount-exhibitor',
        name: eventSpecificAdditionalPass.name || 'Additional Exhibitor Attendee Pass',
        title: eventSpecificAdditionalPass.title || 'Additional Exhibitor Attendee Pass',
        description: eventSpecificAdditionalPass.description || 'For registered Exhibitors. Purchase additional Exhibitor passes for your team at a discounted rate. A valid order ID from a previous Exhibitor or Sponsor registration is required.',
        price: eventSpecificAdditionalPass.price || 395,
        isActive: true,
        requiresAttendeeInfo: true,
        isGovtFreeEligible: false,
        type: 'paid',
        headerImage: eventSpecificAdditionalPass.headerImage || 'vip.webp',
        buttonText: eventSpecificAdditionalPass.buttonText || 'Add',
        category: 'exhibit',
        requiresValidation: true,
        maxQuantityPerOrder: eventSpecificAdditionalPass.maxQuantityPerOrder || 10,
        perks: eventSpecificAdditionalPass.perks || [],
        shownOnRegistrationPage: false,
      });
    } else {
      // Fallback to default if no event-specific additional pass is defined
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
        maxQuantityPerOrder: 10,
        perks: [
          { formatted: [
                { content: "Event Access: (1) VIP Attendee Pass", bold: true },
                { content: "Access to General Sessions", indent: 1 },
                { content: "Access to Exhibit Area", indent: 1 },
                { content: "Onsite Sign-up for Matchmaking Sessions", indent: 1 },
                { content: "Breakfast & Buffet Lunch", indent: 1 },
                { content: "Post-Event Access to Photos, Videos, and Speaker Presentation Slides", indent: 1 },
          ]},
        ],
        shownOnRegistrationPage: false,
      });
    }
  }

  return adaptedExhibitors;
}
