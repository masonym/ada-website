import { NextResponse } from "next/server";
import { S3Client, GetBucketCorsCommand, PutBucketCorsCommand } from "@aws-sdk/client-s3";

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-west-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

// GET: Retrieve current CORS configuration
export async function GET() {
  try {
    // Check if AWS credentials are configured
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      return NextResponse.json(
        { error: "AWS credentials not configured" },
        { status: 500 }
      );
    }

    const bucketName = process.env.AWS_BUCKET_NAME || "americandefensealliance";
    
    const command = new GetBucketCorsCommand({
      Bucket: bucketName,
    });

    try {
      const response = await s3Client.send(command);
      return NextResponse.json({
        success: true,
        corsRules: response.CORSRules || [],
      });
    } catch (error: any) {
      // If no CORS configuration exists
      if (error.name === "NoSuchCORSConfiguration") {
        return NextResponse.json({
          success: true,
          corsRules: [],
          message: "No CORS configuration exists for this bucket",
        });
      }
      throw error;
    }
  } catch (error: any) {
    console.error("Error getting CORS configuration:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get CORS configuration" },
      { status: 500 }
    );
  }
}

// POST: Update CORS configuration
export async function POST() {
  try {
    // Check if AWS credentials are configured
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      return NextResponse.json(
        { error: "AWS credentials not configured" },
        { status: 500 }
      );
    }

    const bucketName = process.env.AWS_BUCKET_NAME || "americandefensealliance";
    
    // Create a CORS configuration that allows uploads from any origin
    const corsConfig = {
      CORSRules: [
        {
          AllowedHeaders: ["*"],
          AllowedMethods: ["PUT", "POST", "GET", "HEAD"],
          AllowedOrigins: ["*"],
          ExposeHeaders: ["ETag"],
          MaxAgeSeconds: 3000,
        },
      ],
    };

    const command = new PutBucketCorsCommand({
      Bucket: bucketName,
      CORSConfiguration: corsConfig,
    });

    await s3Client.send(command);

    return NextResponse.json({
      success: true,
      message: "CORS configuration updated successfully",
      corsRules: corsConfig.CORSRules,
    });
  } catch (error: any) {
    console.error("Error updating CORS configuration:", error);
    
    // Check for specific error types
    if (error.name === "AccessDenied") {
      return NextResponse.json(
        { 
          error: "Access denied. Your AWS credentials do not have permission to update CORS configuration.",
          details: error.message
        },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || "Failed to update CORS configuration" },
      { status: 500 }
    );
  }
}
