import { google, sheets_v4 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { config, TEST_ROW_MARKER } from './config';
import { getSpreadsheetConfigForEvent } from '@/lib/google-sheets/spreadsheet-mapping';

/**
 * Read/verify/clean the registration rows the app writes.
 *
 * Column layout mirrors the row built in logRegistration() (src/lib/google-sheets/index.ts).
 * Registrations are appended starting at row 2, so row 1 is the header.
 */

export const COLUMNS = [
  'company',
  'jobTitle',
  'firstName',
  'lastName',
  'email',
  'phone',
  'timestamp',
  'ticketType',
  'amount',
  'orderTotal',
  'website',
  'businessSize',
  'sbaIdentification',
  'industry',
  'sponsorInterest',
  'speakingInterest',
  'validatedAgainst',
  'promoCode',
] as const;

export type SheetRow = { [K in (typeof COLUMNS)[number]]: string } & {
  /** 1-based row number in the sheet. */
  rowNumber: number;
  amountNumber: number;
  orderTotalNumber: number;
};

export function sheetTarget(eventId: string | number = config.eventId) {
  return getSpreadsheetConfigForEvent(eventId);
}

let client: sheets_v4.Sheets | undefined;

export function sheetsClient(): sheets_v4.Sheets {
  if (!client) {
    const auth = new OAuth2Client(config.google.clientId, config.google.clientSecret);
    auth.setCredentials({ refresh_token: config.google.refreshToken });
    client = google.sheets({ version: 'v4', auth });
  }
  return client;
}

function toRow(values: unknown[], rowNumber: number): SheetRow {
  const row: any = { rowNumber };
  COLUMNS.forEach((name, i) => {
    row[name] = values[i] === undefined || values[i] === null ? '' : String(values[i]);
  });
  row.amountNumber = parseFloat(String(row.amount).replace(/[^0-9.-]/g, '')) || 0;
  row.orderTotalNumber = parseFloat(String(row.orderTotal).replace(/[^0-9.-]/g, '')) || 0;
  return row as SheetRow;
}

let cache: { rows: SheetRow[]; at: number } | undefined;
const CACHE_TTL_MS = 3_000;

/** All registration rows currently in the event's sheet. Cached briefly to stay under quota. */
export async function readRows(force = false): Promise<SheetRow[]> {
  if (!force && cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.rows;

  const target = sheetTarget();
  const response = await sheetsClient().spreadsheets.values.get({
    spreadsheetId: target.spreadsheetId,
    range: `${target.registrationSheetName}!A2:R`,
    // Raw values, so column formatting (currency, phone number masks) doesn't
    // change what the test sees.
    valueRenderOption: 'UNFORMATTED_VALUE',
  });

  const rows = (response.data.values || []).map((values, i) => toRow(values, i + 2));
  cache = { rows, at: Date.now() };
  return rows;
}

/** Rows written by a specific order, matched on either marker column. */
export function rowsForMarker(rows: SheetRow[], marker: string): SheetRow[] {
  return rows.filter((row) => row.company === marker || row.validatedAgainst.includes(marker));
}

/** Every row any test run has ever left behind. Used by the cleanup teardown. */
export function testRows(rows: SheetRow[]): SheetRow[] {
  return rows.filter(
    (row) => row.company.startsWith(TEST_ROW_MARKER) || row.validatedAgainst.includes(TEST_ROW_MARKER)
  );
}

/**
 * Polls the sheet until `expectedCount` rows carrying `marker` appear.
 * Throws a diagnostic error on timeout - the usual cause is the webhook never arriving.
 */
export async function waitForRows(
  marker: string,
  expectedCount: number,
  timeoutMs: number = config.sheetTimeoutMs
): Promise<SheetRow[]> {
  const deadline = Date.now() + timeoutMs;
  let found: SheetRow[] = [];

  while (Date.now() < deadline) {
    found = rowsForMarker(await readRows(true), marker);
    if (found.length >= expectedCount) return found;
    await new Promise((resolve) => setTimeout(resolve, 4_000));
  }

  const target = sheetTarget();
  throw new Error(
    `Timed out after ${timeoutMs / 1000}s waiting for ${expectedCount} row(s) marked "${marker}" ` +
      `in sheet "${target.registrationSheetName}" (${target.spreadsheetId}). Found ${found.length}.\n` +
      'Likely causes:\n' +
      `  - the payment_intent.succeeded webhook never reached the app (mode: ${config.webhookMode})\n` +
      '  - another environment (e.g. staging) is registered as a Stripe webhook endpoint and\n' +
      '    processed this payment first; the handler dedupes on the payment intent id in\n' +
      "    DynamoDB, so the app under test skipped it and logged the row to that environment's\n" +
      '    spreadsheet instead. See "Webhook modes" in tests/README.md.\n' +
      '  - the event id is not mapped to a spreadsheet in src/lib/google-sheets/spreadsheet-mapping.ts\n' +
      '  - the Google credentials cannot write to that spreadsheet\n' +
      'Check the app server logs for "Failed to log registration to Google Sheets" or\n' +
      '"has already been processed".'
  );
}

/** Deletes rows by sheet row number. Used to undo what the tests wrote. */
export async function deleteRows(rowNumbers: number[]): Promise<number> {
  if (rowNumbers.length === 0) return 0;

  const target = sheetTarget();
  const sheets = sheetsClient();

  const meta = await sheets.spreadsheets.get({
    spreadsheetId: target.spreadsheetId,
    fields: 'sheets.properties(sheetId,title)',
  });

  const sheetId = meta.data.sheets?.find(
    (s) => s.properties?.title === target.registrationSheetName
  )?.properties?.sheetId;

  if (sheetId === undefined || sheetId === null) {
    throw new Error(
      `Sheet tab "${target.registrationSheetName}" not found in spreadsheet ${target.spreadsheetId}`
    );
  }

  // Delete bottom-up so earlier row numbers stay valid.
  const requests = [...rowNumbers]
    .sort((a, b) => b - a)
    .map((rowNumber) => ({
      deleteDimension: {
        range: { sheetId, dimension: 'ROWS', startIndex: rowNumber - 1, endIndex: rowNumber },
      },
    }));

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: target.spreadsheetId,
    requestBody: { requests },
  });

  cache = undefined;
  return requests.length;
}
