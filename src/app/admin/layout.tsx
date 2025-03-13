"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = () => {
      const auth = localStorage.getItem("admin_auth");
      setIsAuthenticated(auth === "true");
      setIsLoading(false);

      // If not authenticated and not on login page, redirect to login
      if (auth !== "true" && pathname !== "/admin/login") {
        router.push("/admin/login");
      }
    };

    checkAuth();
  }, [router, pathname]);

  const handleLogout = () => {
    // Clear authentication from localStorage
    localStorage.removeItem("admin_auth");
    setIsAuthenticated(false);
    router.push("/admin/login");
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If on login page or authenticated, show content
  if (pathname === "/admin/login" || isAuthenticated) {
    return (
      <div className="min-h-screen">
        {isAuthenticated && pathname !== "/admin/login" && (
          <div className="bg-white shadow-sm p-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold">Admin Dashboard</h1>
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

  // This should never be reached due to the redirect in useEffect
  return null;
}
