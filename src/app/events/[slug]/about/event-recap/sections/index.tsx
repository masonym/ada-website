// sections/index.tsx
'use client';

import { RecapSection } from '@/types/eventRecap';
import FeaturedSection from './FeaturedSection';
import GridSection from './GridSection';
import MasonrySection from './MasonrySection';
import CarouselSection from './CarouselSection';
import { useEffect, useState } from 'react';

interface SectionRendererProps {
  section: RecapSection;
}

export const SectionRenderer: React.FC<SectionRendererProps> = ({ section }) => {
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    console.log(`Rendering section with layout: ${section.layout}`, section);
  }, [section]);

  try {
    switch (section.layout) {
      case 'featured':
        return <FeaturedSection section={section} />;
      case 'grid':
        return <GridSection section={section} />;
      case 'masonry':
        return <MasonrySection section={section} />;
      case 'carousel':
        return <CarouselSection section={section} />;
      default:
        return <GridSection section={section} />;
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Error rendering section with layout ${section.layout}:`, err);
    setError(errorMessage);
    
    return (
      <div className="p-4 mb-8 border border-red-500 rounded-lg bg-red-50">
        <h3 className="text-xl font-bold text-red-700 mb-2">Error Rendering Section: {section.title}</h3>
        <p className="text-red-600">There was an error rendering this section. Please check the console for more details.</p>
        <p className="mt-2 text-sm text-gray-700">Layout type: {section.layout}</p>
        <p className="mt-1 text-sm text-gray-700">Error: {errorMessage}</p>
      </div>
    );
  }
};
