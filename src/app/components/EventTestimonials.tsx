"use client";

import { EventTestimonial } from "@/types/events";
import Image from "next/image";
import { getCdnPath } from "@/utils/image";
import { useState } from "react";

interface EventTestimonialsProps {
    testimonials?: EventTestimonial[];
    /** Optional custom title. Defaults to "Attendee Testimonials" */
    title?: string;
    /** Set to false to hide the title */
    showTitle?: boolean;
}

const EventTestimonials = ({ testimonials = [], title, showTitle = true }: EventTestimonialsProps) => {
    const [expanded, setExpanded] = useState<Record<number, boolean>>({});

    const toggleExpanded = (idx: number) => {
        setExpanded(prev => ({ ...prev, [idx]: !prev[idx] }));
    };

    return (
        <section className="pb-12">
            <div className="container mx-auto px-4">
                {showTitle && (
                    <h2 className="text-3xl md:text-4xl font-semibold text-center mb-8 md:mb-12 text-slate-700">
                        {title || 'Attendee Testimonials'}
                    </h2>
                )}
                <div className="grid grid-cols-1 xl:grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-6 sm:gap-8">

                    {testimonials.map((testimonial, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
                            {testimonial.type === 'video' && testimonial.videoId && (
                                <div className="relative pb-[56.25%] h-0">
                                    <iframe
                                        className="absolute top-0 left-0 w-full h-full"
                                        src={`https://www.youtube.com/embed/${testimonial.videoId}`}
                                        title={`Testimonial from ${testimonial.name}`}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        loading="lazy"
                                    />
                                </div>
                            )}

                            <div className="p-5 sm:p-6">
                                {testimonial.type === 'image' && testimonial.imageUrl ? (
                                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                                        <div className="flex-shrink-0">
                                            <Image
                                                src={getCdnPath(testimonial.imageUrl)}
                                                alt={testimonial.imageAlt || `${testimonial.name} headshot`}
                                                width={80}
                                                height={80}
                                                className="rounded-full object-cover w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20"
                                                unoptimized
                                                priority={false}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-gray-700 mb-3 italic break-words">{testimonial.quote}</p>
                                            {testimonial.fullTranscript && (
                                                <div className="mb-3">
                                                    {!expanded[index] ? (
                                                        <button
                                                            onClick={() => toggleExpanded(index)}
                                                            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                                                            aria-expanded={!!expanded[index]}
                                                        >
                                                            Read full transcript
                                                        </button>
                                                    ) : (
                                                        <div className="text-gray-600 whitespace-pre-line">
                                                            {testimonial.fullTranscript}
                                                            <div className="mt-2">
                                                                <button
                                                                    onClick={() => toggleExpanded(index)}
                                                                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                                                                >
                                                                    Show less
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            <p className="font-semibold">- {testimonial.name}</p>
                                            <p className="text-gray-500 text-sm">{testimonial.title} at {testimonial.affiliation}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-gray-700 mb-3 italic">{testimonial.quote}</p>
                                        {testimonial.fullTranscript && (
                                            <div className="mb-3">
                                                {!expanded[index] ? (
                                                    <button
                                                        onClick={() => toggleExpanded(index)}
                                                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                                                        aria-expanded={!!expanded[index]}
                                                    >
                                                        Read full transcript
                                                    </button>
                                                ) : (
                                                    <div className="text-gray-600 whitespace-pre-line">
                                                        {testimonial.fullTranscript}
                                                        <div className="mt-2">
                                                            <button
                                                                onClick={() => toggleExpanded(index)}
                                                                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                                                            >
                                                                Show less
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        <p className="font-semibold">- {testimonial.name}</p>
                                        <p className="text-gray-500 text-sm">{testimonial.title} at {testimonial.affiliation}</p>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default EventTestimonials;
