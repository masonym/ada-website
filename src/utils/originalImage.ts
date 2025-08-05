import { getCdnPath } from './image';

/**
 * Converts a WebP image path to the corresponding original image path
 * @param webpPath - The path to the WebP image (e.g., "events/2025nmcpc/photos/section1/image1.webp")
 * @param originalExtension - The original file extension (jpg, png, etc.). Defaults to 'jpg'
 * @returns The CDN path to the original image
 */
export const getOriginalImagePath = (webpPath: string, originalExtension: string = 'jpg'): string => {
  if (!webpPath) return '';
  
  // Remove any existing CDN domain from the path to get the relative path
  let cleanPath = webpPath;
  const cdnDomain = process.env.NEXT_PUBLIC_CDN_DOMAIN || '';
  if (cdnDomain && webpPath.includes(cdnDomain)) {
    cleanPath = webpPath.split(cdnDomain)[1];
    if (cleanPath.startsWith('/')) {
      cleanPath = cleanPath.slice(1);
    }
  }
  
  // Remove leading slash if present
  cleanPath = cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath;
  
  // Replace .webp extension with the original extension
  const pathWithoutExtension = cleanPath.replace(/\.(webp|jpg|jpeg|png)$/i, '');
  
  // Insert 'originals' into the path structure
  // Convert: events/2025nmcpc/photos/section1/image1
  // To: events/2025nmcpc/photos/originals/section1/image1.jpg
  const pathParts = pathWithoutExtension.split('/');
  const eventIndex = pathParts.findIndex(part => part === 'photos');
  
  if (eventIndex !== -1 && eventIndex < pathParts.length - 1) {
    // Insert 'originals' after 'photos'
    pathParts.splice(eventIndex + 1, 0, 'originals');
  }
  
  const originalPath = `${pathParts.join('/')}.${originalExtension}`;
  
  return getCdnPath(originalPath);
};

/**
 * Attempts to determine the original file extension from metadata or filename
 * Falls back to 'jpg' if unable to determine
 */
export const getOriginalExtension = (imageSrc: string, metadata?: any): string => {
  // Check if metadata contains original extension info
  if (metadata?.originalExtension) {
    return metadata.originalExtension;
  }
  
  // Try to extract from filename patterns (if original filename is preserved somewhere)
  if (imageSrc.includes('_orig_')) {
    const match = imageSrc.match(/_orig_\w+\.(\w+)/);
    if (match) {
      return match[1];
    }
  }
  
  // Default to jpg
  return 'jpg';
};
