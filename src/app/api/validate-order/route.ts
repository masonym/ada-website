import { NextResponse } from 'next/server';
import { getConfirmedRegistration } from '@/lib/aws/dynamodb';
import { EXHIBITOR_TYPES } from '@/constants/exhibitors';
import { SPONSORSHIP_TYPES } from '@/constants/sponsorships';
import { StoredRegistrationData } from '@/types/event-registration/registration';
import { readEntitlement } from '@/lib/event-registration/sponsor-pass-entitlement';

/**
 * Staff bypass for order validation, used to comp an additional pass without a
 * real order id.
 *
 * No fallback: this previously defaulted to the literal 'ADA-VALIDATION-KEY'
 * whenever MASTER_ORDER_KEY was unset - which it is - so anyone who typed that
 * string was validated as a sponsor or exhibitor. An unset variable now disables
 * the bypass rather than opening it.
 */
const MASTER_ORDER_KEY = process.env.MASTER_ORDER_KEY || '';

// Helper function to get all exhibitor and sponsor IDs for a given event
const getEligibleTicketIdsForEvent = (eventId: number): string[] => {
  const exhibitorEvent = EXHIBITOR_TYPES.find(e => e.id === eventId);
  const sponsorEvent = SPONSORSHIP_TYPES.find(s => s.id === eventId);

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
    
    // Check if the provided order ID matches the master key
    if (MASTER_ORDER_KEY && orderId.trim() === MASTER_ORDER_KEY) {
      console.log('Master key used for validation');
      return NextResponse.json({ isValid: true, message: 'Master key validation successful' });
    }

    console.log('Validating order:', { orderId, eventId });
    const registration = await getConfirmedRegistration(orderId.trim()) as StoredRegistrationData;

    if (!registration) {
      return NextResponse.json({ isValid: false, message: 'Order not found.' }, { status: 404 });
    }

    console.log('Registration found:', registration);

    // Check if the registration belongs to the correct event
    if (registration.eventId.toString() !== eventId.toString()) {
      return NextResponse.json({ isValid: false, message: 'Order ID is not for the selected event.' }, { status: 400 });
    }

    const eligibleTicketIds = getEligibleTicketIdsForEvent(eventId);
    console.log('Eligible Ticket IDs:', eligibleTicketIds);

    const isEligible = registration.tickets.some(ticket =>
      eligibleTicketIds.includes(ticket.ticketId)
    );
    console.log('Is Eligible:', isEligible);

    if (isEligible) {
      // Complimentary sponsor passes this order has not spent yet. `known: false`
      // means the order predates the counters, not that it has none left - the
      // modal says so rather than refusing, and those are comped by hand.
      const sponsorPasses = readEntitlement(
        registration as unknown as Record<string, unknown>
      );

      // Return company information for tracking purposes
      return NextResponse.json({ 
        isValid: true,
        validatedOrder: {
          orderId: registration.id,
          company: registration.company,
          email: registration.email,
          eventId: registration.eventId,
          createdAt: registration.createdAt,
          tickets: registration.tickets,
          sponsorPasses
        }
      });
    } else {
      return NextResponse.json({ isValid: false, message: 'This order does not contain an eligible Exhibitor or Sponsor pass.' });
    }
  } catch (error) {
    console.error('Error validating order:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Internal Server Error', details: errorMessage }, { status: 500 });
  }
}
