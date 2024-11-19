"use client";

import React, { useCallback, useEffect, useState, useRef } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import AutoHeight from 'embla-carousel-auto-height';
import { EventImage } from '@/utils/imageUtils';
import { EmblaCarouselType, EmblaEventType } from 'embla-carousel';

const TWEEN_FACTOR = 0.75; // Reduced for smoother transitions

type PropType = {
  slides: EventImage[];
  options?: any;
};

const EmblaCarouselNew: React.FC<PropType> = (props) => {
  const { slides } = props;
  const tweenFactor = useRef(0);
  
  // Main carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'center',
    containScroll: false,
    loop: true,
    skipSnaps: false,
    duration: 20, // Faster base transition
    dragFree: false
  }, [AutoHeight()]);
  
  // Thumbs carousel
  const [thumbsRef, thumbsApi] = useEmblaCarousel({
    containScroll: 'keepSnaps',
    dragFree: true,
    slidesToScroll: 1,
    align: 'start'
  });

  const [selectedIndex, setSelectedIndex] = useState(0);

  const tweenOpacity = useCallback(
    (emblaApi: EmblaCarouselType, eventName?: EmblaEventType) => {
      const engine = emblaApi.internalEngine();
      const scrollProgress = emblaApi.scrollProgress();
      const slidesInView = emblaApi.slidesInView();
      const isScrollEvent = eventName === 'scroll';

      requestAnimationFrame(() => {
        emblaApi.scrollSnapList().forEach((scrollSnap, snapIndex) => {
          let diffToTarget = scrollSnap - scrollProgress;
          const slidesInSnap = engine.slideRegistry[snapIndex];

          slidesInSnap.forEach((slideIndex) => {
            if (isScrollEvent && !slidesInView.includes(slideIndex)) return;

            if (engine.options.loop) {
              engine.slideLooper.loopPoints.forEach((loopItem) => {
                const target = loopItem.target();
                if (slideIndex === loopItem.index && target !== 0) {
                  diffToTarget = scrollSnap + (Math.sign(target) * (1 - scrollProgress));
                }
              });
            }

            const tweenValue = 1 - Math.abs(diffToTarget * TWEEN_FACTOR);
            const opacity = Math.max(0, Math.min(1, tweenValue));
            emblaApi.slideNodes()[slideIndex].style.opacity = opacity.toString();
          });
        });
      });
    },
    []
  );

  const onThumbClick = useCallback(
    (index: number) => {
      if (!emblaApi || !thumbsApi) return;
      emblaApi.scrollTo(index);
    },
    [emblaApi, thumbsApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi || !thumbsApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    thumbsApi.scrollTo(emblaApi.selectedScrollSnap());
  }, [emblaApi, thumbsApi]);

  useEffect(() => {
    if (!emblaApi) return;

    emblaApi.on('select', onSelect);
    emblaApi.on('scroll', tweenOpacity);

    // Initial setup
    onSelect();
    tweenOpacity(emblaApi);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('scroll', tweenOpacity);
    };
  }, [emblaApi, thumbsApi, onSelect, tweenOpacity]);

  return (
    <div className="relative max-w-[1000px] mx-auto">
      {/* Thumbnails */}
      <div className="overflow-hidden mb-4" ref={thumbsRef}>
        <div className="flex gap-2">
          {slides.map((slide, index) => (
            <button
              key={index}
              onClick={() => onThumbClick(index)}
              className={`relative flex-0 min-w-[100px] h-[60px] cursor-pointer overflow-hidden rounded-lg transition-opacity will-change-[opacity]
                ${index === selectedIndex ? 'opacity-100 ring-2 ring-blue-500' : 'opacity-50 hover:opacity-80'}`}
            >
              <img
                src={slide.src}
                alt={`Thumbnail ${index + 1}`}
                className="object-cover w-full h-full"
                loading="eager"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Main carousel */}
      <div className="relative overflow-visible" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {slides.map((slide, index) => (
            <div 
              key={index} 
              className="relative flex-[0_0_80%] mx-[10%] will-change-[opacity] cursor-pointer"
              onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                if (!emblaApi) return;
                
                const slideNodes = emblaApi.slideNodes();
                const clickedNode = e.currentTarget;
                const clickedIndex = Array.from(slideNodes).indexOf(clickedNode);
                const currentIndex = emblaApi.selectedScrollSnap();
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const centerThreshold = rect.width / 2;
                
                // If clicking the current slide, use left/right halves
                if (clickedIndex === currentIndex) {
                  if (clickX < centerThreshold) {
                    emblaApi.scrollPrev();
                  } else {
                    emblaApi.scrollNext();
                  }
                } else {
                  // For other slides, scroll towards the clicked slide
                  const indexDiff = clickedIndex - currentIndex;
                  if (indexDiff < 0) {
                    emblaApi.scrollPrev();
                  } else {
                    emblaApi.scrollNext();
                  }
                }
              }}
            >
              <img
                src={slide.src}
                alt={slide.alt}
                className="w-full h-auto object-contain rounded-lg"
                loading="eager"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Slide counter */}
      <div className="absolute top-[5.5rem] right-[12%] bg-black bg-opacity-75 text-white px-4 py-2 rounded-full text-base font-medium z-10">
        {selectedIndex + 1} / {slides.length}
      </div>
    </div>
  );
};

export default EmblaCarouselNew;