import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { getEnv } from '../env';
import { RegistrationFormData, TicketSelection, AttendeeInfo } from '@/types/event-registration/registration';

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
  orderId: string, // Available if needed for future columns
  paymentStatus: string, // Available if needed for future columns
  amountPaid: number,
  promoCode?: string, // Available if needed for future columns
  discountApplied?: number
) {
  try {
    const env = getEnv();
    const rowsToAppend: any[][] = [];

    // Common information for all rows in this registration batch
    const registrationTimestamp = new Date().toISOString();
    const buyerCompany = registrationData.company || '';
    const buyerJobTitle = registrationData.jobTitle || '';
    const buyerFirstName = registrationData.firstName || '';
    const buyerLastName = registrationData.lastName || '';
    const buyerEmail = registrationData.email || '';
    const buyerPhone = registrationData.phone || '';
    const buyerCompanyWebsite = registrationData.companyWebsite || '';

    // These amounts are for the entire order and will be repeated for each attendee row.
    const orderAmountReceived = (amountPaid + (discountApplied || 0)).toFixed(2);
    const orderAmountPaid = amountPaid.toFixed(2);

    if (registrationData.tickets && Array.isArray(registrationData.tickets)) {
      for (const ticket of registrationData.tickets) {
        const ticketType = ticket.ticketId;
        let attendeesProcessedForTicket = 0;

        if (ticket.attendeeInfo && Array.isArray(ticket.attendeeInfo)) {
          for (const attendee of ticket.attendeeInfo) {
            const attendeeBusinessSize = attendee.businessSize || '';
            const attendeeSbaIdentification = 
              (attendee.businessSize === 'Small Business' && attendee.sbaIdentification) 
              ? attendee.sbaIdentification 
              : '';
            const attendeeIndustry = attendee.industry || '';

            const row = [
              attendee.company || '',         // Attendee's Company
              attendee.jobTitle || '',        // Attendee's Job Title
              attendee.firstName || '',       // Attendee's First Name
              attendee.lastName || '',        // Attendee's Last Name
              attendee.email || '',           // Attendee's Email
              attendee.phone || '',           // Attendee's Phone
              registrationTimestamp,          // Common: Registration Date
              ticketType,                     // Specific ticket type for this attendee
              (parseInt(orderAmountReceived) / ticket.quantity).toFixed(2),            // Common: Order Amount Received
              (parseInt(orderAmountPaid) / ticket.quantity).toFixed(2),                // Common: Order Amount Paid
              attendee.website || '',         // Attendee's Website
              attendeeBusinessSize,           // Attendee's Business Size
              attendeeSbaIdentification,      // Attendee's SBA Identification
              attendeeIndustry,               // Attendee's Industry
            ];
            rowsToAppend.push(row);
            attendeesProcessedForTicket++;
          }
        }

        // If quantity > number of attendees with info, add generic rows for remaining quantity
        const remainingQuantity = ticket.quantity - attendeesProcessedForTicket;
        if (remainingQuantity > 0) {
          for (let i = 0; i < remainingQuantity; i++) {
            const row = [
              '',                             // Blank: Company for generic entry
              '',                             // Blank: Job Title for generic entry
              '',                             // Blank: First Name for generic entry
              '',                             // Blank: Last Name for generic entry
              '',                             // Blank: Email for generic entry
              '',                             // Blank: Phone for generic entry
              registrationTimestamp,          // Common: Registration Date
              ticketType,                     // Specific ticket type
              (parseInt(orderAmountReceived) / ticket.quantity).toFixed(2),            // Common: Order Amount Received
              (parseInt(orderAmountPaid) / ticket.quantity).toFixed(2),                // Common: Order Amount Paid
              '',                             // Blank: Website for generic entry
              '',                             // No Business Size for generic entry
              '',                             // No SBA Identification for generic entry
              '',                             // No Industry for generic entry
            ];
            rowsToAppend.push(row);
          }
        }
      }
    }

    if (rowsToAppend.length > 0) {
      await appendToSheet(
        env.GOOGLE_SHEETS_SPREADSHEET_ID,
        '🛡️ Attendee Registration Information 🛡️!A:N', // Existing 14-column range
        rowsToAppend,
        'USER_ENTERED'
      );
    } else {
      // Optional: Log a warning if no rows were generated for a registration attempt
      console.warn('No rows generated for logging registration. Event ID:', eventId, 'Order ID:', orderId);
    }

    return { success: true };
  } catch (error) {
    console.error('Error logging registration to Google Sheets:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
