/**
 * Reads process.env directly rather than going through lib/server-env.
 *
 * Spreadsheet ids are not secrets and are never sent to the browser (no
 * NEXT_PUBLIC_ prefix means Next leaves them undefined there), so this module
 * does not need the `server-only` marker - and must not carry it, because the
 * Playwright suite imports this mapping from plain Node to find the sheet it
 * should verify against.
 */
function env(key: string): string {
  return process.env[key] || "";
}

// Configuration for event-specific spreadsheet mapping
export interface SpreadsheetConfig {
  spreadsheetId: string;
  registrationSheetName: string;
  description?: string;
}

export const DEFAULT_REGISTRATION_SHEET_NAME =
  "🛡️ Attendee Registration Information 🛡️";

/**
 * EVENT_SPREADSHEET_MAPPING
 *
 * Maps each event to its specific Google Spreadsheet.
 * The 'default' entry is used as a fallback for any events not explicitly mapped.
 *
 * Resolved lazily so that tooling (tests, scripts) can load their own env files
 * before the mapping is read.
 */
function buildMapping(): Record<string, SpreadsheetConfig> & {
  default: SpreadsheetConfig;
} {
  const fallback = env("GOOGLE_SHEETS_SPREADSHEET_ID");
  if (!fallback && process.env.NODE_ENV === "production") {
    throw new Error(
      "Missing required environment variable: GOOGLE_SHEETS_SPREADSHEET_ID",
    );
  }

  return {
    // Default spreadsheet (fallback for any unmapped event)
    default: {
      spreadsheetId: fallback,
      registrationSheetName: DEFAULT_REGISTRATION_SHEET_NAME,
      description: "Default registration spreadsheet",
    },

    "1": {
      spreadsheetId: env("GOOGLE_SHEETS_SPREADSHEET_ID_2025DIF") || fallback,
      registrationSheetName: DEFAULT_REGISTRATION_SHEET_NAME,
      description: "2025 Defense Industry Forecast registrations",
    },
    "2": {
      spreadsheetId: env("GOOGLE_SHEETS_SPREADSHEET_ID_2025SDPC") || fallback,
      registrationSheetName: DEFAULT_REGISTRATION_SHEET_NAME,
      description:
        "2025 Southeast Defense Procurement Conference registrations",
    },
    "4": {
      spreadsheetId: env("GOOGLE_SHEETS_SPREADSHEET_ID_2025NMCPC") || fallback,
      registrationSheetName: DEFAULT_REGISTRATION_SHEET_NAME,
      description:
        "2025 Defense Technology and Acquisition Conference registrations",
    },
    "5": {
      spreadsheetId: env("GOOGLE_SHEETS_SPREADSHEET_ID_2025DTAPC") || fallback,
      registrationSheetName: DEFAULT_REGISTRATION_SHEET_NAME,
      description:
        "2025 Navy Marine Corps Procurement Conference registrations",
    },
    "6": {
      spreadsheetId: env("GOOGLE_SHEETS_SPREADSHEET_ID_2026NMCPC") || fallback,
      registrationSheetName: DEFAULT_REGISTRATION_SHEET_NAME,
      description:
        "2026 Navy Marine Corps Procurement Conference registrations",
    },
    "7": {
      spreadsheetId: env("GOOGLE_SHEETS_SPREADSHEET_ID_2026AFSFPC") || fallback,
      registrationSheetName: DEFAULT_REGISTRATION_SHEET_NAME,
      description:
        "2026 Air Force & Space Force Procurement Conference registrations",
    },
    "8": {
      spreadsheetId: env("GOOGLE_SHEETS_SPREADSHEET_ID_2027NMCPC") || fallback,
      registrationSheetName: DEFAULT_REGISTRATION_SHEET_NAME,
      description:
        "2027 Navy & Marine Corps Procurement Conference registrations",
    },
    "9": {
      spreadsheetId: env("GOOGLE_SHEETS_SPREADSHEET_ID_2026DIU") || fallback,
      registrationSheetName: DEFAULT_REGISTRATION_SHEET_NAME,
      description: "2026 Defense Industry Update registrations",
    },

    // Add more event mappings as needed
  };
}

/**
 * Returns the spreadsheet + sheet tab that registrations for an event are logged to,
 * falling back to the default spreadsheet for unmapped events.
 */
export function getSpreadsheetConfigForEvent(
  eventId: string | number,
): SpreadsheetConfig {
  const mapping = buildMapping();
  return mapping[eventId.toString()] || mapping.default;
}
