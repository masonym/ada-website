import { NextResponse } from 'next/server';
import { getEnv } from '@/lib/env';
import { stripe } from '@/lib/stripe/server';
import { logRegistration } from '@/lib/google-sheets';
import { validateRegistrationData } from '@/lib/event-registration/validation';
import { sendRegistrationConfirmationEmail } from '@/lib/email/confirmation-emails';
import { ModalRegistrationType } from '@/lib/registration-adapters';
import { EVENTS } from '@/constants/events';
import { isGovOrMilEmail } from '@/lib/event-registration/validation';
import { REGISTRATION_TYPES } from '@/constants/registrations';
import { savePendingRegistration } from '@/lib/aws/dynamodb';

// Helper function to calculate order total
function calculateOrderTotal(
  ticketSelections: Array<{ ticketId: string; quantity: number }>,
  availableTickets: Array<{ id: string; price: number; earlyBirdPrice?: number; earlyBirdDeadline?: string }>,
  promoCode?: { discountAmount?: number; discountPercentage?: number }
): { subtotal: number; discount: number; total: number } {
  let subtotal = 0;
  const now = new Date();

  // Calculate subtotal based on ticket prices
  for (const selection of ticketSelections) {
    const ticket = availableTickets.find(t => t.id === selection.ticketId);
    if (!ticket) continue;

    const isEarlyBird = ticket.earlyBirdDeadline && new Date(ticket.earlyBirdDeadline) > now;
    const price = isEarlyBird && ticket.earlyBirdPrice ? ticket.earlyBirdPrice : ticket.price;

    subtotal += price * selection.quantity;
  }

  // Apply promo code discount if available
  let discount = 0;
  if (promoCode) {
    if (promoCode.discountAmount) {
      discount = Math.min(promoCode.discountAmount, subtotal);
    } else if (promoCode.discountPercentage) {
      discount = subtotal * (promoCode.discountPercentage / 100);
    }
  }

  // Ensure total is not negative
  const total = Math.max(0, subtotal - discount);

  return { subtotal, discount, total };
}

export async function POST(request: Request) {
  try {
    const env = getEnv();
    const body = await request.json();
    console.log("BODY FROM REGISTRATION ROUTE: ", body);
    const eventIdFromBody = body.eventId; // Extract eventId from the raw body

    const { isValid, errors, validatedData } = await validateRegistrationData(body);
    if (!isValid || !validatedData) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    const { email, tickets, promoCode } = validatedData;
    const currentEventId = eventIdFromBody;

    const eventId = Number(currentEventId);
    const eventRegistrations = REGISTRATION_TYPES.find(event => event.id === eventId);

    if (!eventRegistrations) {
      console.error(`Event ID ${eventId} not found in REGISTRATION_TYPES`);
      return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
    }

    const availableTickets = tickets.map(ticket => {
      const clientProvidedPrice = body.ticketPrices && body.ticketPrices[ticket.ticketId];
      const registrationType = eventRegistrations.registrations.find(reg => 'id' in reg && reg.id === ticket.ticketId);

      if (registrationType) {
        const ticketDef: { id: string; price: number; earlyBirdPrice?: number; earlyBirdDeadline?: string; type: string; } = {
          id: ticket.ticketId,
          price: 0,
          type: 'paid'
        };

        if (clientProvidedPrice !== undefined && typeof clientProvidedPrice === 'number') {
          ticketDef.price = clientProvidedPrice;
        } else if ('price' in registrationType && typeof registrationType.price === 'number') {
          ticketDef.price = registrationType.price;
        }

        if ('type' in registrationType && typeof registrationType.type === 'string') {
          ticketDef.type = registrationType.type;
        }

        if (ticket.ticketId.includes('sponsor')) {
          ticketDef.type = 'sponsor';
        }

        if ('earlyBirdPrice' in registrationType && typeof registrationType.earlyBirdPrice === 'number') {
          ticketDef.earlyBirdPrice = registrationType.earlyBirdPrice;
        }

        if ('earlyBirdDeadline' in registrationType && typeof registrationType.earlyBirdDeadline === 'string') {
          ticketDef.earlyBirdDeadline = registrationType.earlyBirdDeadline;
        }

        return ticketDef;
      }

      if (clientProvidedPrice !== undefined && typeof clientProvidedPrice === 'number') {
        const isSponsorshipTicket = ticket.ticketId.includes('sponsor');
        return { id: ticket.ticketId, price: clientProvidedPrice, type: isSponsorshipTicket ? 'sponsor' : 'paid' };
      }

      console.error(`Ticket ID ${ticket.ticketId} not found for event ${eventId}`);
      return { id: ticket.ticketId, price: 0, type: 'paid' };
    });

    const paidTickets = availableTickets.filter(t => (t.type === 'paid' || t.type === 'sponsor') && typeof t.price === 'number');
    const hasComplimentaryTickets = tickets.some(t => availableTickets.find(at => at.id === t.ticketId)?.type === 'complimentary');

    if (hasComplimentaryTickets) {
      for (const ticket of tickets) {
        const ticketDef = availableTickets.find(t => t.id === ticket.ticketId);
        if (ticketDef?.type === 'complimentary') {
          for (const attendee of ticket.attendeeInfo || []) {
            if (!isGovOrMilEmail(attendee.email)) {
              return NextResponse.json({ success: false, errors: { email: 'Gov/mil email required for complimentary tickets.' } }, { status: 400 });
            }
          }
        }
      }
    }

    const isFreeRegistration = paidTickets.length === 0 && hasComplimentaryTickets;

    let promoCodeDetails = null;
    if (promoCode) {
      const promoResponse = await fetch(`${env.NEXT_PUBLIC_SITE_URL}/api/event-registration/validate-promo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promoCode, eventId: currentEventId, tickets }),
      });
      const promoData = await promoResponse.json();
      if (!promoData.valid) {
        return NextResponse.json({ success: false, errors: { promoCode: promoData.error || 'Invalid promo code' } }, { status: 400 });
      }
      promoCodeDetails = promoData;
    }

    const { discount, total } = calculateOrderTotal(tickets, paidTickets, promoCodeDetails);

    if (total === 0) {
      const orderId = `ORDER-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      await logRegistration(currentEventId, validatedData, orderId, isFreeRegistration ? 'free' : 'paid_free', 0, promoCode, discount);

      const event = EVENTS.find(e => e.id === eventId);

      if (event) {
        const registrationsForEmail: ModalRegistrationType[] = validatedData.tickets
          .map(ticket => {
            const registrationType = eventRegistrations.registrations.find(reg => 'id' in reg && reg.id === ticket.ticketId);
            if (!registrationType) return null;
            return {
              ...(registrationType as any),
              quantity: ticket.quantity,
            };
          })
          .filter((r): r is ModalRegistrationType => r !== null);

        await sendRegistrationConfirmationEmail({
          email: validatedData.email,
          firstName: validatedData.firstName,
          event,
          registrations: registrationsForEmail,
          orderId: orderId,
        });
      }

      return NextResponse.json({ success: true, orderId, paymentStatus: isFreeRegistration ? 'free' : 'free_with_promo', amountPaid: 0 });
    }

    const pendingRegistrationId = await savePendingRegistration(validatedData);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // Convert to cents
      currency: 'usd',
      description: `Registration for event ${body.eventTitle} by ${validatedData.firstName} ${validatedData.lastName}`,
      receipt_email: email,
      metadata: {
        eventId: currentEventId,
        orderType: 'event-registration',
        email,
        promoCode: promoCode || '',
        contactName: `${validatedData.firstName} ${validatedData.lastName}`,
        discountAmount: discount.toString(),
        pendingRegistrationId,
      },
    });

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: total,
    });

  } catch (error) {
    console.error('Error processing registration:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred while processing your registration', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
