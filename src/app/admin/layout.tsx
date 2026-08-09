"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

/**
 * Chrome for the admin area.
 *
 * Access control lives in src/middleware.ts, which verifies the httpOnly session
 * cookie before any admin page or API route runs. This used to gate on a
 * `localStorage.admin_auth === "true"` flag instead - which any visitor could set
 * from the console, and which said nothing about the API routes underneath. The
 * flag is gone; if you are rendering this layout, the middleware already let you
 * through.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  const handleLogout = async () => {
    try {
      await fetch("/api/admin-auth", { method: "DELETE" });
    } catch (error) {
      console.error("Failed to clear admin session cookie:", error);
    }

    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen">
      {!isLoginPage && (
        <div className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">
            <Link href="/admin">Admin Dashboard</Link>
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      )}
      {children}
    </div>
  );
}
