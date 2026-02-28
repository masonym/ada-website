// lib/eventRecap/metadataManager.ts
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { EventRecapMetadata, SectionMetadata, PhotoMetadata } from './types';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-west-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

/**
 * Loads metadata overrides for an event from S3
 * This allows manual specification of alt text, captions, etc.
 */
export async function loadEventMetadata(eventShorthand: string): Promise<EventRecapMetadata | null> {
  try {
    const bucketName = process.env.AWS_BUCKET_NAME || "americandefensealliance";
    const key = `events/${eventShorthand}/metadata.json`;
    
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const response = await s3Client.send(command);
    
    if (!response.Body) {
      return null;
    }

    // Convert the stream to string
    const bodyString = await response.Body.transformToString();
    const metadata: EventRecapMetadata = JSON.parse(bodyString);
    
    return metadata;
  } catch (error) {
    // If the file doesn't exist or there's an error, return null
    console.warn(`No metadata file found for event ${eventShorthand}:`, error);
    return null;
  }
}

/**
 * Merges default photo metadata with override metadata
 */
export function mergePhotoMetadata(
  defaultMetadata: PhotoMetadata,
  overrideMetadata?: PhotoMetadata
): PhotoMetadata {
  if (!overrideMetadata) {
    return defaultMetadata;
  }

  return {
    ...defaultMetadata,
    ...overrideMetadata,
    // Merge arrays instead of replacing them
    people: overrideMetadata.people || defaultMetadata.people,
    tags: overrideMetadata.tags || defaultMetadata.tags,
  };
}

/**
 * Creates default section metadata
 */
export function createDefaultSectionMetadata(
  sectionId: string,
  photoFilenames: string[]
): SectionMetadata {
  // Generate section title from ID
  const title = sectionId
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Determine default layout based on section type
  let layout: SectionMetadata['layout'] = 'masonry';
  if (sectionId.toLowerCase().includes('speaker')) {
    layout = 'carousel';
  } else if (sectionId.toLowerCase().includes('featured')) {
    layout = 'featured';
  }

  // Create default photo metadata for each file
  const photos: Record<string, PhotoMetadata> = {};
  photoFilenames.forEach(filename => {
    photos[filename] = {
      alt: `${title} - ${filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')}`,
    };
  });

  return {
    title,
    layout,
    photos,
  };
}

/**
 * Merges default section metadata with override metadata
 */
export function mergeSectionMetadata(
  defaultMetadata: SectionMetadata,
  overrideMetadata?: SectionMetadata
): SectionMetadata {
  if (!overrideMetadata) {
    return defaultMetadata;
  }

  // Merge photo metadata
  const mergedPhotos: Record<string, PhotoMetadata> = {};
  
  // Start with default photos
  Object.keys(defaultMetadata.photos).forEach(filename => {
    mergedPhotos[filename] = mergePhotoMetadata(
      defaultMetadata.photos[filename],
      overrideMetadata.photos[filename]
    );
  });

  // Add any additional photos from override that weren't in default
  Object.keys(overrideMetadata.photos).forEach(filename => {
    if (!mergedPhotos[filename]) {
      mergedPhotos[filename] = overrideMetadata.photos[filename];
    }
  });

  return {
    title: overrideMetadata.title || defaultMetadata.title,
    description: overrideMetadata.description || defaultMetadata.description,
    layout: overrideMetadata.layout || defaultMetadata.layout,
    photos: mergedPhotos,
  };
}
