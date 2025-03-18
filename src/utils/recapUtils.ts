// utils/recapUtils.ts
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { Event } from "@/types/events";
import { EventRecap, RecapImage, RecapSection } from "@/types/eventRecap";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

/**
 * Generate a basic event recap structure from S3 images
 * This is useful for migrating from the old system or generating a template
 * @param event The event to generate a recap for
 * @returns A structured EventRecap object
 */
export async function generateBasicRecap(event: Event): Promise<EventRecap | null> {
  try {
    // List all objects in the event's photos directory
    const command = new ListObjectsV2Command({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Prefix: `events/${event.eventShorthand}/photos/`,
    });

    const response = await s3Client.send(command);
    
    if (!response.Contents || response.Contents.length === 0) {
      console.warn(`No images found for event ${event.eventShorthand}`);
      return null;
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
    const images: RecapImage[] = imageFiles.map((key, index) => {
      return {
        src: key,
        alt: `Image ${index + 1} from ${event.title.replace(/-/g, ' ')}`,
        width: 1280,
        height: 1280 * 0.75,
        featured: index < 6 // First 6 images are featured
      };
    });

    // Split images into sections
    const featuredImages = images.filter(img => img.featured);
    const remainingImages = images.filter(img => !img.featured);

    // Create sections
    const sections: RecapSection[] = [];

    // Featured section
    if (featuredImages.length > 0) {
      sections.push({
        id: 'featured',
        title: 'Event Highlights',
        layout: 'featured',
        images: featuredImages
      });
    }

    // Main gallery section
    if (remainingImages.length > 0) {
      sections.push({
        id: 'gallery',
        title: 'Photo Gallery',
        layout: 'masonry',
        images: remainingImages
      });
    }

    // Create the recap object
    return {
      eventShorthand: event.eventShorthand,
      sections
    };

  } catch (error) {
    console.error(`Error generating recap for event ${event.eventShorthand}:`, error);
    return null;
  }
}

/**
 * Helper function to convert from the old image format to the new RecapImage format
 * @param oldImages Array of old format images
 * @returns Array of RecapImage objects
 */
export function convertOldImagesToNewFormat(
  oldImages: Array<{ src: string; alt: string; width: number; height: number; highlighted?: boolean }>
): RecapImage[] {
  return oldImages.map(img => ({
    src: img.src,
    alt: img.alt,
    width: img.width,
    height: img.height,
    featured: img.highlighted,
    caption: undefined, // No captions in old format
    people: undefined, // No people data in old format
    tags: undefined // No tags in old format
  }));
}
