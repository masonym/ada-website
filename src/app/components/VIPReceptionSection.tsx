"use client";

import React from 'react';
import DirectionsMap from './DirectionsMap';
import { getCdnPath } from '@/utils/image';
import { MapPin, Clock, CalendarDays } from 'lucide-react';
import { VipNetworkingReception } from '@/types/events';

const VIPReceptionSection: React.FC<{ vipNetworkingReception: VipNetworkingReception }> = ({ vipNetworkingReception }) => {
  return (
    <div className="py-8 px-4 sm:px-6  rounded-xl max-w-[96rem] mx-auto">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center font-gotham text-slate-700 mb-6">
          {vipNetworkingReception.title}
        </h2>

        <div className={`${vipNetworkingReception.placeId ? "grid grid-cols-1 lg:grid-cols-2 gap-8" : "flex flex-row items-center justify-center"}`}>
          <div>
            <div className="mb-6">
              <div dangerouslySetInnerHTML={{ __html: vipNetworkingReception.description }}
                className="prose max-w-none text-md text-slate-600 text-center" />
            </div>

            <div className={`${vipNetworkingReception.placeId ? "" : "flex flex-row items-center justify-center gap-8"}`}>
              <div className={`${vipNetworkingReception.placeId ? "flex items-start" : "flex flex-row items-start justify-center"}`}>
                <CalendarDays className="w-6 h-6 mr-3 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-lg">Date</h4>
                  <p>{vipNetworkingReception.date}</p>
                </div>
              </div>

              <div className={`flex items-start ${vipNetworkingReception.placeId ? "" : "flex-row justify-center"}`}>
                <Clock className="w-6 h-6 mr-3 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-lg">Time</h4>
                  <p>{vipNetworkingReception.timeStart} - {vipNetworkingReception.timeEnd}</p>
                </div>
              </div>

              <div className={`${vipNetworkingReception.placeId ? "flex items-start" : "flex flex-row items-start justify-center"}`}>
                <MapPin className="w-6 h-6 mr-3 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-lg">Location</h4>
                  <p className="font-medium" dangerouslySetInnerHTML={{ __html: vipNetworkingReception.locationName || "" }} />
                  <p dangerouslySetInnerHTML={{ __html: vipNetworkingReception.locationAddress || "" }} />
                  {vipNetworkingReception.locationRoom && (
                    <p className="font-medium">Room: {vipNetworkingReception.locationRoom}</p>
                  )}
                  <p>{vipNetworkingReception.locationPhone}</p>
                  <p>
                    <a href={vipNetworkingReception.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {vipNetworkingReception.locationName}
                    </a>
                  </p>
                </div>
              </div>
            </div>
              <div className={`${vipNetworkingReception.locationPhoto ? "mt-4 hidden lg:flex mx-auto items-end justify-center" : ""}`}>
                <img className="rounded-lg" src={getCdnPath(vipNetworkingReception.locationPhoto || "")} alt="VIP Reception Location" />
              </div>
          </div>

            {vipNetworkingReception.eventPlaceId && vipNetworkingReception.placeId && (
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
        )}
        </div>
        {vipNetworkingReception.additionalInfo && (
          <div className="mt-6 text-center text-balance">
            <p dangerouslySetInnerHTML={{ __html: vipNetworkingReception.additionalInfo }} />
          </div>
        )}
        {vipNetworkingReception.additionalInfo2 && (
          <div className="mt-4 text-center text-balance">
            <p>{vipNetworkingReception.additionalInfo2}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VIPReceptionSection;
