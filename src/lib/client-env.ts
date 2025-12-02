// Client-safe environment variables
// Only include NEXT_PUBLIC_ variables that can be accessed in client components

// Define the client environment interface to match the properties we need
export interface ClientEnvType {
  STRIPE_PUBLISHABLE_KEY: string;
  SITE_URL: string;
  MY_EMAIL: string;
  // Add other client-safe properties as needed
}

export function getClientEnv(): ClientEnvType {
  return {
    // Only include client-safe environment variables (NEXT_PUBLIC_ prefixed)
    STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || '',
    // Add fallbacks for server-side variables that might be accessed from client components
    MY_EMAIL: process.env.NEXT_PUBLIC_MY_EMAIL || 'events@americandefensealliance.org',
    // Add other NEXT_PUBLIC_ variables as needed
  };
}

export type ClientEnv = ReturnType<typeof getClientEnv>;
