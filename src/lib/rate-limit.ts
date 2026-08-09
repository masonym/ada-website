/**
 * A small fixed-window rate limiter for public POST endpoints.
 *
 * The contact form and the newsletter subscribe route both reach real systems -
 * an inbox and the live iContact list - and neither had anything between an
 * automated script and those systems. This is the cheap version of a fix: no
 * captcha, no external service, just a per-address cap that turns "unbounded"
 * into "a handful per window".
 *
 * Counters live in process memory, so they are per-isolate and reset on deploy.
 * On Workers and Lambda that means a distributed sender gets more headroom than
 * the numbers suggest. It is still the difference between a script filling an
 * inbox in a minute and having to work at it. If abuse becomes real rather than
 * theoretical, the next step is a captcha on the form, not a bigger counter.
 */

type Window = {
  count: number;
  resetsAt: number;
};

/** Bound on each limiter's map, so forged addresses cannot grow it forever. */
const MAX_TRACKED = 5000;

/**
 * Best-effort client address.
 *
 * cf-connecting-ip is set by Cloudflare and cannot be forged by the client
 * behind it; x-forwarded-for is the Vercel/proxy equivalent, where the first
 * entry is the original client. Requests with neither share the 'unknown'
 * bucket and are throttled collectively.
 */
export function getClientIdentifier(request: Request): string {
  const cloudflare = request.headers.get('cf-connecting-ip');
  if (cloudflare) return cloudflare;

  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();

  return request.headers.get('x-real-ip') || 'unknown';
}

export type RateLimiter = {
  /** Counts one request and reports whether it is over the cap. */
  consume(identifier: string): { allowed: boolean; retryAfterSeconds: number };
  /** Test seam. */
  reset(): void;
};

export function createRateLimiter({
  limit,
  windowMs,
}: {
  limit: number;
  windowMs: number;
}): RateLimiter {
  const windows = new Map<string, Window>();

  const prune = (now: number) => {
    if (windows.size < MAX_TRACKED) return;
    for (const [key, window] of windows) {
      if (window.resetsAt <= now) windows.delete(key);
    }
    // Every window still live: drop the soonest to expire rather than grow.
    if (windows.size >= MAX_TRACKED) {
      const soonest = [...windows.entries()].sort((a, b) => a[1].resetsAt - b[1].resetsAt);
      for (const [key] of soonest.slice(0, Math.ceil(MAX_TRACKED / 10))) {
        windows.delete(key);
      }
    }
  };

  return {
    consume(identifier: string) {
      const now = Date.now();
      prune(now);

      const existing = windows.get(identifier);
      const window =
        existing && existing.resetsAt > now
          ? existing
          : { count: 0, resetsAt: now + windowMs };

      window.count += 1;
      windows.set(identifier, window);

      if (window.count > limit) {
        return {
          allowed: false,
          retryAfterSeconds: Math.max(1, Math.ceil((window.resetsAt - now) / 1000)),
        };
      }

      return { allowed: true, retryAfterSeconds: 0 };
    },

    reset() {
      windows.clear();
    },
  };
}

/** 429 with a Retry-After, in the shape both public routes return. */
export function tooManyRequests(retryAfterSeconds: number, message: string) {
  return Response.json(
    { error: message },
    { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } }
  );
}
