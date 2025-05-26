import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import { getEnv } from '../env';

const env = getEnv();

// Initialize the Google Sheets API client
async function getAuthClient() {
  try {
    const auth = new JWT({
      email: env.GOOGLE_SHEETS_CLIENT_EMAIL,
      key: env.GOOGLE_SHEETS_PRIVATE_KEY,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    await auth.authorize();
    return auth;
  } catch (error) {
    console.error('Error initializing Google Sheets client:', error);
    throw new Error('Failed to initialize Google Sheets client');
  }
}

export async function appendToSheet(
  spreadsheetId: string,
  range: string,
  values: any[][],
  valueInputOption: 'RAW' | 'USER_ENTERED' = 'RAW'
) {
  try {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption,
      requestBody: {
        values,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error appending to Google Sheet:', error);
    throw new Error('Failed to append data to Google Sheet');
  }
}

export async function getSheetData(
  spreadsheetId: string,
  range: string
) {
  try {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    return response.data.values || [];
  } catch (error) {
    console.error('Error getting data from Google Sheet:', error);
    throw new Error('Failed to get data from Google Sheet');
  }
}

export async function logRegistration(
  eventId: string,
  registrationData: any,
  orderId: string,
  paymentStatus: string,
  amountPaid: number,
  promoCode?: string,
  discountApplied?: number
) {
  try {
    const env = getEnv();
    const timestamp = new Date().toISOString();
    
    // Format the registration data for the sheet
    const row = [
      timestamp,
      orderId,
      registrationData.firstName,
      registrationData.lastName,
      registrationData.email,
      registrationData.phone,
      registrationData.jobTitle,
      registrationData.company,
      registrationData.companyWebsite,
      registrationData.businessSize,
      registrationData.industry,
      registrationData.address1,
      registrationData.address2 || '',
      registrationData.city,
      registrationData.state,
      registrationData.zipCode,
      registrationData.country,
      registrationData.howDidYouHearAboutUs,
      registrationData.interestedInSponsorship ? 'Yes' : 'No',
      registrationData.interestedInSpeaking ? 'Yes' : 'No',
      paymentStatus,
      amountPaid.toFixed(2),
      promoCode || '',
      discountApplied ? discountApplied.toFixed(2) : '0.00',
      // Include ticket information
      ...registrationData.tickets.flatMap(t => [
        t.ticketId,
        t.quantity,
        JSON.stringify(t.attendeeInfo || [])
      ]),
      // Add any additional fields you want to track
      JSON.stringify(registrationData, null, 2)
    ];

    await appendToSheet(
      env.GOOGLE_SHEETS_SPREADSHEET_ID,
      'Registrations!A:Z', // Adjust the range as needed
      [row],
      'USER_ENTERED'
    );

    return { success: true };
  } catch (error) {
    console.error('Error logging registration to Google Sheets:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
