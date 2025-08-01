// lib/eventRecap/eventRecapBuilder.ts
import { EventRecap, RecapSection, RecapImage } from './types';
import { scanS3ForPhotos, generateDefaultMetadata, groupPhotosBySection } from './s3Scanner';
import { 
  loadEventMetadata, 
  createDefaultSectionMetadata, 
  mergeSectionMetadata 
} from './metadataManager';

export interface EventRecapBuilderOptions {
  eventShorthand: string;
  bucketName?: string;
  baseUrl?: string; // CloudFront URL base
}

/**
 * Builds an EventRecap by combining S3 photo scanning with metadata overrides
 */
export async function buildEventRecap(options: EventRecapBuilderOptions): Promise<EventRecap | null> {
  const { 
    eventShorthand, 
    bucketName = 'americandefensealliance',
    baseUrl = 'https://d3gvnlbntpm4ho.cloudfront.net'
  } = options;

  try {
    // Load metadata overrides if they exist
    const metadataOverrides = await loadEventMetadata(eventShorthand);

    // For now, we'll use a fallback approach since S3 scanning needs AWS SDK setup
    // In production, this would scan S3 for actual photos
    const photoSections = await getPhotoSectionsFromS3OrFallback(eventShorthand, bucketName);

    if (Object.keys(photoSections).length === 0) {
      return null; // No photos found
    }

    // Build sections
    const sections: RecapSection[] = [];

    for (const [sectionId, photos] of Object.entries(photoSections)) {
      // Create default metadata for this section
      const photoFilenames = photos.map(photo => photo.Key.split('/').pop() || '');
      const defaultSectionMetadata = createDefaultSectionMetadata(sectionId, photoFilenames);

      // Merge with overrides if they exist
      const sectionMetadata = mergeSectionMetadata(
        defaultSectionMetadata,
        metadataOverrides?.sections[sectionId]
      );

      // Build images array
      const images: RecapImage[] = photos.map(photo => {
        const filename = photo.Key.split('/').pop() || '';
        const photoMetadata = sectionMetadata.photos[filename];
        
        // Generate default metadata if not provided
        const defaultMeta = generateDefaultMetadata(photo.Key, sectionId);

        return {
          src: `${baseUrl}/${photo.Key}`,
          alt: photoMetadata?.alt || defaultMeta.alt,
          width: photoMetadata?.width || 1200, // Default width
          height: photoMetadata?.height || 800, // Default height
          caption: photoMetadata?.caption,
          featured: photoMetadata?.featured,
          people: photoMetadata?.people || defaultMeta.people,
          tags: photoMetadata?.tags,
        };
      });

      sections.push({
        id: sectionId,
        title: sectionMetadata.title,
        description: sectionMetadata.description,
        layout: sectionMetadata.layout,
        images,
      });
    }

    return {
      eventShorthand,
      title: metadataOverrides?.title,
      introduction: metadataOverrides?.introduction,
      sections,
    };

  } catch (error) {
    console.error('Error building event recap:', error);
    return null;
  }
}

/**
 * Temporary fallback function until S3 scanning is fully implemented
 * This will try to fetch from S3, but fall back to known structure
 */
async function getPhotoSectionsFromS3OrFallback(
  eventShorthand: string, 
  bucketName: string
): Promise<Record<string, Array<{ Key: string; LastModified: Date; Size: number }>>> {
  
  // TODO: Replace this with actual S3 scanning once AWS SDK is set up
  // For now, return empty object - this will be replaced with real S3 data
  
  try {
    // Attempt to use the S3 scanner (will be mock for now)
    const scanResult = await scanS3ForPhotos({
      bucketName,
      prefix: `events/${eventShorthand}/photos/`,
    });

    return scanResult.sections;
  } catch (error) {
    console.warn('S3 scanning not available, using fallback');
    return {};
  }
}

/**
 * Gets image dimensions from CloudFront URL
 * This is a helper function that could be used to auto-detect image dimensions
 */
export async function getImageDimensions(imageUrl: string): Promise<{ width: number; height: number } | null> {
  try {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = () => {
        resolve(null);
      };
      img.src = imageUrl;
    });
  } catch (error) {
    return null;
  }
}
