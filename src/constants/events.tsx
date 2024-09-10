// app/events/[slug]/page.tsx

import Image from "next/image";

export const EVENTS = [
  {
    id: 1,
    title: "2025 Defense Industry Forecast",
    date: "November 14th, 2024",
    timeStart: "2024-11-14T14:00:00Z",
    description: "The 2025 Defense Industry Forecast will provide actionable business intelligence on upcoming acquisition opportunities — covering Defense Dept. and Combat Command mission priorities — Army, Navy, Air Force, Marine Corps, Space Force and Coast Guard — focused on all major sectors from advanced IT, AI and Cyber, all-domain command & control, and weapons system development & sustainment, to logistics & transport, facility management, Military base building design & construction, energy resiliency and environmental remediation, to new Government-Private Sector collaborations in critical infrastructure security, U.S. manufacturing base revitalization, ship building and shipyard modernization, Space defense and other major initiatives.",
    eventText: (
      <div className="max-container font-light">
        <p className="mb-4 leading-9">
          The 2025 Defense Industry Forecast will provide actionable business intelligence on upcoming acquisition opportunities – covering Defense Dept. mission priorities focused on advanced IT, AI and Cyber, to weapons system development & sustainment, to forward logistics, facility support, Military base construction, shipyard modernization, Space defense and other major buying programs.
        </p>
        <p className="mb-4">
          Conference attendees will have the chance to hear about the latest purchasing opportunities from Program Managers, Contracting Officers, and Small Business Program Directors from across the Defense Dept., and from Army, Navy, Air Force, Marine Corps and Space Force commands and installations – and from Prime Defense Contractors.
        </p>
      </div>
    ),
    topicalCoverage: [
      "Defense Dept., Service, and Combat Command Acquisition Priorities",
      "DoD Small Business Contracting Programs",
      "Prime Defense Contractors – Subcontracting & Teaming",
      "Accelerated Contracting Opportunities for Innovative Technology Solutions (DIU, DEFENSEWERX, Etc.)",
      "Description of GWAC's (Government-Wide Acquisition Contracts) and Their Small Business Tracks",
      "Mentor-Protégé Programs as Business Accelerators for Smalls and Primes",
      "Army Corps of Engineers (USACE) and Naval Facilities Engineering Systems Command (NAVFAC) Projects Coming Down the Pike",
      "Military Base-Community Partnerships Driving Construction and Facility Support Contracts",
      "Contract and Grant Opportunities Financed by Infrastructure and Energy Resiliency Legislation",
      "Navy's Critical Maintenance & Shipbuilding Issues and Resulting Support Needs",
      "Indo-Pacific Deployment/Logistics Challenges and New Contracting Initiatives",
      "The New Unmanned/Autonomous Platforms and How to Engage",
      "The Race to Develop AI, Advanced Computing and Machine Learning for Defense",
      "Cybersecurity Compliance Mandates and CMMC Training Options",
      "Defense Contract Audit Agency Support for Small & Medium-size Contractors",
      "Special Preferential Contracting/Set-Aside Opportunities for Small Disadvantaged Businesses, 8(a) Certified Companies, Woman-Owned Small Businesses, Veteran and Service-Disabled Veteran Owned Small Businesses, HUBZone Firms, and Native American, Alaska Native, and Native Hawaiian Companies"
    ],
    image: "/2025_DefenseIndustryForecast.png",
    slug: "2025-defense-industry-forecast",
    locationImage: "/locations/location_NPC.png",
    locationAddress: "529 14th St NW, Washington, DC 20045, United States",
    directions: [
      {
        title: "Traveling from Baltimore",
        description: `
                    <ol class="list-decimal pl-4">
                      <li>Take the Baltimore-Washington Parkway south and exit at New York Ave.(Route 50)</li>
                      <li>Follow New York Ave. all the way to 14th St. and turn left (South).</li>
                      <li>The National Press Building is at the corner of 14th and F St. next to the J.W. Marriott Hotel.</li>
                    </ol>
        `
      },
      {
        title: "Traveling by Metro",
        description: `
                    <ol class="list-decimal pl-4">
                        <li>Take Metro to Metro Center.</li>
                        <li>Take the 13th Street Exit, take escalator to 13th Street; you should be at the corner of 13th and G Streets.</li>
                        <li>Walk one block south to F Street.</li>
                        <li>Turn right (West) and walk one block to 14th Street.</li>
                        <li>Turn left and walk downhill to the National Press Building lobby.</li>
                        <li>Enter and take the elevators to the 13th Floor.</li>
                    </ol>
        `
      },
      {
        title: "Traveling from Virginia",
        description: `
                    <ol class="list-decimal pl-4">
                      <h4 class="text-[20px] font-bold mt-4 mb-2">I-395 North</h4>
                      <li>Follow signs to 14th Street Bridge; Exit to 14th St.</li>
                      <li>Continue north on 14th St. past Washington Monument past Freedom Plaza and Pennsylvania Ave.</li>
                      <li>The National Press Building is in the next block, next door to the J.W. Marriott Hotel</li>
                      <h4 class="text-[20px] font-bold mt-4 mb-2">Memorial Bridge</h4>
                    </ol>
                    <ol class="list-decimal pl-4">        
                      <li>Cross Memorial Bridge to D.C.</li>
                      <li>Bear left at the Lincoln Memorial.</li>
                      <li>Right on Constitution Ave.</li>
                      <li>Left on 15th St.</li>
                      <li>Right on F St.</li>
                      <li>The National Press Building is at the corner of 14th and F St. next to the J.W. Marriott Hotel</li>
                    </ol>         
                    <ol class="list-decimal pl-4">
                      <h4 class="text-[20px] font-bold mt-4 mb-2">I-66</h4>
                      <li>Take I-66 east across the Roosevelt Bridge into D.C.</li>
                      <li>This becomes Constitution Ave.</li>
                      <li>Left on 15th St.</li>
                      <li>Right on F St.</li>
                      <li>The National Press Building is at the corner of 14th and F St. next to the J.W. Marriott Hotel</li>
                    </ol>
        `
      },
    ],
    images: [
      { id: "main", src: "/events/2025-defense-industry-forecast/main.jpeg", alt: "Main event image" },
      { id: "location", src: "/events/2025-defense-industry-forecast/location.jpeg", alt: "Event location" },
      // { id: "recap", src: "/events/2025-defense-industry-forecast/recap-placeholder.jpg", alt: "Event recap placeholder" },
      // Add more images as needed
    ],
    parkingInfo: [
      {
        title: "For Guaranteed Parking Reservations",
        description: `We recommend booking convenient and affordable parking in advance through SpotHero, the nation's leading parking reservations app.`,
        link: {
          linkText: "To reserve your parking spot, visit the The National Press Club SpotHero Parking Page",
          href: 'https://spothero.app.link/ts1p2NqSe1?kind=destination&id=45809&$3p=a_hasoffers&$affiliate_json=http%3A%2F%2Ftracking.spothero.com%2Faff_c%3Foffer_id%3D1%26aff_id%3D1065%26file_id%3D28%26source%3Dthenationalpressclub%26aff_sub2%3Dparkingpage%26format%3Djson'
        },
      },
      {
        title: "Valet Parking Options",
        description: `Valet Parking is available at the JW Marriott hotel (next to the Press Club) or the Willard Hotel (across the street from the Press Club).`,
      },
    ],
    placeID: "ChIJ44HT0_u3t4kR9J5_0CQu3ic",
    registerLink: "https://www.eventbrite.com/e/2025-defense-industry-forecast-tickets-997306910817",
    password: "ADA2025DIF"
  },
  // Add more events here
];
