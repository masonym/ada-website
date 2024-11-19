// utils/imageUtils.ts

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

export async function getEventImages(eventSlug: string): Promise<EventImage[]> {
  try {
    // Define the directory path where event images are stored
    const eventDir = path.join(process.cwd(), 'public', 'events', eventSlug, 'photos');
    
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
        src: `/events/${eventSlug}/photos/${file}`,
        alt: `Image ${index + 1} from ${eventSlug.replace(/-/g, ' ')}`,
        width: metadata.width || 1920, // fallback dimension if metadata fails
        height: metadata.height || 1080,
        highlighted: index < 15 // First 15 images are highlighted
      };
    }));

    return images;

  } catch (error) {
    console.error(`Error loading images for event ${eventSlug}:`, error);
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