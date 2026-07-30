// Helpers for the "sign up for the next event" callout on printable schedules.

import { EVENTS } from '@/constants/events';
import { Event } from '@/types/events';

const MONTHS = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
];

const STATE_NAMES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', DC: 'Washington, DC', FL: 'Florida',
  GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana',
  IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine',
  MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi',
  MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire',
  NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota',
  OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island',
  SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah',
  VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin',
  WY: 'Wyoming',
};

/**
 * Event dates are display strings ("May 28-29, 2026", "November 14, 2024",
 * "June 30 - July 1, 2027"), so `new Date()` can't parse them directly.
 * Returns the start date, or null when the string doesn't look like a date.
 */
export function parseEventStartDate(dateStr?: string): Date | null {
  if (!dateStr) return null;

  const match = dateStr.match(/([A-Za-z]+)\s+(\d{1,2})/);
  const yearMatch = dateStr.match(/(\d{4})/);
  if (!match || !yearMatch) return null;

  const month = MONTHS.indexOf(match[1].toLowerCase());
  if (month === -1) return null;

  return new Date(Number(yearMatch[1]), month, Number(match[2]));
}

/**
 * The next event on the calendar after the one being printed (falling back to
 * the next event after today when the current event's date can't be parsed).
 */
export function findNextEvent(currentEvent?: Event | null): Event | undefined {
  const after = parseEventStartDate(currentEvent?.date) ?? new Date();

  return EVENTS
    .filter((e) => e.shown !== false && e.id !== currentEvent?.id)
    .map((e) => ({ event: e, start: parseEventStartDate(e.date) }))
    .filter((e): e is { event: Event; start: Date } => e.start !== null && e.start > after)
    .sort((a, b) => a.start.getTime() - b.start.getTime())[0]?.event;
}

/** "8989 North Gate Boulevard, Colorado Springs, Colorado 80921" -> "Colorado Springs, Colorado" */
export function getCityAndState(event?: Event | null): string {
  const address = event?.locationAddress?.replace(/<\/?br\s*\/?>/gi, ',').trim();
  if (!address) return '';

  const parts = address
    .split(',')
    .map((p) => p.trim())
    .filter((p) => p && !/^(usa|united states)$/i.test(p));
  if (parts.length < 2) return '';

  const region = parts[parts.length - 1].replace(/\s*\d{5}(-\d{4})?$/, '').trim();
  const city = parts[parts.length - 2];
  const state = STATE_NAMES[region.toUpperCase()] ?? region;

  return state ? `${city}, ${state}` : city;
}

export function getEventRegistrationUrl(event?: Event | null): string {
  if (!event?.slug) return '';
  return `https://www.americandefensealliance.org/events/${event.slug}?register=true`;
}

export function buildCalloutHeading(event?: Event | null): string {
  if (!event) return '';
  return `Sign-up for the\n${event.title}\ntoday — for 10% off the Early-bird registration prices!`;
}

export function buildCalloutFooter(event?: Event | null): string {
  if (!event) return '';
  const location = getCityAndState(event);
  return location ? `${event.date}\n${location}` : event.date;
}
