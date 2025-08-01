// lib/eventRecap/s3Scanner.ts
import { S3Object } from './types';

// Since we're using CloudFront, we'll need to work with the S3 API
// This utility will help scan S3 directories for photos

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
    // For now, we'll create a mock implementation since we need AWS SDK setup
    // This will be replaced with actual S3 API calls
    const mockResult: S3ScanResult = {
      photos: [],
      sections: {}
    };

    // TODO: Implement actual S3 scanning
    // const s3 = new AWS.S3();
    // const params = {
    //   Bucket: bucketName,
    //   Prefix: prefix,
    //   Delimiter: '/'
    // };
    
    // const data = await s3.listObjectsV2(params).promise();
    // Process the results and group by subdirectory

    return mockResult;
  } catch (error) {
    console.error('Error scanning S3 for photos:', error);
    throw new Error('Failed to scan S3 for photos');
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
