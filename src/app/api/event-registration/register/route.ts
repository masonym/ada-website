import { NextResponse } from 'next/server';
import { getEnv } from '@/lib/env';
import { stripe } from '@/lib/stripe/server';
import { logRegistration } from '@/lib/google-sheets';
import { validateRegistrationData } from '@/lib/event-registration/validation';
import { isGovOrMilEmail } from '@/lib/event-registration/validation';

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
    const eventIdFromBody = body.eventId; // Extract eventId from the raw body
    
    // Validate the request body (excluding eventId for schema validation if it's not part of it)
    const { isValid, errors, validatedData } = await validateRegistrationData(body);
    if (!isValid || !validatedData) {
      return NextResponse.json(
        { success: false, errors },
        { status: 400 }
      );
    }

    // Use validatedData for schema-defined fields
    const { email, tickets, promoCode, paymentMethod } = validatedData;
    // Use eventIdFromBody for the eventId
    const currentEventId = eventIdFromBody;
    
    // Get event and ticket data (in a real app, this would come from your database)
    // For now, we'll use a simplified example
    const availableTickets = [
      // This would come from your database
      { id: 'standard', price: 100, earlyBirdPrice: 80, earlyBirdDeadline: '2024-12-31T23:59:59Z' },
      { id: 'vip', price: 200, earlyBirdPrice: 150, earlyBirdDeadline: '2024-12-31T23:59:59Z' },
      // Example: if your $99.99 ticket has id 'general-admission', add it here for testing:
      // { id: 'general-admission', price: 99.99, earlyBirdPrice: 79.99, earlyBirdDeadline: '...' }
    ];

    console.log('--- Registration Attempt ---');
    console.log('Event ID:', currentEventId);
    console.log('Selected tickets (from client):', JSON.stringify(tickets, null, 2));
    console.log('Available tickets (server-side):', JSON.stringify(availableTickets, null, 2));

    // Check if the email is a .gov or .mil email for free registration
    const isFreeRegistration = isGovOrMilEmail(email) && paymentMethod === 'free';
    
    // Validate promo code if provided
    let promoCodeDetails = null;
    if (promoCode) {
      // In a real app, you would validate the promo code against your database or Stripe
      // This is a simplified example
      const promoResponse = await fetch(`${env.SITE_URL}/api/event-registration/validate-promo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promoCode, eventId: currentEventId, tickets }),
      });
      
      const promoData = await promoResponse.json();
      if (!promoData.valid) {
        return NextResponse.json(
          { success: false, errors: { promoCode: promoData.error || 'Invalid promo code' } },
          { status: 400 }
        );
      }
      
      promoCodeDetails = promoData;
    }

    // Calculate order total
    const { subtotal, discount, total } = calculateOrderTotal(
      tickets,
      availableTickets,
      promoCodeDetails
    );

    console.log('Calculated Order:');
    console.log('  Subtotal:', subtotal);
    console.log('  Discount:', discount);
    console.log('  Total:', total);

    // For free registration, skip payment processing
    if (isFreeRegistration) {
      // Generate a unique order ID
      const orderId = `ORDER-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // Log the registration to Google Sheets
      await logRegistration(
        currentEventId, // Use consistent eventId
        validatedData,
        orderId,
        'free',
        0,
        promoCode,
        discount
      );
      
      return NextResponse.json({
        success: true,
        orderId,
        paymentStatus: 'free',
        amountPaid: 0,
        discountApplied: discount,
      });
    }

    // For paid registration, create a payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        eventId: currentEventId, // Use consistent eventId
        orderType: 'event-registration',
        email,
        promoCode: promoCode || '',
      },
    });

    console.log('Stripe PaymentIntent created with amount:', Math.round(total * 100));

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: total,
      currency: 'usd',
    });

  } catch (error) {
    console.error('Error processing registration:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'An error occurred while processing your registration',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
