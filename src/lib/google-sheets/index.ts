import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { getEnv } from '../env';
import { RegistrationFormData, TicketSelection, AttendeeInfo } from '@/types/event-registration/registration';
import { EVENTS } from '@/constants/events';

const env = getEnv();

// Initialize the Google Sheets API client
async function getAuthClient() {
  try {
    const oAuth2Client = new OAuth2Client(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      // Optional: You might have a redirect URI if you were doing a full OAuth flow,
      // but for server-to-server with a refresh token, it's often not directly used here.
      // e.g., 'http://localhost:3000/oauth2callback'
    );

    oAuth2Client.setCredentials({ refresh_token: env.GOOGLE_REFRESH_TOKEN });

    // The access token will be automatically refreshed if it's expired.
    // You can manually refresh if needed, but typically not necessary for each call.
    // await oAuth2Client.refreshAccessToken(); 

    return oAuth2Client;
  } catch (error) {
    console.error('Error initializing Google Sheets OAuth2 client:', error);
    throw new Error('Failed to initialize Google Sheets OAuth2 client');
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
  registrationData: RegistrationFormData,
  orderId: string,
  paymentStatus: string,
  amountPaid: number,
  promoCode?: string,
  discountApplied?: number
) {
  try {
    const env = getEnv();
    const event = EVENTS.find(e => e.id.toString() === eventId);
    if (!event) {
      throw new Error(`Event with ID ${eventId} not found`);
    }

    const registrationTimestamp = new Date().toISOString();
    const formattedRegistrationTimestamp = new Date(registrationTimestamp).toLocaleString();
    const rowsToAppend: any[][] = [];

    const commonData = {
      registrationTimestamp: formattedRegistrationTimestamp,
      orderId,
      paymentStatus,
      amountPaid: amountPaid / 100, // Convert from cents
      promoCode: promoCode || '',
      discountApplied: discountApplied || 0,
      buyerFirstName: registrationData.firstName,
      buyerLastName: registrationData.lastName,
      buyerEmail: registrationData.email,
      buyerCompany: registrationData.company,
    };

    for (const ticket of registrationData.tickets) {
      // Skip sponsorship products, only log attendee tickets
      // But keep tickets that are included with sponsorships
      if (ticket.category === 'sponsorship') {
        // Skip the sponsorship product itself
        continue;
      }
      
      const ticketType = ticket.ticketName || 'N/A';
      const attendees = ticket.attendeeInfo || [];

      if (attendees.length > 0) {
        for (const attendee of attendees) {
          const row = [
            attendee.company || '',
            attendee.jobTitle || '',
            attendee.firstName || '',
            attendee.lastName || '',
            attendee.email || '',
            attendee.phone || '',
            commonData.registrationTimestamp,
            ticketType,
            commonData.amountPaid,
            commonData.amountPaid, // Placeholder for a different value if needed
            attendee.website || '',
            attendee.businessSize || '',
            attendee.sbaIdentification || '',
            attendee.industry || '',
            attendee.sponsorInterest || '',
            attendee.speakingInterest || '',
          ];
          rowsToAppend.push(row);
        }
      } else {
        // Create generic rows if no attendee info is provided for the quantity
        for (let i = 0; i < ticket.quantity; i++) {
          const row = [
            '', '', '', '', '', '',
            commonData.registrationTimestamp,
            ticketType,
            commonData.amountPaid,
            commonData.amountPaid,
            '', '', '', '', '', '',
          ];
          rowsToAppend.push(row);
        }
      }
    }

    if (rowsToAppend.length > 0) {
      await appendToSheet(
        env.GOOGLE_SHEETS_SPREADSHEET_ID,
        '🛡️ Attendee Registration Information 🛡️!A:P',
        rowsToAppend,
        'USER_ENTERED'
      );
    } else {
      console.warn('No rows generated for logging registration. Order ID:', orderId);
    }

    return { success: true };
  } catch (error) {
    console.error('Error logging registration to Google Sheets:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
