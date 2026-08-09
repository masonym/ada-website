import { s3Client, S3_BUCKET } from "@/lib/s3/client";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import { EVENTS } from "@/constants/events";


export async function GET(request: NextRequest) {
  try {
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      return NextResponse.json(
        { error: "Server configuration error: AWS credentials not set" },
        { status: 500 }
      );
    }

    const eventId = parseInt(request.nextUrl.searchParams.get("eventId") || "", 10);
    const event = EVENTS.find((candidate) => candidate.id === eventId);

    if (!event) {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
    }

    const prefix = `events/${event.eventShorthand}/presentations/`;
    const command = new ListObjectsV2Command({
      Bucket: S3_BUCKET,
      Prefix: prefix,
    });

    const data = await s3Client.send(command);
    const presentations = (data.Contents || [])
      .filter((item) => (item.Key || "").toLowerCase().endsWith(".pdf"))
      .map((item) => ({
        key: item.Key || "",
        fileName: (item.Key || "").replace(prefix, ""),
        lastModified: item.LastModified?.toISOString() || null,
        size: item.Size || 0,
      }))
      .sort((a, b) => a.fileName.localeCompare(b.fileName));

    return NextResponse.json({ presentations });
  } catch (error: any) {
    console.error("Error fetching presentations:", error);
    return NextResponse.json(
      { error: "Failed to fetch presentations", details: error.message },
      { status: 500 }
    );
  }
}
