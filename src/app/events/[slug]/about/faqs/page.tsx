import React from 'react';
import { notFound } from 'next/navigation';
import { getEventBundle } from '@/lib/events';
import EventWarningNotice from '@/app/components/EventWarningNotice';

/**
 * Event FAQ page.
 *
 * A server component: this is static marketing copy with no interactivity, and
 * it used to be `"use client"` reading the slug from useParams and importing
 * both EVENTS and FAQs. That meant the content was not in the server-rendered
 * HTML (bad for indexing) and every event's data shipped to the browser to
 * render one event's questions.
 */
export default async function FAQsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const bundle = getEventBundle(slug);

  if (!bundle) {
    notFound();
  }

  const { event, faqs } = bundle;

  return (
    <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-700 text-center mb-8">
        Frequently Asked Questions
      </h2>
      <div className="space-y-6">
        {faqs.length > 0 ? (
          faqs.map((faq, index) => (
            <div key={index} className="border-b border-gray-300 pb-4">
              <h3 className="text-xl font-semibold text-slate-800">{faq.question}</h3>
              {/* answers carry markup for line breaks and links */}
              <p className="text-slate-600" dangerouslySetInnerHTML={{ __html: faq.answer }}></p>
            </div>
          ))
        ) : (
          <p className="text-slate-600">No FAQs available for this event.</p>
        )}
      </div>
      <EventWarningNotice eventTitle={event.title} />
    </div>
  );
}
