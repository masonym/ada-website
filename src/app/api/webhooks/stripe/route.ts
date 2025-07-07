import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe/server';
import { getEnv } from '@/lib/env';
import { logRegistration } from '@/lib/google-sheets';
import { sendRegistrationConfirmationEmails } from '@/lib/email/confirmation-emails';
import { headers } from 'next/headers';
import { RegistrationFormData } from '@/types/event-registration/registration';
import { EVENTS } from '@/constants/events';
import { getRegistrationsForEvent, getSponsorshipsForEvent, getExhibitorsForEvent, AdapterModalRegistrationType } from '@/lib/registration-adapters';
import { getPendingRegistration, saveConfirmedRegistration, getConfirmedRegistration } from '@/lib/aws/dynamodb';

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log(`PaymentIntent ${paymentIntent.id} succeeded.`);

  const metadata = paymentIntent.metadata;
  const eventId = metadata.eventId;
  const pendingRegistrationId = metadata.pendingRegistrationId;

  if (!pendingRegistrationId || !eventId) {
    console.error('Error: Missing pendingRegistrationId or eventId in payment intent metadata.', { metadata });
    return;
  }
  
  // // Idempotency check - see if this payment has already been processed
  // try {
  //   // Check if the registration is already confirmed with this payment ID
  //   // Since we use the payment intent ID as the primary key in our confirmed registrations table
  //   const existingRegistration = await getConfirmedRegistration(paymentIntent.id);
  //   if (existingRegistration) {
  //     console.log(`Payment ${paymentIntent.id} has already been processed. Skipping to prevent duplicates.`);
  //     return;
  //   }
  // } catch (error) {
  //   console.error('Error checking for existing registration:', error);
  //   // Continue with processing since we couldn't confirm if it exists
  // }

  try {
    const registrationData = await getPendingRegistration(pendingRegistrationId);

    if (!registrationData) {
      console.error(`Could not find pending registration with ID: ${pendingRegistrationId}`);
      return;
    }

    // Save to permanent storage
    await saveConfirmedRegistration(registrationData, paymentIntent.id);

    // Log the registration to Google Sheets
    await logRegistration(
      eventId,
      registrationData,
      paymentIntent.id,
      'succeeded',
      paymentIntent.amount,
      registrationData.promoCode,
      Number(metadata.discountAmount) || 0
    );

    // --- Prepare data for confirmation email ---
    const event = EVENTS.find(e => e.id.toString() === eventId);
    if (!event) {
      console.error(`Event with ID ${eventId} not found.`);
      return;
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

        const orderSummary = {
      orderId: paymentIntent.id,
      orderDate: new Date(paymentIntent.created * 1000).toLocaleDateString(),
      items: registrationData.tickets.map(ticket => {
        const regType = allRegistrationTypes.find(rt => rt.id === ticket.ticketId);
        return {
          name: ticket.ticketName || regType?.name || 'Unknown Ticket',
          quantity: ticket.quantity,
          price: (Number(regType?.price) || 0), // Price is in dollars, converting from string
        };
      }),
      subtotal: (paymentIntent.amount + (Number(metadata.discountAmount) || 0)) / 100, // in dollars
      discount: (Number(metadata.discountAmount) || 0) / 100, // in dollars
      total: paymentIntent.amount / 100, // in dollars
    };

    // Send confirmation emails to all unique attendees
    await sendRegistrationConfirmationEmails({
      registrationData,
      event,
      registrations: purchasedRegistrations,
      orderId: paymentIntent.id,
      orderSummary,
    });

  } catch (error) {
    console.error('Error processing successful payment intent:', error);
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

export async function POST(request: Request) {
  const env = getEnv();
  const signature = headers().get('stripe-signature');

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
  
  // Immediately acknowledge receipt to Stripe to prevent timeouts
  // Then process the event asynchronously
  const eventId = event.id;
  const eventType = event.type;
  const eventObject = event.data.object;
  
  // Fire and forget - don't await these operations
  // This prevents timeout errors while ensuring the webhook responds quickly
  processStripeEvent(eventId, eventType, eventObject)
    .catch(error => console.error(`Error in background processing of ${eventId}:`, error));
  
  // Return successful response immediately
  return NextResponse.json({ received: true });
};

/**
 * Process a Stripe event in the background without blocking the webhook response
 */
async function processStripeEvent(eventId: string, eventType: string, eventObject: any) {
  console.log(`Processing Stripe event ${eventId} of type ${eventType} in background`);
  
  try {
    // Handle the event based on type
    switch (eventType) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(eventObject as Stripe.PaymentIntent);
        break;
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
  } catch (error) {
    console.error(`Error processing Stripe event ${eventId}:`, error);
    // We intentionally don't rethrow here as this is background processing
  }
}
