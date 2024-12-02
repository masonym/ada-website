// utils/imageUtils.ts
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { EventProps } from '@/app/components/Speakers';

export type EventImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  highlighted?: boolean;
};

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

export async function getEventImages(event: EventProps): Promise<EventImage[]> {
  try {
    // List all objects in the event's photos directory
    const command = new ListObjectsV2Command({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Prefix: `events/${event.eventShorthand}/photos/`,
    });

    const response = await s3Client.send(command);
    
    if (!response.Contents) {
      console.warn(`No images found for event ${event.eventShorthand}`);
      return [];
    }

    // Filter for WebP files and sort them
    const imageFiles = response.Contents
      .map(file => file.Key!)
      .filter(key => key.endsWith('.webp'))
      .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)?.[0] || '0');
        const numB = parseInt(b.match(/\d+/)?.[0] || '0');
        return numA - numB;
      });

    // Create image objects
    // Since we're using pre-processed WebP images, we know they're 1280px wide
    // and can calculate height based on original aspect ratio

    const images = imageFiles.map((key, index) => {
      const filename = key.split('/').pop()!;
      
      return {
        src: key, // Full S3 key path
        alt: `Image ${index + 1} from ${event.title.replace(/-/g, ' ')}`,
        width: 1280, // Our processed width
        height: 1280 * 0.75, // Approximate height, will be adjusted by Next.js
        highlighted: index < 18 // First 18 images are highlighted
      };
    });

    // If you need exact dimensions, you could fetch them like this:
    // (but it's probably unnecessary since we know our processing parameters)
    /*
    const images = await Promise.all(imageFiles.map(async (key, index) => {
      try {
        const headCommand = new HeadObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME!,
          Key: key
        });
        const headResponse = await s3Client.send(headCommand);
        
        // You could store dimensions in metadata during processing
        const width = parseInt(headResponse.Metadata?.width || '1280');
        const height = parseInt(headResponse.Metadata?.height || '960');

        return {
          src: key,
          alt: `Image ${index + 1} from ${event.title.replace(/-/g, ' ')}`,
          width,
          height,
          highlighted: index < 18
        };
      } catch (error) {
        console.error(`Error getting metadata for ${key}:`, error);
        return null;
      }
    })).then(results => results.filter((img): img is EventImage => img !== null));
    */

    return images;

  } catch (error) {
    console.error(`Error loading images for event ${event.eventShorthand}:`, error);
    return [];
  }
}


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