import { defineConfig } from '@playwright/test';

/**
 * Config for the event registration smoke tests (see tests/README.md).
 *
 * These are API-level tests, not browser tests: they drive the same endpoints the
 * registration modal calls, confirm the resulting payment in Stripe test mode, and
 * verify the rows that land in the event's Google Sheet.
 *
 * Workers are pinned to 1 on purpose - the tests read the same Google Sheet and the
 * Sheets API read quota is per-user, so parallel polling causes 429s.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  timeout: 180_000,
  expect: { timeout: 15_000 },
  reporter: [['list', { printSteps: true }]],
  globalTeardown: './tests/global-teardown.ts',
  use: {
    baseURL:
      process.env.TEST_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  },
});
