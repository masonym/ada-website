"use client";

import React from 'react';
import { FAQs } from '@/constants/faqs';
import { useParams } from 'next/navigation';
import { EVENTS } from '@/constants/events';

const FAQsPage = () => {
    const params = useParams(); // Get the dynamic slug
    const event = EVENTS.find((e) => e.slug === params.slug); // Find the event by slug
    const eventId = event?.id; // Get the event ID

    // Find the corresponding FAQs based on the event ID
    const eventFAQs = FAQs.find(faq => faq.id === eventId)?.faqs || [];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-700 text-center mb-8">
                Frequently Asked Questions
            </h2>
            <div className="space-y-6">
                {eventFAQs.length > 0 ? (
                    eventFAQs.map((faq, index) => (
                        <div key={index} className="border-b border-gray-300 pb-4">
                            <h3 className="text-xl font-semibold text-slate-800">{faq.question}</h3>
                            <p className="text-slate-600">{faq.answer}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-slate-600">No FAQs available for this event.</p>
                )}
            </div>
        </div>
    );
};

export default FAQsPage;