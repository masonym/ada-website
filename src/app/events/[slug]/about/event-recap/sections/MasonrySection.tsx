'use client';

import React, { useState } from 'react';
import Masonry from 'react-masonry-css';
import Image from 'next/image';
import { RecapSection } from '@/types/eventRecap';
import { getCdnPath } from '@/utils/image';
import Lightbox from "yet-another-react-lightbox";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Captions from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import "yet-another-react-lightbox/plugins/captions.css";

interface MasonrySectionProps {
  section: RecapSection;
}

const MasonrySection: React.FC<MasonrySectionProps> = ({ section }) => {
  const [currentImage, setCurrentImage] = useState<number | null>(null);

  const handleClick = (index: number) => {
    setCurrentImage(index);
  };

  const closeLightbox = () => {
    setCurrentImage(null);
  };

  // Breakpoint columns for Masonry
  const breakpointColumnsObj = {
    default: 4, // 4 columns by default
    1280: 3,    // 3 columns for screen width 1280px and below
    1024: 2,    // 2 columns for screen width 1024px and below
    640: 1      // 1 column for screen width 640px and below
  };

  // Create slides for lightbox with captions
  const slides = section.images.map(img => ({
    src: getCdnPath(img.src),
    alt: img.alt,
    title: img.caption,
    description: img.people?.length
      ? `Featuring: ${img.people.join(', ')}`
      : undefined
  }));

  return (
    <div className="mb-16">
      <h2 className="text-3xl font-bold text-slate-700 mb-4">{section.title}</h2>
      {section.description && <div className="mb-6">{section.description}</div>}

      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >
        {section.images.map((image, index) => {
          const minSize = 500; // minimum width/height
          const scaleFactor = Math.max(1 / 10, minSize / image.width, minSize / image.height);

          const scaledWidth = Math.round(image.width * scaleFactor);
          const scaledHeight = Math.round(image.height * scaleFactor);

          return (
            <div
              key={image.src}
              className="mb-4 relative overflow-hidden rounded-lg group cursor-pointer"
              onClick={() => handleClick(index)}
            >
              <Image
                src={getCdnPath(image.src)}
                alt={image.alt}
                width={scaledWidth}
                height={scaledHeight}
                className="rounded-lg transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                loading={index < 8 ? "eager" : "lazy"}
              />

              {image.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-sm">{image.caption}</p>
                  {image.people && image.people.length > 0 && (
                    <p className="text-xs mt-1 text-gray-300">
                      Featuring: {image.people.join(', ')}
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </Masonry>

      {currentImage !== null && (
        <Lightbox
          open={true}
          close={closeLightbox}
          index={currentImage}
          slides={slides}
          plugins={[Thumbnails, Zoom, Captions]}
          carousel={{
            finite: false,
          }}
          zoom={{
            maxZoomPixelRatio: 3,
            zoomInMultiplier: 2,
          }}
          thumbnails={{
            position: "bottom",
            width: 120,
            height: 80,
          }}
          captions={{
            showToggle: true,
            descriptionTextAlign: "center",
          }}
          styles={{
            container: { backgroundColor: "rgba(0, 0, 0, .9)" },
          }}
        />
      )}
    </div>
  );
};

export default MasonrySection;
