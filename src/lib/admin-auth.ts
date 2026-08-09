import { NextRequest } from 'next/server';

/**
 * Server-side half of the admin gate.
 *
 * Logging in sets an httpOnly cookie holding a signed session token; the
 * middleware verifies it on every request under /admin, /api/admin and the other
 * prefixes listed there, so routes with real-world side effects can trust the
 * caller without asking the admin to re-enter anything.
 *
 * The token used to be SHA-256("salt:" + ADMIN_PASSWORD) - deterministic, which
 * made it password-equivalent, identical for every admin and every session, and
 * impossible to invalidate short of changing the password. It is now a random
 * per-session id plus an absolute expiry, signed with HMAC-SHA-256 keyed on the
 * admin secret. Two sessions never share a token, a stolen cookie dies on its
 * own schedule, and the cookie no longer reveals anything about the password.
 *
 * The signature is verified statelessly. That is deliberate: verification runs
 * in middleware, which is the Edge runtime, and reaching DynamoDB from there
 * would put a network round-trip and the AWS SDK on every admin request. The
 * cost is that individual sessions cannot be revoked server-side before they
 * expire - rotating ADMIN_SESSION_SECRET (or ADMIN_PASSWORD) invalidates all of
 * them at once, which is the lever that matters when a laptop goes missing.
 *
 * Web Crypto rather than node:crypto throughout, so this works on the Workers
 * runtime the site deploys to.
 */
export const ADMIN_SESSION_COOKIE = 'admin_session';

// Seven days: long enough that a logged-in admin is not bounced mid-task,
// short enough that a leaked cookie is not valid indefinitely.
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 7;

// Domain separation for the HMAC, and a version marker so the format can change
// without old cookies being silently accepted under the new rules.
const TOKEN_VERSION = 'v2';

/**
 * Key material for the session signature.
 *
 * ADMIN_SESSION_SECRET is preferred, because it lets the signing key be rotated
 * (logging everyone out) without changing the password people actually type.
 * Falling back to ADMIN_PASSWORD keeps deployments that have not set it working
 * - the token is no longer derived from it in any recoverable way, so this is
 * only a key, not a disclosure.
 */
function getSigningSecret(): string | null {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || null;
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function sign(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return base64UrlEncode(new Uint8Array(signature));
}

/**
 * Compares two strings without leaking how far they matched.
 *
 * Lengths are compared first and the loop always runs to the end of the longer
 * string, so the timing depends on the inputs' lengths but not their contents.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  const length = Math.max(a.length, b.length);
  let mismatch = a.length ^ b.length;

  for (let i = 0; i < length; i++) {
    mismatch |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }

  return mismatch === 0;
}

/**
 * Mints a session token for a successful login.
 *
 * Shape: v2.<expiry seconds>.<random session id>.<signature>. The session id is
 * 128 bits of CSPRNG output, so it identifies the session in logs without being
 * guessable, and the signature covers the first three parts - an attacker cannot
 * extend the expiry or invent an id without the secret.
 */
export async function createAdminSessionToken(
  maxAgeSeconds: number = ADMIN_SESSION_MAX_AGE
): Promise<string | null> {
  const secret = getSigningSecret();
  if (!secret) return null;

  const expiresAt = Math.floor(Date.now() / 1000) + maxAgeSeconds;
  const sessionId = base64UrlEncode(crypto.getRandomValues(new Uint8Array(16)));

  const payload = `${TOKEN_VERSION}.${expiresAt}.${sessionId}`;
  return `${payload}.${await sign(payload, secret)}`;
}

/**
 * Verifies a session token: format, signature, then expiry.
 *
 * The signature is checked before the expiry so an unsigned token cannot be used
 * to probe anything, and the comparison is constant-time.
 */
export async function verifyAdminSessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;

  const secret = getSigningSecret();
  if (!secret) {
    console.error('[admin-auth] no admin secret is set - refusing all admin requests');
    return false;
  }

  const parts = token.split('.');
  if (parts.length !== 4) return false;

  const [version, expiresAt, sessionId, signature] = parts;
  if (version !== TOKEN_VERSION) return false;

  const expiry = Number(expiresAt);
  if (!Number.isFinite(expiry)) return false;

  const expected = await sign(`${version}.${expiresAt}.${sessionId}`, secret);
  if (!timingSafeEqual(signature, expected)) return false;

  return expiry > Math.floor(Date.now() / 1000);
}

/**
 * Returns true when the request carries a valid admin session cookie.
 */
export async function isAuthenticatedAdmin(request: NextRequest): Promise<boolean> {
  return verifyAdminSessionToken(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
}
