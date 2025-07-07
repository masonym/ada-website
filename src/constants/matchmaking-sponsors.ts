import { SPONSORS, Sponsor } from './sponsors';

/**
 * Type definition for the matchmaking sponsors data structure
 */
export type MatchmakingSponsorsData = {
  sponsorIds: string[];
  title?: string;
  description?: string;
};

/**
 * Mapping of event IDs to the sponsors that are attending matchmaking sessions
 */
export const EVENT_MATCHMAKING_SPONSORS: Record<string, MatchmakingSponsorsData> = {
  // Florida Defense Expo
  "2025-navy-marine-corps-procurement-conference": {
    sponsorIds: [
      "marmc",
      "navsup-fleet-logistics-center-norfolk",
      "norfolk-naval-shipyard",
      "bae-systems",
      "unicor",
      "navair",
      "dmg-mori",
      "mcs-government-services",
      "newport-news-shipbuilding",
      "general-dynamics-information-technology",
      "us-army-contracting-command",
      "hanwha-defense-usa",
    ],
    title: "Companies Participating in Matchmaking Sessions",
    description: "These industry leaders will be available for one-on-one matchmaking sessions during the event.<br />Sign up early to secure your spot."
  },
};

/**
 * Helper function to get matchmaking sponsors for a specific event
 */
export const getEventMatchmakingSponsors = (eventSlug: string): Sponsor[] => {
  const eventData = EVENT_MATCHMAKING_SPONSORS[eventSlug];
  if (!eventData) return [];
  
  return eventData.sponsorIds
    .map(id => SPONSORS[id])
    .filter(Boolean) as Sponsor[];
};

/**
 * Helper function to get matchmaking sponsors metadata for a specific event
 */
export const getEventMatchmakingMetadata = (eventSlug: string): { title?: string; description?: string } => {
  const eventData = EVENT_MATCHMAKING_SPONSORS[eventSlug];
  if (!eventData) return {};
  
  return {
    title: eventData.title,
    description: eventData.description
  };
};
