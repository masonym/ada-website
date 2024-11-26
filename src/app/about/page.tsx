import { getCdnPath } from '@/utils/image';
import React from 'react';
import Image from 'next/image';

const AboutUsPage = () => {
  return (
    <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-center text-navy-800 mb-8">About American Defense Alliance</h1>
      
      <div className="flex flex-col md:flex-row items-center mb-12">
        <div className="md:w-1/2 mb-6 md:mb-0 md:pr-8">
          <Image
            src={getCdnPath("/placeholder.png")}
            alt="American Defense Alliance Team"
            width={600}
            height={400}
            className="rounded-lg shadow-lg"
          />
        </div>
        <div className="md:w-1/2">
          <h2 className="text-2xl font-semibold text-navy-800 mb-4">Our Mission</h2>
          <p className="text-gray-700 mb-4">
            The American Defense Alliance is dedicated to the critical mission of supporting U.S. National Security and our Warfighters. We serve as a vital bridge between the private-sector Defense Industrial Base and Federal acquisition requirements and priorities.
          </p>
          <p className="text-gray-700">
            Our goal is to facilitate meaningful connections between Small Businesses, Diversity Suppliers, and Prime Contractors, enabling them to collaborate effectively in identifying, pursuing, and performing Government contracts.
          </p>
        </div>
      </div>
      
      <div className="bg-gray-100 rounded-lg p-8 mb-12">
        <h2 className="text-2xl font-semibold text-navy-800 mb-4">What We Do</h2>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>Provide actionable intelligence on upcoming acquisition opportunities</li>
          <li>Organize industry-leading events and conferences</li>
          <li>Facilitate networking between small businesses and prime contractors</li>
          <li>Offer guidance on government contracting processes and requirements</li>
          <li>Promote innovation and technological advancement in the defense sector</li>
        </ul>
      </div>
      
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-navy-800 mb-4">Our Commitment</h2>
        <p className="text-gray-700 mb-4">
          At American Defense Alliance, we are committed to fostering a robust and diverse defense industrial base. We believe that by empowering businesses of all sizes and backgrounds, we can enhance the capabilities and resilience of our national defense infrastructure.
        </p>
        <p className="text-gray-700">
          Through our events, resources, and networks, we strive to create an environment where innovation thrives, partnerships flourish, and the American defense industry continues to lead on the global stage.
        </p>
      </div>
      
      {/* New section for the company president */}
      <div className="mb-12">
        <h2 className="text-3xl font-semibold text-navy-800 mb-4 text-center">Leadership</h2>
        <div className="flex flex-col md:flex-row items-start">
          <div className="md:w-1/2 mb-6 md:mb-0 md:pr-8">
            <Image
              src={getCdnPath("/charles_president_photo.png")}
              alt="Charles Sills - President & CEO"
              width={600}
              height={300}
              className="rounded-3xl shadow-lg"
            />
          </div>
          <div className="md:w-2/3">
            <h3 className="text-xl font-semibold text-navy-800 mb-2">Charles Sills - President & CEO</h3>
            <p className="text-gray-700 mb-4">
            Charles F. Sills is a recognized authority on U.S. Government contracting, and an advocate for Small Business/Diversity Supplier access to Federal and Military acquisition opportunities, serving as the President & CEO of the American Defense Alliance – which hosts major Defense Requirements conferences across the country, connecting private sector innovators with the Pentagon, Military commands, and Congress to accelerate National Security solutions.
            </p>
            <p className="text-gray-700 mb-4">
            Concurrently, he serves as Chief Operating Officer of the Minority Business Development Agency’s Federal Procurement Center, under the U.S. Commerce Dept.; and manages the partnership under which MBDA affiliated companies attend and benefit from ADA conferences.  He is a member of the U.S. Chamber of Commerce's Small Business Council, and the Executive Committee of the Veterans Entrepreneurship Task Force (VET-Force).  He is also a Member of the Board of the American-Eurasian Business Coalition, focusing on international infrastructure, energy and investment initiatives, and serving on multinational task forces such as the Danube Basin Environmental Restoration Program and the Japan-U.S. Joint Fund for Social & Economic Development.
            </p>
            <p className="text-gray-700 mb-4">
            As a former Naval Intelligence Officer, he held positions at the Defense Intelligence Agency, the U.S. Middle East Force, and NATO Supreme Allied Command/Atlantic; and subsequently worked in Lockheed Martin’s International Division managing strategic marketing and export licensing for defense systems as well as renewable energy technologies.  His education includes an M.A. from the Fletcher School of Law and Diplomacy and an A.B. from Princeton University’s Woodrow Wilson School of Public & International Affairs.
            </p>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default AboutUsPage;