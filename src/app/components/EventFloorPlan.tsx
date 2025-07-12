'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { getCdnPath } from '@/utils/image';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';

interface EventFloorPlanProps {
  eventId: number;
  floorPlanImage: string;
}

const EventFloorPlan: React.FC<EventFloorPlanProps> = ({
  eventId,
  floorPlanImage
}) => {
  const [isFloorplanOpen, setIsFloorplanOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const handleOpenLightbox = () => {
    setIsLightboxOpen(true);
  };

  return (
    <section className="max-w-[86rem] mx-auto my-12">
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-lg hover:border-blue-300 max-w-[90%] md:max-w-[60%] mx-auto">
        <div 
          className="bg-navy-300 p-4 cursor-pointer flex justify-between items-center" 
          onClick={() => setIsFloorplanOpen(!isFloorplanOpen)}
        >
          <h4 className="text-xl font-semibold text-white flex items-center">
            {isFloorplanOpen ? <ChevronDown className="mr-2" /> : <ChevronRight className="mr-2" />}
            Event Floorplan
          </h4>
        </div>
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isFloorplanOpen ? 'max-h-[2500px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="p-4 sm:p-6">
            <p className="text-gray-600 mb-4 text-center">
              View the event floorplan below. Click on the image to view in high resolution.
            </p>
            <div className="grid grid-cols-1 gap-4">
              <div 
                onClick={handleOpenLightbox} 
                className="cursor-pointer transition-transform hover:scale-[1.01]"
              >
                <Image
                  src={getCdnPath(floorPlanImage)}
                  alt="Event Floorplan"
                  width={790}
                  height={1024}
                  className="w-full h-auto rounded-md shadow-sm border"
                />
                <div className="text-center mt-2 text-sm text-navy-500">
                  Click to view in full size
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox for high-resolution view */}
      <Lightbox
        open={isLightboxOpen}
        close={() => setIsLightboxOpen(false)}
        slides={[
          {
            src: getCdnPath(floorPlanImage),
            alt: "Event Floorplan"
          }
        ]}
        plugins={[Zoom]}
        animation={{ zoom: 500 }}
        zoom={{
          maxZoomPixelRatio: 3,
          zoomInMultiplier: 2,
          doubleTapDelay: 300,
        }}
      />
    </section>
  );
};

export default EventFloorPlan;
