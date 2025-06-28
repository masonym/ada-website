import { NextResponse } from 'next/server';
import { getConfirmedRegistration } from '@/lib/aws/dynamodb';
import { EXHIBITOR_TYPES } from '@/constants/exhibitors';
import { SPONSORSHIP_TYPES } from '@/constants/sponsorships';

// Helper function to get all exhibitor and sponsor IDs for a given event
const getEligibleTicketIdsForEvent = (eventId: string): string[] => {
  const exhibitorEvent = EXHIBITOR_TYPES.find(e => e.id.toString() === eventId);
  const sponsorEvent = SPONSORSHIP_TYPES.find(s => s.id.toString() === eventId);

  const exhibitorIds = exhibitorEvent ? exhibitorEvent.exhibitors.map(ex => ex.id) : [];
  const sponsorIds = sponsorEvent
    ? [
        ...(sponsorEvent.primeSponsor ? [sponsorEvent.primeSponsor.id] : []),
        ...sponsorEvent.sponsorships.map(sp => sp.id),
      ]
    : [];

  return [...exhibitorIds, ...sponsorIds];
};

export async function POST(request: Request) {
  try {
    const { orderId, eventId } = await request.json();

    if (!orderId || !eventId) {
      return NextResponse.json({ error: 'Order ID and Event ID are required' }, { status: 400 });
    }

    const registration = await getConfirmedRegistration(orderId);

    if (!registration) {
      return NextResponse.json({ isValid: false, message: 'Order not found.' }, { status: 404 });
    }

    // Check if the registration belongs to the correct event
    if (registration.eventId.toString() !== eventId.toString()) {
        return NextResponse.json({ isValid: false, message: 'Order ID is not for the selected event.' }, { status: 400 });
    }

    const eligibleTicketIds = getEligibleTicketIdsForEvent(eventId);

    const isEligible = registration.tickets.some(ticket =>
      eligibleTicketIds.includes(ticket.ticketId)
    );

    if (isEligible) {
      return NextResponse.json({ isValid: true });
    } else {
      return NextResponse.json({ isValid: false, message: 'This order does not contain an eligible Exhibitor or Sponsor pass.' });
    }
  } catch (error) {
    console.error('Error validating order:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Internal Server Error', details: errorMessage }, { status: 500 });
  }
}
