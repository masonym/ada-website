import { getCdnPath } from "@/utils/image";
import { Mail, Phone, CircleAlert } from "lucide-react";
import Image from "next/image";
import { Event } from "@/types/events";

export const EVENTS: Event[] = [
  {
    id: 1,
    title: "2025 Defense Industry Forecast",
    date: "November 14, 2024",
    timeStart: "2024-11-14T13:00:00Z",
    description: "The 2025 Defense Industry Forecast will provide actionable business intelligence on upcoming acquisition opportunities — covering Defense Dept. and Combat Command mission priorities — Army, Navy, Air Force, Marine Corps, Space Force and Coast Guard — focused on all major sectors from advanced IT, AI and Cyber, all-domain command & control, and weapons system development & sustainment, to logistics & transport, facility management, Military base building design & construction, energy resiliency and environmental remediation, to new Government-Private Sector collaborations in critical infrastructure security, U.S. manufacturing base revitalization, ship building and shipyard modernization, Space defense and other major initiatives.",
    eventText: (
      <div className="max-container font-light">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center font-gotham text-slate-700 mb-6">
          Event Overview
        </h2>
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
    testimonials: [
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
    ],
    image: "/2025_DefenseIndustryForecast.webp",
    slug: "2025-defense-industry-forecast",
    locationImage: "/locations/location_NPC.webp",
    locationAddress: `National Press Club</br>529 14th St NW, Washington, DC 20045, United States`,
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
      // { id: "recap", src: "/events/2025-defense-industry-forecast/recap-placeholder.webp", alt: "Event recap placeholder" },
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
    password: "ADA2025DIF",
    eventShorthand: "2025DIF",

  },
  {
    id: 2,
    eventShorthand: "2025SDPC",
    title: "2025 Southeast Defense Procurement Conference",
    date: "March 11-12, 2025",
    timeStart: "2025-03-11T11:30:00Z", // TODO: change to actual time
    description: "Join us for the 2025 Southeast Defense Procurement Conference on March 11-12, 2025 in Atlanta, Georgia — a pivotal event designed to empower businesses with crucial insights into Defense Procurement across the Southeastern United States, from North Carolina to Mississippi. This event is open to Defense Contractors nationwide, with a special focus on those interested in expanding their business opportunities in the Southeast by doing business with the various contracting commands. It will spotlight current and future purchasing requirements and contracting opportunities that can empower your business to new levels of success.",
    eventText: (
      <div className="max-w-[92rem] font-light text-balance">
        <div className="p-4 border-black border-4 bg-white w-fit text-5xl text-red-500 font-bold mx-auto rounded-lg mb-4 flex items-center"><span className="mr-2"><CircleAlert size={48} color="#c53434" /></span>Event Registration is Now Closed<span className="ml-2"><CircleAlert size={48} color="#c53434" /></span></div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center font-gotham text-slate-700 mb-6">
          Event Overview
        </h2>
        <p className="mb-0 leading-9">
          Join us for the <b>2025 Southeast Defense Procurement Conference</b> on March 11-12, 2025 in Atlanta, Georgia, home to the U.S. Army Corps of Engineers South Atlantic Division — a pivotal event designed to empower businesses with crucial insights into Defense Procurement across the Southeastern United States, from North Carolina to Mississippi. This event is open to Defense Contractors nationwide, with a special focus on those interested in expanding their business opportunities in the Southeast by doing business with the various contracting commands. It will spotlight current and future purchasing requirements and contracting opportunities that can empower your business to new levels of success.
          <br /><br />
        </p>
        <p className="font-bold text-xl text-center font-gotham">
          Featured Contracting Commands:
        </p>
        <div className="">
          <ul className="list-inside">
            <li>Multiple Air Force Bases in Florida, Georgia & throughout the Southeast</li>
            <li>Marine Corps Bases in North & South Carolina and the Blount Island Logistic Support Facility</li>
            <li>Ft. Liberty, Army Anniston Depot and Red Stone Arsenal</li>
            <li>Army Corps of Engineers District Headquarters in Mobile, Savannah, Charleston, Jacksonville & Wilmington</li>
            <li>NAVFAC Field Offices & Public Works Dept.'s</li>
            <li>King's Bay Naval Sub Base, and Naval Air Stations in Pensacola, Jacksonville & Key West</li>
            <li>Major Contracting Commands including CENTCOM, SOUTHCOM, AFSOC, SOCSOUTH, & SPACECENT</li>
          </ul>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center font-gotham text-slate-700 mt-6 mb-2">
          What to Expect
        </h2>
        <p className="mb-4 max-w-6xl mx-auto text-center">
          The <b>2025 Southeast Defense Procurement Conference</b> is the premier event to
          explore the latest contracting opportunities across a wide range of industries.
          From <b>Aerospace and Aviation</b> to <b>Military Base Construction, Facility Support,
            Shipbuilding, Expeditionary Logistics, AI and Energy Resilience</b>, you'll connect
          with top companies driving military innovation. Attendees will gain access to key
          decision-makers, including Program Managers, Contracting Officers, and Small
          Business Program Directors from the Army, Navy, Air Force, Marine Corps, and Space
          Force Commands, and top Prime Defense Contractors. This is your chance to forge
          invaluable connections that can shape the future of your business.
        </p>
        {/* <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center font-gotham text-slate-700 mt-6 mb-2">
          Why Attend?
        </h2>
        <p>
          This event is an invaluable opportunity to network with industry leaders, gain insights into emerging trends, and position your business for success in the competitive defense contracting landscape. Don’t miss out on the chance to be at the forefront of defense procurement. Secure your spot today!
        </p> */}
      </div>
    ),
    aboutEventText: (
      <div className="max-container font-light">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center font-gotham text-slate-700 mb-6">
          Event Overview
        </h2>
        <p className="mb-0 leading-9">
          Join us for the <b>2025 Southeast Defense Procurement Conference</b> on March 11-12, 2025 in Atlanta, Georgia, home to the U.S. Army Corps of Engineers South Atlantic Division — a pivotal event designed to empower businesses with crucial insights into Defense Procurement across the Southeastern United States, from North Carolina to Mississippi. This event is open to Defense Contractors nationwide, with a special focus on those interested in expanding their business opportunities in the Southeast by doing business with the various contracting commands. It will spotlight current and future purchasing requirements and contracting opportunities that can empower your business to new levels of success.
        </p>
      </div>
    ),
    topicalCoverage: [
      { tagline: "Defense Acquisition Priorities", description: "Understand the Latest Acquisition Strategies from the Department of Defense, Service Components, and Combat Commands" },
      // { tagline: "Small Business Contracting Programs", description: "Learn about Initiatives that Support Small Businesses in Defense Contracting" },
      { tagline: "Subcontracting and Teaming Opportunities", description: " Connect with Prime Defense Contractors to Explore Collaborative Ventures" },
      { tagline: "Innovative Technology Solutions", description: " Discover Accelerated Contracting Opportunities through DARPA, DIU, and DEFENSEWERX" },
      // { tagline: "Government-Wide Acquisition Contracts (GWACs)", description: " Navigate the Intricacies of GWACs and their Small Business Tracks" },
      // { tagline: "Mentor-Protégé Programs", description: " Explore Programs Designed to Accelerate the Growth of Small Businesses through Strategic Partnerships" },
      { tagline: "Upcoming Projects", description: "Get Insights into Future Projects from the Army Corps of Engineers (USACE) and Naval Facilities Engineering Systems Command (NAVFAC)" },
      { tagline: "Military Base-Community Partnerships", description: " Learn how these Partnerships are Driving Construction and Facility Support Contracts" },
      { tagline: "Cybersecurity Compliance", description: "Understand the Mandates and Training Options Available for Compliance with CMMC" },
      // { tagline: "Support for Small & Medium Contractors", description: "Gain Access to Resources from the Defense Contract Audit Agency" },
      // { tagline: "Special Contracting Opportunities", description: " Explore Set-Aside Opportunities for Small Disadvantaged Businesses, including 8(a) Certified, Woman-Owned, Veteran-Owned, and HUBZone firms" },
      { tagline: "Small Business Contracting Opportunities", description: "Explore Set-Aside Opportunities for Small Disadvantaged Businesses, including 8(a) Certified, Woman-Owned, Veteran-Owned, and HUBZone firms. Explore Programs Designed to Accelerate the Growth of Small Businesses through Strategic Partnerships. Navigate the Intricacies of GWACs and their Small Business Tracks." }
    ],
    expectations: [
      {
        audienceType: "Small Business",
        expectations: [
          {
            title: "Business Opportunities and Tailored Growth Sessions",
            description: "Participate in Sessions designed to Accelerate your Business Growth, whether you are New to the Federal Market or a Seasoned Contractor looking to Expand your Reach"
          },
          {
            title: "Direct Access to Decision-Makers",
            description: "Forge Connections with Federal Procurement Decision-Makers, Contracting Officers, and Small Business Liaison Officers, who can Drive your Business Forward"
          },
          {
            title: "Networking with Experienced Small Businesses",
            description: "Learn from and Collaborate with other Small Businesses that have successfully navigated the Federal Market, Sharing Insights and Strategies for Growth"
          },
          {
            title: "One-on-One Matchmaking Sessions",
            description: "Gain Exclusive, Personalized Sessions with Key Government Agencies and Major Corporations to Expand your Network and Grow your Business"
          },
          {
            title: "Subcontracting Opportunities",
            description: "Engage with Large Businesses to Explore Strategic Subcontracting Opportunities, Boosting your Past Performance and Helping you scale your Success"
          },
        ]
      }
    ],
    expectationsText: `
    The <b>2025 Southeast Defense Procurement Conference</b> is the premier event to
explore the latest contracting opportunities across a wide range of industries.
From <b>Aerospace and Aviation</b> to <b>Military Base Construction, Facility Support,
Shipbuilding, Expeditionary Logistics, AI and Energy Resilience</b>, you'll connect
with top companies driving military innovation. Attendees will gain access to key
decision-makers, including Program Managers, Contracting Officers, and Small
Business Program Directors from the Army, Navy, Air Force, Marine Corps, and Space
Force Commands, and top Prime Defense Contractors. This is your chance to forge
invaluable connections that can shape the future of your business.
    `,
    image: "/2025_SoutheastDefenseProcurementConference.webp",
    slug: "2025-southeast-defense-procurement-conference",
    locationImage: "/hotels/hilton-atlanta-hotel.webp",
    locationAddress: "255 Courtland St NE, Atlanta, GA 30303, USA",
    directions: [
      {
        title: "Walking Directions From The Peachtree Center Marta Station",
        description: `
                    <ol class="list-decimal pl-4">
                      <li>From the Airport by the Subway (MARTA), Take the train north and exit at Peachtree Center Station.</li>
                      <li>Follow the directions for Peachtree Center Mall. You will go up a very steep escalator into the Mall.</li>
                      <li>Take a right at the top of the escalator and enter Peachtree Center Mall through the sliding glass doors.</li>
                      <li>Continue Straight through the Food Court and past the Seating Areas.</li>
                      <li>Take a left where the seating area ends and there is a shoe/shine booth in front of you.</li>
                      <li>Take a right at Yami Yami Sushi. (Dairy Queen will be on your left.)</li>
                      <li>Go through the Glass Skybridge with directional signage that reads to "Marquis 1 & 2 Towers/ Marriott Marquis Hotel"</li>
                      <li>Turn left at the Security Desk. Continue through the glass doors and take a right upon passing through.</li>
                      <li>Take another right into the Marriott Marquis Atrium/Lobby after passing through a second set of sliding glass doors.</li>
                      <li>You will now need to go down two levels via escalator, stairs, or elevator.</li>
                      <li>By Elevator- Walk straight out of Elevator Bank towards the "Skybridge to Hilton Hotel."</li>
                      <li>By Escalator- Take a right off of the escalator towards "Skybridge to Hilton Hotel."</li>
                      <li>By Stairs- Continue straight past the Elevator Bank towards "Skybridge to Hilton Hotel."</li>
                      <li>Walk through the Glass Skybridge into the Hilton. You are now on the second floor of the hotel.</li>
                      <li>Proceed downstairs to the lobby to check-in.</li>
                    </ol>
                    <a href="https://www.itsmarta.com/uploadedimages/train-stations-map-2020.jpg" target="_blank" rel="noopener noreferrer" class=" text-blue-600 hover:underline">Click here to view a map of the MARTA train station.</a>
                    `,
      },
    ],
    images: [],
    parkingInfo: [
      {
        title: "",
        description: `<b>Self-Parking:</b> $40.00 Per Day
        <br />
        <b>Oversize Vehicle:</b> $60.00 Per Day
        <br />
        <b>Valet:</b> $60.00 Per Day
        <br />
        <b>Garage Height:</b> 6 ft
        <br />
        <b>Secured:</b> Yes
        <br />
        <b>Covered:</b> Yes
        <br />
        <b>EV Charging:</b> Not Available
        <br/><br/>
        <i>Note: Valet Required for Oversized Vehicles</i>`,
      },
    ],
    placeID: "ChIJ__IuDHcE9YgRl74p-48jkpU",
    registerLink: "https://www.eventbrite.com/e/2025-southeast-defense-procurement-conference-registration-1059452313389",
    password: "SDPC2025ADA",

    featuredTopicsTitle: "Featured Contracting Commands",
    featuredTopicsSubtitle: "These insights highlight key regional defense assets and contracting opportunities in the Southeast, emphasizing the need for contractors to tailor their solutions to support the military's evolving Infrastructure, Operational Readiness, and Technological Advancements.",
    featuredTopics: [
      {
        title: "Strategic Importance of Air Force Bases in Florida, Georgia, and the Southeast",
        subItems: [
          {
            title: "Diverse Capabilities",
            description: "Air Force Bases in the Southeast, such as Tyndall AFB, Eglin AFB, and Dobbins ARB, are vital hubs for Air Combat, Training, Missile Testing, and Space Operations."
          },
          {
            title: "Modernization and Resilience",
            description: "Tyndall AFB's recovery from Hurricane Michael highlights the Region's commitment to Resilience and Infrastructure upgrades, creating major opportunities for Construction, Engineering and Technology Solutions."
          },
          {
            title: "Future of Combat and Space Operations",
            description: "With a focus on expanding Space, Cyber, and Electronic Warfare capabilities at bases like Hickam and Patrick AFB, the Region is driving demand for Cutting-edge Technology, Cyber Defense, and Satellite Communications."
          }
        ]
      },
      {
        title: "Marine Corps Bases and Blount Island Logistic Support Facility",
        subItems: [
          {
            title: "Strategic Mobilization",
            description: "Camp Lejeune and Parris Island in North and South Carolina are critical to the Marine Corps' Readiness, Training, and Rapid Deployment Capabilities."
          },
          {
            title: "Logistics Infrastructure",
            description: "The Blount Island Logistics Support Facility in Jacksonville, Florida, plays a key role in supporting Navy and Marine Corps Logistics through Warehousing, Transportation, and Supply Chain Management."
          },
          {
            title: "Enhanced Joint Operations",
            description: "Located near key Navy and Air Force assets in the Southeast, these Marine Corps bases strengthen inter-service Operations and Procurement partnerships."
          }
        ]
      },
      {
        title: "Ft. Liberty, Army Anniston Depot, and Redstone Arsenal",
        subItems: [
          {
            title: "Fort Liberty",
            description: "A key hub for Army Space Operations Forces, Fort Liberty's expanding mission offers opportunities in Specialized Training, Advanced Systems, and Equipment Support."
          },
          {
            title: "Anniston Army Depot",
            description: "Vital for Military Vehicle Repair and Maintenance, the depot is embracing innovation for Modernization, creating opportunities in Defense Manufacturing, Automation, and Maintenance Services."
          },
          {
            title: "Redstone Arsenal",
            description: "In Huntsville, Alabama, Redstone Arsenal is a leading center for Missile Defense, Aviation, and Cybersecurity Research. The presence of NASA and AMCOM drives demand for Advanced Defense Technologies and R&D Contracting."
          }
        ]
      },
      {
        title: "Army Corps of Engineers Districts (Mobile, Savannah, Charleston, Jacksonville, Wilmington)",
        subItems: [
          {
            title: "Infrastructure & Modernization",
            description: "These Districts drive large-scale projects in Water Resources, Flood Control, and Military Facility upgrades."
          },
          {
            title: "Resiliency Focus",
            description: "Focusing on Climate Adaptation and Resilient Infrastructure, the Districts seek firms with expertise in Construction, Energy Efficiency, and Disaster Recovery."
          },
          {
            title: "Regional Development",
            description: "The growing need for Port and Base Facility upgrades in Wilmington, Charleston, and Savannah creates unique opportunities in Infrastructure Development and Defense Logistics."
          }
        ]
      },
      {
        title: "NAVFAC Field Offices & Public Works Departments",
        subItems: [
          {
            title: "Base Infrastructure and Sustainment",
            description: "NAVFAC Field Officers are essential in maintaining and enhancing Base Infrastructure across the Southeast, covering Construction, Maintenance, Repairs, and Utility upgrades at Navy Installations.",
          },
          {
            title: "Energy and Sustainability Initatives",
            description: "With a growing emphasis on Sustainable Construction and Renewable Energy, NAVFAC offers opportunities for contractors in Green Technology, Energy-Efficient Systems, and Power Solutions."
          },
          {
            title: "Real Property and Facility Management",
            description: "As public works departments focus on Facility Lifecycle Management, there are abundant opportunities for firms specializing in Construction, Asset Management, and Infrastructure Upgrades.",
          },
        ]
      },
      {
        title: "King’s Bay Naval Submarine Base & Naval Air Stations (Pensacola, Jacksonville, Key West)",
        subItems: [
          {
            title: "Submarine Operations & Technology",
            description: "King's Bay Naval Submarine Base supports Nuclear-powered Submarine Operations, creating procurement opportunities in Nuclear Technology, Logistics, Security Systems, and Specialized Defense Tech.",
          },
          {
            title: "Naval Aviation",
            description: "Naval Air Stations like Pensacola, Jacksonville, and Key West are crucial for Training and Fleet Readiness, offering opportunities in Aviation Systems, Training Equipment, Simulation Technologies, and Maintenance Services.",
          },
          {
            title: "Integration and Joint Training",
            description: "These bases play a key role in Joint Training Exercises, driving demand for solutions that enhance Interoperability, Cybersecurity, and Logistics.",
          },
        ]
      },
      {
        title: "Key Contracting Commands (CENTCOM, SOUTHCOM, AFSOC, SOCSOUTH, SPACECENT)",
        subItems: [
          {
            title: "Global & Regional Operation",
            description: "CENTCOM and SOUTHCOM influence operations in the Southeast U.S., with growing procurement needs in Logistics, Cybersecurity, and Intelligence, driven by U.S. interests in the Caribbean and Latin America. This creates demand for Security, Infrastructure, and Technology Solutions.",
          },
          {
            title: "Special Operations & Space Missions",
            description: "AFSOC, SOCSOUTH, and SPACECENT focus on Specialized Readiness and Technology. Companies with expertise in Advanced Communications, Space Technologies, and Special Operations Equipment will be prime candidates for contracts."
          },
          {
            title: "Innovation & Tech Solutions",
            description: "With SPACECENT and SOCSOUTH advancing Space and Cyber Technologies, there's a rising need for cutting-edge solutions in Satellite communications, Cybersecurity, Data Analytics, and Space-based Defense Systems."
          }
        ]
      }
    ],
    matchmakingSessions: {
      signUpTime: "7:30 AM",
      sessionTime: "4:00 PM - 5:30 PM",
      date: "March 11",
      slotsPerHost: 9,
      sessionDurationMinutes: 10
    }
  },
  {
    id: 3,
    eventShorthand: "2025DTIOS",
    title: "Driving the Industrialization of Space",
    date: "December 8-9, 2024",
    timeStart: "2024-12-09T15:00:00Z",
    description: "The commercialization of space has taken root, but now we stand on the brink of a groundbreaking evolution: the INDUSTRIALIZATION of space. Are you ready to be part of this transformative phase? This shift opens up a wealth of opportunities for space companies, including advanced mass production systems, innovative propellant solutions for launches and orbital positioning, cutting-edge industry analytics, and next-generation satellite communication systems.",
    eventText: (
      <div className="max-container font-light">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center font-gotham text-slate-700 mb-6">
          Industrializing Space
        </h2>
        <p className="mb-0 leading-9">
          The commercialization of space has taken root, but now we stand on the brink of a groundbreaking evolution: the <b><i>INDUSTRIALIZATION</i></b> of space. Are you ready to be part of this transformative phase? This shift opens up a wealth of opportunities for Space Sector Companies, including Advanced Mass Production Systems, Innovative Propellant Solutions for Launches and Orbital Positioning, Cutting-edge Industry Analytics, and Next-generation Satellite Communication Systems.
          <br /><br />
        </p>
        <p className="mb-4 leading-9">
          We invite you to connect with the pioneers and visionaries who are leading this new era of Department of Defense and Commercial Space Industrialization. Meet the experts and program Managers eager to collaborate with those who recognize the vast potential in this rapidly expanding sector. Seize this opportunity to be at the forefront of this exciting frontier!
        </p>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center font-gotham text-slate-700 mt-6 mb-2">
          Conference Topics Spotlight
        </h2>
        <ul className="list-inside">
          <li>How Rapidly Evolving New Technologies and Geopolitical Rivalries are Moving the Space Sector into a New Phase</li>
          <li>NASA and Space Force – Engaging the Innovative Commercial Players – New Outreach Initiatives and Programs</li>
          <li>Funding Space Industrialization – Capital Sourcing for New Space Technologies and the Supporting Terrestrial Infrastructure</li>
          <li>Spaceport Launch Infrastructure and Ground Support Requirements</li>
          <li>U.S. Space Defense – Challenges and Imperatives – Space as the Likely First Battleground in any Future Major Conflict, and how Space Force Guardians are Being Integrated into our Worldwide Combat Commands</li>
          <li>Quantum and AI Driving New Frontiers in Space – and the Clear and Present Dangers to U.S. Space Assets and Operations</li>
          <li>Space Supply Chain Challenges – Cybersecurity Imperatives – and How to Ensure Availability of Essential Space Asset Components</li>
          <li>New Developments in Fabrication of Space Equipment, at On-Orbit Maintenance/Repair</li>
        </ul>
      </div>
    ),
    topicalCoverage: [],
    image: "/header_final.webp",
    slug: "2025-driving-the-industrialization-of-space",
    locationImage: "/locations/kennedy-space-center.webp",
    locationAddress: `
    The Center for Space Education at The Astronauts Memorial Foundation
    <br/>SR 405, Building M6-306, Kennedy Space Center, FL 32899`,
    directions: [
      {
        title: "From Cocoa Beach (SR 528)",
        description: `
      <ol class="list-decimal pl-4">
        <li>Travel north on A1A to SR 528 west</li>
        <li>Take exit #49 for SR 3 toward Merritt Island/Kennedy Space Center</li>
        <li>Turn right/north onto SR 3 and continue north for approximately 8 miles/13 km</li>
        <li>Turn left/west onto Space Commerce Way and go approximately 1.5 miles/2.4 km</li>
        <li>Kennedy Space Center Visitor Complex is located on the right</li>
      </ol>
    `
      },
      {
        title: "From Orlando (SR 50)",
        description: `
      <ol class="list-decimal pl-4">
        <li>From Orlando, travel east on SR 50 for approximately 50 miles/80 km</li>
        <li>Passing I-95, turn right/east at the next intersection onto SR 405</li>
        <li>Follow signs for approximately 10 miles/16 km</li>
        <li>Turn right onto Space Commerce Way and go approximately 1.2 miles/2 km</li>
        <li>Kennedy Space Center Visitor Complex is located on the left</li>
      </ol>
    `
      },
      {
        title: "From Orlando (SR 528)",
        description: `
      <ol class="list-decimal pl-4">
        <li>From Orlando, travel east on SR 528 for approximately 50 miles/80 km</li>
        <li>Take SR 407 exit on left for Kennedy Space Center and Titusville</li>
        <li>Continue on SR 407 to end at SR 405</li>
        <li>Turn right/east onto SR 405 and follow signs for Kennedy Space Center for approximately 7.5 miles/12 km</li>
        <li>Turn right onto Space Commerce Way and go approximately 1.2 miles/2 km</li>
        <li>Kennedy Space Center Visitor Complex is located on the left</li>
      </ol>
    `
      },
      {
        title: "From Daytona Beach (I-95)",
        description: `
      <ol class="list-decimal pl-4">
        <li>Travel I-95 South to Exit #215 onto Highway 50</li>
        <li>Turn left/east onto Highway 50</li>
        <li>Take a right onto SR 405 and continue straight, following signs for Kennedy Space Center</li>
        <li>Travel for approximately 10 miles/16 km</li>
        <li>Turn right onto Space Commerce Way and go approximately 1.2 miles/2 km</li>
        <li>Kennedy Space Center Visitor Complex is located on the left</li>
      </ol>
    `
      },
      {
        title: "From Miami (I-95)",
        description: `
      <ol class="list-decimal pl-4">
        <li>Travel I-95 North to Exit #212 SR 407</li>
        <li>Turn right on SR 407</li>
        <li>Continue on SR 407 to end at SR 405</li>
        <li>Turn right/east onto SR 405 and follow signs for Kennedy Space Center for approximately 7.5 miles/12 km</li>
        <li>Turn right onto Space Commerce Way and go approximately 1.2 miles/2 km</li>
        <li>Kennedy Space Center Visitor Complex is located on the left</li>
      </ol>
    `
      }
    ],
    images: [],
    parkingInfo: [
      {
        title: "General Parking Information",
        description: `The Kennedy Space Center Visitor Complex Parking Lot accommodates Motorcycles, Automobiles, and Oversized Vehicles such as RVs. Parking fees are collected at the entrance to the lot. Parking is accessible 30 minutes before complex opening.
        <br/><br/>
        You must enter the KSCVC through the "Crawler" entrance on Space Commerce Way. The entrance is a newer entrance, if you attempt to enter through the security gate off of SR405, you will be asked to turn around.
        `
      },
      {
        title: "Accessible Parking",
        description: `Parking for Visitors with Disabilities is available in Lot 2 with Valid Parking Permit.`
      },
      {
        title: "Rideshare & Taxi Information",
        description: `Rideshare and Taxi Drop-offs and Pick-ups in Lot 4 are permitted with Proof of Fare.`
      },
      {
        title: "GPS Information",
        description: `For GPS navigation, use coordinates 28°30'56.0"N and 80°40'54"W or search for "Kennedy Space Center Visitor Complex". Important: Do not use "Kennedy Space Center" as this will direct you to an incorrect location.`
      }
    ],
    placeID: "ChIJY0BfjTOu4IgRxNjxFMIAkQ0",
    registerLink: "https://www.industrializing.space/shop/",
    password: "2025DTIOS",
    contactInfo: {
      contactText: "General Inquiries",
      contactEmail: "info@industralizing.space",
      contactEmail2: "lana@americandefensealliance.org"
    },
    sponsorshipInfo: {
      customContactText: (
        <div className="flex flex-col items-center space-y-4 bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-3xl font-bold">Contact Information</h3>
          <div className="text-center">
            <p className="text-xl font-bold">Lana Corrigan, Meetings & Events Executive</p>
            {/* <p className="text-lg text-gray-200 italic mb-4">Meetings & Events Executive</p> */}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full">
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              <span>(202) 256-3028</span>
            </div>

            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              <a
                href="mailto:lana@americandefensealliance.org"
                className="hover:text-blue-200 underline transition-colors duration-300"
              >
                lana@americandefensealliance.org
              </a>
            </div>
          </div>
        </div>
      )
    },
    customFooterText: (
      <div>
        <p>The Industrializing Space Conference is a Program of the Michigan Aerospace Manufacturing Association, a 501(c)(6) Organization in Partnership with American Defense Alliance and The Astronaut Memorial Foundation.
        </p>
      </div>
    ),
    parkingBox: {
      text: "To access the KSC Visitor Complex, present the Parking Placard provided below. This will serve as your entry into the KSCVC parking for the event. Park in Lot 4 and please present this parking pass at the parking plaza. It may be presented digitally or it may be printed.\n\nImportant: Each attendee must present a yellow admission ticket at the turnstiles. You will have (1) ticket for each day of the event.\n• Travel Through Turnstiles and Around the Curved Path\n• The Rocket Garden will be on your Left\n• To the CSE: Walk through the Rocket Garden through the Gateway Building Beyond the White Fence (to the left of the Gateway) will be The Center for Space Education\n• Turn Right to Follow the Path to the Front Entrance of The Center for Space Education",
      imagePlaceholder: "/events/2025DTIOS/parking_placard.webp"
    },
  },
  {
    id: 4,
    eventShorthand: "2025NMCPC",
    password: "2025NMCPCADA",
    title: "2025 Navy & Marine Corps Procurement Conference",
    date: "July 29-30, 2025",
    timeStart: "2025-07-29T11:30:00Z",
    description: `Join us for the 2025 Navy & Marine Corps Procurement Conference on July 29-30, 2025 in Norfolk, Virginia, home to Naval Station Norfolk and Norfolk Naval Shipyard. This is your opportunity to engage directly with decision-makers from the Pentagon, Navy and Marine Corps Bases and Commands, and leading Prime Defense Contractors. Don't miss your chance to network with Industry Leaders and Government Experts and gain critical information into current procurement needs and upcoming contracting opportunities by registering to attend.`,
    eventText: (
      <div className="max-container font-light">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center font-gotham text-slate-700 mb-6">
          Event Overview
        </h2>
        <p className="mb-4 leading-relaxed">
          Join us for the <b>2025 Navy & Marine Corps Procurement Conference</b> on July 29-30, 2025 in Norfolk, Virginia, home to Naval Station Norfolk and Norfolk Naval Shipyard. This is your opportunity to engage directly with decision-makers from the Pentagon, Navy and Marine Corps Bases and Commands, and leading Prime Defense Contractors. Don't miss your chance to network with Industry Leaders and Government Experts and gain critical information into current procurement needs and upcoming contracting opportunities by registering to attend.
        </p>
        <p className="font-bold text-xl text-center font-gotham">
          Topical Coverage:
        </p>
        <div className="">
          <ul className="list-inside">
            <li>Navy's Critical Maintenance & Repair and Shipbuilding Needs</li>
            <li>SIOP - Shipyard Infrastructure Optimization Plan - Driving $ Billions in Construction & Facility Support Contracts</li>
            <li>New Navy & Marine Corps Littoral Warfighting Requirements & Contracts</li>
            <li>New Navy & Marine Corps Technology Initiatives</li>
            <li>Upcoming Projects - NAVFAC, MARCORSYSCOM, and USACE</li>
            <li>Military Base-Community Partnerships Driving Local Build Contracts</li>
            <li>Indo-Pacific ‘Pivot’ – Deployment & Logistics Challenges Driving Major New Acquisitions</li>
            <li>Contracts Supporting U.S. Leadership in AI</li>
            <li>The Surge in Autonomous/Unmanned Systems Development & Deployment</li>
            <li>Base & Installation Physical Security Upgrades</li>
            <li>Major Command IT & Cyber Protection Contracts</li>
            <li>Prime Defense Contractors — Subcontracting & Teaming Opportunities</li>
            <li>Accelerated Contracting Vehicles for Innovative Tech (DARPA, DIU, DEFENSEWERX)</li>
            <li>How to Access GWACs (Government-Wide Acquisition Contracts)</li>
            <li>Mentor-Protégé Programs as Business Accelerators for Smalls & Primes</li>
            <li>Cybersecurity Compliance Mandates and CMMC Training Options</li>
            <li>Defense Contract Audit Agency Support for Small & Medium-Size Contractors</li>
          </ul>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center font-gotham text-slate-700 mt-6 mb-2">
          What to Expect
        </h2>
        <p className="mb-4 max-w-6xl mx-auto text-center">
          The <b>2025 Navy & Marine Corps Procurement Conference</b> will allow you to meet Program Managers, Contracting Officers, and Small Business Program Directors from key Navy and Marine Corps Bases & Commands, as well as Army, Air Force, and Space Force Commands. You’ll also engage with leading Prime Defense Contractors actively seeking new partners and Subcontractors. Whether you're looking to forge strategic alliances, expand your network, or secure new business opportunities, this event is your gateway to success in the Defense industry. Don’t miss your chance to be part of this high-impact networking experience!
        </p>
      </div>
    ),
    aboutEventText: (
      <div className="max-container font-light">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center font-gotham text-slate-700 mb-6">
          Event Overview
        </h2>
        <p className="mb-0 leading-9">
          Join us for the <b>2025 Navy & Marine Corps Procurement Conference</b> on July 29-30, 2025 in Norfolk, Virginia, home to Naval Station Norfolk and Norfolk Naval Shipyard. This is your opportunity to engage directly with decision-makers from the Pentagon, Navy and Marine Corps Bases and Commands, and leading Prime Defense Contractors. Don't miss your chance to network with Industry Leaders and Government Experts and gain critical information into current procurement needs and upcoming contracting opportunities by registering to attend.
        </p>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center font-gotham text-slate-700 mt-6 mb-2">
          What to Expect
        </h2>
        <p className="mb-4 max-w-6xl mx-auto text-center">
          The <b>2025 Navy & Marine Corps Procurement Conference</b> will allow you to meet Program Managers, Contracting Officers, and Small Business Program Directors from key Navy and Marine Corps Bases & Commands, as well as Army, Air Force, and Space Force Commands. You’ll also engage with leading Prime Defense Contractors actively seeking new partners and Subcontractors. Whether you're looking to forge strategic alliances, expand your network, or secure new business opportunities, this event is your gateway to success in the Defense industry. Don’t miss your chance to be part of this high-impact networking experience!
        </p>
      </div>
    ),
    topicalCoverage: [
      { "tagline": "Navy's Critical Maintenance & Repair and Shipbuilding Needs", "description": "Navy's urgent need for maintenance, repair, and new shipbuilding to ensure operational readiness and technological superiority" },
      { "tagline": "SIOP - Shipyard Infrastructure Optimization Plan - Driving $ Billions in Construction & Facility Support Contracts", "description": "Massive investments under the SIOP to upgrade facilities and boost Navy shipbuilding and repair capabilities" },
      { "tagline": "New Navy & Marine Corps Littoral Warfighting Requirements & Contracts", "description": "New operational needs and contracts focused on enhancing littoral (coastal) warfare capabilities for the Navy and Marine Corps" },
      { "tagline": "New Navy & Marine Corps Technology Initiatives", "description": "Cutting-edge technology advancements being pursued by the Navy and Marine Corps to modernize operations and capabilities" },
      { "tagline": "Upcoming Projects - NAVFAC, MARCORSYSCOM, and USACE", "description": "Upcoming infrastructure and development projects led by NAVFAC, MARCORSYSCOM, and USACE, with a focus on military needs" },
      { "tagline": "Military Base-Community Partnerships Driving Local Build Contracts", "description": "How partnerships between military bases and local communities are generating construction contracts for regional infrastructure development" },
      { "tagline": "Indo-Pacific ‘Pivot’ – Deployment & Logistics Challenges Driving Major New Acquisitions", "description": "Strategic 'Indo-Pacific Pivot,' emphasizing the logistical and deployment challenges that are shaping new defense acquisitions" },
      { "tagline": "Contracts Supporting U.S. Leadership in AI", "description": "Defense contracts aimed at advancing U.S. leadership in artificial intelligence technologies for military applications" },
      { "tagline": "The Surge in Autonomous/Unmanned Systems Development & Deployment", "description": "Rapid development and deployment of autonomous and unmanned systems in the military, with a focus on new contracts" },
      { "tagline": "Base & Installation Physical Security Upgrades", "description": "Initiatives and contracts aimed at upgrading physical security systems at military bases and installations to ensure safety and resilience" },
      { "tagline": "Major Command IT & Cyber Protection Contracts", "description": "Contracts focused on enhancing IT and cybersecurity protections for major military commands against growing cyber threats" },
      { "tagline": "Prime Defense Contractors — Subcontracting & Teaming Opportunities", "description": "Subcontracting and teaming opportunities for small and medium-sized businesses to work with prime defense contractors on large-scale projects" },
      { "tagline": "Accelerated Contracting Vehicles for Innovative Tech (DARPA, DIU, DEFENSEWERX)", "description": "Fast-tracked contracting vehicles like DARPA, DIU, and DEFENSEWERX are enabling the acquisition of cutting-edge defense technologies" },
      { "tagline": "How to Access GWACs (Government-Wide Acquisition Contracts)", "description": "How contractors can navigate and access Government-Wide Acquisition Contracts (GWACs) for defense and federal opportunities" },
      { "tagline": "Mentor-Protégé Programs as Business Accelerators for Smalls & Primes", "description": "How Mentor-Protégé programs help accelerate business growth for small businesses by pairing them with larger prime contractors" },
      { "tagline": "Cybersecurity Compliance Mandates and CMMC Training Options", "description": "New cybersecurity compliance requirements under CMMC and training resources available for contractors to meet these standards" },
      { "tagline": "Defense Contract Audit Agency Support for Small & Medium-Size Contractors", "description": "Role of the Defense Contract Audit Agency (DCAA) in providing audit support to help small and medium-sized contractors" }
    ],
    image: "2025NMCPC_wide.webp",
    slug: "2025-navy-marine-corps-procurement-conference",
    locationImage: "locations/temp_venue.webp",
    locationAddress: `111 Google Ave`,
    placeID: "ChIJBdD-jwuYuokRyjyu_hU0jUg",
    registerLink: "https://www.eventbrite.com/e/2025-navy-marine-corps-procurement-conference-tickets-1119534781669",

    matchmakingSessions: {
      signUpTime: "7:30 AM",
      sessionTime: "4:00 PM - 5:30 PM",
      date: "July 29",
      slotsPerHost: 9,
      sessionDurationMinutes: 10
    },
    countdownColour: "#1C2D3D",
    expectationsText: `The <b>2025 Navy & Marine Corps Procurement Conference</b> will allow you to meet Program Managers, Contracting Officers, and Small Business Program Directors from key Navy and Marine Corps Bases & Commands, as well as Army, Air Force, and Space Force Commands. You’ll also engage with leading Prime Defense Contractors actively seeking new partners and Subcontractors. Whether you're looking to forge strategic alliances, expand your network, or secure new business opportunities, this event is your gateway to success in the Defense industry. Don’t miss your chance to be part of this high-impact networking experience!`,
    parkingInfo: [
      {
        title: "",
        description: `
        <b>On-Site Parking</b> - Daily: $22.00
        </br>
        <b>Off-Site Parking</b> - Main Street Garage 0.1 Miles
        </br>
        <b>Valet</b> - Daily: $33.00`,
      },
    ],
    directions: [
      {
        title: "NORTH",
        description: `
          <ul class="list-decimal pl-4">
            <li>Take Highway 13 South to 64 East, to 264 West. Follow the Waterside Drive Exit.</li>
            <li>Take a right at second light onto Atlantic Street. Go down one block, take a left onto Main Street.</li>
            <li>The Marriott Hotel is immediately on the left.</li>
          </ul>
          `
      },
      {
        title: "SOUTH",
        description: `
        <ul class="list-decimal pl-4">
          <li>Take 95 North to the Emporia Exit.</li>
          <li>Go East on Highway 58 to 64 East (approximately 2 1/2 hours), to 264 West.</li>
          <li>Follow the Waterside Drive Exit.</li>
          <li>Take a right at second light onto Atlantic Street.</li>
          <li>Go down one block, take a left onto Main Street.</li>
          <li>The Marriott Hotel is immediately on the left.</li>
        </ul>
        `
      },
      {
        title: "EAST",
        description: `
        <ul class="list-decimal pl-4">
          <li>44 West to 264 West. Follow the Waterside Drive Exit.</li>
          <li>Take a right at second light onto Atlantic Street.</li>
          <li>Go down one Block, take a left onto Main Street.</li>
          <li>The Marriott Hotel is immediately on the left.</li>
        </ul>
        `
      },
      {
        title: "WEST",
        description: `
        <ul class="list-decimal pl-4">
          <li>64 East to 264 West. Follow the Waterside Drive Exit.</li>
          <li>Take a right at second light onto Atlantic Street.</li>
          <li>Go down one block, take a left onto Main Street.</li>
          <li>The Marriott Hotel is immediately on the left.</li>
        </ul>
        `
      },
    ]
  }];
