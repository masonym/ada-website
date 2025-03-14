"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function S3CorsPage() {
  const [corsRules, setCorsRules] = useState<any[]>([]);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch current CORS configuration on component mount
  useEffect(() => {
    fetchCorsConfig();
  }, []);

  const fetchCorsConfig = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/s3-cors");
      const data = await response.json();

      if (response.ok) {
        setCorsRules(data.corsRules);
        if (data.message) {
          setMessage({ text: data.message, type: "info" });
        } else {
          setMessage(null);
        }
      } else {
        setMessage({ text: data.error || "Failed to fetch CORS configuration", type: "error" });
      }
    } catch (error) {
      setMessage({ text: "An error occurred while fetching CORS configuration", type: "error" });
      console.error("Error fetching CORS:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateCorsConfig = async () => {
    setIsUpdating(true);
    setMessage({ text: "Updating CORS configuration...", type: "info" });

    try {
      const response = await fetch("/api/s3-cors", {
        method: "POST",
      });
      const data = await response.json();

      if (response.ok) {
        setCorsRules(data.corsRules);
        setMessage({ text: "CORS configuration updated successfully", type: "success" });
        // Refresh the CORS configuration
        await fetchCorsConfig();
      } else {
        setMessage({ text: data.error || "Failed to update CORS configuration", type: "error" });
      }
    } catch (error) {
      setMessage({ text: "An error occurred while updating CORS configuration", type: "error" });
      console.error("Error updating CORS:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">S3 CORS Configuration</h1>
        <Link href="/admin" className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">
          Back to Admin
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        {message && (
          <div
            className={`mb-6 p-4 rounded-md ${
              message.type === "success"
                ? "bg-green-50 text-green-700"
                : message.type === "error"
                ? "bg-red-50 text-red-700"
                : "bg-blue-50 text-blue-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Current CORS Configuration</h2>
          {isLoading ? (
            <p>Loading CORS configuration...</p>
          ) : corsRules.length === 0 ? (
            <p className="text-yellow-600">No CORS rules are configured for this bucket.</p>
          ) : (
            <div className="bg-gray-100 p-4 rounded-md overflow-auto">
              <pre className="text-sm">{JSON.stringify(corsRules, null, 2)}</pre>
            </div>
          )}
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Update CORS Configuration</h2>
          <p className="mb-4">
            Click the button below to update the S3 bucket CORS configuration to allow uploads from any origin.
            This is required for direct browser uploads to S3.
          </p>
          <button
            onClick={updateCorsConfig}
            disabled={isUpdating}
            className={`px-4 py-2 rounded-md text-white font-medium ${
              isUpdating ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isUpdating ? "Updating..." : "Update CORS Configuration"}
          </button>
        </div>

        <div className="mt-6 text-sm text-gray-600">
          <h3 className="font-medium mb-2">About CORS Configuration</h3>
          <p>
            Cross-Origin Resource Sharing (CORS) is a security feature that restricts web pages from making requests to a
            different domain than the one that served the original page. For direct browser uploads to S3, the bucket
            must have a CORS configuration that allows PUT requests from your website&apos;s domain.
          </p>
        </div>
      </div>
    </div>
  );
}
