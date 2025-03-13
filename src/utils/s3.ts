import { S3Client } from "@aws-sdk/client-s3";

// Initialize S3 client with environment variables
export const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-west-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

// Helper function to get the S3 URL for a file
export const getS3Url = (key: string): string => {
  const bucketName = process.env.AWS_BUCKET_NAME || "americandefensealliance";
  const region = process.env.AWS_REGION || "us-west-2";
  return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
};
