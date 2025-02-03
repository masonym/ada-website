import React from 'react';

const FocusAreas = () => {
  const areas = [
    { title: "Defense Acquisition", icon: "🎯", description: "We provide actionable insights on upcoming Defense Acquisition Opportunities, helping businesses navigate complex Federal Procurement Processes and align with DoD Priorities." },
    { title: "Industry Networking", icon: "👥", description: "We facilitate valuable connections between Small and Medium-size Businesses, Prime Contractors, and Government Agencies, fostering collaboration, innovation and growth within the Defense Industrial Base." },
    { title: "Small Business Support", icon: "🏢", description: "We offer resources, guidance and mentoring to empower Small Businesses to compete effectively in the Defense Industry." },
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