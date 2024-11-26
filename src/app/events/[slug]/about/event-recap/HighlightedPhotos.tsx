'use client';

import React, { useState } from 'react';
import Masonry from 'react-masonry-css'; // Import Masonry
import type { EventImage } from '@/utils/imageUtils';
import Lightbox from "yet-another-react-lightbox";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import Image from 'next/image';
import { getCdnPath } from '@/utils/image';

interface HighlightedPhotosProps {
  images: EventImage[];
}

const HighlightedPhotos: React.FC<HighlightedPhotosProps> = ({ images }) => {
  const [currentImage, setCurrentImage] = useState<number | null>(null);

  const handleClick = (_: React.MouseEvent, { index }: { index: number }) => {
    setCurrentImage(index);
  };

  const closeLightbox = () => {
    setCurrentImage(null);
  };

  // Breakpoint columns for Masonry
  const breakpointColumnsObj = {
    default: 3, // 3 columns by default
    1100: 2,    // 2 columns for screen width 1100px and below
    700: 1      // 1 column for screen width 700px and below
  };

  return (
    <div className="rounded-lg overflow-hidden">

      {/* Masonry layout */}
      <Masonry
        breakpointCols={3}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >
        {
          images.map((img, index) => (
            <div key={img.src} className="relative mb-4">
              <Image
                src={getCdnPath(img.src)}
                alt={img.alt}
                width={img.width}
                height={img.height}
                loading={index < 6 ? "eager" : "lazy"} // Load first 6 images eagerly
                className="rounded-lg cursor-pointer"
                onClick={(e) => handleClick(e, { index })}
                quality={75}
              />
            </div>
          ))
        }
      </Masonry>

      {currentImage !== null && (
        <Lightbox
          open={true}
          close={closeLightbox}
          index={currentImage}
          slides={images.map(img => ({
            src: getCdnPath(img.src),
            alt: img.alt,
          }))}
          plugins={[Thumbnails, Zoom]}
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
          styles={{
            container: { backgroundColor: "rgba(0, 0, 0, .9)" },
          }}
        />
      )}
    </div>
  );
};

export default HighlightedPhotos;
