// lib/eventRecap/types.ts
import { ReactNode } from 'react';

export interface RecapImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
  featured?: boolean;
  people?: string[]; // Names of people in the image
  tags?: string[]; // For filtering/categorizing
}

export interface RecapSection {
  id: string; // Unique identifier for the section
  title: string;
  description?: ReactNode;
  layout: 'grid' | 'masonry' | 'carousel' | 'featured';
  images: RecapImage[];
}

export interface EventRecap {
  eventShorthand: string; // Matches event.eventShorthand
  title?: string; // Optional custom title
  introduction?: ReactNode; // Optional introduction text
  sections: RecapSection[];
}

// New types for the hybrid system
export interface PhotoMetadata {
  alt?: string;
  caption?: string;
  people?: string[];
  tags?: string[];
  featured?: boolean;
  width?: number;
  height?: number;
}

export interface SectionMetadata {
  title: string;
  description?: string;
  layout: 'grid' | 'masonry' | 'carousel' | 'featured';
  photos: Record<string, PhotoMetadata>; // filename -> metadata
  pagination?: {
    enabled?: boolean;
    itemsPerPage?: number;
    threshold?: number; // minimum photos before pagination kicks in
  };
}

export interface EventRecapMetadata {
  eventShorthand: string;
  title?: string;
  introduction?: string;
  sections: Record<string, SectionMetadata>; // section id -> metadata
}

// S3 object structure
export interface S3Object {
  Key: string;
  LastModified: Date;
  Size: number;
}
