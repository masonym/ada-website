// types/eventRecap.ts
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
