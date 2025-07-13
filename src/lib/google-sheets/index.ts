import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { getEnv } from '../env';
import { RegistrationFormData, TicketSelection, AttendeeInfo } from '@/types/event-registration/registration';
import { EVENTS } from '@/constants/events';

// Configuration for event-specific spreadsheet mapping
interface SpreadsheetConfig {
  spreadsheetId: string;
  registrationSheetName?: string;
  description?: string;
}

// Map event IDs to their respective spreadsheet configurations
interface EventSpreadsheetMapping {
  [eventId: string]: SpreadsheetConfig;
  default: SpreadsheetConfig;
}

const env = getEnv();

/**
 * EVENT_SPREADSHEET_MAPPING
 * 
 * Maps each event to its specific Google Spreadsheet.
 * The 'default' entry is used as a fallback for any events not explicitly mapped.
 * 
 * Each entry contains:
 * - spreadsheetId: The Google Sheets ID for the specific event
 * - registrationSheetName: The name of the sheet tab in the spreadsheet where registrations are logged
 * - description: Optional description of what the spreadsheet is used for
 */
const EVENT_SPREADSHEET_MAPPING: EventSpreadsheetMapping = {
  // Default spreadsheet (fallback for any unmapped event)
  default: {
    spreadsheetId: env.GOOGLE_SHEETS_SPREADSHEET_ID,
    registrationSheetName: '🛡️ Attendee Registration Information 🛡️',
    description: 'Default registration spreadsheet'
  },
  
  '1': {
    spreadsheetId: env.GOOGLE_SHEETS_SPREADSHEET_ID_2025DIF || env.GOOGLE_SHEETS_SPREADSHEET_ID,
    registrationSheetName: '🛡️ Attendee Registration Information 🛡️',
    description: '2025 Defense Industry Forecast registrations'
  },
  
  '2': {
    spreadsheetId: env.GOOGLE_SHEETS_SPREADSHEET_ID_2025SDPC || env.GOOGLE_SHEETS_SPREADSHEET_ID,
    registrationSheetName: '🛡️ Attendee Registration Information 🛡️',
    description: '2025 Southeast Defense Procurement Conference registrations'
  },
  '4': {
    spreadsheetId: env.GOOGLE_SHEETS_SPREADSHEET_ID_2025NMCPC || env.GOOGLE_SHEETS_SPREADSHEET_ID,
    registrationSheetName: '🛡️ Attendee Registration Information 🛡️',
    description: '2025 Defense Technology and Acquisition Conference registrations'
  },
  '5': {
    spreadsheetId: env.GOOGLE_SHEETS_SPREADSHEET_ID_2025DTAPC || env.GOOGLE_SHEETS_SPREADSHEET_ID,
    registrationSheetName: '🛡️ Attendee Registration Information 🛡️',
    description: '2025 Navy Marine Corps Procurement Conference registrations'
  },
  
  // Add more event mappings as needed
};



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
    const event = EVENTS.find(e => e.id === Number(eventId));
    if (!event) {
      throw new Error(`Event with ID ${eventId} not found`);
    }

    // Get the spreadsheet configuration for this event
    // If no specific config exists for this event, use the default
    const spreadsheetConfig = EVENT_SPREADSHEET_MAPPING[eventId] || EVENT_SPREADSHEET_MAPPING.default;
    
    // Get the sheet name (with fallback)
    const sheetName = spreadsheetConfig.registrationSheetName || '🛡️ Attendee Registration Information 🛡️';
    
    const registrationTimestamp = new Date().toISOString();
    const formattedRegistrationTimestamp = new Date(registrationTimestamp).toLocaleString();
    const rowsToAppend: any[][] = [];

    const commonData = {
      registrationTimestamp: formattedRegistrationTimestamp,
      orderId,
      paymentStatus,
      totalAmountPaid: amountPaid / 100, // Convert from cents
      promoCode: promoCode || '',
      discountApplied: discountApplied || 0,
      buyerFirstName: registrationData.firstName,
      buyerLastName: registrationData.lastName,
      buyerEmail: registrationData.email,
      buyerCompany: registrationData.company,
    };
    
    // Track if we've logged a sponsorship amount
    const loggedSponsorships: Record<string, boolean> = {};

    for (const ticket of registrationData.tickets) {
      // We now handle sponsorship products too - we need to log them
      // Previously we were skipping them, but now we want to log them with their correct name
      
      console.log(ticket);
      const ticketType = ticket.ticketName || 'N/A';
      const attendees = ticket.attendeeInfo || [];

      if (attendees.length > 0) {
        for (const attendee of attendees) {
          // Determine what amount to log based on ticket type
          let amountToLog = 0;
          
          // Always set complimentary tickets to $0
          if (ticket.ticketPrice === 'Complimentary') {
            amountToLog = 0;
          }
          // For sponsor-included tickets, show the sponsor amount for the first ticket only
          else if (ticket.isIncludedWithSponsorship && ticket.sponsorshipId) {
            if (!loggedSponsorships[ticket.sponsorshipId]) {
              // Find the sponsorship ticket and get its price
              const sponsorTicket = registrationData.tickets.find(t => t.ticketId === ticket.sponsorshipId);
              if (sponsorTicket) {
                amountToLog = typeof sponsorTicket.ticketPrice === 'number' ? sponsorTicket.ticketPrice : 0;
                loggedSponsorships[ticket.sponsorshipId] = true;
              }
            }
          } else {
            // Regular ticket - use per-ticket price
            amountToLog = typeof ticket.ticketPrice === 'number' ? ticket.ticketPrice : 0;
          }
          
          const row = [
            attendee.company || '',
            attendee.jobTitle || '',
            attendee.firstName || '',
            attendee.lastName || '',
            attendee.email || '',
            attendee.phone || '',
            commonData.registrationTimestamp,
            ticketType,
            (amountToLog * 0.971) - 0.3,
            commonData.totalAmountPaid, // Total order amount
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
          // Use the same payment logic as above
          let amountToLog = 0;
          
          // For sponsor-included tickets, show the sponsor amount for the first ticket only
          if (ticket.isIncludedWithSponsorship && ticket.sponsorshipId) {
            if (!loggedSponsorships[ticket.sponsorshipId]) {
              // Find the sponsorship ticket and get its price
              const sponsorTicket = registrationData.tickets.find(t => t.ticketId === ticket.sponsorshipId);
              if (sponsorTicket) {
                amountToLog = typeof sponsorTicket.ticketPrice === 'number' ? sponsorTicket.ticketPrice : 0;
                loggedSponsorships[ticket.sponsorshipId] = true;
              }
            }
          } else {
            // Regular ticket - use per-ticket price
            amountToLog = typeof ticket.ticketPrice === 'number' ? ticket.ticketPrice : 0;
          }
          
          const row = [
            '', '', '', '', '', '',
            commonData.registrationTimestamp,
            ticketType,
            (amountToLog * 0.971) - 0.3,
            commonData.totalAmountPaid, // Total order amount
            '', '', '', '', '', '',
          ];
          rowsToAppend.push(row);
        }
      }
    }

    if (rowsToAppend.length > 0) {
      // Use the event-specific spreadsheet ID and sheet name
      await appendToSheet(
        spreadsheetConfig.spreadsheetId,
        `${sheetName}!A2`,
        rowsToAppend,
        'USER_ENTERED'
      );
      
      console.log(`Registration logged to spreadsheet for event ${eventId} (${event.eventShorthand})`);
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
