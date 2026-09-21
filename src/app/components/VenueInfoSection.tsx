import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Globe, MapPin, Phone } from 'lucide-react';
import { getCdnPath } from '@/utils/image';
import { VenueDetails } from '@/types/events';

/**
 * Venue "business card": photo on the left, name/address/phone/website on the
 * right, with an optional note and an about-the-venue paragraph underneath.
 * Server-rendered - nothing here is interactive.
 */
export default function VenueInfoSection({
    venue,
    title = 'Event Venue',
    className = '',
}: {
    venue: VenueDetails;
    title?: string;
    className?: string;
}) {
    return (
        <section className={`bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 ${className}`}>
            <h3 className="bg-navy-300 text-white text-2xl sm:text-3xl font-bold font-gotham text-center py-4 px-6">
                {title}
            </h3>

            <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {venue.image && (
                    <Image
                        src={getCdnPath(venue.image)}
                        alt={venue.name}
                        width={1000}
                        height={600}
                        className="w-full h-auto rounded-lg object-cover"
                        priority
                    />
                )}

                <div className={venue.image ? '' : 'md:col-span-2'}>
                    <h4 className="text-2xl sm:text-3xl font-bold text-navy-100 mb-4">{venue.name}</h4>

                    <div className="space-y-3 text-lg text-slate-700">
                        <div className="flex items-start">
                            <MapPin className="w-5 h-5 mr-3 mt-1 flex-shrink-0 text-gray-400" />
                            <div>
                                <p>{venue.address}</p>
                                {venue.addressLine2 && <p>{venue.addressLine2}</p>}
                            </div>
                        </div>

                        {venue.phone && (
                            <div className="flex items-center">
                                <Phone className="w-5 h-5 mr-3 flex-shrink-0 text-gray-400" />
                                <a href={`tel:${venue.phone.replace(/[^\d+]/g, '')}`} className="hover:underline">
                                    {venue.phone}
                                </a>
                            </div>
                        )}

                        {venue.website && (
                            <div className="flex items-center">
                                <Globe className="w-5 h-5 mr-3 flex-shrink-0 text-gray-400" />
                                <Link
                                    href={venue.website.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline break-words"
                                >
                                    {venue.website.label}
                                </Link>
                            </div>
                        )}
                    </div>

                    {venue.note && (
                        <div
                            className="mt-6 text-slate-600 border-l-4 border-navy-300/30 pl-4"
                            dangerouslySetInnerHTML={{ __html: venue.note }}
                        />
                    )}
                </div>
            </div>

            {venue.description && (
                <div className="px-6 sm:px-8 pb-8">
                    <div
                        className="text-slate-700 leading-relaxed border-t border-gray-200 pt-6"
                        dangerouslySetInnerHTML={{ __html: venue.description }}
                    />
                </div>
            )}
        </section>
    );
}
