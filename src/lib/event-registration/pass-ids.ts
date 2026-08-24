/**
 * Catalogue ids of the add-on attendee passes, kept in a module that imports
 * nothing.
 *
 * They are needed by the adapters (which build the catalogue), by the order
 * resolver and entitlement code (which read it), and by the email templates.
 * Anywhere else would make one of those import the others and close a cycle.
 */

/** Paid add-on pass for a company that already bought a sponsorship. */
export const ADDITIONAL_SPONSOR_PASS_ID = 'vip-discount-sponsor';

/** Paid add-on pass for a company that already bought exhibit space. */
export const ADDITIONAL_EXHIBITOR_PASS_ID = 'vip-discount-exhibitor';

/**
 * $0 pass a sponsor claims against an attendee pass their package already
 * included but that they had not named at checkout.
 */
export const COMP_SPONSOR_PASS_ID = 'vip-comp-sponsor';

export function isCompSponsorPassId(ticketId: string | undefined): boolean {
  return ticketId === COMP_SPONSOR_PASS_ID;
}
