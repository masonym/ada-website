import React from 'react';
import { EVENTS } from '@/constants/events';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { MapPin, Phone } from 'lucide-react';
import { LODGING_INFO } from '@/constants/lodging';

export default function LodgingPage({ params }: { params: { slug: string } }) {
  const event = EVENTS.find((e) => e.slug === params.slug);
  
  if (!event) {
    notFound();
  }

  const lodging = LODGING_INFO.find((l) => l.eventId === event.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center font-gotham text-slate-700 mb-8">
        Recommended Lodging
      </h1>

      {lodging ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {lodging.hotels.map((hotel, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative h-64">
                <Image
                  src={hotel.image}
                  alt={hotel.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4 text-navy-800">{hotel.name}</h2>
                <div className="space-y-2 text-gray-600">
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 mr-2 mt-1 flex-shrink-0 text-gray-400" />
                    <div>
                      <p>{hotel.address}</p>
                      <p>{`${hotel.city}, ${hotel.state} ${hotel.zip}`}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 mr-2 flex-shrink-0 text-gray-400" />
                    <p>{hotel.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600">
          Lodging information will be available soon.
        </p>
      )}

      {lodging?.note && (
        <p className="mt-8 text-center text-gray-600">
          {lodging.note}
        </p>
      )}
    </div>
  );
}