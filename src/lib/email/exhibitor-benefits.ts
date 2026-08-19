import {
  AdditionalPassType,
  EXHIBITOR_TYPES,
  ExhibitorType,
} from '@/constants/exhibitors';
import { CONTACT, renderPerks } from './perks';

/**
 * Exhibitor benefits are generated from the perks in `@/constants/exhibitors`,
 * the same way sponsorship benefits come from `@/constants/sponsorships`. The
 * block used to be a fixed paragraph describing an 8'x10' space, a 6' table and
 * a $395 additional pass, which is only true of some events - event 1 sells a
 * 6' "Display Table" with two passes included, and the additional-pass price is
 * per event - so anything not in the data risked promising the wrong thing.
 */

function findEvent(eventId: number | string | undefined) {
  if (eventId === undefined) return null;
  return (
    EXHIBITOR_TYPES.find((e) => e.id.toString() === eventId.toString()) ?? null
  );
}

/** Looks up the raw exhibit space definition backing a purchased registration. */
export function findExhibitorType(
  eventId: number | string | undefined,
  exhibitorId: string | undefined,
  title?: string
): ExhibitorType | null {
  const event = findEvent(eventId);
  if (!event) return null;

  const all = event.exhibitors || [];

  return (
    (exhibitorId && all.find((e) => e.id === exhibitorId)) ||
    (title &&
      all.find((e) => e.title.toLowerCase() === title.toLowerCase().trim())) ||
    null
  );
}

/**
 * Whether the event offers exhibit space at all. Events like the 2026 Defense
 * Industry Update have no exhibits, so emails must not offer them one.
 */
export function eventHasExhibitSpace(
  eventId: number | string | undefined
): boolean {
  return (findEvent(eventId)?.exhibitors || []).some(
    (e) => e.isActive !== false
  );
}

/** The "Additional Exhibitor Attendee Pass" sold alongside this event's booths. */
export function getExhibitorAdditionalPass(
  eventId: number | string | undefined
): AdditionalPassType | undefined {
  return findEvent(eventId)?.additionalPass;
}

/**
 * Builds the exhibitor benefits block of a confirmation email from the exhibit
 * space's perks. Returns a generic block when it can't be found, so an
 * exhibitor is never sent an email with no benefits at all.
 */
export function generateExhibitorBenefitsHtml({
  exhibitor,
  exhibitorTitle,
}: {
  exhibitor: ExhibitorType | null;
  exhibitorTitle: string;
}): string {
  const heading = `${exhibitor?.title || exhibitorTitle || 'Exhibit Space'} Benefits`;

  const body = exhibitor
    ? renderPerks(exhibitor.perks)
    : '<p>The full details of your exhibit package are listed on the event website.</p>';

  return `
    <div class="highlight">
      <h2>${heading}</h2>
      ${body}

      <p style="color: red;"><strong>Please respond to this email with a high-quality image of your company logo.</strong></p>

      <h4 style="margin-top: 20px; margin-bottom: 2px;">Next Steps</h4>
      <p>Please reach out to our team at ${CONTACT} to coordinate your exhibit, including finalizing your branding assets.</p>
    </div>
  `;
}
