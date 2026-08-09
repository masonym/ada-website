import { NextResponse } from 'next/server';

import { createRateLimiter, getClientIdentifier, tooManyRequests } from '@/lib/rate-limit';

/**
 * Newsletter signup.
 *
 * Every accepted request writes a contact into the live iContact list, so an
 * unthrottled route is a way for anyone to fill the mailing list with addresses
 * that never asked to be on it. Three per ten minutes per address is more than a
 * person needs and far less than a script wants.
 */
const limiter = createRateLimiter({ limit: 3, windowMs: 10 * 60 * 1000 });

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const API_APP_ID = process.env.ICONTACT_APP_ID;
const API_USERNAME = process.env.ICONTACT_EMAIL;
const API_PASSWORD = process.env.ICONTACT_PASSWORD;
const ACCOUNT_ID = process.env.ICONTACT_ACCOUNT_ID;
const CLIENT_FOLDER_ID = process.env.ICONTACT_CLIENT_FOLDER_ID;
const LIST_ID = process.env.ICONTACT_LIST_ID;

async function makeIContactRequest(endpoint: string, method: string, body?: any) {
  const url = `https://app.icontact.com/icp/a/${ACCOUNT_ID}/c/${CLIENT_FOLDER_ID}/${endpoint}`;

  // The request body is the subscriber's name and address; it used to be printed
  // in full on every call, which put it in log retention.
  const response = await fetch(url, {
    method,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'API-Version': '2.2',
      'API-AppId': API_APP_ID || '',
      'API-Username': API_USERNAME || '',
      'API-Password': API_PASSWORD || '',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const responseData = await response.json();

  if (!response.ok) {
    console.error(`Error response from iContact:`, responseData);
    throw new Error(JSON.stringify(responseData));
  }

  return responseData;
}

export async function POST(request: Request) {
  try {
    const throttle = limiter.consume(getClientIdentifier(request));
    if (!throttle.allowed) {
      return tooManyRequests(
        throttle.retryAfterSeconds,
        'Too many signup attempts. Please try again shortly.'
      );
    }

    const { email, firstName, lastName } = await request.json();

    if (typeof email !== 'string' || !EMAIL_PATTERN.test(email)) {
      return NextResponse.json({ message: 'A valid email address is required' }, { status: 400 });
    }

    // Create contact
    const contactData = await makeIContactRequest('contacts', 'POST', [{
      email,
      firstName,
      lastName,
      status: 'normal',
    }]);

    if (!contactData.contacts || contactData.contacts.length === 0) {
      throw new Error('Failed to create contact');
    }

    const contactId = contactData.contacts[0].contactId;

    // Add contact to list
    await makeIContactRequest('subscriptions', 'POST', [{
      contactId,
      listId: LIST_ID,
      status: 'normal',
    }]);

    // The response used to echo the full iContact payload back to the browser,
    // which is more of our list plumbing than a signup form needs to know.
    return NextResponse.json({ message: 'Subscription successful' }, { status: 200 });
  } catch (error: any) {
    console.error('Error in subscribe API route:', error);
    return NextResponse.json({ message: 'An error occurred while subscribing', error: error.message }, { status: 500 });
  }
}