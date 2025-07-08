import { EventTestimonial } from "@/types/events";

interface EventTestimonialsProps {
    testimonials?: EventTestimonial[];
}

const EventTestimonials = ({ testimonials = [] }: EventTestimonialsProps) => {
    return (
        <section className="py-12">
            <div className="container mx-auto px-4">
                <h2 className="text-4xl font-semibold text-center mb-12 text-slate-700">Attendee Testimonials</h2>
                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-8">
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
                            <div className="p-6">
                                <p className="text-gray-600 mb-4">{testimonial.quote}</p>
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
