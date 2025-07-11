import { NextResponse } from 'next/server';
import { getEnv } from '@/lib/env';
import { stripe } from '@/lib/stripe/server';
import { logRegistration } from '@/lib/google-sheets';
import { validateRegistrationData } from '@/lib/event-registration/validation';
import { OrderSummary } from '@/lib/email/templates';
import { sendRegistrationConfirmationEmails } from '@/lib/email/confirmation-emails';
import { AdapterModalRegistrationType } from '@/lib/registration-adapters';
import { EVENTS } from '@/constants/events';
import { isGovOrMilEmail } from '@/lib/event-registration/validation';
import { REGISTRATION_TYPES } from '@/constants/registrations';
import { savePendingRegistration } from '@/lib/aws/dynamodb';

// Helper function to calculate order total
function calculateOrderTotal(
  ticketSelections: Array<{ ticketId: string; quantity: number }>,
  availableTickets: Array<{ id: string; price: number; earlyBirdPrice?: number; earlyBirdDeadline?: string }>,
  promoCode?: { discountAmount?: number; discountPercentage?: number; eligibleTicketTypes?: string[] }
): { subtotal: number; discount: number; total: number } {
  let subtotal = 0;
  let eligibleSubtotal = 0;
  const now = new Date();
  const ticketSubtotals = new Map<string, number>();

  // Calculate subtotal based on ticket prices
  for (const selection of ticketSelections) {
    const ticket = availableTickets.find(t => t.id === selection.ticketId);
    if (!ticket) continue;

    const isEarlyBird = ticket.earlyBirdDeadline && new Date(ticket.earlyBirdDeadline) > now;
    const price = isEarlyBird && ticket.earlyBirdPrice ? ticket.earlyBirdPrice : ticket.price;
    const ticketSubtotal = price * selection.quantity;
    
    subtotal += ticketSubtotal;
    ticketSubtotals.set(selection.ticketId, ticketSubtotal);
    
    // Track subtotal for eligible tickets if promo code has eligibility restrictions
    if (promoCode?.eligibleTicketTypes && promoCode.eligibleTicketTypes.includes(selection.ticketId)) {
      eligibleSubtotal += ticketSubtotal;
    }
  }

  // Apply promo code discount if available
  let discount = 0;
  if (promoCode) {
    // If eligibleTicketTypes is provided, only apply discount to eligible tickets
    const baseForDiscount = promoCode.eligibleTicketTypes ? eligibleSubtotal : subtotal;
    
    if (promoCode.discountAmount) {
      discount = Math.min(promoCode.discountAmount, baseForDiscount);
    } else if (promoCode.discountPercentage) {
      discount = baseForDiscount * (promoCode.discountPercentage / 100);
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
    // console.log("BODY FROM REGISTRATION ROUTE: ", body);
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

    // Format promoCodeDetails to match what calculateOrderTotal expects
    const promoCodeForCalc = promoCodeDetails ? {
      discountPercentage: promoCodeDetails.discountPercentage,
      eligibleTicketTypes: promoCodeDetails.eligibleTicketTypes // Include eligibleTicketTypes for selective discount
    } : undefined;
    
    const { subtotal, discount, total } = calculateOrderTotal(tickets, paidTickets, promoCodeForCalc);

    if (total === 0) {
      const orderId = `ORDER-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      await logRegistration(currentEventId, validatedData, orderId, isFreeRegistration ? 'free' : 'paid_free', 0, promoCode, discount);

      const event = EVENTS.find(e => e.id === eventId);

      if (event) {
        const registrationsForEmail: AdapterModalRegistrationType[] = validatedData.tickets
          .map(ticket => {
            const registrationType = eventRegistrations.registrations.find(reg => 'id' in reg && reg.id === ticket.ticketId);
            if (!registrationType) return null;
            return {
              ...(registrationType as any),
              quantity: ticket.quantity,
            };
          })
          .filter((r): r is AdapterModalRegistrationType => r !== null);
          
        // Create order summary for confirmation email
        const orderSummaryItems = validatedData.tickets.map(ticket => {
          const registrationType = eventRegistrations.registrations.find(reg => 'id' in reg && reg.id === ticket.ticketId);
          let price = 0;
          
          if (body.ticketPrices && typeof body.ticketPrices[ticket.ticketId] === 'number') {
            price = body.ticketPrices[ticket.ticketId];
          } else if (registrationType && 'price' in registrationType && typeof registrationType.price === 'number') {
            price = registrationType.price;
          }
          
          return {
            name: registrationType?.title || ticket.ticketId,
            quantity: ticket.quantity,
            price: price
          };
        });
        
        const orderSummary: OrderSummary = {
          orderId: orderId,
          orderDate: new Date().toLocaleDateString(),
          items: orderSummaryItems,
          subtotal: subtotal,
          discount: discount,
          total: total
        };

        await sendRegistrationConfirmationEmails({
          registrationData: validatedData,
          event,
          registrations: registrationsForEmail,
          orderId: orderId,
          orderSummary: orderSummary,
        });
      }

      return NextResponse.json({ success: true, orderId, paymentStatus: isFreeRegistration ? 'free' : 'free_with_promo', amountPaid: 0 });
    }

    const pendingRegistrationId = await savePendingRegistration(validatedData);
    // Create order summary for payment receipt
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // Convert to cents
      currency: 'usd',
      description: `Registration for event ${body.eventTitle} by ${validatedData.firstName} ${validatedData.lastName}`,
      receipt_email: email,
      // statement_descriptor_suffix: `${body.eventTitle.substring(0, 12)}`, // Add event title as descriptor suffix (limited to 12 chars for safety)
      metadata: {
        eventId: currentEventId,
        orderType: 'event-registration',
        email,
        promoCode: promoCode || '',
        contactName: `${validatedData.firstName} ${validatedData.lastName}`,
        discountAmount: discount.toString(),
        pendingRegistrationId,
        // Store eligible ticket types if promo code has restrictions
        eligibleTicketTypes: promoCodeDetails?.eligibleTicketTypes ? JSON.stringify(promoCodeDetails.eligibleTicketTypes) : '',
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
