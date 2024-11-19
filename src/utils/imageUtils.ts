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

export async function validateImagePaths(eventSlug: string): Promise<boolean> {
    try {
      const eventDir = path.join(process.cwd(), 'public', 'events', eventSlug, 'photos');
      await fs.access(eventDir);
      return true;
    } catch {
      console.error(`Directory not found: ${eventSlug}/photos`);
      return false;
    }
  }