import { NextResponse } from "next/server";

export async function GET() {
  // Only check if the environment variables are set, don't expose the actual values
  const config = {
    AWS_ACCESS_KEY_ID: !!process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: !!process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION || "us-west-2",
    AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME || "americandefensealliance",
  };

  return NextResponse.json({ 
    status: "ok",
    config 
  });
}
