export function getEnv() {
  return {
    // Stripe
    STRIPE_PUBLISHABLE_KEY: getRequiredEnv('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', 'Stripe Publishable Key'),
    STRIPE_SECRET_KEY: getRequiredEnv('STRIPE_SECRET_KEY', 'Stripe Secret Key'),
    STRIPE_WEBHOOK_SECRET: getRequiredEnv('STRIPE_WEBHOOK_SECRET', 'Stripe Webhook Secret'),
    
    // Google Sheets (OAuth 2.0 Client)
    GOOGLE_SHEETS_SPREADSHEET_ID: getRequiredEnv('GOOGLE_SHEETS_SPREADSHEET_ID', 'Google Sheets Spreadsheet ID'),
    // Event-specific spreadsheet IDs - these are optional and will fallback to the default if not provided
    GOOGLE_SHEETS_SPREADSHEET_ID_2025DIF: process.env.GOOGLE_SHEETS_SPREADSHEET_ID_2025DIF || '',
    GOOGLE_SHEETS_SPREADSHEET_ID_2025SDPC: process.env.GOOGLE_SHEETS_SPREADSHEET_ID_2025SDPC || '',
    GOOGLE_SHEETS_SPREADSHEET_ID_2025NMCPC: process.env.GOOGLE_SHEETS_SPREADSHEET_ID_2025NMCPC || '',
    GOOGLE_SHEETS_SPREADSHEET_ID_2025DTAPC: process.env.GOOGLE_SHEETS_SPREADSHEET_ID_2025DTAPC || '',
    GOOGLE_SHEETS_SPREADSHEET_ID_2026NMCPC: process.env.GOOGLE_SHEETS_SPREADSHEET_ID_2026NMCPC || '',
    // Google OAuth credentials
    GOOGLE_CLIENT_ID: getRequiredEnv('GOOGLE_CLIENT_ID', 'Google Client ID'),
    GOOGLE_CLIENT_SECRET: getRequiredEnv('GOOGLE_CLIENT_SECRET', 'Google Client Secret'),
    GOOGLE_REFRESH_TOKEN: getRequiredEnv('GOOGLE_REFRESH_TOKEN', 'Google Refresh Token'),
    // GOOGLE_SHEETS_CLIENT_EMAIL is used by JWT auth, not directly by OAuth2 client for auth, but might be used for other purposes or if switching auth methods.
    GOOGLE_SHEETS_CLIENT_EMAIL: process.env.GOOGLE_SHEETS_CLIENT_EMAIL || '', // Make optional or remove if not needed for OAuth flow
    // GOOGLE_SHEETS_PRIVATE_KEY is for JWT/Service Account auth, not OAuth2 client.
    GOOGLE_SHEETS_PRIVATE_KEY: (process.env.GOOGLE_SHEETS_PRIVATE_KEY || '').replace(/\n/g, '\n'), // Ensure it's optional and handles undefined
    
    // Email
    RESEND_API_KEY: getRequiredEnv('RESEND_API_KEY', 'Resend API Key'),
    MY_EMAIL: getRequiredEnv('MY_EMAIL', 'My Email Address for Sending'),
    
    // Application
    NEXT_PUBLIC_SITE_URL: getRequiredEnv('NEXT_PUBLIC_SITE_URL', 'Site URL'), // Renamed for clarity
    NODE_ENV: process.env.NODE_ENV || 'development',
    
    // Admin
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'ada-admin-2025',
    
    // AWS
    AWS_ACCESS_KEY_ID: getRequiredEnv('AWS_ACCESS_KEY_ID', 'AWS Access Key ID'),
    AWS_SECRET_ACCESS_KEY: getRequiredEnv('AWS_SECRET_ACCESS_KEY', 'AWS Secret Access Key'),
    AWS_REGION: getRequiredEnv('AWS_REGION', 'AWS Region'),
    DYNAMODB_TABLE_NAME: getRequiredEnv('DYNAMODB_TABLE_NAME', 'DynamoDB Table Name'),
  PERMANENT_REGISTRATIONS_TABLE_NAME: getRequiredEnv('PERMANENT_REGISTRATIONS_TABLE_NAME', 'Permanent Registrations Table Name'),
  };
}

function getRequiredEnv(key: string, name: string): string {
  const value = process.env[key];
  if (!value) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Missing required environment variable: ${key} (${name})`);
    } else {
      console.warn(`Warning: Missing environment variable: ${key} (${name})`);
      return '';
    }
  }
  return value;
}

export type Env = ReturnType<typeof getEnv>;
