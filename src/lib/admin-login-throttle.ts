export { getClientIdentifier } from '@/lib/rate-limit';

/**
 * Brute-force throttling for the admin login.
 *
 * The admin area is one shared password with no second factor, and the login
 * route previously accepted guesses as fast as HTTP could deliver them. This
 * caps a single client to a handful of attempts per window and then locks it
 * out for a stretch that grows with each further failure.
 *
 * The counters are in process memory, which means they are per-isolate: on
 * Workers and Lambda a determined attacker who lands on cold isolates gets a
 * fresh budget each time, and a distributed attacker gets one per source
 * address. That is a real limitation and it is still a large improvement over
 * unlimited guessing - the alternative, a DynamoDB round-trip on every login
 * attempt, puts the database on the path that has to work when everything else
 * is broken. If the admin area ever grows past one shared password, replace this
 * with per-user credentials rather than with a bigger counter.
 */

type Attempt = {
  failures: number;
  /** When the current counting window started. */
  windowStartedAt: number;
  /** Epoch ms until which this client is refused outright. */
  lockedUntil: number;
};

/** Failures tolerated inside one window before the lockout starts. */
const MAX_FAILURES = 5;

/** Failures older than this stop counting, so an honest typo does not linger. */
const WINDOW_MS = 15 * 60 * 1000;

/** First lockout; each failure past the threshold doubles it, to the cap below. */
const BASE_LOCKOUT_MS = 60 * 1000;
const MAX_LOCKOUT_MS = 60 * 60 * 1000;

/** Bound on the map, so a spray across forged addresses cannot grow it forever. */
const MAX_TRACKED_CLIENTS = 5000;

const attempts = new Map<string, Attempt>();

function prune(now: number) {
  if (attempts.size < MAX_TRACKED_CLIENTS) return;

  for (const [key, attempt] of attempts) {
    if (attempt.lockedUntil <= now && now - attempt.windowStartedAt > WINDOW_MS) {
      attempts.delete(key);
    }
  }

  // Still full of live entries - drop the oldest rather than grow without bound.
  if (attempts.size >= MAX_TRACKED_CLIENTS) {
    const oldest = [...attempts.entries()].sort(
      (a, b) => a[1].windowStartedAt - b[1].windowStartedAt
    );
    for (const [key] of oldest.slice(0, Math.ceil(MAX_TRACKED_CLIENTS / 10))) {
      attempts.delete(key);
    }
  }
}

/**
 * Whether this client may attempt a login right now.
 *
 * `retryAfterSeconds` is suitable for a Retry-After header and is always at
 * least 1, so a caller never sees "wait 0 seconds" on a live lockout.
 */
export function checkLoginAllowed(identifier: string): {
  allowed: boolean;
  retryAfterSeconds: number;
} {
  const now = Date.now();
  const attempt = attempts.get(identifier);

  if (!attempt || attempt.lockedUntil <= now) {
    return { allowed: true, retryAfterSeconds: 0 };
  }

  return {
    allowed: false,
    retryAfterSeconds: Math.max(1, Math.ceil((attempt.lockedUntil - now) / 1000)),
  };
}

/**
 * Records a failed attempt and returns the lockout it triggered, if any.
 */
export function recordLoginFailure(identifier: string): { lockedForSeconds: number } {
  const now = Date.now();
  prune(now);

  const existing = attempts.get(identifier);
  const windowIsLive = existing !== undefined && now - existing.windowStartedAt <= WINDOW_MS;

  // Rolling the window forgets old failures but never an active lockout, so a
  // client cannot wait out the counting window to shorten a longer ban.
  const attempt: Attempt = windowIsLive
    ? existing
    : { failures: 0, windowStartedAt: now, lockedUntil: existing?.lockedUntil ?? 0 };

  attempt.failures += 1;

  if (attempt.failures >= MAX_FAILURES) {
    const overshoot = attempt.failures - MAX_FAILURES;
    const lockout = Math.min(BASE_LOCKOUT_MS * 2 ** overshoot, MAX_LOCKOUT_MS);
    attempt.lockedUntil = now + lockout;
    attempts.set(identifier, attempt);
    return { lockedForSeconds: Math.ceil(lockout / 1000) };
  }

  attempts.set(identifier, attempt);
  return { lockedForSeconds: 0 };
}

/** Clears the counter for a client after a successful login. */
export function recordLoginSuccess(identifier: string) {
  attempts.delete(identifier);
}

/** Test seam - drops all counters. */
export function resetLoginThrottle() {
  attempts.clear();
}
