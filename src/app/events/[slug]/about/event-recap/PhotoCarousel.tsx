'use client';

import React, { useState } from 'react';
import { Slide } from 'react-slideshow-image';
import 'react-slideshow-image/dist/styles.css';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import type { EventImage } from '@/utils/imageUtils';
import Lightbox from "yet-another-react-lightbox";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import { getCdnPath } from '@/utils/image';

interface PhotoCarouselProps {
  images: EventImage[];
}

const PhotoCarousel: React.FC<PhotoCarouselProps> = ({ images }) => {
  const [autoplay, setAutoplay] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const properties = {
    prevArrow: (
      <button className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white transition-colors z-10">
        <ChevronLeft className="w-6 h-6 text-gray-800" />
      </button>
    ),
    nextArrow: (
      <button className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white transition-colors z-10">
        <ChevronRight className="w-6 h-6 text-gray-800" />
      </button>
    ),
    autoplay,
    duration: 3000,
    transitionDuration: 500,
    infinite: true,
    indicators: false,
    // scale: 1.2,
    onChange: (oldIndex: number, newIndex: number) => {
      setCurrentIndex(newIndex);
    },
  };

  // Handle thumbnail click
  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
  };

  // Handle main image click
  const handleImageClick = () => {
    setLightboxOpen(true);
  };

  return (
    <div className="relative">
      <div className="bg-gray-100 rounded-lg min-h-[320px]">
        <Slide {...properties}>
          {images.map((image, index) => (
            <div
              key={image.src}
              className="flex items-center justify-center h-full cursor-pointer"
              onClick={handleImageClick}
            >
              <div className="relative w-full h-full">
                <Image
                  src={getCdnPath(image.src)}
                  alt={image.alt}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                  priority={index === 0}
                />
              </div>
            </div>
          ))}
        </Slide>
      </div>

      {/* Thumbnails */}
      <div className="mt-4">
        <div className="flex space-x-2 overflow-x-auto pb-2 max-w-full scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
          {images.map((image, index) => (
            <button
              key={image.src}
              onClick={() => handleThumbnailClick(index)}
              className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden transition-all ${
                currentIndex === index ? 'ring-2 ring-blue-500' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Image
                src={getCdnPath(image.src)}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Autoplay control */}
      <button
        onClick={() => setAutoplay(!autoplay)}
        className="absolute bottom-4 right-4 bg-white/80 p-2 rounded-full hover:bg-white transition-colors z-10"
      >
        {autoplay ? (
          <Pause className="w-6 h-6 text-gray-800" />
        ) : (
          <Play className="w-6 h-6 text-gray-800" />
        )}
      </button>

      {/* Lightbox */}
      {lightboxOpen && (
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          index={currentIndex}
          slides={images.map(img => ({
            src: img.src,
            alt: img.alt,
            width: img.width,
            height: img.height,
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

export default PhotoCarousel;