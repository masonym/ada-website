import React from 'react';

const Testimonials = () => {
    const testimonials = [
        { quote: "ADA events have been instrumental in helping us navigate the defense industry landscape.", author: "John Doe, CEO of Defense Tech Inc." },
        { quote: "The networking opportunities at ADA conferences are unparalleled. Highly recommended!", author: "Jane Smith, Small Business Owner" },
    ];

    return (
        <section className="pt-8 pb-16 px-4 bg-gray-100">
            <div className="container mx-auto">
                <h3 className="text-xl font-bold text-center mb-0 text-navy-800">Don't just hear it from us</h3>
                <h2 className="text-3xl font-semibold text-center mb-12 text-navy-300">Hear it from our attendees</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                            <p className="text-gray-600 mb-4">"{testimonial.quote}"</p>
                            <p className="font-semibold">- {testimonial.author}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;