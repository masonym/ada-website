// app/events/[slug]/page.tsx

import Image from "next/image";

export const EVENTS = [
  {
    id: 1,
    title: "2025 Defense Industry Forecast",
    date: "November 14th, 2024",
    timeStart: "2024-11-14T12:00:00Z",
    description: "The 2025 Defense Industry Forecast will provide actionable business intelligence on upcoming acquisition opportunities — covering Defense Dept. and Combat Command mission priorities — Army, Navy, Air Force, Marine Corps, Space Force and Coast Guard — focused on all major sectors from advanced IT, AI and Cyber, all-domain command & control, and weapons system development & sustainment, to logistics & transport, facility management, Military base building design & construction, energy resiliency and environmental remediation, to new Government-Private Sector collaborations in critical infrastructure security, U.S. manufacturing base revitalization, ship building and shipyard modernization, Space defense and other major initiatives.",
    eventText: (
      <div className="max-container font-light">
        <p className="mb-4 leading-relaxed">
          The 2025 Defense Industry Forecast will provide actionable business intelligence on upcoming acquisition opportunities – covering Defense Dept. mission priorities focused on advanced IT, AI and Cyber, to weapons system development & sustainment, to forward logistics, facility support, Military base construction, shipyard modernization, Space defense and other major buying programs.
        </p>
        <p className="mb-4">
          Conference attendees will have the chance to hear about the latest purchasing opportunities from Program Managers, Contracting Officers, and Small Business Program Directors from across the Defense Dept., and from Army, Navy, Air Force, Marine Corps and Space Force commands and installations – and from Prime Defense Contractors.
        </p>
      </div>
    ),
    topicalCoverage: [
      { tagline: "", description: "Defense Department, Service, and Combat Command Acquisition Priorities", },
      { tagline: "", description: "DoD Small Business Contracting Programs", },
      { tagline: "", description: "Prime Defense Contractors — Subcontracting & Teaming", },
      { tagline: "", description: "Accelerated Contracting Opportunities for Innovative Technology Solutions (DARPA, DIU, DEFENSEWERX)", },
      { tagline: "", description: "GWAC's (Government-Wide Acquisition Contracts) and Their Small Business Tracks", },
      { tagline: "", description: "Mentor-Protégé Programs as Business Accelerators for Smalls and Primes", },
      { tagline: "", description: "Army Corps of Engineers (USACE) and Naval Facilities Engineering Systems Command (NAVFAC) Projects Coming Down the Pike", },
      { tagline: "", description: "Military Base-Community Partnerships Driving Construction and Facility Support Contracts", },
      { tagline: "", description: "Indo-Pacific Deployment/Logistics Challenges and New Contracting Initiatives", },
      { tagline: "", description: "The Race to Develop AI, Advanced Computing and Machine Learning for Defense", },
      { tagline: "", description: "Cybersecurity Compliance Mandates and CMMC Training Options", },
      { tagline: "", description: "Special Preferential Contracting/Set-Aside Opportunities for Small Disadvantaged Businesses, 8(a) Certified Companies, Woman-Owned Small Businesses, Veteran and Service-Disabled Veteran Owned Small Businesses, HUBZone Firms, and Native American, Alaska Native, and Native Hawaiian Companies", },
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
  {
    id: 2,
    title: "2025 Southeast Defense Procurement Conference",
    date: "March 18th-19th, 2025",
    timeStart: "2025-03-18T11:30:00Z", // TODO: change to actual time
    description: "Join us for the 2025 Southeast Defense Procurement Conference on March 18-19, 2025 in Atlanta, Georgia — a pivotal event designed to empower businesses with crucial insights into Defense Procurement across the Southeastern United States, from North Carolina to Mississippi. This event will spotlight current and future purchasing requirements and contracting opportunities that can empower your business to new levels of success.",
    eventText: (
      <div className="max-container font-light">
        <p className="mb-0 leading-9">
          Join us for the <b>2025 Southeast Defense Procurement Conference</b> on March 18-19, 2025 in Atlanta, Georgia — a pivotal event designed to empower businesses with crucial insights into Defense Procurement across the Southeastern United States, from North Carolina to Mississippi. This event will spotlight current and future purchasing requirements and contracting opportunities that can empower your business to new levels of success.
          <br /><br />
        </p>
        <p className="font-bold text-xl text-center font-gotham">
          Featured Contracting Commands:
        </p>
        <p className="">
          <ul className="list-inside">
            <li>Multiple Air Force Bases in Florida, Georgia & throughout the Southeast</li>
            <li>Marine Corps Bases in North & South Carolina and the Blount Island Logistic Support Facility</li>
            <li>Ft. Liberty, Army Anniston Depot and Red Stone Arsenal</li>
            <li>Army Corps of Engineers District Headquarters in Mobile, Savannah, Charleston, Jacksonville & Wilmington</li>
            <li>NAVFAC Field Offices & Public Works Dept.’s</li>
            <li>King’s Bay Naval Sub Base, and Naval Air Stations in Pensacola, Jacksonville & Key West</li>
            <li>Major Contracting Commands including CENTCOM, SOUTHCOM, AFSOC, SOCSOUTH, & SPACECENT</li>
          </ul>
        </p>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center font-gotham text-slate-700 mt-6 mb-2">
          What to Expect
        </h2>
        <p className="mb-4">
          Attendees will gain unparalleled access to key decision-makers, including Program Managers, Contracting Officers, and Small Business Program Directors from the Army, Navy, Air Force, Marine Corps, and Space Force Commands, and top Prime Defense Contractors. This is your chance to forge invaluable connections that can shape the future of your business.
        </p>
        {/* <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center font-gotham text-slate-700 mt-6 mb-2">
          Why Attend?
        </h2>
        <p>
          This event is an invaluable opportunity to network with industry leaders, gain insights into emerging trends, and position your business for success in the competitive defense contracting landscape. Don’t miss out on the chance to be at the forefront of defense procurement. Secure your spot today!
        </p> */}
      </div>
    ),
    topicalCoverage: [
      { tagline: "Defense Acquisition Priorities", description: "Understand the Latest Acquisition Strategies from the Department of Defense, Service Components, and Combat Commands" },
      // { tagline: "Small Business Contracting Programs", description: "Learn about Initiatives that Support Small Businesses in Defense Contracting" },
      { tagline: "Subcontracting and Teaming Opportunities", description: " Connect with Prime Defense Contractors to Explore Collaborative Ventures" },
      { tagline: "Innovative Technology Solutions", description: " Discover Accelerated Contracting Opportunities through DARPA, DIU, and DEFENSEWERX" },
      { tagline: "Government-Wide Acquisition Contracts (GWACs)", description: " Navigate the Intricacies of GWACs and their Small Business Tracks" },
      { tagline: "Mentor-Protégé Programs", description: " Explore Programs Designed to Accelerate the Growth of Small Businesses through Strategic Partnerships" },
      { tagline: "Upcoming Projects", description: "Get Insights into Future Projects from the Army Corps of Engineers (USACE) and Naval Facilities Engineering Systems Command (NAVFAC)" },
      { tagline: "Military Base-Community Partnerships", description: " Learn how these Partnerships are Driving Construction and Facility Support Contracts" },
      { tagline: "Cybersecurity Compliance", description: "Understand the Mandates and Training Options Available for Compliance with CMMC" },
      // { tagline: "Support for Small & Medium Contractors", description: "Gain Access to Resources from the Defense Contract Audit Agency" },
      { tagline: "Special Contracting Opportunities", description: " Explore Set-Aside Opportunities for Small Disadvantaged Businesses, including 8(a) Certified, Woman-Owned, Veteran-Owned, and HUBZone firms" },
    ],
    image: "/2025_SoutheastDefenseProcurementConference.png",
    slug: "2025-southeast-defense-procurement-conference",
    locationImage: "/locations/location_NPC.png",
    locationAddress: "TBD",
    directions: [],
    images: [],
    parkingInfo: [],
    placeID: "TBD",
    registerLink: "https://www.eventbrite.com/e/2025-southeast-defense-procurement-conference-registration-1059452313389",
    password: "ADA2025SDPC"
  },
  {
    id: 3,
    title: "Driving the Industrialization of Space",
    date: "December 8th-9th, 2024",
    timeStart: "2024-12-08T09:00:00Z",
    description: "The commercialization of space has taken root, but now we stand on the brink of a groundbreaking evolution: the INDUSTRIALIZATION of space. Are you ready to be part of this transformative phase? This shift opens up a wealth of opportunities for space companies, including advanced mass production systems, innovative propellant solutions for launches and orbital positioning, cutting-edge industry analytics, and next-generation satellite communication systems.",
    eventText: (
      <div className="max-container font-light">
        <p className="mb-4 leading-relaxed">
          The commercialization of space has taken root, but now we stand on the brink of a groundbreaking evolution: the INDUSTRIALIZATION of space. Are you ready to be part of this transformative phase? This shift opens up a wealth of opportunities for space companies, including advanced mass production systems, innovative propellant solutions for launches and orbital positioning, cutting-edge industry analytics, and next-generation satellite communication systems. We invite you to connect with the pioneers and visionaries who are leading this new era of Department of Defense and commercial Space industrialization. Meet the experts and program managers eager to collaborate with those who recognize the vast potential in this rapidly expanding sector. Seize this opportunity to be at the forefront of this exciting frontier!
        </p>
        <p className="mb-4">
          {/* Conference attendees will have the chance to hear about the latest purchasing opportunities from Program Managers, Contracting Officers, and Small Business Program Directors from across the Defense Dept., and from Army, Navy, Air Force, Marine Corps and Space Force commands and installations – and from Prime Defense Contractors. */}
        </p>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center font-gotham text-slate-700 mt-6 mb-2">
          Conference Topics Spotlight:
        </h2>
        <p className="">
          <ul className="list-inside">
            <li>How rapidly evolving new technologies and geopolitical rivalries are moving the Space sector into a new phase</li>
            <li>NASA and Space Force – engaging the innovative commercial players – new outreach initiatives and programs</li>
            <li>Funding Space industrialization – capital sourcing for new Space technologies and the supporting terrestrial infrastructure</li>
            <li>Spaceport launch infrastructure and ground support requirements</li>
            <li>U.S. Space Defense – challenges and imperatives – Space as the likely first battleground in any future major conflict, and how Space Force Guardians are being integrated into our worldwide Combat Commands</li>
            <li>Quantum and AI driving new frontiers in Space – and the clear and present dangers to U.S. Space assets and operations</li>
            <li>Space supply chain challenges – Cybersecurity imperatives – and how to ensure availability of essential Space asset components</li>
            <li>New developments in fabrication of Space equipment, on-orbit maintenance/repair</li>
          </ul>
        </p>
      </div>
    ),
    topicalCoverage: [
      "How rapidly evolving new technologies and geopolitical rivalries are moving the Space sector into a new phase",
      "NASA and Space Force – engaging the innovative commercial players – new outreach initiatives and programs",
      "Funding Space industrialization – capital sourcing for new Space technologies and the supporting terrestrial infrastructure",
      "Spaceport launch infrastructure and ground support requirements",
      "U.S. Space Defense – challenges and imperatives – Space as the likely first battleground in any future major conflict, and how Space Force Guardians are being integrated into our worldwide Combat Commands",
      "Quantum and AI driving new frontiers in Space – and the clear and present dangers to U.S. Space assets and operations",
      "Space supply chain challenges – Cybersecurity imperatives – and how to ensure availability of essential Space asset components",
      "New developments in fabrication of Space equipment, on-orbit maintenance/repair",
    ],
    image: "/2025_IndustrializingSpace.png",
    slug: "2025-driving-the-industrialization-of-space",
    locationImage: "/locations/location_NPC.png",
    locationAddress: "TBD",
    directions: [],
    images: [],
    parkingInfo: [],
    placeID: "TBD",
    registerLink: "https://shop.michman.org/",
    password: "2025DTIOS"
  }
];
