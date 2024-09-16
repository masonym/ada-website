import { NextResponse } from 'next/server';

const API_APP_ID = process.env.ICONTACT_APP_ID;
const API_USERNAME = process.env.ICONTACT_EMAIL;
const API_PASSWORD = process.env.ICONTACT_PASSWORD;
const ACCOUNT_ID = process.env.ICONTACT_ACCOUNT_ID;
const CLIENT_FOLDER_ID = process.env.ICONTACT_CLIENT_FOLDER_ID;
const LIST_ID = process.env.ICONTACT_LIST_ID;

async function makeIContactRequest(endpoint: string, method: string, body?: any) {
  const response = await fetch(`https://app.icontact.com/icp/a/${ACCOUNT_ID}/c/${CLIENT_FOLDER_ID}/${endpoint}`, {
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

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Failed to ${method} ${endpoint}`);
  }

  return response.json();
}

export async function POST(request: Request) {
  try {
    const { email, firstName, lastName } = await request.json();

    // Create contact
    const contactData = await makeIContactRequest('contacts', 'POST', [{
      email,
      firstName,
      lastName,
      status: 'normal',
    }]);

    const contactId = contactData[0].contactId;

    // Add contact to list
    await makeIContactRequest('subscriptions', 'POST', {
      contactId,
      listId: LIST_ID,
      status: 'normal',
    });

    return NextResponse.json({ message: 'Subscription successful', data: contactData }, { status: 200 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ message: 'An error occurred while subscribing' }, { status: 500 });
  }
}