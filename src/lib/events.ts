import { EVENTS } from '@/constants/events';
import { Event } from '@/types/events';

/**
 * Get an event by its ID
 * @param eventId The ID of the event to retrieve
 * @returns The event object or undefined if not found
 */
export async function getEvent(eventId: string | number): Promise<Event | undefined> {
  // Convert eventId to string for comparison
  const id = eventId.toString();
  
  // Find the event in the EVENTS constant
  const event = EVENTS.find(event => event.id.toString() === id);
  
  return event;
}

/**
 * Get an event by its slug
 * @param slug The slug of the event to retrieve
 * @returns The event object or undefined if not found
 */
export async function getEventBySlug(slug: string): Promise<Event | undefined> {
  // Find the event in the EVENTS constant
  const event = EVENTS.find(event => event.slug === slug);
  
  return event;
}

/**
 * Get all events
 * @returns Array of all events
 */
export async function getAllEvents(): Promise<Event[]> {
  return EVENTS;
}

/**
 * Get upcoming events (events with start dates in the future)
 * @returns Array of upcoming events
 */
export async function getUpcomingEvents(): Promise<Event[]> {
  const now = new Date();
  
  return EVENTS.filter(event => {
    // Use date property instead of startDate
    const startDate = new Date(event.date);
    return startDate >= now;
  });
}

/**
 * Get past events (events with end dates in the past)
 * @returns Array of past events
 */
export async function getPastEvents(): Promise<Event[]> {
  const now = new Date();
  
  return EVENTS.filter(event => {
    // Use date property since endDate is not available
    const endDate = new Date(event.date);
    return endDate < now;
  });
}
