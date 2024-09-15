"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQ = () => {
    const faqs = [
        {
            question: "What is the American Defense Alliance?",
            answer: "The American Defense Alliance is an organization dedicated to connecting the private-sector Defense Industrial Base with Federal acquisition opportunities and facilitating partnerships between small businesses and prime contractors."
        },
        {
            question: "How can I participate in American Defense Alliance events?",
            answer: "You can participate in American Defense Alliance events by registering through our website. Check our 'Upcoming Events' section for details on future events and registration information."
        },
        {
            question: "Does American Defense Alliance offer resources for small businesses?",
            answer: "Yes, American Defense Alliance provides various resources for small businesses, including networking opportunities, educational events, and connections to prime contractors in the defense industry."
        },
        {
            question: "How can I sponsor an event?",
            answer: `For sponsorship details, please check out the Sponsorship Opportunities page of any of our <a href="/events"  class="text-blue-600 hover:underline text-nowrap">events</a>, or email <a href="mailto:marketing@americandefensealliance.org" class="text-blue-600 hover:underline text-nowrap">marketing@americandefensealliance.org.</a>`
        },
    ];

    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="py-16 bg-gray-100 px-4">
            <div className="container mx-auto text-navy-800">
                <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
                <div className="max-w-3xl mx-auto">
                    {faqs.map((faq, index) => (
                        <div key={index} className="mb-4 border-b border-gray-200 pb-4">
                            <button
                                className="flex justify-between items-center w-full text-left"
                                onClick={() => toggleFAQ(index)}
                            >
                                <span className="text-lg font-semibold">{faq.question}</span>
                                {openIndex === index ? (
                                    <ChevronUp className="h-6 w-6 text-blue-600" />
                                ) : (
                                    <ChevronDown className="h-6 w-6 text-blue-600" />
                                )}
                            </button>
                            {openIndex === index && (
                                <p className="mt-2 text-gray-600" dangerouslySetInnerHTML={{__html: faq.answer}}></p>
                            )} 
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQ;