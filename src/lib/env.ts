/**
 * Client-safe environment variables.
 *
 * Everything here is a NEXT_PUBLIC_* value, which means it is compiled into the
 * browser bundle by design. Nothing secret may be added to this file - server
 * secrets live in lib/server-env.ts, which is marked `server-only` so importing
 * it from a component fails the build.
 */
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

    // Stripe (publishable key only - the secret key is server-side)
    STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',

    // Application
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || '',
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV || 'development',
    NODE_ENV: process.env.NODE_ENV || 'development',

    // Contact address surfaced in email templates
    MY_EMAIL: process.env.NEXT_PUBLIC_MY_EMAIL || 'events@americandefensealliance.org',
  };
}

export type ClientEnv = ReturnType<typeof getClientEnv>;
