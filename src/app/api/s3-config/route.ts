import { NextResponse } from "next/server";

export async function GET() {
  // Only check if the environment variables are set, don't expose the actual values
  const config = {
    AWS_ACCESS_KEY_ID: !!process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: !!process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION || "us-west-2",
    AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME || "americandefensealliance",
  };

  // Check if all required credentials are set
  const isConfigured = config.AWS_ACCESS_KEY_ID && config.AWS_SECRET_ACCESS_KEY;

  return NextResponse.json({ 
    status: isConfigured ? "ok" : "error",
    message: isConfigured 
      ? "S3 configuration is complete" 
      : "S3 credentials are missing. Please check your environment variables.",
    config,
    maxFileSize: 25 * 1024 * 1024, // 25MB in bytes
    uploadMethod: "presigned-url" // Indicate we're using pre-signed URLs
  });
}
