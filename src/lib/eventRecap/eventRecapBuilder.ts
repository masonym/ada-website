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
    baseUrl = 'https://cdn.americandefensealliance.org'
  } = options;

  try {
    // Load metadata overrides if they exist
    const metadataOverrides = await loadEventMetadata(eventShorthand);

    // Scan S3 for photos
    const scanResult = await scanS3ForPhotos({
      bucketName,
      prefix: `events/${eventShorthand}/photos/`,
    });
    
    const photoSections = scanResult.sections;

    if (Object.keys(photoSections).length === 0) {
      return null; // No photos found
    }

    // Build sections
    const sections: RecapSection[] = [];

    // Determine section order: use metadata order if available, otherwise alphabetical
    let sectionOrder: string[];
    if (metadataOverrides?.sections) {
      // Use the order from metadata file, but only include sections that have photos
      const metadataSectionIds = Object.keys(metadataOverrides.sections);
      const photoSectionIds = Object.keys(photoSections);
      
      // Start with sections from metadata (in order), then add any additional photo sections
      sectionOrder = [
        ...metadataSectionIds.filter(id => photoSectionIds.includes(id)),
        ...photoSectionIds.filter(id => !metadataSectionIds.includes(id))
      ];
    } else {
      // Fall back to alphabetical order
      sectionOrder = Object.keys(photoSections).sort();
    }

    for (const sectionId of sectionOrder) {
      const photos = photoSections[sectionId];
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
      metadata: metadataOverrides || undefined,
    };

  } catch (error) {
    console.error('Error building event recap:', error);
    return null;
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
