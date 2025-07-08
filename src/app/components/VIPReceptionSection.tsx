"use client";

import React from 'react';
import DirectionsMap from './DirectionsMap';
import { getCdnPath } from '@/utils/image';
import { MapPin, Clock, CalendarDays } from 'lucide-react';
import { VipNetworkingReception } from '@/types/events';

const VIPReceptionSection: React.FC<{ vipNetworkingReception: VipNetworkingReception }> = ({ vipNetworkingReception }) => {
  return (
    <div className="my-12 py-8 px-4 sm:px-6 bg-slate-50 rounded-xl">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center font-gotham text-slate-700 mb-6">
          {vipNetworkingReception.title}
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="mb-6">
              <div dangerouslySetInnerHTML={{ __html: vipNetworkingReception.description }}
                className="prose max-w-none text-md text-slate-600" />
            </div>

            <div className=" mb-0">
              <div className="flex items-start">
                <CalendarDays className="w-6 h-6 mr-3 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-lg">Date</h4>
                  <p>{vipNetworkingReception.date}</p>
                </div>
              </div>

              <div className="flex items-start">
                <Clock className="w-6 h-6 mr-3 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-lg">Time</h4>
                  <p>{vipNetworkingReception.timeStart} - {vipNetworkingReception.timeEnd}</p>
                </div>
              </div>

              <div className="flex items-start">
                <MapPin className="w-6 h-6 mr-3 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-lg">Location</h4>
                  <p className="font-medium">{vipNetworkingReception.locationName}</p>
                  <p dangerouslySetInnerHTML={{ __html: vipNetworkingReception.locationAddress || "" }} />

                  <p>{vipNetworkingReception.locationPhone}</p>
                  <p>
                    <a href={vipNetworkingReception.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {vipNetworkingReception.locationName}
                    </a>
                  </p>
                </div>
              </div>
              <div className="mt-4 hidden lg:flex mx-auto items-end justify-center">
                <img className="rounded-lg" src={getCdnPath(vipNetworkingReception.locationPhoto || "")} alt="VIP Reception Location" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Walking Directions</h3>
            <DirectionsMap
              originPlaceId={vipNetworkingReception.eventPlaceId || ""}
              destinationPlaceId={vipNetworkingReception.placeId || ""}
              originName={vipNetworkingReception.eventLocationName || "Event Location"}
              destinationName={vipNetworkingReception.locationName}
              travelMode="WALKING"
            />
          </div>
        </div>
        {vipNetworkingReception.additionalInfo && (
          <div className="mt-6 text-center text-balance">
            <p dangerouslySetInnerHTML={{ __html: vipNetworkingReception.additionalInfo }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default VIPReceptionSection;
