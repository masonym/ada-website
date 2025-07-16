"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Globe, MapPin, Phone } from 'lucide-react';
import { getCdnPath } from '@/utils/image';
import { LODGING_INFO } from '@/constants/lodging';

// Define types based on the LODGING_INFO structure
type Hotel = {
  name: string;
  address: string;
  city?: string;
  state?: string;
  zip?: string;
  phone: string;
  image: string;
  link?: {
    href: string;
    label: string;
  };
};

type LodgingInfo = {
  eventId: number;
  hotels: Hotel[];
  note?: string;
};

type LodgingSectionProps = {
  lodging: LodgingInfo;
  title?: string; // Allow custom title override
  className?: string; // For additional styling flexibility
  imageShown?: boolean; // For additional styling flexibility
};

export default function LodgingSection({ 
  lodging, 
  title = "Event Venue & Lodging",
  className = "",
  imageShown = true,
}: LodgingSectionProps) {
  return (
    <section className={`max-w-[86rem] mx-auto ${className}`}>
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center font-gotham text-slate-700 mb-8">
        {title}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-8 mx-auto">
        {lodging.hotels.map((hotel: Hotel, index: number) => (
          <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
            {imageShown && (
              <div className="relative h-[30rem]">
                <Image
                  src={getCdnPath(hotel.image)}
                  alt={hotel.name}
                  fill
                  className="object-cover object-[75%_15%]"
                />
              </div>
            )}
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-4 text-navy-800">{hotel.name}</h3>
              <div className="space-y-2 text-gray-600">
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 mr-2 mt-1 flex-shrink-0 text-gray-400" />
                  <div>
                    {hotel.address && <span>{hotel.address}</span>}
                    {hotel.city && <span>, {hotel.city}</span>}
                    {hotel.state && <span>, {hotel.state}</span>}
                    {hotel.zip && <span> {hotel.zip}</span>}
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="w-5 h-5 mr-2 flex-shrink-0 text-gray-400" />
                  <p>{hotel.phone}</p>
                </div>
                {hotel.link && (
                  <div className="flex items-center">
                    <Globe className="w-5 h-5 mr-2 flex-shrink-0 text-gray-400" />
                    <Link href={hotel.link.href} className="text-blue-600 hover:underline" target="_blank">
                      <p className="my-2">{hotel.link.label}</p>
                    </Link>
                  </div>
                )}
                <p className="mt-8 text-left text-gray-600">
                  {/* If any of the address/state/city/zip are blank, don't display lodging note*/}
                  {hotel.city || hotel.state || hotel.zip ? (
                    <div className="flex flex-col">
                      {lodging.note && <span dangerouslySetInnerHTML={{ __html: lodging.note }}></span>}
                    </div>
                  ) : null}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
