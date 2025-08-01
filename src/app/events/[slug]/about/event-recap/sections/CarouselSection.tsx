'use client';

import React, { useState } from 'react';
import { RecapSection } from '@/types/eventRecap';
import { getCdnPath } from '@/utils/image';
import Image from 'next/image';
import Lightbox from "yet-another-react-lightbox";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Captions from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import "yet-another-react-lightbox/plugins/captions.css";
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselSectionProps {
  section: RecapSection;
}

const CarouselSection: React.FC<CarouselSectionProps> = ({ section }) => {
  const [currentImage, setCurrentImage] = useState<number | null>(null);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    dragFree: true
  });

  // Natural sort function to handle filenames with numbers
  const naturalSort = (a: string, b: string): number => {
    // Extract numbers from parentheses in filenames like "Name (123).ext"
    const getNumber = (filename: string): number => {
      const match = filename.match(/\((\d+)\)/);
      return match ? parseInt(match[1], 10) : 0;
    };

    const numA = getNumber(a);
    const numB = getNumber(b);

    // If both have numbers, sort by number
    if (numA !== 0 && numB !== 0) {
      return numA - numB;
    }

    // If only one has a number, prioritize the one with number
    if (numA !== 0) return -1;
    if (numB !== 0) return 1;

    // If neither has numbers, fall back to string comparison
    return a.localeCompare(b);
  };

  // Sort images naturally by filename
  const sortedImages = [...section.images].sort((a, b) => naturalSort(a.src, b.src));

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  const handleClick = (index: number) => {
    setCurrentImage(index);
  };

  const closeLightbox = () => {
    setCurrentImage(null);
  };

  // Create slides for lightbox with captions
  const slides = sortedImages.map(img => ({
    src: getCdnPath(img.src),
    alt: img.alt,
    title: img.caption,
    description: img.people?.length
      ? `Featuring: ${img.people.join(', ')}`
      : undefined
  }));

  return (
    <div className="mb-16">
      {section.description && <div className="mb-6">{section.description}</div>}

      <div className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {sortedImages.map((image, index) => {
              // Calculate aspect ratio for consistent heights
              const aspectRatio = image.width / image.height;
              const imageHeight = 300; // Base height for all images
              const imageWidth = imageHeight * aspectRatio;

              const minSize = 100; // minimum width/height
              const scaleFactor = Math.max(1 / 10, minSize / image.width, minSize / image.height);

              const scaledWidth = Math.round(image.width * scaleFactor);
              const scaledHeight = Math.round(image.height * scaleFactor);

              return (
                <div
                  key={image.src}
                  className="flex-none mx-2"
                  style={{ width: `${imageWidth}px` }}
                >
                  <div
                    className="relative overflow-hidden rounded-lg group cursor-pointer"
                    onClick={() => handleClick(index)}
                  >
                    <div className="relative">

                      <img
                        src={getCdnPath(image.src)}
                        alt={image.alt}
                        className="object-contain"
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        loading={index < 4 ? "eager" : "lazy"}
                      />
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      {image.caption && (
                        <p className="text-sm mt-1">{image.caption}</p>
                      )}
                      {image.people && image.people.length > 0 && (
                        <p className="text-xs mt-1 text-gray-300">
                          Featuring: {image.people.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation buttons */}
        <button
          className="absolute top-1/2 left-2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-md z-10"
          onClick={scrollPrev}
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          className="absolute top-1/2 right-2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-md z-10"
          onClick={scrollNext}
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

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

export default CarouselSection;
