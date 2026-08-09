import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  createAdminSessionToken,
  timingSafeEqual,
} from "@/lib/admin-auth";
import {
  checkLoginAllowed,
  getClientIdentifier,
  recordLoginFailure,
  recordLoginSuccess,
} from "@/lib/admin-login-throttle";

function sessionCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export async function POST(request: NextRequest) {
  const client = getClientIdentifier(request);

  try {
    // Throttle before touching the password, so a locked-out client learns
    // nothing from how long the response takes.
    const throttle = checkLoginAllowed(client);
    if (!throttle.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many attempts. Try again later." },
        { status: 429, headers: { "Retry-After": String(throttle.retryAfterSeconds) } }
      );
    }

    const { password } = await request.json();

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { success: false, error: "Password is required" },
        { status: 400 }
      );
    }

    // Read at call time rather than module scope: a module-level snapshot is
    // captured once per isolate, which makes rotating the password require a
    // redeploy rather than a restart.
    const expected = process.env.ADMIN_PASSWORD;

    // An unset password locks the admin area rather than opening it. Without
    // this the comparison below would succeed for an empty submission.
    if (!expected) {
      console.error("[admin-auth] ADMIN_PASSWORD is not set - refusing all logins");
      return NextResponse.json(
        { success: false, error: "Admin login is not configured" },
        { status: 503 }
      );
    }

    if (!timingSafeEqual(password, expected)) {
      const { lockedForSeconds } = recordLoginFailure(client);

      // Deliberately the same body and status whether or not this attempt
      // tripped the lockout - the Retry-After header is the only signal, and it
      // only appears once the client is already blocked.
      return NextResponse.json(
        { success: false, error: "Invalid password" },
        {
          status: 401,
          headers: lockedForSeconds
            ? { "Retry-After": String(lockedForSeconds) }
            : undefined,
        }
      );
    }

    recordLoginSuccess(client);

    const token = await createAdminSessionToken();
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Admin login is not configured" },
        { status: 503 }
      );
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(
      ADMIN_SESSION_COOKIE,
      token,
      sessionCookieOptions(ADMIN_SESSION_MAX_AGE)
    );
    return response;
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { success: false, error: "Authentication failed" },
      { status: 500 }
    );
  }
}

/**
 * Clears the admin session cookie. Called by the admin layout on logout so the
 * server-side session ends with the client-side one.
 *
 * This ends the session on this device only. Session tokens are verified by
 * signature rather than looked up in a store (see lib/admin-auth.ts), so a
 * cookie copied elsewhere stays valid until it expires; rotating
 * ADMIN_SESSION_SECRET is what invalidates every session at once.
 */
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, "", sessionCookieOptions(0));
  return response;
}
