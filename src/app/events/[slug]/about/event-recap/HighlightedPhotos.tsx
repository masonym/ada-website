'use client';

import React, { useState } from 'react';
import Gallery from 'react-photo-gallery';
import type { EventImage } from '@/utils/imageUtils';
import Lightbox from "yet-another-react-lightbox";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import Image from 'next/image';

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

  return (
    <div className="rounded-lg overflow-hidden">

      <div className="columns-1 sm:columns-2 lg:columns-3 py-2 md:py-4 gap-4 gap-y-5">
        {
          images.map((img, index) => (
            <div key={img.src} className="relative mb-4 break-inside-avoid">
              <Image
                src={img.src}
                alt={img.alt}
                width={img.width}
                height={img.height}
                placeholder='blur'
                blurDataURL="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
                className="rounded-lg cursor-pointer"
                onClick={(e) => handleClick(e, { index })}
              />
            </div>
          ))
        }
      </div>

      {currentImage !== null && (
        <Lightbox
          open={true}
          close={closeLightbox}
          index={currentImage}
          slides={images.map(img => ({
            src: img.src,
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