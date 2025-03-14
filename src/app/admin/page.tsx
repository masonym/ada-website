"use client";

import { useState, useRef, FormEvent, ChangeEvent, useEffect } from "react";
import { EVENTS } from "@/constants/events";
import { Event } from "@/types/events";
import Link from 'next/link';

// Maximum file size (10MB)
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB in bytes
const WEBHOOK_URL = "https://canary.discord.com/api/webhooks/1349875967115395095/uuWqdigZbAv1hgBxDaWFybi9y00QD2rcozudzl_U-4JA-nwVmTIK-9zr09ogXUPpbmC7"
export default function AdminPage() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
  const [s3ConfigStatus, setS3ConfigStatus] = useState<"loading" | "configured" | "error">("loading");
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if S3 is configured on component mount
  useEffect(() => {
    const checkS3Config = async () => {
      try {
        const response = await fetch("/api/s3-config");
        const data = await response.json();

        if (response.ok && data.config.AWS_ACCESS_KEY_ID && data.config.AWS_SECRET_ACCESS_KEY) {
          setS3ConfigStatus("configured");
        } else {
          setS3ConfigStatus("error");
          setMessage({
            text: "S3 configuration error: AWS credentials not set.",
            type: "error"
          });
        }
      } catch (error) {
        setS3ConfigStatus("error");
        setMessage({
          text: "Failed to check S3 configuration.",
          type: "error"
        });
      }
    };

    checkS3Config();
  }, []);

  const handleEventChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const eventId = parseInt(e.target.value);
    const event = EVENTS.find((event) => event.id === eventId) || null;
    setSelectedEvent(event);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;

    if (selectedFile) {
      // Validate file is PDF
      if (!selectedFile.type.includes("pdf")) {
        setMessage({ text: "Only PDF files are allowed", type: "error" });
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      // Validate file size
      if (selectedFile.size > MAX_FILE_SIZE) {
        setMessage({
          text: `File size (${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB) exceeds the maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
          type: "error"
        });
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      setFile(selectedFile);
      setMessage(null);
    } else {
      setFile(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!selectedEvent || !file) {
      setMessage({ text: "Please select an event and upload a PDF file", type: "error" });
      return;
    }

    setIsUploading(true);
    setMessage({ text: "Preparing upload...", type: "info" });
    setUploadProgress(5); // Start progress

    try {
      // Step 1: Get a pre-signed URL
      const presignedUrlResponse = await fetch("/api/get-presigned-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          eventShorthand: selectedEvent.eventShorthand,
        }),
      });

      const presignedUrlData = await presignedUrlResponse.json();

      if (!presignedUrlResponse.ok) {
        throw new Error(presignedUrlData.error || "Failed to get pre-signed URL");
      }

      setMessage({ text: "Uploading file directly to S3...", type: "info" });
      setUploadProgress(20); // Update progress after getting URL

      // Step 2: Upload directly to S3 using the pre-signed URL
      try {
        // Create a blob with the file data
        const fileBlob = new Blob([file], { type: 'application/pdf' });
        
        // Upload to S3 using fetch
        const uploadResponse = await fetch(presignedUrlData.presignedUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/pdf',
          },
          body: fileBlob,
        });
        
        if (!uploadResponse.ok) {
          throw new Error(`Upload failed with status: ${uploadResponse.status}`);
        }
        
        setUploadProgress(100); // Complete progress
        setMessage({
          text: `File uploaded successfully! Path: ${presignedUrlData.key}`,
          type: "success"
        });
        
        // Send webhook notification
        fetch(WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: `File uploaded successfully! Path: ${presignedUrlData.key}`,
          })
        });
        
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch (uploadError: any) {
        throw new Error(uploadError.message || "Error uploading to S3");
      } finally {
        setIsUploading(false);
      }

    } catch (error: any) {
      setMessage({
        text: error.message || "An error occurred while uploading the file",
        type: "error"
      });
      console.error("Upload error:", error);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Upload Presentations</h1>

      <div className="bg-white shadow-md rounded-lg p-6">
        {s3ConfigStatus === "error" && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">
            <h3 className="font-bold mb-2">S3 Configuration Error</h3>
            <p>AWS credentials are not properly configured. Please check the README-S3-UPLOAD.md file for setup instructions.</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="event" className="block text-gray-700 font-medium mb-2">
              Select Event
            </label>
            <select
              id="event"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleEventChange}
              value={selectedEvent?.id || ""}
              required
              disabled={s3ConfigStatus === "error"}
            >
              <option value="" disabled>
                Select an event
              </option>
              {EVENTS.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label htmlFor="file" className="block text-gray-700 font-medium mb-2">
              Upload PDF File
            </label>
            <input
              id="file"
              type="file"
              ref={fileInputRef}
              accept=".pdf"
              onChange={handleFileChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={s3ConfigStatus === "error"}
            />
            <p className="mt-2 text-sm text-gray-500">
              Only PDF files are accepted. Maximum file size: {MAX_FILE_SIZE / (1024 * 1024)}MB
            </p>
          </div>

          {file && (
            <div className="mb-6 p-3 bg-gray-200 rounded-md">
              <p className="text-sm">
                <span className="font-medium">Selected file:</span> {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            </div>
          )}

          {message && (
            <div
              className={`mb-6 p-4 rounded-md ${message.type === "success" ? "bg-green-50 text-green-700" :
                message.type === "error" ? "bg-red-50 text-red-700" :
                  "bg-blue-50 text-blue-700"
                }`}
            >
              {message.text}
            </div>
          )}

          {uploadProgress > 0 && (
            <div className="mb-6">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 mt-1 text-right">{Math.round(uploadProgress)}%</p>
            </div>
          )}

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isUploading || !selectedEvent || !file || s3ConfigStatus === "error"}
              className={`px-6 py-3 rounded-md text-white font-medium ${isUploading || !selectedEvent || !file || s3ConfigStatus === "error"
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
                }`}
            >
              {isUploading ? "Uploading..." : "Upload File"}
            </button>
          </div>

          {selectedEvent && (
            <div className="mt-6 text-sm text-gray-600">
              <p>File will be uploaded to: <code>/events/{selectedEvent.eventShorthand}/presentations/</code></p>
            </div>
          )}
        </form>
      </div>
      
      <div className="mt-8 bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Admin Tools</h2>
        <div className="space-y-4">
          <div>
            <Link href="/admin/s3-cors" className="text-blue-600 hover:underline flex items-center">
              <span className="mr-2">📊</span> S3 CORS Configuration
            </Link>
            <p className="text-sm text-gray-600 ml-6 mt-1">
              View and update the S3 bucket CORS configuration for direct uploads
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
