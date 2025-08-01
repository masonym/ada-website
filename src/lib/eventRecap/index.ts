// lib/eventRecap/index.ts
import { EventRecap } from './types';
import { buildEventRecap } from './eventRecapBuilder';
import { EVENT_RECAPS, getEventRecap as getManualEventRecap } from '@/constants/eventRecaps';

/**
 * Main service for getting event recap data
 * Tries the new hybrid system first, falls back to legacy manual data
 */
export async function getEventRecap(eventShorthand: string): Promise<EventRecap | undefined> {
  try {
    // First, try the new hybrid system
    const hybridRecap = await buildEventRecap({ eventShorthand });
    
    if (hybridRecap && hybridRecap.sections.length > 0) {
      return hybridRecap;
    }

    // Fall back to legacy manual data
    const legacyRecap = getManualEventRecap(eventShorthand);
    return legacyRecap;

  } catch (error) {
    console.error('Error getting event recap:', error);
    
    // Always fall back to legacy data on error
    return getManualEventRecap(eventShorthand);
  }
}

/**
 * Forces use of the legacy manual system
 */
export function getLegacyEventRecap(eventShorthand: string): EventRecap | undefined {
  return getManualEventRecap(eventShorthand);
}

/**
 * Forces use of the new hybrid system
 */
export async function getHybridEventRecap(eventShorthand: string): Promise<EventRecap | null> {
  return buildEventRecap({ eventShorthand });
}

// Re-export types for convenience
export type { EventRecap, RecapSection, RecapImage } from './types';
export type { EventRecapMetadata, SectionMetadata, PhotoMetadata } from './types';
