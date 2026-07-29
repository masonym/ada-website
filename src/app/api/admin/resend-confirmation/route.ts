import { NextRequest, NextResponse } from 'next/server';
import { EVENTS } from '@/constants/events';
import { getConfirmedRegistration } from '@/lib/aws/dynamodb';
import { sendRegistrationConfirmationEmail } from '@/lib/email/confirmation-emails';
import {
  getRegistrationsForEvent,
  getSponsorshipsForEvent,
  getExhibitorsForEvent,
  AdapterModalRegistrationType,
} from '@/lib/registration-adapters';
import { StoredRegistrationData } from '@/types/event-registration/registration';
import { isAuthenticatedAdmin } from '@/lib/admin-auth';

const EVENTS_INBOX = 'events@americandefensealliance.org';

function allRegistrationTypesForEvent(eventId: string | number): AdapterModalRegistrationType[] {
  return [
    ...getRegistrationsForEvent(eventId),
    ...getSponsorshipsForEvent(eventId),
    ...getExhibitorsForEvent(eventId),
  ];
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Looks up a confirmed order so the admin can eyeball it before re-sending.
 * Returns 200 with `found: false` for unknown IDs - comped/$0 registrations are
 * only logged to Google Sheets, so "not found" is an expected outcome that the
 * UI handles by falling back to manual entry.
 */
export async function GET(request: NextRequest) {
  if (!(await isAuthenticatedAdmin(request))) {
    return NextResponse.json({ error: 'Admin session expired - please log in again' }, { status: 401 });
  }

  const orderId = new URL(request.url).searchParams.get('orderId')?.trim();
  if (!orderId) {
    return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
  }

  try {
    const registration = (await getConfirmedRegistration(orderId)) as StoredRegistrationData | null;

    if (!registration) {
      return NextResponse.json({
        found: false,
        message:
          'No stored order with that ID. Comped and $0 registrations are not saved to DynamoDB - enter the details manually below.',
      });
    }

    const event = EVENTS.find(e => e.id.toString() === registration.eventId?.toString());
    const registrationTypes = allRegistrationTypesForEvent(registration.eventId);

    return NextResponse.json({
      found: true,
      order: {
        orderId,
        eventId: registration.eventId,
        eventTitle: event?.title ?? `Unknown event (${registration.eventId})`,
        createdAt: registration.createdAt,
        purchaser: {
          firstName: registration.firstName,
          lastName: registration.lastName,
          email: registration.email,
          company: registration.company,
        },
        tickets: (registration.tickets || []).map(ticket => ({
          ticketId: ticket.ticketId,
          ticketName:
            ticket.ticketName ||
            registrationTypes.find(rt => rt.id === ticket.ticketId)?.title ||
            ticket.ticketId,
          quantity: ticket.quantity,
          attendees: (ticket.attendeeInfo || []).map(attendee => ({
            name: `${attendee.firstName} ${attendee.lastName}`.trim(),
            email: attendee.email,
          })),
        })),
      },
    });
  } catch (error) {
    console.error('[admin/resend-confirmation] Lookup failed:', error);
    return NextResponse.json({ error: 'Failed to look up order' }, { status: 500 });
  }
}

/**
 * Re-sends a registration confirmation to a single new contact - the usual case
 * being an attendee substitution. No order summary is attached: the replacement
 * attendee did not pay, so the email is the pass itself and nothing more.
 */
export async function POST(request: NextRequest) {
  if (!(await isAuthenticatedAdmin(request))) {
    return NextResponse.json({ error: 'Admin session expired - please log in again' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      orderId,
      firstName,
      lastName,
      email,
      jobTitle,
      company,
      phone,
      eventId: eventIdOverride,
      ticketIds: ticketIdsOverride,
      copyEventsInbox = false,
    } = body;

    if (!orderId || !firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'orderId, firstName, lastName and email are all required' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    let registration: StoredRegistrationData | null = null;
    try {
      registration = (await getConfirmedRegistration(orderId.trim())) as StoredRegistrationData | null;
    } catch (error) {
      // A DynamoDB outage should not block a manual send - fall through to the
      // overrides and let the missing-eventId check below decide.
      console.error('[admin/resend-confirmation] Lookup failed, continuing:', error);
    }

    const eventId = registration?.eventId ?? eventIdOverride;
    if (!eventId) {
      return NextResponse.json(
        { error: 'Order not found - supply eventId and ticketIds to send manually' },
        { status: 400 }
      );
    }

    const event = EVENTS.find(e => e.id.toString() === eventId.toString());
    if (!event) {
      return NextResponse.json({ error: `Event ${eventId} not found` }, { status: 404 });
    }

    const ticketIds: string[] =
      ticketIdsOverride?.length > 0
        ? ticketIdsOverride
        : (registration?.tickets || []).map(ticket => ticket.ticketId);

    if (ticketIds.length === 0) {
      return NextResponse.json({ error: 'No ticket types selected' }, { status: 400 });
    }

    const registrationTypes = allRegistrationTypesForEvent(eventId);
    const registrations = ticketIds
      .map(id => registrationTypes.find(rt => rt.id === id))
      .filter((r): r is AdapterModalRegistrationType => r !== undefined);

    if (registrations.length === 0) {
      return NextResponse.json(
        { error: `None of the selected ticket types exist for event ${eventId}` },
        { status: 400 }
      );
    }

    const attendee = {
      firstName,
      lastName,
      email,
      jobTitle,
      company,
      phone,
    };

    const result = await sendRegistrationConfirmationEmail({
      email,
      firstName,
      event,
      registrations,
      orderId: orderId.trim(),
      attendees: [attendee],
    });

    if (!result?.success) {
      console.error('[admin/resend-confirmation] Send failed:', result);
      return NextResponse.json(
        { error: result?.error || 'Failed to send confirmation email' },
        { status: 502 }
      );
    }

    let copySent = false;
    if (copyEventsInbox) {
      // Resend allows 2 requests/second; the same 1200ms spacing the bulk
      // confirmation sender uses.
      await new Promise(resolve => setTimeout(resolve, 1200));
      const copyResult = await sendRegistrationConfirmationEmail({
        email: EVENTS_INBOX,
        firstName,
        event,
        registrations,
        orderId: orderId.trim(),
        attendees: [attendee],
      });
      copySent = Boolean(copyResult?.success);
      if (!copySent) {
        console.error('[admin/resend-confirmation] Events inbox copy failed:', copyResult);
      }
    }

    console.log(
      `[admin/resend-confirmation] Re-sent confirmation for order ${orderId} to ${email}`
    );

    return NextResponse.json({
      success: true,
      sentTo: email,
      eventTitle: event.title,
      ticketIds: registrations.map(r => r.id),
      orderFound: Boolean(registration),
      copySent,
    });
  } catch (error) {
    console.error('[admin/resend-confirmation] Unexpected error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
