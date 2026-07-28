import { getServerEnv } from '../env';

// Configuration for event-specific spreadsheet mapping
export interface SpreadsheetConfig {
  spreadsheetId: string;
  registrationSheetName: string;
  description?: string;
}

export const DEFAULT_REGISTRATION_SHEET_NAME = '🛡️ Attendee Registration Information 🛡️';

/**
 * EVENT_SPREADSHEET_MAPPING
 *
 * Maps each event to its specific Google Spreadsheet.
 * The 'default' entry is used as a fallback for any events not explicitly mapped.
 *
 * Resolved lazily so that tooling (tests, scripts) can load their own env files
 * before the mapping is read.
 */
function buildMapping(): Record<string, SpreadsheetConfig> & { default: SpreadsheetConfig } {
  const env = getServerEnv();

  return {
    // Default spreadsheet (fallback for any unmapped event)
    default: {
      spreadsheetId: env.GOOGLE_SHEETS_SPREADSHEET_ID,
      registrationSheetName: DEFAULT_REGISTRATION_SHEET_NAME,
      description: 'Default registration spreadsheet',
    },

    '1': {
      spreadsheetId: env.GOOGLE_SHEETS_SPREADSHEET_ID_2025DIF || env.GOOGLE_SHEETS_SPREADSHEET_ID,
      registrationSheetName: DEFAULT_REGISTRATION_SHEET_NAME,
      description: '2025 Defense Industry Forecast registrations',
    },
    '2': {
      spreadsheetId: env.GOOGLE_SHEETS_SPREADSHEET_ID_2025SDPC || env.GOOGLE_SHEETS_SPREADSHEET_ID,
      registrationSheetName: DEFAULT_REGISTRATION_SHEET_NAME,
      description: '2025 Southeast Defense Procurement Conference registrations',
    },
    '4': {
      spreadsheetId: env.GOOGLE_SHEETS_SPREADSHEET_ID_2025NMCPC || env.GOOGLE_SHEETS_SPREADSHEET_ID,
      registrationSheetName: DEFAULT_REGISTRATION_SHEET_NAME,
      description: '2025 Defense Technology and Acquisition Conference registrations',
    },
    '5': {
      spreadsheetId: env.GOOGLE_SHEETS_SPREADSHEET_ID_2025DTAPC || env.GOOGLE_SHEETS_SPREADSHEET_ID,
      registrationSheetName: DEFAULT_REGISTRATION_SHEET_NAME,
      description: '2025 Navy Marine Corps Procurement Conference registrations',
    },
    '6': {
      spreadsheetId: env.GOOGLE_SHEETS_SPREADSHEET_ID_2026NMCPC || env.GOOGLE_SHEETS_SPREADSHEET_ID,
      registrationSheetName: DEFAULT_REGISTRATION_SHEET_NAME,
      description: '2026 Navy Marine Corps Procurement Conference registrations',
    },
    '7': {
      spreadsheetId: env.GOOGLE_SHEETS_SPREADSHEET_ID_2026AFSFPC || env.GOOGLE_SHEETS_SPREADSHEET_ID,
      registrationSheetName: DEFAULT_REGISTRATION_SHEET_NAME,
      description: '2026 Air Force & Space Force Procurement Conference registrations',
    },
    '8': {
      spreadsheetId: env.GOOGLE_SHEETS_SPREADSHEET_ID_2027NMCPC || env.GOOGLE_SHEETS_SPREADSHEET_ID,
      registrationSheetName: DEFAULT_REGISTRATION_SHEET_NAME,
      description: '2027 Navy & Marine Corps Procurement Conference registrations',
    },

    // Add more event mappings as needed
  };
}

/**
 * Returns the spreadsheet + sheet tab that registrations for an event are logged to,
 * falling back to the default spreadsheet for unmapped events.
 */
export function getSpreadsheetConfigForEvent(eventId: string | number): SpreadsheetConfig {
  const mapping = buildMapping();
  return mapping[eventId.toString()] || mapping.default;
}
