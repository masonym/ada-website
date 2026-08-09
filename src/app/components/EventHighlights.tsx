"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import type { ResolvedHighlight, HighlightSpeaker } from '@/lib/event-highlights';
import { getCdnPath } from '@/utils/image';

// Sanity image refs look like "image-<assetId>-<dimensions>-<format>".
function getSanityImageUrl(ref: string) {
  return `https://cdn.sanity.io/images/nc4xlou0/production/${ref
    .replace('image-', '')
    .replace('-webp', '.webp')
    .replace('-jpg', '.jpg')
    .replace('-png', '.png')}`;
}

type Props = {
  /** Highlights with their session speakers already resolved on the server. */
  highlights: ResolvedHighlight[];
  title?: string;
  subtitle?: string;
};

/**
 * Highlights carry their speakers with them now. This component used to import
 * constants/highlights to look them up on click - and that module imports
 * SCHEDULES, so every event's full agenda shipped to the browser on a page where
 * the modal is usually never opened.
 */
const EventHighlights: React.FC<Props> = ({ highlights, title, subtitle }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState<string>('');
  const [modalSpeakers, setModalSpeakers] = useState<HighlightSpeaker[]>([]);

  if (highlights.length === 0) return null;

  const openSpeakersModal = (h: ResolvedHighlight) => {
    setModalSpeakers(h.speakers);
    setModalTitle(h.sessionTitle || 'Session');
    setIsModalOpen(true);
  };

  const closeSpeakersModal = () => {
    setIsModalOpen(false);
    setModalSpeakers([]);
    setModalTitle('');
  };

  return (
    <section className="pt-8 pb-16 px-4">
      <div className="max-w-[90rem] mx-auto">
        <h4 className="text-xl md:text-3xl font-semibold text-slate-700 text-center mb-0">
          {title || 'Event Highlights'}
        </h4>
        {subtitle && <h4 className="text-lg text-center mb-8 text-slate-600">{subtitle}</h4>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {highlights.map((h, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col h-full"
            >
              {h.videoId && (
                <div className="relative pb-[56.25%] h-0">
                  <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${h.videoId}${h.videoStartTime ? `?start=${h.videoStartTime}` : ""
                      }`}
                    title={`Highlight: ${h.sessionTitle}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              )}

              {/* Flex column that pushes button to bottom */}
              <div className="p-6 flex flex-col flex-1">
                <div>
                  <div className="text-sm text-gray-500 mb-1">
                    {h.sessionTime} - {h.sessionDayDate}
                  </div>
                  <div className="font-semibold text-lg mb-2">{h.sessionTitle}</div>
                </div>

                <button
                  onClick={() => openSpeakersModal(h)}
                  className="mt-auto inline-block text-white px-4 py-2 rounded-md bg-lightBlue-400 hover:bg-blue-500 transition-colors"
                >
                  View Speakers
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeSpeakersModal}>
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-navy-800">Speakers — {modalTitle}</h2>
              <button
                onClick={closeSpeakersModal}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              {modalSpeakers.length === 0 ? (
                <div className="text-gray-600">No speakers found for this session.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {modalSpeakers.map((sp, i) => (
                    <div key={i} className="flex items-center gap-4">
                      {sp.sanityImage?.asset?._ref ? (
                        <Image
                          src={getSanityImageUrl(sp.sanityImage.asset._ref)}
                          alt={sp.name || 'Speaker'}
                          width={64}
                          height={64}
                          className="rounded-full object-cover"
                          unoptimized
                        />
                      ) : sp.photo ? (
                        <Image
                          src={getCdnPath(`speakers/${sp.photo}`)}
                          alt={sp.name || 'Speaker'}
                          width={64}
                          height={64}
                          className="rounded-full object-cover"
                        />
                      ) : null}
                      <div>
                        <div className="font-semibold">{sp.name}</div>
                        {sp.title && <div className="text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: sp.title }} />}
                        {sp.affiliation && <div className="text-sm text-gray-600">{sp.affiliation}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default EventHighlights;
