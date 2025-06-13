"use client";

import React from 'react';
import DirectionsMap from './DirectionsMap';
import { getCdnPath } from '@/utils/image';
import { MapPin, Clock, CalendarDays } from 'lucide-react';

interface VIPReceptionProps {
  vipReception: {
    title: string;
    date: string;
    time: string;
    description: string;
    locationName: string;
    locationAddress: string;
    placeId: string;
    eventPlaceId: string;
    eventLocationName?: string;
    locationPhoto?: string;
  };
}

const VIPReceptionSection: React.FC<VIPReceptionProps> = ({ vipReception }) => {
  return (
    <div className="my-12 py-8 px-4 sm:px-6 bg-slate-50 rounded-xl">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center font-gotham text-slate-700 mb-6">
          {vipReception.title}
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="mb-6">
              <div dangerouslySetInnerHTML={{ __html: vipReception.description }}
                className="prose max-w-none text-md text-slate-600" />
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-start">
                <CalendarDays className="w-6 h-6 mr-3 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-lg">Date</h4>
                  <p>{vipReception.date}</p>
                </div>
              </div>

              <div className="flex items-start">
                <Clock className="w-6 h-6 mr-3 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-lg">Time</h4>
                  <p>{vipReception.time}</p>
                </div>
              </div>

              <div className="flex items-start">
                <MapPin className="w-6 h-6 mr-3 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-lg">Location</h4>
                  <p className="font-medium">{vipReception.locationName}</p>
                  <p dangerouslySetInnerHTML={{ __html: vipReception.locationAddress }} />
                </div>
              </div>
              <div className="hidden lg:flex mx-auto items-center justify-center">
                <img className="rounded-lg" src={getCdnPath(vipReception.locationPhoto || "")} alt="VIP Reception Location" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Walking Directions</h3>
            <DirectionsMap
              originPlaceId={vipReception.eventPlaceId}
              destinationPlaceId={vipReception.placeId}
              originName={vipReception.eventLocationName || "Event Location"}
              destinationName={vipReception.locationName}
              travelMode="WALKING"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VIPReceptionSection;
