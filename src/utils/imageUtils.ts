// utils/imageUtils.ts

import { EventProps } from '@/app/components/Speakers';
import { promises as fs } from 'fs';
import path from 'path';
import sharp from 'sharp';

export type EventImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  highlighted?: boolean;
};

export async function getEventImages(event: EventProps): Promise<EventImage[]> {
  try {
    // Define the directory path where event images are stored
    const eventDir = path.join(process.cwd(), 'public', 'events', event.eventShorthand, 'photos');
    
    // Read all files in the directory
    const files = await fs.readdir(eventDir);
    
    // Filter for image files and sort them
    const imageFiles = files
      .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
      .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)?.[0] || '0');
        const numB = parseInt(b.match(/\d+/)?.[0] || '0');
        return numA - numB;
      });

    // Create image objects with dimensions
    const images = await Promise.all(imageFiles.map(async (file, index) => {
      const imagePath = path.join(eventDir, file);
      // Get image dimensions using sharp
      const metadata = await sharp(imagePath).metadata();
      return {
        src: `/events/${event.eventShorthand}/photos/${file}`,
        alt: `Image ${index + 1} from ${event.title.replace(/-/g, ' ')}`,
        width: metadata.width || 1920, // fallback dimension if metadata fails
        height: metadata.height || 1080,
        highlighted: index < 18 // First 15 images are highlighted
      };
    }));

    return images;

  } catch (error) {
    console.error(`Error loading images for event ${event.eventShorthand}:`, error);
    return [];
  }
}

import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

export async function validateImagePaths(eventSlug: string): Promise<boolean> {
  try {
    // Check if there are any objects in the events/[eventSlug]/photos directory
    const command = new ListObjectsV2Command({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Prefix: `events/${eventSlug}/photos/`,
      MaxKeys: 1 // We only need to know if at least one image exists
    });

    const response = await s3Client.send(command);
    
    // If we have any contents, the directory exists and has photos
    return (response.Contents?.length ?? 0) > 0;
  } catch (error) {
    console.error(`Failed to validate images for event: ${eventSlug}`, error);
    return false;
  }
}