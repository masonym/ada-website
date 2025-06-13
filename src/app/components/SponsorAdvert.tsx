import React from 'react';
import Link from 'next/link';
import { Award, ChevronRight, Mail } from 'lucide-react';
import ExhibitInstructionsButton from './ExhibitInstructionsButton';
import SponsorProspectus from './SponsorProspectus';
import { Event } from '@/types/events';

export default function SponsorAdvert({ event }: { event: Event }) {
  return (

    < div className="pt-6 items-center flex flex-col w-full" >

      {/* Sponsorship Section */}
      {/* this is a stupid temporary hacky solution */}
      {
        event.id != 3 && (
          <>
            <div className="flex flex-wrap items-center justify-center mb-4 gap-3">
              <Award className="w-6 h-6 md:w-8 md:h-8 text-gold-500 shrink-0" />
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-navy-800 text-center">
                Become a Sponsor
              </h3>
            </div>

            <div className="bg-gradient-to-r from-navy-500 to-navy-800 text-white p-4 md:p-6 rounded-lg mb-6 w-full max-w-4xl">
              <p className="text-center mb-4 text-sm md:text-base">
                Enhance your Visibility and Connect with Key Decision-Makers through our Exclusive Sponsorship Opportunities. This is your chance to elevate your brand and make a lasting impact in the Defense Sector.
              </p>
              <Link href={`/events/${event.slug}/sponsors-exhibitors/sponsorship-opportunities`} className="block">
                <button className="w-full py-3 px-6 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition duration-300 flex items-center justify-center">
                  View Sponsorship Packages
                  <ChevronRight className="ml-2 w-5 h-5" />
                </button>
              </Link>
            </div>
          </>
        )
      }


      <ExhibitInstructionsButton eventShorthand={event.eventShorthand} />
      <SponsorProspectus eventShorthand={event.eventShorthand} />

      <div className="text-center w-full max-w-4xl mb-4">
        <div className="flex items-center justify-center text-gray-600 mb-2">
          <Mail className="w-5 h-5 mr-2" />
          <p className="font-medium text-md md:text-base">{event.contactInfo?.contactText || 'Contact our Sponsorship Team'} </p>
        </div>
        <a
          href={`mailto:${event.contactInfo?.contactEmail || 'marketing@americandefensealliance.org'}`}
          className="text-blue-600 hover:text-blue-800 transition-colors duration-300 font-medium break-words text-sm md:text-base"
        >
          {event.contactInfo?.contactEmail || 'marketing@americandefensealliance.org'}
        </a>
      </div>
    </div >
  )
}
