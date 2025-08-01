// lib/eventRecap/s3Scanner.ts
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { S3Object } from './types';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-west-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export interface S3ScanOptions {
  bucketName: string;
  prefix: string; // e.g., "events/2025NMCPC/photos/"
  imageExtensions?: string[];
}

export interface S3ScanResult {
  photos: S3Object[];
  sections: Record<string, S3Object[]>; // section name -> photos
}

/**
 * Scans S3 bucket for photos in an event directory
 * Groups photos by subdirectory (section)
 */
export async function scanS3ForPhotos(options: S3ScanOptions): Promise<S3ScanResult> {
  const { bucketName, prefix, imageExtensions = ['.jpg', '.jpeg', '.png', '.webp'] } = options;

  try {
    const allPhotos: S3Object[] = [];
    let continuationToken: string | undefined;

    // Scan all objects in the prefix (may require multiple requests for large directories)
    do {
      const command = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix,
        ContinuationToken: continuationToken,
        MaxKeys: 1000, // Process in batches
      });

      const response = await s3Client.send(command);
      
      if (response.Contents) {
        // Filter for image files only
        const imageFiles = response.Contents.filter(obj => {
          if (!obj.Key) return false;
          const extension = obj.Key.toLowerCase().substring(obj.Key.lastIndexOf('.'));
          return imageExtensions.includes(extension);
        }).map(obj => ({
          Key: obj.Key!,
          LastModified: obj.LastModified || new Date(),
          Size: obj.Size || 0,
        }));

        allPhotos.push(...imageFiles);
      }

      continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    // Group photos by section (subdirectory)
    const sections = groupPhotosBySection(allPhotos, prefix);

    return {
      photos: allPhotos,
      sections,
    };
  } catch (error) {
    console.error('Error scanning S3 for photos:', error);
    // Return empty result instead of throwing to allow graceful degradation
    return {
      photos: [],
      sections: {},
    };
  }
}

/**
 * Generates default metadata for a photo based on filename and path
 */
export function generateDefaultMetadata(photoKey: string, sectionName: string): {
  alt: string;
  caption?: string;
  people?: string[];
} {
  const filename = photoKey.split('/').pop() || '';
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  
  // Try to extract meaningful info from filename
  const cleanName = nameWithoutExt
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());

  return {
    alt: `${cleanName} - ${sectionName}`,
    caption: undefined,
    people: undefined
  };
}

/**
 * Groups S3 objects by their subdirectory (section)
 */
export function groupPhotosBySection(photos: S3Object[], basePrefix: string): Record<string, S3Object[]> {
  const sections: Record<string, S3Object[]> = {};

  photos.forEach(photo => {
    // Extract section name from the path
    const relativePath = photo.Key.replace(basePrefix, '');
    const pathParts = relativePath.split('/');
    
    if (pathParts.length > 1) {
      const sectionName = pathParts[0];
      if (!sections[sectionName]) {
        sections[sectionName] = [];
      }
      sections[sectionName].push(photo);
    } else {
      // Photos in root directory go to 'general' section
      if (!sections['general']) {
        sections['general'] = [];
      }
      sections['general'].push(photo);
    }
  });

  return sections;
}
