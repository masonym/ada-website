// app/api/get-lists/route.ts

import { NextResponse } from 'next/server';

const API_APP_ID = process.env.ICONTACT_APP_ID;
const API_USERNAME = process.env.ICONTACT_EMAIL;
const API_PASSWORD = process.env.ICONTACT_PASSWORD;
const ACCOUNT_ID = process.env.ICONTACT_ACCOUNT_ID;
const CLIENT_FOLDER_ID = process.env.ICONTACT_CLIENT_FOLDER_ID;

export async function GET() {
  try {
    const response = await fetch(`https://app.icontact.com/icp/a/${ACCOUNT_ID}/c/${CLIENT_FOLDER_ID}/lists`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'API-Version': '2.2',
        'API-AppId': API_APP_ID || '',
        'API-Username': API_USERNAME || '',
        'API-Password': API_PASSWORD || '',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch lists');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ message: 'An error occurred while fetching lists' }, { status: 500 });
  }
}