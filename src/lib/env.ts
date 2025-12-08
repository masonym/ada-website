// Client-side environment variables (safe to use in browser)
export function getClientEnv() {
  return {
    // Maps API
    NEXT_PUBLIC_MAPS_API_KEY: process.env.NEXT_PUBLIC_MAPS_API_KEY || '',
    NEXT_PUBLIC_MAP_ID: process.env.NEXT_PUBLIC_MAP_ID || '',
    
    // CDN and Storage
    NEXT_PUBLIC_CDN_DOMAIN: process.env.NEXT_PUBLIC_CDN_DOMAIN || '',
    NEXT_PUBLIC_STORAGE_BUCKET: process.env.NEXT_PUBLIC_STORAGE_BUCKET || '',
    
    // Development Mode
    NEXT_PUBLIC_DEV_MODE: process.env.NEXT_PUBLIC_DEV_MODE === 'true',
    
    // Stripe (client-side publishable key only)
    STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    
    // Application
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || '',
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV || 'development',
    NODE_ENV: process.env.NODE_ENV || 'development',
  };
}

// Server-side environment variables (only for server-side code)
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
    
    // Admin
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'ada-admin-2025',
    
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
    
    // Resend API
    RESEND_API_KEY: getRequiredEnv('RESEND_API_KEY', 'Resend API Key'),
    
    // DynamoDB
    DYNAMODB_TABLE_NAME: getRequiredEnv('DYNAMODB_TABLE_NAME', 'DynamoDB Table Name'),
    PERMANENT_REGISTRATIONS_TABLE_NAME: getRequiredEnv('PERMANENT_REGISTRATIONS_TABLE_NAME', 'Permanent Registrations Table Name'),
    REGISTRATION_CONTACT_EMAIL_ADDRESS: getRequiredEnv('REGISTRATION_CONTACT_EMAIL_ADDRESS', 'Registration Contact Email Address'),
    
    // Sanity CMS
    SANITY_WRITE_TOKEN: process.env.SANITY_WRITE_TOKEN || '',
  };
}

// Legacy function for backward compatibility - use getClientEnv() or getServerEnv() instead
export function getEnv() {
  // Only return client-safe variables when called from client-side
  if (typeof window !== 'undefined') {
    return getClientEnv();
  }
  // Return all variables when called from server-side
  return {
    ...getClientEnv(),
    ...getServerEnv(),
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
