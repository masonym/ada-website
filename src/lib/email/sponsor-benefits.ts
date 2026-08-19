import { SPONSORSHIP_TYPES } from "@/constants/sponsorships";
import {
  AdditionalPassType,
  Sponsorship,
  SponsorshipContact,
} from "@/types/sponsorships";
import { MatchmakingSession } from "@/types/events";
import { CONTACT, joinList, perkText, renderPerks } from "./perks";

/**
 * Sponsorship benefits for confirmation emails are generated from the perks
 * defined in `@/constants/sponsorships` rather than from a hardcoded per-tier
 * table. The perks array is the single source of truth the sponsorship page
 * sells from, so an email built from it can never promise a benefit that was
 * changed or withdrawn for a given event (e.g. the 2027 NMCPC tiers, which
 * shortened the Gold/Silver speaking slots, dropped Bronze speaking entirely,
 * and split lanyards out into their own sponsorship).
 */

/** The tier block for an event, keyed by the same id the event uses. */
function findTier(eventId: number | string | undefined) {
  if (eventId === undefined) return null;
  return (
    SPONSORSHIP_TYPES.find((t) => t.id.toString() === eventId.toString()) ??
    null
  );
}

/** Looks up the raw sponsorship definition backing a purchased registration. */
export function findSponsorship(
  eventId: number | string | undefined,
  sponsorshipId: string | undefined,
  title?: string,
): Sponsorship | null {
  const tier = findTier(eventId);
  if (!tier) return null;

  const all = [
    ...(tier.primeSponsor ? [tier.primeSponsor] : []),
    ...(tier.sponsorships || []),
  ];

  return (
    (sponsorshipId && all.find((s) => s.id === sponsorshipId)) ||
    (title &&
      all.find((s) => s.title.toLowerCase() === title.toLowerCase().trim())) ||
    null
  );
}

/**
 * The "Additional Sponsor Attendee Pass" sold alongside this event's
 * sponsorships. Emails quote its price from here rather than repeating a
 * number, which drifted once already when event 9 moved to $295.
 */
export function getSponsorAdditionalPass(
  eventId: number | string | undefined,
): AdditionalPassType | undefined {
  return findTier(eventId)?.additionalPass;
}

/**
 * Whether the sponsorship includes exhibit space. Falls back to the title when
 * the sponsorship isn't found in the data (only the "without Exhibit Space"
 * tiers are named for its absence).
 */
export function sponsorshipIncludesExhibitSpace(
  sponsorship: Sponsorship | null,
  title: string,
): boolean {
  if (!sponsorship)
    return !title.toLowerCase().includes("without exhibit space");
  return /exhibit space/.test(perkText(sponsorship.perks));
}

interface BenefitFlags {
  speaking: boolean;
  panel: boolean;
  workshop: boolean;
  remarks: boolean;
  matchmaking: boolean;
  lanyards: boolean;
  spotlight: boolean;
  advertisement: boolean;
  branding: boolean;
}

function detectBenefits(text: string): BenefitFlags {
  return {
    speaking: /speaking opportunity|speaking session|audience address/.test(
      text,
    ),
    panel: /moderate the panel/.test(text),
    workshop: /workshop/.test(text),
    remarks: /remarks/.test(text),
    matchmaking: /matchmaking/.test(text),
    lanyards: /lanyard/.test(text),
    spotlight: /spotlight/.test(text),
    advertisement: /advertisement|capabilities statement/.test(text),
    branding: /logo|branding/.test(text),
  };
}

/** The specific things we need back from the sponsor, per detected benefit. */
function actionItemsHtml(flags: BenefitFlags): string {
  const items: string[] = [];

  if (flags.speaking || flags.panel) {
    items.push(
      `<li>Your ${flags.panel ? "panel moderator" : "speaker"}'s name, bio (any length), high-resolution photo, and ${flags.panel ? "panel focus" : "session topic"} for approval and scheduling.</li>`,
    );
  } else if (flags.remarks) {
    items.push(
      "<li>The name, bio, and high-resolution photo of whoever will be providing reception remarks, for inclusion on our website.</li>",
    );
  }

  if (flags.workshop) {
    items.push(
      "<li>Your workshop title, description, and presenter details so we can schedule and promote the session.</li>",
    );
  }

  if (flags.lanyards) {
    items.push(
      "<li>Arrangements for the delivery of your branded lanyards, along with your branding specifications.</li>",
    );
  }

  if (flags.advertisement) {
    items.push(
      "<li>Your full-page color advertisement/capabilities statement artwork for the printed program.</li>",
    );
  }

  if (flags.spotlight) {
    items.push(
      "<li>A company description and capabilities statement for your Sponsor Spotlight Email.</li>",
    );
  }

  if (flags.matchmaking) {
    items.push(
      "<li>The name of the representative who will host your Matchmaking Table, and a brief company description.</li>",
    );
  }

  if (items.length === 0) return "";

  return `
      <p><strong>Please send us the following:</strong></p>
      <ul>
        ${items.join("\n        ")}
      </ul>`;
}

/**
 * Who to contact, as an mailto link. Some sponsorships are owned end to end by
 * one person rather than the events@ inbox, so the sponsorship data may name
 * them; see `contact` in `@/types/sponsorships`.
 */
function contactHtml(contact?: SponsorshipContact): string {
  if (!contact) return `our team at ${CONTACT}`;
  return `${contact.name} at <a href="mailto:${contact.email}">${contact.email}</a>`;
}

function nextStepsHtml(flags: BenefitFlags, contact?: SponsorshipContact): string {
  const coordination: string[] = [];

  if (flags.speaking || flags.panel)
    coordination.push("scheduling your speaking opportunity");
  if (flags.workshop) coordination.push("scheduling your workshop");
  if (flags.branding || flags.lanyards)
    coordination.push("finalizing branding assets");
  if (flags.matchmaking)
    coordination.push("reserving your matchmaking session(s)");
  if (flags.spotlight) coordination.push("coordinating your spotlight email");
  if (flags.advertisement)
    coordination.push("submitting your program advertisement");

  const list = joinList(coordination);

  return `<p>Please reach out to ${contactHtml(contact)} to coordinate your benefits${list ? `, including ${list}` : ""}.</p>`;
}

/**
 * The event's matchmaking session times. Exported because the additional-pass
 * template shows them too, for passes linked to a package that includes
 * matchmaking.
 */
export function matchmakingSessionsHtml(
  matchmakingSessions?: MatchmakingSession,
): string {
  const sessionList = (matchmakingSessions?.sessions || [])
    .filter((session) => session?.date && session?.sessionTime)
    .map((session) => `<li>${session.date} from ${session.sessionTime}</li>`)
    .join("");

  if (!sessionList) return "";

  return `
      <p><strong>Matchmaking Sessions:</strong></p>
      <ul>
        ${sessionList}
      </ul>`;
}

/**
 * Builds the sponsorship benefits block of a confirmation email straight from
 * the sponsorship's perks. Returns a generic block when the sponsorship can't
 * be found, so a sponsor is never sent an email with no benefits at all.
 */
export function generateSponsorBenefitsHtml({
  sponsorship,
  sponsorshipLevel,
  matchmakingSessions,
}: {
  sponsorship: Sponsorship | null;
  sponsorshipLevel: string;
  matchmakingSessions?: MatchmakingSession;
}): string {
  // Titles are inconsistent across events ("Gold Sponsor", "Platinum
  // Sponsorship", "Major Panel Sponsorship: ..."), so only add the word when
  // it isn't already there.
  const heading = /sponsor/i.test(sponsorshipLevel)
    ? `${sponsorshipLevel} Benefits`
    : `${sponsorshipLevel} Sponsorship Benefits`;

  if (!sponsorship) {
    return `
    <div class="highlight">
      <h2>${heading}</h2>
      <p>The full details of your sponsorship package are listed on the event website.</p>
      <h4 style="margin-top: 20px; margin-bottom: 2px;">Next Steps</h4>
      <p>Please reach out to our team at ${CONTACT} to coordinate your benefits.</p>
    </div>
  `;
  }

  const flags = detectBenefits(perkText(sponsorship.perks));

  return `
    <div class="highlight">
      <h2>${heading}</h2>
      ${renderPerks(sponsorship.perks)}
      ${flags.matchmaking ? matchmakingSessionsHtml(matchmakingSessions) : ""}
      <h4 style="margin-top: 20px; margin-bottom: 2px;">Next Steps</h4>
      ${nextStepsHtml(flags, sponsorship.contact)}
      ${actionItemsHtml(flags)}
    </div>
  `;
}
