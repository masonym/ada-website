// sections/index.tsx
import { RecapSection } from '@/types/eventRecap';
import FeaturedSection from './FeaturedSection';
import GridSection from './GridSection';
import MasonrySection from './MasonrySection';
import CarouselSection from './CarouselSection';

interface SectionRendererProps {
  section: RecapSection;
}

export const SectionRenderer: React.FC<SectionRendererProps> = ({ section }) => {
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
};
