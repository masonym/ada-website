// app/events/[slug]/page.tsx

import Image from "next/image";

export const EVENTS = [
  {
    id: 1,
    title: "2025 Defense Industry Forecast",
    date: "November 14th, 2024",
    timeStart: "2024-11-14T14:00:00Z",
    description: "The 2025 Defense Industry Forecast Will provide actionable business intelligence on upcoming acquisition opportunities — covering Defense Dept. and Combat Command mission priorities — Army, Navy, Air Force, Marine Corps, Space Force and Coast Guard — focused on all major sectors from advanced IT, AI and Cyber, all-domain command & control, and weapons system development & sustainment, to logistics & transport, facility management, Military base building design & construction, energy resiliency and environmental remediation, to new Government-Private Sector collaborations in critical infrastructure security, U.S. manufacturing base revitalization, ship building and shipyard modernization, Space defense and other major initiatives.",
    eventText: (
      <div className="max-container font-light">
        <p className="mb-4 leading-9">
          The 2025 Defense Industry Forecast will provide actionable business intelligence on upcoming acquisition opportunities – covering Defense Dept. mission priorities focused on advanced IT, AI and Cyber, to weapons system development & sustainment, to forward logistics, facility support, Military base construction, shipyard modernization, Space defense and other major buying programs.
        </p>
        <p className="mb-4">
          Conference attendees will have the chance to hear about the latest purchasing opportunities from Program Managers, Contracting Officers, and Small Business Program Directors from across the Defense Dept., and from Army, Navy, Air Force, Marine Corps and Space Force commands and installations – and from Prime Defense Contractors.
        </p>
        <div className="flex flex-col border-0 bg-slate-300 rounded-lg p-4 pt-0 mb-0">
          <h2 className="text-xl text-white font-semibold mb-2 bg-navy-800 p-4 rounded-md mt-4">2025 Defense Industry Forecast – Topical Coverage:</h2>
          <ul className="list-disc pl-5">
            <li>Defense Dept., Service, and Combat Command Acquisition Priorities</li>
            <li>DoD Small Business Contracting Programs</li>
            <li>Prime Defense Contractors – Subcontracting & Teaming</li>
            <li>Accelerated Contracting Opportunities for Innovative Technology Solutions (DIU, DEFENSEWERX, Etc.)</li>
            <li>Description of GWAC’s (Government-Wide Acquisition Contracts) and Their Small Business Tracks</li>
            <li>Mentor-Protégé Programs as Business Accelerators for Smalls and Primes</li>
            <li>Army Corps of Engineers (USACE) and Naval Facilities Engineering Systems Command (NAVFAC) Projects Coming Down the Pike</li>
            <li>Military Base-Community Partnerships Driving Construction and Facility Support Contracts</li>
            <li>Contract and Grant Opportunities Financed by Infrastructure and Energy Resiliency Legislation</li>
            <li>Navy’s Critical Maintenance & Shipbuilding Issues and Resulting Support Needs</li>
            <li>Indo-Pacific Deployment/Logistics Challenges and New Contracting Initiatives</li>
            <li>The New Unmanned/Autonomous Platforms and How to Engage </li>
            <li>The Race to Develop AI, Advanced Computing and Machine Learning for Defense</li>
            <li>Cybersecurity Compliance Mandates and CMMC Training Options</li>
            <li>Defense Contract Audit Agency Support for Small & Medium-size Contractors</li>
            <li>Special Preferential Contracting/Set-Aside Opportunities for Small Disadvantaged</li>
            <li>Businesses, 8(a) Certified Companies, Woman-Owned Small Businesses, Veteran and Service-Disabled Veteran Owned Small Businesses, HUBZone Firms, and Native American, Alaska Native, and Native Hawaiian Companies</li>
          </ul>
        </div>
      </div>
    ),
    image: "/2025_DefenseIndustryForecast.png",
    slug: "2025-defense-industry-forecast",
    locationImage: "/locations/location_NPC.png",
    locationAddress: "529 14th Street NW, Washington, DC 20045",
    registerLink: "/",
    password: "ADA2025DIF"
  },
  // Add more events here
];
