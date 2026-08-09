import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { logRegistration } from '@/lib/google-sheets';
import { validateRegistrationData, isGovOrMilEmail } from '@/lib/event-registration/validation';
import { OrderSummary } from '@/lib/email/templates';
import { sendRegistrationConfirmationEmails } from '@/lib/email/confirmation-emails';
import { AdapterModalRegistrationType } from '@/lib/registration-adapters';
import { EVENTS } from '@/constants/events';
import { savePendingRegistration } from '@/lib/aws/dynamodb';
import { validatePromoCodeForOrder } from '@/lib/promo-codes/validate';
import {
  resolveOrderPricing,
  applyPromoDiscount,
  getOrderCatalogue,
} from '@/lib/event-registration/order';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const currentEventId = body.eventId;
    const eventId = Number(currentEventId);

    const { isValid, errors, validatedData } = await validateRegistrationData(body);
    if (!isValid || !validatedData) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    const { email, tickets, promoCode } = validatedData;

    const event = EVENTS.find(e => e.id === eventId);
    if (!event) {
      console.error(`Event ID ${eventId} not found in EVENTS`);
      return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
    }

    // Prices come from the constants files, never from the request. `ticketPrices`
    // is still read, but only to log a disagreement - see lib/event-registration/order.
    const resolved = resolveOrderPricing(eventId, tickets, {
      clientPrices: body.ticketPrices,
    });

    if (!resolved.ok) {
      return NextResponse.json(
        { success: false, errors: { [resolved.field]: resolved.error } },
        { status: 400 }
      );
    }

    if (resolved.mismatches.length > 0) {
      // Usually a price tier rolling over while the modal was open. Harmless -
      // the customer is charged the server price - but worth seeing in the logs.
      console.warn(
        `[register] Event ${eventId}: client/server price mismatch`,
        resolved.mismatches
      );
    }

    // Complimentary tickets are gov/mil only. Checked here as well as in the yup
    // schema because the schema skips sponsor passes and add-on shapes.
    const catalogue = getOrderCatalogue(eventId);
    for (const item of resolved.items) {
      if (item.type !== 'complimentary') continue;
      if (item.ticketId.endsWith('-additional-pass')) continue; // sponsor passes are exempt

      const submitted = tickets.find(t => t.ticketId === item.ticketId);
      for (const attendee of submitted?.attendeeInfo ?? []) {
        if (!isGovOrMilEmail(attendee.email)) {
          return NextResponse.json(
            { success: false, errors: { email: 'Gov/mil email required for complimentary tickets.' } },
            { status: 400 }
          );
        }
      }
    }

    let promoCodeDetails: Awaited<ReturnType<typeof validatePromoCodeForOrder>> | null = null;
    if (promoCode) {
      const promoResult = await validatePromoCodeForOrder(promoCode, currentEventId, tickets);
      if (!promoResult.valid) {
        return NextResponse.json(
          { success: false, errors: { promoCode: promoResult.error } },
          { status: 400 }
        );
      }
      promoCodeDetails = promoResult;
    }

    const { subtotal, discount, total } = applyPromoDiscount(
      resolved.items,
      promoCodeDetails?.valid
        ? {
            discountPercentage: promoCodeDetails.discountPercentage,
            eligibleTicketTypes: promoCodeDetails.eligibleTicketTypes,
          }
        : undefined
    );

    const hasComplimentaryTickets = resolved.items.some(i => i.type === 'complimentary');
    const hasPaidTickets = resolved.items.some(i => i.type === 'paid' || i.type === 'sponsor');
    const isFreeRegistration = !hasPaidTickets && hasComplimentaryTickets;

    const orderSummaryItems = resolved.items.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: item.unitPrice,
    }));

    if (total === 0) {
      const orderId = `ORDER-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      await logRegistration(
        currentEventId,
        validatedData,
        orderId,
        isFreeRegistration ? 'free' : 'paid_free',
        0,
        promoCode,
        discount
      );

      const registrationsForEmail: AdapterModalRegistrationType[] = resolved.items
        .map(item => {
          const entry = catalogue.get(item.ticketId);
          if (!entry) return null;
          return { ...entry, quantity: item.quantity } as AdapterModalRegistrationType;
        })
        .filter((r): r is AdapterModalRegistrationType => r !== null);

      const orderSummary: OrderSummary = {
        orderId,
        orderDate: new Date().toLocaleDateString(),
        items: orderSummaryItems,
        subtotal,
        discount,
        total,
      };

      await sendRegistrationConfirmationEmails({
        registrationData: validatedData,
        event,
        registrations: registrationsForEmail,
        orderId,
        orderSummary,
      });

      return NextResponse.json({
        success: true,
        orderId,
        paymentStatus: isFreeRegistration ? 'free' : 'free_with_promo',
        amountPaid: 0,
      });
    }

    const pendingRegistrationId = await savePendingRegistration(validatedData);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // cents
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
        eligibleTicketTypes: promoCodeDetails?.valid && promoCodeDetails.eligibleTicketTypes
          ? JSON.stringify(promoCodeDetails.eligibleTicketTypes)
          : '',
        orderValidations: validatedData.orderValidations
          ? JSON.stringify(validatedData.orderValidations)
          : '',
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
      {
        success: false,
        error: 'An error occurred while processing your registration',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
