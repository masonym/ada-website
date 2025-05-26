export function getEnv() {
  return {
    // Stripe
    STRIPE_PUBLISHABLE_KEY: getRequiredEnv('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', 'Stripe Publishable Key'),
    STRIPE_SECRET_KEY: getRequiredEnv('STRIPE_SECRET_KEY', 'Stripe Secret Key'),
    STRIPE_WEBHOOK_SECRET: getRequiredEnv('STRIPE_WEBHOOK_SECRET', 'Stripe Webhook Secret'),
    
    // Google Sheets
    GOOGLE_SHEETS_SPREADSHEET_ID: getRequiredEnv('GOOGLE_SHEETS_SPREADSHEET_ID', 'Google Sheets Spreadsheet ID'),
    GOOGLE_SHEETS_CLIENT_EMAIL: getRequiredEnv('GOOGLE_SHEETS_CLIENT_EMAIL', 'Google Sheets Client Email'),
    GOOGLE_SHEETS_PRIVATE_KEY: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
    
    // Application
    SITE_URL: getRequiredEnv('NEXT_PUBLIC_SITE_URL', 'Site URL'),
    NODE_ENV: process.env.NODE_ENV || 'development',
    
    // Admin
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'ada-admin-2025',
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
