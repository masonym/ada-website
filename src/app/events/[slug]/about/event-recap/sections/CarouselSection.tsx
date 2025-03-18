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

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  const handleClick = (index: number) => {
    setCurrentImage(index);
  };

  const closeLightbox = () => {
    setCurrentImage(null);
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

      <div className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {section.images.map((image, index) => {
              // Calculate aspect ratio for consistent heights
              const aspectRatio = image.width / image.height;
              const imageHeight = 300; // Base height for all images
              const imageWidth = imageHeight * aspectRatio;

              const minSize = 500; // minimum width/height
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
                    className="relative overflow-hidden rounded-lg group cursor-pointer h-full"
                    onClick={() => handleClick(index)}
                  >
                    <div className="relative" style={{ height: `${imageHeight}px` }}>

                      <Image
                        src={getCdnPath(image.src)}
                        alt={image.alt}
                        width={scaledWidth}
                        height={scaledHeight}
                        className="object-contain"
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        loading={index < 4 ? "eager" : "lazy"}
                      />;
                    </div>

                    {image.caption || image.people && (
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
