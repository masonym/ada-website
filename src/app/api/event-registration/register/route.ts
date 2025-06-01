import { NextResponse } from 'next/server';
import { getEnv } from '@/lib/env';
import { stripe } from '@/lib/stripe/server';
import { logRegistration } from '@/lib/google-sheets';
import { validateRegistrationData } from '@/lib/event-registration/validation';
import { sendFreeRegistrationConfirmationEmail, sendPaymentPendingConfirmationEmail } from '@/lib/email';
import { isGovOrMilEmail } from '@/lib/event-registration/validation';
import { REGISTRATION_TYPES } from '@/constants/registrations';

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
    // const eventTitleFromBody = body.eventTitle; // Optional: for more descriptive emails
    // const eventSlugFromBody = body.eventSlug; // Optional: for direct event links

    // Validate the request body (excluding eventId for schema validation if it's not part of it)
    const { isValid, errors, validatedData } = await validateRegistrationData(body);
    if (!isValid || !validatedData) { // Check !validatedData explicitly for TS
      return NextResponse.json(
        { success: false, errors },
        { status: 400 }
      );
    }

    // Use validatedData for schema-defined fields
    const { email, tickets, promoCode, paymentMethod } = validatedData;
    // Use eventIdFromBody for the eventId
    const currentEventId = eventIdFromBody;

    // Find all available tickets for the current event from our centralized source of truth
    const eventId = Number(currentEventId);
    const eventRegistrations = REGISTRATION_TYPES.find(event => event.id === eventId);

    if (!eventRegistrations) {
      console.error(`Event ID ${eventId} not found in REGISTRATION_TYPES`);
      return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
    }

    // Map the requested tickets to their full definitions from our source of truth
    const availableTickets = tickets.map(ticket => {
      // Find the registration type in our centralized source
      // First, check if the ticket ID exists in the registrations
      // Using a type assertion to avoid TypeScript errors with property access
      const registrationType = eventRegistrations.registrations.find(reg => {
        return 'id' in reg && reg.id === ticket.ticketId;
      });

      if (registrationType) {
        // Create a safe ticket definition with proper type checking
        const ticketDef: {
          id: string;
          price: number;
          earlyBirdPrice?: number;
          earlyBirdDeadline?: string;
          type: string;
        } = {
          id: ticket.ticketId,
          // Handle different price formats and convert to number when possible
          price: 0, // Default value
          type: 'paid' // Default value
        };

        // Handle different ways price might be stored
        if ('price' in registrationType) {
          const price = registrationType.price;
          if (typeof price === 'number') {
            ticketDef.price = price;
          } else if (typeof price === 'string' && price.startsWith('$')) {
            // Try to parse a string price like "$99.99"
            const parsedPrice = parseFloat(price.replace('$', '').replace(',', ''));
            if (!isNaN(parsedPrice)) {
              ticketDef.price = parsedPrice;
            }
          }
        }

        // Handle type field
        if ('type' in registrationType && typeof registrationType.type === 'string') {
          ticketDef.type = registrationType.type;
        }

        // Handle early bird price
        if ('earlyBirdPrice' in registrationType) {
          const earlyBirdPrice = registrationType.earlyBirdPrice;
          if (typeof earlyBirdPrice === 'number') {
            ticketDef.earlyBirdPrice = earlyBirdPrice;
          }
        }

        // Handle early bird deadline
        if ('earlyBirdDeadline' in registrationType &&
          typeof registrationType.earlyBirdDeadline === 'string') {
          ticketDef.earlyBirdDeadline = registrationType.earlyBirdDeadline;
        }

        return ticketDef;
      }

      // If we can't find the ticket in our central source, log an error and default to 0
      console.error(`Ticket ID ${ticket.ticketId} not found in REGISTRATION_TYPES for event ${eventId}`);
      return {
        id: ticket.ticketId,
        price: 0,
        type: 'paid'
      };
    });

    // Filter out any tickets with type 'complimentary' or non-numeric prices
    const paidTickets = availableTickets.filter(ticket => {
      return ticket.type === 'paid' && typeof ticket.price === 'number';
    });

    console.log('Paid tickets:', JSON.stringify(paidTickets, null, 2));

    console.log('--- Registration Attempt ---');
    console.log('Event ID:', currentEventId);
    console.log('Selected tickets (from client):', JSON.stringify(tickets, null, 2));
    // Also log ticket prices if they were sent
    if (body.ticketPrices) {
      console.log('Ticket prices (from client):', JSON.stringify(body.ticketPrices, null, 2));
    }
    console.log('Available tickets (server-side):', JSON.stringify(availableTickets, null, 2));

    // Check if the email is a .gov or .mil email for free registration
    const isFreeRegistration = isGovOrMilEmail(email) && paymentMethod === 'free';

    // Validate promo code if provided
    let promoCodeDetails = null;
    if (promoCode) {
      // In a real app, you would validate the promo code against your database or Stripe
      // This is a simplified example
      const promoResponse = await fetch(`${env.NEXT_PUBLIC_SITE_URL}/api/event-registration/validate-promo`, { // Use NEXT_PUBLIC_SITE_URL
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
      paidTickets, // Use the filtered list of paid tickets with numeric prices
      promoCodeDetails
    );

    console.log('Calculated Order:');
    console.log('  Subtotal:', subtotal);
    console.log('  Discount:', discount);
    console.log('  Total:', total);

    // For free registration, skip payment processing
    if (isFreeRegistration) {
      if (!validatedData) {
        // This path should ideally not be reached due to the primary check after validateRegistrationData
        console.error('validatedData is unexpectedly null at the start of isFreeRegistration block');
        return NextResponse.json({ success: false, error: 'Internal server error: validatedData became null unexpectedly' }, { status: 500 });
      }
      // validatedData is now confirmed to be RegistrationFormData for the rest of this block
      const orderId = `ORDER-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // Log the registration to Google Sheets
      await logRegistration(
        currentEventId, // Use consistent eventId
        validatedData, // Null check for validatedData is done at the start of this 'isFreeRegistration' block
        orderId,
        'free',
        0,
        promoCode, // promoCode is destructured from validatedData, so it's fine if validatedData is non-null
        discount
      );

      // Send free registration confirmation email
      // validatedData is confirmed non-null from the check at the start of the isFreeRegistration block
      if (validatedData.firstName && validatedData.email) {
        await sendFreeRegistrationConfirmationEmail({
          userEmail: validatedData.email,
          firstName: validatedData.firstName,
          eventName: body.eventTitle || 'the Event', // Prefer eventTitle from body, fallback
          orderId,
          eventUrl: body.eventSlug ? `${env.NEXT_PUBLIC_SITE_URL}/events/${body.eventSlug}` : env.NEXT_PUBLIC_SITE_URL
        });
      }

      // Now, return the successful response
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

    // Log paid registration attempt to Google Sheets
    if (!validatedData) {
      // This case should ideally not be reached if the initial check is correct
      console.error('validatedData is null before logging paid registration');
      return NextResponse.json({ success: false, error: 'Internal server error: validatedData became null before logging' }, { status: 500 });
    }
    await logRegistration(
      currentEventId,
      validatedData, // Now confirmed non-null
      paymentIntent.id, // Use PaymentIntent ID as orderId
      'pending_stripe_payment', // Indicate payment is pending
      total, // Amount to be paid
      validatedData.promoCode, // Now confirmed non-null
      discount
    );

    // Send payment pending confirmation email
    // validatedData is already confirmed non-null from the check above
    if (validatedData.firstName && validatedData.email) {
      await sendPaymentPendingConfirmationEmail({
        userEmail: validatedData.email,
        firstName: validatedData.firstName,
        eventName: body.eventTitle || 'the Event', // Prefer eventTitle from body, fallback
        orderId: paymentIntent.id,
        amount: total,
        eventUrl: body.eventSlug ? `${env.NEXT_PUBLIC_SITE_URL}/events/${body.eventSlug}` : env.NEXT_PUBLIC_SITE_URL
      });
    }

    return NextResponse.json({
      success: true,
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
