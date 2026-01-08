import { SPONSORS, Sponsor } from './sponsors';

/**
 * Type definition for the matchmaking sponsors data structure
 */
export type SponsorMetadata = {
  sponsorId: string;
  note?: string;
}

export type MatchmakingSponsorsData = {
  sponsorIds: (string | SponsorMetadata)[];
  title?: string;
  description?: string;
};

type MatchmakingSponsorWithNote = {
  sponsor: Sponsor;
  note?: string;
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
      { sponsorId: "unicor", note: "Participating on Tuesday, July 29th only." },
      "navair",
      "dmg-mori",
      "mcs-government-services",
      "newport-news-shipbuilding",
      "general-dynamics-information-technology",
      { sponsorId: "us-army-contracting-command", note: "Participating on Tuesday, July 29th only." },
      "hanwha-defense-usa",
      "us-gsa",
    ],
    title: "Companies Participating in Matchmaking Sessions",
    description: "These industry leaders will be available for one-on-one matchmaking sessions during the event."
  },
  "2026-navy-marine-corps-procurement-conference": {
    sponsorIds: [
      "navair",
      "us-gsa",
    ],
    title: "Companies Participating in Matchmaking Sessions",
    description: "Stay tuned for additional companies to be added as we get closer to the event date!"
  },
};

/**
 * Helper function to get matchmaking sponsors for a specific event
 */
export const getEventMatchmakingSponsors = (eventSlug: string): MatchmakingSponsorWithNote[] => {
  const eventData = EVENT_MATCHMAKING_SPONSORS[eventSlug];
  if (!eventData) return [];

  return eventData.sponsorIds
    .map(item => {
      const sponsorId = typeof item === 'string' ? item : item.sponsorId;
      const sponsor = SPONSORS[sponsorId];
      if (!sponsor) return null;

      return {
        sponsor,
        note: typeof item === 'string' ? undefined : item.note,
      };
    })
    .filter(Boolean) as MatchmakingSponsorWithNote[];
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
