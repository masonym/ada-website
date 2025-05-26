import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { getEnv } from '@/lib/env';
import { logRegistration } from '@/lib/google-sheets';

// Helper to read raw request body as text
async function getRawBody(readable: any): Promise<Buffer> {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export async function POST(request: Request) {
  const env = getEnv();
  const signature = request.headers.get('stripe-signature');
  
  if (!signature) {
    console.error('No Stripe signature found');
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    );
  }

  try {
    // Get the raw body as text
    const rawBody = await getRawBody(request.body);
    
    // Verify the webhook signature
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;
      case 'charge.refunded':
        await handleChargeRefunded(event.data.object);
        break;
      // Add more event types as needed
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook error' },
      { status: 400 }
    );
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: any) {
  const { id, metadata, amount, currency } = paymentIntent;
  
  // In a real app, you would fetch the registration data from your database
  // using the paymentIntent.id or metadata.orderId
  
  console.log(`PaymentIntent ${id} succeeded for ${amount} ${currency}`);
  
  // Example of logging to Google Sheets
  try {
    await logRegistration(
      metadata.eventId,
      metadata, // This would be your registration data
      metadata.orderId || id,
      'paid',
      amount / 100, // Convert from cents
      metadata.promoCode,
      metadata.discountApplied ? parseFloat(metadata.discountApplied) : 0
    );
    
    console.log(`Registration logged for payment intent ${id}`);
  } catch (error) {
    console.error('Error logging registration:', error);
    // In a real app, you might want to retry or notify an admin
  }
  
  // Send confirmation email, update database, etc.
}

async function handlePaymentIntentFailed(paymentIntent: any) {
  const { id, last_payment_error } = paymentIntent;
  console.error(`PaymentIntent ${id} failed:`, last_payment_error?.message);
  
  // Update your database, notify the user, etc.
}

async function handleChargeRefunded(charge: any) {
  const { id, payment_intent, amount_refunded, refunds } = charge;
  console.log(`Charge ${id} was refunded: ${amount_refunded} cents`);
  
  // Update your database, notify the user, etc.
}
