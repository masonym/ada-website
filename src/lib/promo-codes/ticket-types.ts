// Ticket types eligible for a promo code, derived from the same constants the
// registration modal sells from. Promo codes match on the ticket id sent at
// checkout, so anything hand-maintained here drifts out of sync with the real
// ids (and silently stops discounting).

import {
  getExhibitorsForEvent,
  getRegistrationsForEvent,
  getSponsorshipsForEvent,
} from "@/lib/registration-adapters";

export type TicketTypeCategory = "ticket" | "exhibit" | "sponsorship";

export interface TicketTypeOption {
  id: string;
  label: string;
  category: TicketTypeCategory;
  /** Of the events asked about, the ones that actually offer this ticket type. */
  eventIds: number[];
}

export const TICKET_CATEGORY_LABELS: Record<TicketTypeCategory, string> = {
  ticket: "Passes & Add-Ons",
  exhibit: "Exhibit Space",
  sponsorship: "Sponsorships",
};

const CATEGORY_ORDER: TicketTypeCategory[] = [
  "ticket",
  "exhibit",
  "sponsorship",
];

/**
 * Every discountable ticket type offered by the given events, deduped by id.
 * Ordering follows the constants (top sponsorship tier first, etc.), grouped by
 * category.
 */
export function getTicketTypeOptionsForEvents(
  eventIds: number[],
): TicketTypeOption[] {
  const optionsById = new Map<string, TicketTypeOption>();

  eventIds.forEach((eventId) => {
    const items = [
      ...getRegistrationsForEvent(eventId),
      ...getExhibitorsForEvent(eventId),
      ...getSponsorshipsForEvent(eventId),
    ];

    items.forEach((item) => {
      // Early events describe their registrations without ids, and the
      // "Sponsorship Opportunities" entry is a link to the sponsorship page
      // rather than something that can be bought.
      if (!item.id || item.type === "sponsor") return;
      // A percentage off a $0 pass is a no-op.
      if (item.type === "complimentary" || item.type === "free") return;

      const existing = optionsById.get(item.id);
      if (existing) {
        if (!existing.eventIds.includes(eventId))
          existing.eventIds.push(eventId);
        return;
      }

      optionsById.set(item.id, {
        id: item.id,
        label: item.title || item.name || item.id,
        category: item.category,
        eventIds: [eventId],
      });
    });
  });

  // Stable sort, so the per-event source ordering survives inside each category.
  return [...optionsById.values()].sort(
    (a, b) =>
      CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category),
  );
}
