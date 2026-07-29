import { NextRequest } from 'next/server';

/**
 * Server-side half of the admin gate.
 *
 * The admin area is gated client-side by a localStorage flag (see
 * src/app/admin/layout.tsx), which is fine for routes that only read content but
 * proves nothing to an API route. Logging in also sets an httpOnly cookie
 * holding a token derived from the admin password, so routes with real-world
 * side effects - sending mail, for instance - can verify the caller without
 * asking the admin to re-enter anything.
 */
export const ADMIN_SESSION_COOKIE = 'admin_session';

// Seven days: long enough that a logged-in admin is not bounced mid-task,
// short enough that a leaked cookie is not valid indefinitely.
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 7;

// Domain separation, so the stored token is not a bare hash of the password.
const TOKEN_SALT = 'ada-admin-session-v1:';

/**
 * Derives the session token from the admin password. Uses Web Crypto rather
 * than node:crypto so it works on the Workers runtime the site deploys to.
 */
export async function getAdminSessionToken(): Promise<string | null> {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;

  const data = new TextEncoder().encode(`${TOKEN_SALT}${password}`);
  const digest = await crypto.subtle.digest('SHA-256', data);

  return Array.from(new Uint8Array(digest))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Returns true when the request carries a valid admin session cookie.
 */
export async function isAuthenticatedAdmin(request: NextRequest): Promise<boolean> {
  const expected = await getAdminSessionToken();
  if (!expected) {
    console.error('[admin-auth] ADMIN_PASSWORD is not set - refusing all admin requests');
    return false;
  }

  const supplied = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  return supplied === expected;
}
