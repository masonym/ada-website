import { SCHEDULES } from '@/constants/schedules';

export type HighlightItem = {
  // Minimal keys to locate the session and render a highlight
  sessionTime?: string;
  sessionTitle?: string;
  /** Optional day selector to disambiguate across multi-day schedules */
  sessionDayDate?: string; // e.g., "May 28, 2026"
  sessionDayIndex?: number; // 0-based index in the schedule's days array
  videoId?: string; // YouTube ID placeholder acceptable
  videoStartTime?: number;
};

export type HighlightsMap = Record<number, HighlightItem[]>; // keyed by source eventId

// Initial highlights. Placeholder video IDs are fine.
export const HIGHLIGHTS: HighlightsMap = {
  // 2025 Navy & Marine Corps Procurement Conference (event id: 4)
  4: [
    {
      sessionDayDate: 'July 29, 2025',
      sessionTime: '11:25 AM',
      sessionTitle: 'Fleet Readiness Panel – Addressing Critical Challenges & Requirements',
      videoId: 'Qfpk0DPH0Mg'
    },
    {
      sessionDayDate: 'July 29, 2025',
      sessionTime: '2:15 PM',
      sessionTitle: 'UNITED STATES MARINE CORPS KEYNOTE ADDRESS',
      videoId: 'JbiElkPPYrc'
    },
    {
      sessionDayDate: 'July 30, 2025',
      sessionTime: '9:00 AM',
      sessionTitle: 'How to do Business with the Primes',
      videoId: 'nUi7lIniESM'
    }
  ]
};

// Helper to find a schedule item by time/title within an event schedule
export function findScheduleItem(
  eventId: number,
  time?: string,
  title?: string,
  day?: { date?: string; index?: number }
) {
  const scheduleEntry = SCHEDULES.find((s) => s.id === eventId);
  if (!scheduleEntry) return null;
  for (let i = 0; i < scheduleEntry.schedule.length; i++) {
    const scheduleDay = scheduleEntry.schedule[i];
    // If a day filter is provided, enforce it
    if (day) {
      const dateMatches = day.date ? (scheduleDay.date || '').trim().toLowerCase() === day.date.trim().toLowerCase() : true;
      const indexMatches = typeof day.index === 'number' ? i === day.index : true;
      if (!(dateMatches && indexMatches)) continue;
    }

    for (const item of scheduleDay.items) {
      const itemTitle = (item.title || '').trim().toLowerCase();
      const itemTime = (item.time || '').trim().toLowerCase();
      const titleGiven = typeof title === 'string' && title.trim().length > 0;
      const timeGiven = typeof time === 'string' && time.trim().length > 0;

      const titleMatches = titleGiven ? itemTitle === title!.trim().toLowerCase() : false;
      const timeMatches = timeGiven ? itemTime === time!.trim().toLowerCase() : false;

      // Matching strategy:
      // - If both title and time provided, require both
      // - Else if only title provided, require title
      // - Else if only time provided, require time
      if ((titleGiven && timeGiven && titleMatches && timeMatches)
        || (titleGiven && !timeGiven && titleMatches)
        || (!titleGiven && timeGiven && timeMatches)) {
        return { day: scheduleDay, item };
      }
    }
  }
  return null;
}
