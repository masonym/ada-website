"use client";

import { EventTestimonial } from "@/types/events";
import Image from "next/image";
import { getCdnPath } from "@/utils/image";
import { useState } from "react";

interface EventTestimonialsProps {
    testimonials?: EventTestimonial[];
}

const EventTestimonials = ({ testimonials = [] }: EventTestimonialsProps) => {
    const [expanded, setExpanded] = useState<Record<number, boolean>>({});

    const toggleExpanded = (idx: number) => {
        setExpanded(prev => ({ ...prev, [idx]: !prev[idx] }));
    };

    return (
        <section className="py-12">
            <div className="container mx-auto px-4">
                <h2 className="text-4xl font-semibold text-center mb-12 text-slate-700">Attendee Testimonials</h2>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-8">

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

                            {testimonial.type === 'image' && testimonial.imageUrl && (
                                <div className="relative w-full h-56 bg-gray-100">
                                    <Image
                                        src={getCdnPath(testimonial.imageUrl)}
                                        alt={testimonial.imageAlt || `${testimonial.name} headshot`}
                                        fill
                                        sizes="(max-width: 1024px) 100vw, 33vw"
                                        className="object-cover"
                                        unoptimized
                                        priority={false}
                                    />
                                </div>
                            )}

                            <div className="p-6">
                                <p className="text-gray-600 mb-4">{testimonial.quote}</p>
                                {testimonial.fullTranscript && (
                                    <div className="mb-4">
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
                    ))}
                </div>
            </div>
        </section>
    );
};

export default EventTestimonials;
