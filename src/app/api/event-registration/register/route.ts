import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { fitStripeMetadata } from '@/lib/stripe/metadata';
import { logRegistration } from '@/lib/google-sheets';
import { validateRegistrationData, isGovOrMilEmail } from '@/lib/event-registration/validation';
import { OrderSummary } from '@/lib/email/templates';
import { sendRegistrationConfirmationEmails } from '@/lib/email/confirmation-emails';
import { AdapterModalRegistrationType } from '@/lib/registration-adapters';
import { EVENTS } from '@/constants/events';
import {
  savePendingRegistration,
  saveFailedRegistration,
  saveConfirmedRegistration,
  claimSponsorPasses,
  releaseSponsorPasses,
} from '@/lib/aws/dynamodb';
import {
  CompPassClaim,
  isCompSponsorPassId,
  planCompPassClaims,
} from '@/lib/event-registration/sponsor-pass-entitlement';
import { validatePromoCodeForOrder } from '@/lib/promo-codes/validate';
import {
  resolveOrderPricing,
  applyPromoDiscount,
  getOrderCatalogue,
} from '@/lib/event-registration/order';

export async function POST(request: Request) {
  // Hoisted so the catch can record what was attempted. A failed registration
  // otherwise leaves no trace: Stripe has no PaymentIntent, the sheet only logs
  // successes, and the pending row expires after 24 hours.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let body: any;
  let pendingRegistrationId: string | undefined;
  // Passes already decremented off a sponsor's original order. Handed back if the
  // request fails after the claim - see the catch.
  const claimedPasses: CompPassClaim[] = [];

  try {
    body = await request.json();
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
      // Sponsor passes are exempt: bundled ones, and the comped claim of a
      // pass the sponsorship already paid for.
      if (item.ticketId.endsWith('-additional-pass')) continue;
      if (isCompSponsorPassId(item.ticketId)) continue;

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

    // A complimentary Additional Sponsor Attendee Pass is priced at 0 by the
    // resolver like any other complimentary line, so this is the only thing
    // standing between a crafted POST and unlimited free passes: each one must
    // name a verified order, and the claim is decremented off that order under a
    // conditional update before the registration is allowed to proceed.
    const claimPlan = planCompPassClaims(resolved.items, body.orderValidations);
    if (!claimPlan.ok) {
      return NextResponse.json(
        { success: false, errors: { tickets: claimPlan.error } },
        { status: 400 }
      );
    }

    for (const claim of claimPlan.claims) {
      const result = await claimSponsorPasses(claim.orderId, claim.count, eventId);

      if (!result.ok) {
        // Nothing has been charged or recorded yet, but earlier claims in this
        // same order have already been decremented.
        await Promise.all(
          claimedPasses.map(c => releaseSponsorPasses(c.orderId, c.count))
        );

        const message =
          result.reason === 'insufficient'
            ? `Order ${claim.orderId} has ${result.remaining} complimentary sponsor pass(es) remaining; ${claim.count} requested.`
            : result.reason === 'unknown-entitlement'
              ? `We cannot tell how many complimentary passes order ${claim.orderId} has left. Please contact us and we will register your attendee for you.`
              : `Order ${claim.orderId} is not a sponsorship order for this event.`;

        return NextResponse.json(
          { success: false, errors: { tickets: message } },
          { status: 400 }
        );
      }

      claimedPasses.push(claim);
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

      // Free orders used to stop at the sheet and the emails, leaving no row in
      // the permanent table. That is fine for a comped attendee but not for a
      // sponsorship: without a stored order there are no pass counters to claim
      // against later, and a claim placed here would leave no record of itself.
      //
      // Only fatal for an order that spent someone's passes - handing those out
      // with no record of it is worse than failing. A gov/mil comped attendee
      // registered fine for years without this row and still should if the write
      // fails, so there it is logged and the registration continues.
      try {
        await saveConfirmedRegistration(validatedData, orderId);
      } catch (saveError) {
        console.error(`Could not record free registration ${orderId}:`, saveError);
        if (claimedPasses.length > 0) throw saveError;
      }

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

    pendingRegistrationId = await savePendingRegistration(validatedData);

    // The webhook only ever asks whether a ticket *in this order* was eligible,
    // so carry the intersection instead of the promo code's whole eligibility
    // list - a code covering every ticket type serialized past Stripe's 500-char
    // metadata limit and failed the whole payment intent.
    const orderedTicketIds = new Set(resolved.items.map(item => item.ticketId));
    const eligibleTicketTypesInOrder =
      promoCodeDetails?.valid && promoCodeDetails.eligibleTicketTypes
        ? promoCodeDetails.eligibleTicketTypes.filter(id => orderedTicketIds.has(id))
        : [];

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // cents
      currency: 'usd',
      description: `Registration for event ${body.eventTitle} by ${validatedData.firstName} ${validatedData.lastName}`,
      receipt_email: email,
      // Everything here is length-checked: an oversized value would 400 the
      // whole request rather than just losing that field.
      metadata: fitStripeMetadata(
        {
          eventId: String(currentEventId),
          orderType: 'event-registration',
          email,
          promoCode: promoCode || '',
          contactName: `${validatedData.firstName} ${validatedData.lastName}`,
          discountAmount: discount.toString(),
          pendingRegistrationId,
          eligibleTicketTypes: eligibleTicketTypesInOrder.length
            ? JSON.stringify(eligibleTicketTypesInOrder)
            : '',
        },
        'register'
      ),
    });

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: total,
    });
  } catch (error) {
    console.error('Error processing registration:', error);

    // The order never happened, so passes claimed for it go back on the shelf.
    await Promise.all(
      claimedPasses.map(claim => releaseSponsorPasses(claim.orderId, claim.count))
    );

    // Outlives the 24-hour pending row and the host's log retention, so an order
    // lost here is still reconstructable - and the customer still reachable -
    // weeks later. saveFailedRegistration swallows its own errors.
    const failureId = await saveFailedRegistration({
      payload: body,
      error,
      pendingRegistrationId,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while processing your registration',
        details: error instanceof Error ? error.message : 'Unknown error',
        // Gives support something to quote back to us.
        reference: failureId ?? undefined,
      },
      { status: 500 }
    );
  }
}
