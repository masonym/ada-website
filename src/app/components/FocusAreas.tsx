import React from 'react';

const FocusAreas = () => {
  const areas = [
    { title: "Defense Acquisition", icon: "🎯", description: "We provide actionable insights on upcoming defense acquisition opportunities, helping businesses navigate complex federal procurement processes and align with DoD priorities." },
    { title: "Small Business Support", icon: "🏢", description: "We offer resources, education, and connections to empower small businesses and diversity suppliers to compete effectively in the defense industry." },
    { title: "Industry Networking", icon: "🤝", description: "We facilitate valuable connections between small businesses, prime contractors, and government agencies, fostering collaboration and growth within the defense industrial base." },
  ];

  return (
    <section className="py-16 px-4 bg-white">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-navy-800">Our Key Focus Areas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {areas.map((area, index) => (
            <div key={index} className="text-center">
              <div className="text-5xl mb-4">{area.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-navy-800">{area.title}</h3>
              <p className="text-gray-600">{area.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FocusAreas;