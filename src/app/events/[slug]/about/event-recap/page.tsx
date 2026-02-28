import React from 'react';
import { EVENTS } from '@/constants/events';
import { notFound } from 'next/navigation';
import { validateImagePaths } from '@/utils/imageUtils';
import Link from 'next/link';
import EventTestimonials from '@/app/components/EventTestimonials';
import { getEventRecap } from '@/lib/eventRecap';
import { SectionRenderer } from './sections';
import { SOCIALS } from '@/constants';

// Generate static params for all event slugs
export async function generateStaticParams() {
  return EVENTS.map((event) => ({
    slug: event.slug,
  }));
}

export default async function EventRecapPage({ params }: { params: { slug: string } }) {
  const event = EVENTS.find((e) => e.slug === params.slug);

  if (!event) {
    notFound();
  }

  // Validate if images directory exists
  const hasImages = await validateImagePaths(event.eventShorthand);

  // Get event recap data using hybrid system
  const recapData = await getEventRecap(event.eventShorthand);

  const eventDate = new Date(event.timeStart);
  const currentDate = new Date();
  const eventHasOccurred = eventDate < currentDate;

  if (!eventHasOccurred) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Event Recap Not Available</h2>
        <p className="text-lg">
          Event Recap Usually Available 1 Week Post-Event.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-[48px] font-gotham font-bold mb-4 text-slate-700 text-center">
        Photo Highlights of the <br />{event.title}
      </h1>

      {!hasImages && <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Photos Coming Soon</h2>
        <p className="text-lg">
          Photo gallery for {event.title} is being prepared. Please check back later.
        </p>
      </div>}

      <div className="mb-8 max-w-3xl mx-auto bg-navy-800 rounded-lg p-6 sm:p-8 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-lg sm:text-xl mb-4">
            Access Presentation Materials and Recordings
          </p>
          <Link
            href={`/events/${params.slug}/agenda`}
            className="inline-block bg-white text-navy-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            View Agenda
          </Link>
        </div>
      </div>
      {/* Social Media Sharing Section */}
      {recapData?.metadata?.socialSharing?.enabled && (
        <div className="max-w-4xl mx-auto mb-12 text-center bg-navy-400 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-200">
            Share Your Favorite Moments
          </h2>
          <p className="text-lg mb-6 text-white">
            {recapData.metadata.socialSharing.message || `Feel free to share your favorite moments from the ${event.title} on Social Media and don't forget to tag us and use ${recapData.metadata.socialSharing.hashtag || '#2025NMCPC'}!`}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {SOCIALS.links.map((social) => {
              const IconComponent = social.Icon;
              return (
                <Link
                  key={social.title}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 hover:text-navy-600 px-4 py-2 rounded-lg border border-gray-200 transition-colors duration-200 shadow-sm hover:shadow-md"
                >
                  <IconComponent className="w-5 h-5" />
                  <span className="font-medium">{social.title}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {event.testimonials && event.testimonials.length > 0 && (
        <EventTestimonials testimonials={event.testimonials} />
      )}

      {/* Display custom introduction if available */}
      {recapData?.introduction && (
        <div className="max-w-4xl mx-auto mb-12 text-center">
          {recapData.introduction}
        </div>
      )}

      {/* Render each section based on its layout type */}
      {recapData?.sections.map(section => (
        <SectionRenderer key={section.id} section={section} />
      ))}


      {/* Photo Credits Section */}
      {recapData?.metadata?.photoCredits?.enabled && (
        <div className="max-w-4xl mx-auto mb-8 text-center border-t border-gray-200 pt-8">
          <p className="text-sm text-gray-600">
            Photography by{' '}
            <Link
              href={recapData.metadata.photoCredits.website || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-navy-600 hover:text-navy-800 font-medium underline"
            >
              {recapData.metadata.photoCredits.photographer || "Professional Event Photography"}
            </Link>
          </p>
        </div>
      )}

      {/* Fallback if no recap data is available but images exist */}
      {hasImages && !recapData && (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Enhanced Photo Gallery Coming Soon</h2>
          <p className="text-lg mb-4">
            We're currently working on an enhanced photo gallery for this event.
            In the meantime, you can view the agenda and presentation materials.
          </p>
          <Link
            href={`/events/${params.slug}/agenda`}
            className="inline-block bg-navy-800 text-white px-6 py-2 rounded-lg font-semibold hover:bg-navy-700 transition-colors"
          >
            View Agenda
          </Link>
        </div>
      )}
    </div>
  );
}
