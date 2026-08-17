import 'server-only';

/**
 * Server-side environment variables.
 *
 * Split out of lib/env.ts and marked `server-only` deliberately. The old module
 * exported both halves, so any client component that imported it for a
 * NEXT_PUBLIC value also pulled in the references to AWS_SECRET_ACCESS_KEY,
 * STRIPE_SECRET_KEY and the Google refresh token. Combined with the `env` block
 * that used to sit in next.config.mjs, that inlined real secrets into browser
 * bundles. Importing this file from the client is now a build error.
 *
 * Client-safe values live in lib/env.ts.
 */

function getRequiredEnv(key: string, name: string): string {
  const value = process.env[key];
  if (!value) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Missing required environment variable: ${key} (${name})`);
    }
    console.warn(`Warning: Missing environment variable: ${key} (${name})`);
    return '';
  }
  return value;
}

export function getServerEnv() {
  return {
    // Email Configuration
    MY_EMAIL: getRequiredEnv('MY_EMAIL', 'My Email Address for Sending'),
    MY_PASSWORD: getRequiredEnv('MY_PASSWORD', 'My Email Password'),

    // iContact API
    ICONTACT_APP_ID: getRequiredEnv('ICONTACT_APP_ID', 'iContact App ID'),
    ICONTACT_EMAIL: getRequiredEnv('ICONTACT_EMAIL', 'iContact Email'),
    ICONTACT_PASSWORD: getRequiredEnv('ICONTACT_PASSWORD', 'iContact Password'),
    ICONTACT_CLIENT_FOLDER_ID: getRequiredEnv('ICONTACT_CLIENT_FOLDER_ID', 'iContact Client Folder ID'),
    ICONTACT_ACCOUNT_ID: getRequiredEnv('ICONTACT_ACCOUNT_ID', 'iContact Account ID'),
    ICONTACT_API_URL: getRequiredEnv('ICONTACT_API_URL', 'iContact API URL'),
    ICONTACT_LIST_ID: getRequiredEnv('ICONTACT_LIST_ID', 'iContact List ID'),

    // AWS
    AWS_ACCESS_KEY_ID: getRequiredEnv('AWS_ACCESS_KEY_ID', 'AWS Access Key ID'),
    AWS_SECRET_ACCESS_KEY: getRequiredEnv('AWS_SECRET_ACCESS_KEY', 'AWS Secret Access Key'),
    AWS_REGION: process.env.AWS_REGION || 'us-west-2',
    AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME || 'americandefensealliance',

    // Admin - no fallback on purpose. An unset password must lock the admin
    // area, not silently accept a value that is published in this repo.
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || '',

    // Discord Webhook
    DISCORD_ADMIN_WEBHOOK_URL: process.env.DISCORD_ADMIN_WEBHOOK_URL || '',

    // Stripe (server-side secrets)
    STRIPE_SECRET_KEY: getRequiredEnv('STRIPE_SECRET_KEY', 'Stripe Secret Key'),
    STRIPE_WEBHOOK_SECRET: getRequiredEnv('STRIPE_WEBHOOK_SECRET', 'Stripe Webhook Secret'),

    // Google Sheets API
    GOOGLE_CLIENT_ID: getRequiredEnv('GOOGLE_CLIENT_ID', 'Google Client ID'),
    GOOGLE_CLIENT_SECRET: getRequiredEnv('GOOGLE_CLIENT_SECRET', 'Google Client Secret'),
    GOOGLE_REFRESH_TOKEN: getRequiredEnv('GOOGLE_REFRESH_TOKEN', 'Google Refresh Token'),
    GOOGLE_SHEETS_CLIENT_EMAIL: process.env.GOOGLE_SHEETS_CLIENT_EMAIL || '',
    GOOGLE_SHEETS_PRIVATE_KEY: process.env.GOOGLE_SHEETS_PRIVATE_KEY || '',

    // Google Sheets Spreadsheet IDs
    GOOGLE_SHEETS_SPREADSHEET_ID: getRequiredEnv('GOOGLE_SHEETS_SPREADSHEET_ID', 'Google Sheets Spreadsheet ID'),
    GOOGLE_SHEETS_SPREADSHEET_ID_2025DIF: process.env.GOOGLE_SHEETS_SPREADSHEET_ID_2025DIF || '',
    GOOGLE_SHEETS_SPREADSHEET_ID_2025SDPC: process.env.GOOGLE_SHEETS_SPREADSHEET_ID_2025SDPC || '',
    GOOGLE_SHEETS_SPREADSHEET_ID_2025NMCPC: process.env.GOOGLE_SHEETS_SPREADSHEET_ID_2025NMCPC || '',
    GOOGLE_SHEETS_SPREADSHEET_ID_2025DTAPC: process.env.GOOGLE_SHEETS_SPREADSHEET_ID_2025DTAPC || '',
    GOOGLE_SHEETS_SPREADSHEET_ID_2026NMCPC: process.env.GOOGLE_SHEETS_SPREADSHEET_ID_2026NMCPC || '',
    GOOGLE_SHEETS_SPREADSHEET_ID_2026AFSFPC: process.env.GOOGLE_SHEETS_SPREADSHEET_ID_2026AFSFPC || '',
    GOOGLE_SHEETS_SPREADSHEET_ID_2027NMCPC: process.env.GOOGLE_SHEETS_SPREADSHEET_ID_2027NMCPC || '',

    // Resend API
    RESEND_API_KEY: getRequiredEnv('RESEND_API_KEY', 'Resend API Key'),

    // DynamoDB
    DYNAMODB_TABLE_NAME: getRequiredEnv('DYNAMODB_TABLE_NAME', 'DynamoDB Table Name'),
    PERMANENT_REGISTRATIONS_TABLE_NAME: getRequiredEnv('PERMANENT_REGISTRATIONS_TABLE_NAME', 'Permanent Registrations Table Name'),
    // Deliberately not required: a missing table name must never stop a
    // registration, it only costs us the forensic record.
    FAILED_REGISTRATIONS_TABLE_NAME:
      process.env.FAILED_REGISTRATIONS_TABLE_NAME || 'failed-registrations',
    REGISTRATION_CONTACT_EMAIL_ADDRESS: getRequiredEnv('REGISTRATION_CONTACT_EMAIL_ADDRESS', 'Registration Contact Email Address'),

    // Sanity CMS
    SANITY_WRITE_TOKEN: process.env.SANITY_WRITE_TOKEN || '',
  };
}

export type ServerEnv = ReturnType<typeof getServerEnv>;
