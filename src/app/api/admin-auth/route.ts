import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  getAdminSessionToken,
} from "@/lib/admin-auth";

// The admin password is stored in .env as ADMIN_PASSWORD
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { success: false, error: "Password is required" },
        { status: 400 }
      );
    }

    // Simple password check
    if (password === ADMIN_PASSWORD) {
      const response = NextResponse.json({ success: true });

      // Alongside the localStorage flag the client sets, issue an httpOnly
      // session cookie so admin API routes can authenticate the caller
      // server-side without prompting for the password again.
      const token = await getAdminSessionToken();
      if (token) {
        response.cookies.set(ADMIN_SESSION_COOKIE, token, {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: ADMIN_SESSION_MAX_AGE,
        });
      }

      return response;
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid password" },
        { status: 401 }
      );
    }
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
 */
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
