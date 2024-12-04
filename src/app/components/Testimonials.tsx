import React from 'react';

interface Testimonial {
    type: 'video' | 'text';
    quote: string;
    name: string;
    title: string;
    affiliation: string;
    videoId?: string;
}

const Testimonials = () => {
    const testimonials: Testimonial[] = [
        {
            type: 'video',
            quote: "\"I'm here because it allows me to be able to share proven stories as a small business where we have been able to win contracts through our SBIR and our OT, but more importantly to learn more about what upcoming opportunities there are and meet with senior leaders\"",
            name: "Aimee Zick",
            title: "Business Development Executive",
            affiliation: "Improve Group",
            videoId: "H3Be6-OY_ug"
        },
        {
            type: 'video',
            quote: "\"The American Defense Alliance is a body for us that is extremely valuable because it covers that whole forest, from two dudes in a garage to some pretty large and impressive companies.\" ",
            name: "His Royal Highness, Brigadier General Prince Joachim, Prince of Denmark",
            title: "Danish Military Industry Attaché",
            affiliation: "Royal Embassy of Denmark",
            videoId: "LNC5iQfEEEc"
        },
        {
            type: 'video',
            quote: "\"The American Defense Alliance puts on fantastic events, and they really connect Small Businesses to a lot of really great opportunities out there.\"",
            name: "Brian Liesveld",
            title: "Chief Executive Officer",
            affiliation: "DEFENSEWERX",
            videoId: "kqyAAe4RHNA"
        }
    ];

    return (
        <section className="pt-8 pb-16 px-4 bg-gray-100">
            <div className="container mx-auto">
                <h3 className="text-xl font-bold text-center mb-0 text-navy-800">Don't just hear it from us</h3>
                <h2 className="text-3xl font-semibold text-center mb-12 text-navy-300">Hear what our attendees have to say</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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

export default Testimonials;