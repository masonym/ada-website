import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe/server';
import { getServerEnv } from '@/lib/server-env';
import { logRegistration } from '@/lib/google-sheets';
import { sendRegistrationConfirmationEmails } from '@/lib/email/confirmation-emails';
import { headers } from 'next/headers';
import { RegistrationFormData } from '@/types/event-registration/registration';
import { EVENTS } from '@/constants/events';
import { getRegistrationsForEvent, getSponsorshipsForEvent, getExhibitorsForEvent, AdapterModalRegistrationType } from '@/lib/registration-adapters';
import { resolveEarlyBird } from '@/lib/pricing-tiers';
import { getPendingRegistration, saveConfirmedRegistration, getConfirmedRegistration, markFulfillmentStep, saveFailedRegistration } from '@/lib/aws/dynamodb';
import { StoredRegistrationData } from '@/types/event-registration/registration';

/**
 * Whether an order was fully fulfilled, and if not, whether trying again could
 * change the answer. `retryable` drives the webhook's status code: a step that
 * failed for a transient reason should bring Stripe back, while a malformed or
 * unrecognised order never will be fixed by repeating it.
 */
type FulfillmentOutcome =
  | { ok: true }
  | {
      ok: false;
      retryable: boolean;
      /** Short slug, safe to use as an index-friendly stage on the failure record. */
      code: string;
      /** The long form - error text, per-recipient results - for the record's body. */
      detail?: string;
      error?: unknown;
    };

async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent
): Promise<FulfillmentOutcome> {
  console.log(`PaymentIntent ${paymentIntent.id} succeeded.`);

  const metadata = paymentIntent.metadata;
  const eventId = metadata.eventId;
  const pendingRegistrationId = metadata.pendingRegistrationId;

  if (!pendingRegistrationId || !eventId) {
    console.error('Error: Missing pendingRegistrationId or eventId in payment intent metadata.', { metadata });
    return { ok: false, retryable: false, code: 'missing-payment-intent-metadata' };
  }
  
  // Idempotency is per fulfillment step, not per order. The confirmed row is
  // written before Sheets and email, so an earlier attempt that timed out mid-way
  // leaves a row for an order the customer was never actually served - skipping on
  // the row alone is what turns a partial failure into a permanently silent one.
  let existingRegistration: StoredRegistrationData | null = null;
  try {
    // The payment intent ID is the primary key in our confirmed registrations table
    existingRegistration = await getConfirmedRegistration(paymentIntent.id);
    if (existingRegistration?.sheetsLoggedAt && existingRegistration?.confirmationEmailsSentAt) {
      console.log(`Payment ${paymentIntent.id} is fully processed. Skipping to prevent duplicates.`);
      return { ok: true };
    }
    if (existingRegistration) {
      console.log(
        `Payment ${paymentIntent.id} was partially processed ` +
        `(sheets: ${existingRegistration.sheetsLoggedAt ?? 'no'}, ` +
        `emails: ${existingRegistration.confirmationEmailsSentAt ?? 'no'}). Resuming.`
      );
    }
  } catch (error) {
    console.error('Error checking for existing registration:', error);
    // Continue with processing since we couldn't confirm if it exists
  }

  try {
    // Prefer the stored copy on a retry: the pending record has a 24h TTL and may
    // already be gone, and the stored copy is the one the customer actually paid for.
    const registrationData = existingRegistration ?? await getPendingRegistration(pendingRegistrationId);

    if (!registrationData) {
      console.error(`Could not find pending registration with ID: ${pendingRegistrationId}`);
      return { ok: false, retryable: false, code: 'pending-registration-not-found' };
    }

    // Save to permanent storage. Skipped when the row is already there, so a retry
    // cannot reset the sponsor pass counters and wipe passes claimed since.
    if (!existingRegistration) {
      await saveConfirmedRegistration(registrationData, paymentIntent.id);
    }

    // Both steps are attempted even if the first fails - a customer who is in the
    // sheet but got no email, or the reverse, is better than neither - and the
    // failures are collected so the response can still tell Stripe to come back.
    const failures: string[] = [];

    // Log the registration to Google Sheets
    if (existingRegistration?.sheetsLoggedAt) {
      console.log(`Registration ${paymentIntent.id} was already logged to Google Sheets. Skipping.`);
    } else {
      try {
        const logResult = await logRegistration(
          eventId,
          registrationData,
          paymentIntent.id,
          'succeeded',
          paymentIntent.amount,
          registrationData.promoCode,
          Number(metadata.discountAmount) || 0
        );

        if (!logResult.success) {
          console.error(`Failed to log registration to Google Sheets: ${logResult.error}`);
          failures.push(`google-sheets: ${logResult.error}`);
        } else {
          await markFulfillmentStep(paymentIntent.id, 'sheetsLoggedAt');
          console.log(`Successfully logged registration ${paymentIntent.id} to Google Sheets`);
        }
      } catch (sheetError) {
        console.error('Unexpected error logging to Google Sheets:', sheetError);
        failures.push(`google-sheets: ${sheetError instanceof Error ? sheetError.message : String(sheetError)}`);
        // Continue processing to still try sending emails
      }
    }

    // --- Prepare data for confirmation email ---
    const event = EVENTS.find(e => e.id.toString() === eventId);
    if (!event) {
      console.error(`Event with ID ${eventId} not found.`);
      return { ok: false, retryable: false, code: 'unknown-event' };
    }

    const allRegistrationTypes: AdapterModalRegistrationType[] = [
      ...getRegistrationsForEvent(eventId),
      ...getSponsorshipsForEvent(eventId),
      ...getExhibitorsForEvent(eventId)
    ];

    const purchasedRegistrations: AdapterModalRegistrationType[] = registrationData.tickets
      .map(ticket => allRegistrationTypes.find(regType => regType.id === ticket.ticketId))
      .filter((r): r is AdapterModalRegistrationType => r !== undefined);

    if (purchasedRegistrations.length !== registrationData.tickets.length) {
      console.warn('Mismatch between tickets in order and found registration types.');
    }

        // Parse eligible ticket types if available in metadata
    let eligibleTicketTypes: string[] = [];
    try {
      if (metadata.eligibleTicketTypes) {
        eligibleTicketTypes = JSON.parse(metadata.eligibleTicketTypes);
      }
    } catch (e) {
      console.error('Error parsing eligibleTicketTypes from metadata:', e);
    }

    const orderSummary = {
      orderId: paymentIntent.id,
      orderDate: new Date(paymentIntent.created * 1000).toLocaleDateString(),
      items: registrationData.tickets.map(ticket => {
        const regType = allRegistrationTypes.find(rt => rt.id === ticket.ticketId);
        
        // Check if early bird pricing should apply. Tiers are resolved as of the
        // order date rather than now, so an order placed just before a tier
        // rolled over is still receipted at the price it was charged.
        let itemPrice = Number(regType?.price) || 0;
        const orderDate = new Date(paymentIntent.created * 1000);
        const { earlyBirdPrice, earlyBirdDeadline } = resolveEarlyBird(
          regType ?? {},
          orderDate
        );
        if (earlyBirdPrice && earlyBirdDeadline) {
          // Use early bird price if order date is before the deadline
          if (orderDate < new Date(earlyBirdDeadline)) {
            itemPrice = Number(earlyBirdPrice);
          }
        }

        // Note whether this ticket type was eligible for promo discount
        const isEligibleForPromo = registrationData.promoCode && 
          eligibleTicketTypes.length > 0 && 
          eligibleTicketTypes.includes(ticket.ticketId);
        
        return {
          name: ticket.ticketName || regType?.name || 'Unknown Ticket',
          quantity: ticket.quantity,
          price: itemPrice, // Price is in dollars, using early bird price when applicable
          eligibleForPromo: isEligibleForPromo
        };
      }),
      subtotal: (paymentIntent.amount / 100) + (Number(metadata.discountAmount) || 0), // in dollars
      discount: Number(metadata.discountAmount) || 0, // already in dollars
      total: paymentIntent.amount / 100, // in dollars
      promoCode: registrationData.promoCode || null,
      eligibleTicketTypes: eligibleTicketTypes.length > 0 ? eligibleTicketTypes : null
    };

    if (existingRegistration?.confirmationEmailsSentAt) {
      console.log(`Confirmation emails for ${paymentIntent.id} were already sent. Skipping.`);
      return failures.length
        ? { ok: false, retryable: true, code: 'fulfillment-step-failed', detail: failures.join('; ') }
        : { ok: true };
    }

    // Send confirmation emails to all unique attendees
    try {
      const emailResult = await sendRegistrationConfirmationEmails({
        registrationData,
        event,
        registrations: purchasedRegistrations,
        orderId: paymentIntent.id,
        orderSummary,
      });
      
      if (!emailResult.success) {
        console.error(`Failed to send confirmation emails: ${JSON.stringify(emailResult.results)}`);
        failures.push(`confirmation-emails: ${JSON.stringify(emailResult.results)}`);
      } else {
        await markFulfillmentStep(paymentIntent.id, 'confirmationEmailsSentAt');
        console.log(`Successfully sent confirmation emails for registration ${paymentIntent.id}`);
      }
    } catch (emailError) {
      console.error('Unexpected error sending confirmation emails:', emailError);
      failures.push(`confirmation-emails: ${emailError instanceof Error ? emailError.message : String(emailError)}`);
    }

    return failures.length
      ? { ok: false, retryable: true, code: 'fulfillment-step-failed', detail: failures.join('; ') }
      : { ok: true };

  } catch (error) {
    console.error('Error processing successful payment intent:', error);
    return { ok: false, retryable: true, code: 'unexpected-fulfillment-error', error };
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.error(`PaymentIntent ${paymentIntent.id} failed.`, paymentIntent.last_payment_error);
  // Optional: Add logic to notify the user or internal teams about the failure.
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  console.log(`Charge ${charge.id} for ${charge.amount} was refunded.`);
  // Optional: Add logic to update registration status in your system.
}

/**
 * Fulfillment runs synchronously inside the webhook response, and it is not fast:
 * a Sheets append plus, per recipient, an S3 listing, a render, a send, and a
 * deliberate 1200ms rate-limit pause. A multi-attendee order does not fit in the
 * platform default, and a timeout here means Stripe records a delivery failure
 * with the customer already charged.
 */
export const maxDuration = 60;

export async function POST(request: Request) {
  const env = getServerEnv();
  const signature = (await headers()).get('stripe-signature');

  if (!signature) {
    console.error('No Stripe signature found in request headers.');
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const rawBody = await request.text();
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error: any) {
    console.error('Error constructing webhook event:', error.message);
    return NextResponse.json({ error: `Webhook error: ${error.message}` }, { status: 400 });
  }

  console.log(`Received verified Stripe event: ${event.type}`);
  
  // Process the event synchronously for critical events like payment_intent.succeeded
  // For other events, we can process asynchronously
  const eventId = event.id;
  const eventType = event.type;
  const eventObject = event.data.object;
  
  // For payment_intent.succeeded, we need to ensure emails and logging completes
  if (eventType === 'payment_intent.succeeded') {
    console.log(`Processing critical event ${eventId} of type ${eventType} synchronously`);

    const paymentIntentId = (eventObject as Stripe.PaymentIntent)?.id;
    let outcome: FulfillmentOutcome;
    try {
      // Process synchronously - wait for completion
      outcome = await processStripeEvent(eventId, eventType, eventObject);
    } catch (error) {
      console.error(`Error processing Stripe event ${eventId}:`, error);
      outcome = { ok: false, retryable: true, code: 'unhandled-webhook-error', error };
    }

    if (outcome.ok) {
      console.log(`Successfully completed processing of ${eventId}`);
      return NextResponse.json({ received: true, processed: true });
    }

    // A charged customer who was not fulfilled used to leave no trace outside the
    // logs: Stripe showed the payment as succeeded, the sheet only records
    // successes, and the pending row expires within a day. Record it durably
    // first - the recorder swallows its own errors - then decide the status.
    const failureId = await saveFailedRegistration({
      payload: { paymentIntentId, eventId, eventType },
      error: outcome.error ?? outcome.detail ?? outcome.code,
      pendingRegistrationId: (eventObject as Stripe.PaymentIntent)?.metadata?.pendingRegistrationId,
      stage: `webhook:${outcome.code}`,
    });

    console.error(
      `Fulfillment incomplete for ${paymentIntentId} (${outcome.code}${outcome.detail ? `: ${outcome.detail}` : ''}). ` +
      `Recorded as ${failureId ?? 'unrecorded'}.`
    );

    if (outcome.retryable) {
      // Ask Stripe to come back. Safe now that fulfillment is idempotent per step:
      // a retry resumes what did not finish instead of duplicating what did.
      return NextResponse.json(
        { received: true, processed: false, reason: outcome.code, failureId },
        { status: 500 }
      );
    }

    // Nothing a retry can fix, so take the event off Stripe's hands; the record
    // above is what surfaces it for a human.
    return NextResponse.json({ received: true, processed: false, reason: outcome.code, failureId });
  } else {
    // For non-critical events, continue with async processing
    // Fire and forget - don't await these operations
    processStripeEvent(eventId, eventType, eventObject)
      .catch(error => console.error(`Error in background processing of ${eventId}:`, error));
    
    // Return successful response immediately for non-critical events
    return NextResponse.json({ received: true });
  }
};

/**
 * Process a Stripe event in the background without blocking the webhook response
 */
async function processStripeEvent(
  eventId: string,
  eventType: string,
  eventObject: any
): Promise<FulfillmentOutcome> {
  console.log(`Processing Stripe event ${eventId} of type ${eventType} in background`);

  try {
    // Handle the event based on type
    switch (eventType) {
      case 'payment_intent.succeeded':
        return await handlePaymentIntentSucceeded(eventObject as Stripe.PaymentIntent);
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(eventObject as Stripe.PaymentIntent);
        break;
      case 'charge.refunded':
        await handleChargeRefunded(eventObject as Stripe.Charge);
        break;
      default:
        console.log(`Unhandled event type: ${eventType}`);
    }
    console.log(`Successfully processed Stripe event ${eventId}`);
    return { ok: true };
  } catch (error) {
    console.error(`Error processing Stripe event ${eventId}:`, error);
    // Background callers ignore this; the synchronous path turns it into a status.
    return { ok: false, retryable: true, code: 'unexpected-event-error', error };
  }
}
