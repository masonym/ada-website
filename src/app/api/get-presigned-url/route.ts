import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { EVENTS } from "@/constants/events";

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-west-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

// Maximum file size (25MB)
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB in bytes

export async function POST(request: NextRequest) {
  try {
    // Check if AWS credentials are configured
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.error("AWS credentials not configured");
      return NextResponse.json(
        { error: "Server configuration error: AWS credentials not set" },
        { status: 500 }
      );
    }

    const { fileName, fileType, fileSize, eventShorthand } = await request.json();

    if (!fileName || !fileType || !fileSize || !eventShorthand) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Validate event exists
    const eventExists = EVENTS.some(event => event.eventShorthand === eventShorthand);
    if (!eventExists) {
      return NextResponse.json(
        { error: "Invalid event shorthand" },
        { status: 400 }
      );
    }

    // Validate file is PDF
    if (!fileType.includes("pdf")) {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    // Validate file size
    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds the maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
        { status: 400 }
      );
    }

    // Generate S3 key (path) with sanitized filename
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const s3Key = `events/${eventShorthand}/presentations/${sanitizedFileName}`;

    // Create the command for generating a presigned URL
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME || "americandefensealliance",
      Key: s3Key,
      ContentType: "application/pdf",
      ContentDisposition: `inline; filename="${sanitizedFileName}"`,
    });

    // Generate presigned URL (valid for 15 minutes)
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });

    // Generate the final S3 URL (for reference after upload)
    const bucketName = process.env.AWS_BUCKET_NAME || "americandefensealliance";
    const region = process.env.AWS_REGION || "us-west-2";
    const fileUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${s3Key}`;

    return NextResponse.json({
      success: true,
      presignedUrl,
      fileUrl,
      key: s3Key,
    });
  } catch (error: any) {
    console.error("Error generating presigned URL:", error);

    // Provide more detailed error messages based on the error type
    if (error.name === "CredentialsProviderError") {
      return NextResponse.json(
        { error: "AWS credentials error" },
        { status: 500 }
      );
    } else if (error.name === "AccessDenied") {
      return NextResponse.json(
        { error: "Access denied to S3 bucket" },
        { status: 403 }
      );
    } else if (error.name === "NoSuchBucket") {
      return NextResponse.json(
        { error: "S3 bucket does not exist" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate presigned URL", details: error.message },
      { status: 500 }
    );
  }
}
