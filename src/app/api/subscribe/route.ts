import { NextResponse } from 'next/server';

const API_APP_ID = process.env.ICONTACT_APP_ID;
const API_USERNAME = process.env.ICONTACT_EMAIL;
const API_PASSWORD = process.env.ICONTACT_PASSWORD;
const ACCOUNT_ID = process.env.ICONTACT_ACCOUNT_ID;
const CLIENT_FOLDER_ID = process.env.ICONTACT_CLIENT_FOLDER_ID;
const LIST_ID = process.env.ICONTACT_LIST_ID;

async function makeIContactRequest(endpoint: string, method: string, body?: any) {
  const url = `https://app.icontact.com/icp/a/${ACCOUNT_ID}/c/${CLIENT_FOLDER_ID}/${endpoint}`;
  console.log(`Making ${method} request to ${url}`);
  console.log('Request body:', JSON.stringify(body, null, 2));
  
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
    const { email, firstName, lastName } = await request.json();

    console.log(`Attempting to subscribe: ${email}, ${firstName}, ${lastName}`);

    // Create contact
    console.log('Creating contact...');
    const contactData = await makeIContactRequest('contacts', 'POST', [{
      email,
      firstName,
      lastName,
      status: 'normal',
    }]);

    console.log('Contact created:', contactData);

    if (!contactData.contacts || contactData.contacts.length === 0) {
      throw new Error('Failed to create contact');
    }

    const contactId = contactData.contacts[0].contactId;

    // Add contact to list
    console.log(`Adding contact ${contactId} to list ${LIST_ID}...`);
    const subscriptionData = await makeIContactRequest('subscriptions', 'POST', [{
      contactId,
      listId: LIST_ID,
      status: 'normal',
    }]);

    console.log('Subscription created:', subscriptionData);

    return NextResponse.json({ message: 'Subscription successful', data: { contact: contactData, subscription: subscriptionData } }, { status: 200 });
  } catch (error: any) {
    console.error('Error in subscribe API route:', error);
    return NextResponse.json({ message: 'An error occurred while subscribing', error: error.message }, { status: 500 });
  }
}