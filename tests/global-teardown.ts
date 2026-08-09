import { config, TEST_ROW_MARKER } from './helpers/config';
import { readRows, testRows, deleteRows, sheetTarget } from './helpers/sheets';

/**
 * Removes the rows the suite wrote to the event's registration sheet.
 *
 * Matches on the marker rather than this run's id, so rows left behind by an aborted
 * earlier run get cleaned up too. Set TEST_CLEANUP_SHEET_ROWS=false to keep them for
 * inspection - they can be deleted by hand later, they all start with "ADA QA TEST".
 */
export default async function globalTeardown() {
  // Nothing to clean up unless a run actually targeted one event's sheet. The
  // offline specs (01-03) write nothing, and CI runs them with neither
  // TEST_EVENT_ID nor Google credentials.
  if (!process.env.TEST_EVENT_ID) return;
  if (!config.google.clientId || !config.google.refreshToken) return;

  if (!config.cleanupSheetRows) {
    console.log(`\n[teardown] TEST_CLEANUP_SHEET_ROWS=false - leaving "${TEST_ROW_MARKER}" rows in place.`);
    return;
  }

  try {
    const rows = testRows(await readRows(true));
    if (rows.length === 0) {
      console.log('\n[teardown] no test rows to clean up.');
      return;
    }

    const deleted = await deleteRows(rows.map((r) => r.rowNumber));
    console.log(
      `\n[teardown] deleted ${deleted} test row(s) from "${sheetTarget().registrationSheetName}".`
    );
  } catch (error) {
    // Never fail the run on cleanup - report it so the rows can be removed by hand.
    console.error(
      `\n[teardown] could not clean up test rows: ${error instanceof Error ? error.message : error}\n` +
        `Delete any rows whose Company or "Validated against" column starts with "${TEST_ROW_MARKER}".`
    );
  }
}
