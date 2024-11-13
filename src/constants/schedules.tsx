export const SCHEDULES = [
    {
        id: 1, // This should match the event ID from EVENTS
        schedule: [
            {
                date: "November 14, 2024",
                items: [
                    {
                        time: "8:00 AM",
                        title: "On-Site Attendee Registration",
                        location: "Ballroom Pre-function"
                    },
                    {
                        time: "9:00 AM",
                        title: "Welcoming Remarks",
                        location: "National Press Club Ballroom",
                        speakers: [{
                            name: "Charles F. Sills",
                            title: "President & CEO",
                            affiliation: "American Defense Alliance",
                            photo: "/speakers/charles_sills.png"
                        }],
                    },
                    {
                        time: "9:10 AM",
                        title: "Congressional Keynote Address",
                        location: "National Press Club Ballroom",
                        speakers: [{
                            name: "Congressman Michael Waltz (6th District, Florida)",
                            title: "Chairman, Subcommittee on Readiness and Member, Subcommittee on Strategic Forces and Subcommittee on Intelligence and Operations, and Task Force on Critical Supply Chain, House Armed Services Committee; and Member, House Foreign Affairs Committee and Permanent Select Committee on Intelligence",
                            affiliation: "U.S. House of Representatives",
                            photo: "/speakers/michael_waltz.png"
                        }],
                    },
                    {
                        time: "9:45 AM",
                        title: "Artificial Intelligence — Impact on Defense Acquisition",
                        location: "National Press Club Ballroom",
                        speakers: [{
                            name: "Amir Bagherpour, PhD",
                            title: "Managing Director and Analytics & Visualization Lead for Data & AI",
                            affiliation: "Accenture Federal Services",
                            photo: "/speakers/amir_bagherpour.jpg",
                            presentation: "2025 Defense Industry Forecast - Amir Bagherpour, PhD.pdf",
                        }]
                    },
                    {
                        time: "10:15 AM",
                        title: "How To Do Business With The Primes I",
                        location: "National Press Club Ballroom",
                        speakers: [{
                            name: "Mark Correll, P.E.",
                            title: "Vice President, Federal Strategy Director",
                            affiliation: "HDR, Inc. (Former Deputy Assistant Secretary of the Air Force for Environment, Safety and Infrastructure)",
                            photo: "/speakers/mark_correll.png",
                            presentation: "2025 Defense Industry Forecast - Mark Correll, P.E..pdf",
                        }]
                    },
                    {
                        time: "10:45 AM",
                        title: "Defense Department Keynote Address",
                        location: "National Press Club Ballroom",
                        speakers: [{
                            name: "Honorable John P. (\"Sean\") Coffey",
                            title: "General Counsel",
                            affiliation: "Department of the Navy",
                            photo: "/speakers/john_coffey.png",
                        }]
                    },
                    {
                        time: "11:20 AM",
                        title: "Defense Dept. Small Business Programs",
                        location: "National Press Club Ballroom",
                        speakers: [
                            {
                                name: "Kimberly Diane Buehler",
                                title: "Director, Office of Small Business Programs (OSBP)",
                                affiliation: "U.S. Army, Department of Defense",
                                photo: "/speakers/kimberly_buhler.png",
                                presentation: "2025 Defense Industry Forecast - Kimberly Diane Buehler.pdf",
                            },
                            {
                                name: "Arveice Washington",
                                title: "Director, Office of Small Business Programs (OSBP)",
                                affiliation: "Office of the Secretary of the Navy",
                                photo: "/speakers/arveice_washington.jpg",
                            },
                            {
                                name: "Scott Kiser",
                                title: "Director, Office of Small Business Programs (OSBP)",
                                affiliation: "Office of the Secretary of the Air Force",
                                photo: "/speakers/scott_kiser.png",
                            }
                        ]
                    },
                    {
                        time: "12:15 PM",
                        title: "Ukraine — Report from the Front — and the Military Support Effort",
                        location: "National Press Club Ballroom",
                        speakers: [{
                            name: "Dr. Iryna Andrukh",
                            title: "Ukraine Program Director",
                            affiliation: "Progress Humanity (Formerly  Colonel in the Ukraine Army and Recipient of 4 Ukraine Presidential Medals of Honor)",
                            photo: "/speakers/iryna_andrukh.png"
                        }]
                    },
                    {
                        time: "12:45 PM",
                        title: "Lunch Networking Break",
                        location: "National Press Club Ballroom"
                    },
                    {
                        time: "1:30 PM",
                        title: "Defense Budget Analysis & Highlights",
                        location: "National Press Club Ballroom",
                        speakers: [{
                            name: "Mark Cancian",
                            title: "Senior Advisor, International Security Program",
                            affiliation: "Center for Strategic and International Studies (CSIS)",
                            photo: "/speakers/mark_cancian.jpg"
                        }]
                    },
                    {
                        time: "2:00 PM",
                        title: "Transatlantic Defense Partnerships to Strengthen Industrial Resilience",
                        location: "National Press Club Ballroom",
                        speakers: [{
                            name: "His Royal Highness, Brigadier General Prince Joachim, Prince of Denmark",
                            title: "Danish Military Industry Attaché",
                            affiliation: "Royal Embassy of Denmark",
                            photo: "/speakers/joachim_christian.png"
                        }]
                    },
                    {
                        time: "2:30 PM",
                        title: "Defense Department 'Innovation Hubs' — Champions for Innovative Small Business",
                        location: "National Press Club Ballroom",
                        speakers: [{
                            name: "Brian Liesveld",
                            title: "Chief Executive Officer",
                            affiliation: "DEFENSEWERX",
                            photo: "/speakers/brian_liesveld.jpg"
                        }]
                    },
                    {
                        time: "3:00 PM",
                        title: "Army Corps of Engineers — Acquisition Plans & Upcoming Projects",
                        location: "National Press Club Ballroom",
                        speakers: [{
                            name: "David Morrow",
                            title: "Acting Director, Military Programs",
                            affiliation: "U.S. Army Corps of Engineers",
                            photo: "/speakers/david_morrow.png"
                        }]
                    },
                    {
                        time: "3:30 PM",
                        title: "Strategies for Accessing Major GWACs (Government-Wide Acquisition Contracts)",
                        location: "National Press Club Ballroom",
                        speakers: [{
                            name: "Patricia Waddell",
                            title: "Director, Office of IT Services",
                            affiliation: "Information Technology Category (ITC), Federal Acquisition Service (FAS), U.S. General Services Administration (GSA)",
                            photo: "/speakers/patricia_waddell.png"
                        }]
                    },
                    {
                        time: "4:00 PM",
                        title: "Military Base-Community Partnership Programs",
                        location: "National Press Club Ballroom",
                        speakers: [{
                            name: "Dave Leinberger",
                            title: "Acting Director, Army Partnerships",
                            affiliation: "Deputy Chief of Staff, G-9 (Installations)",
                            photo: "/speakers/dave_leinberger.png"
                        }]
                    },
                    {
                        time: "4:30 PM",
                        title: "NAVFAC Opportunities Briefing",
                        location: "National Press Club Ballroom",
                        speakers: [{
                            name: "Bianca Henderson",
                            title: "Director, Office of Small Business Programs (OSBP)",
                            affiliation: "Naval Facilities Engineering Systems Command (NAVFAC)",
                            photo: "/speakers/bianca_henderson.png"
                        }]
                    },
                    {
                        time: "5:00 PM",
                        title: "How To Do Business With The Primes II",
                        location: "National Press Club Ballroom",
                        speakers: [{
                            name: "David Canada",
                            title: "Director, Global Supplier Diversity",
                            affiliation: "Boeing Defense Space & Security",
                            photo: "/speakers/david_canada.png"
                        }]
                    },
                    {
                        time: "5:15 PM",
                        title: "Closing Remarks",
                        location: "National Press Club Ballroom",
                        speakers: [{
                            name: "Charles F. Sills",
                            title: "President & CEO",
                            affiliation: "American Defense Alliance",
                            photo: "/speakers/charles_sills.png"
                        }],
                    },
                    {
                        time: "5:30 PM - 7:30 PM",
                        title: "VIP Networking Reception",
                        description: "Invitation Only: VIP Attendees, Exhibitors, Sponsors, Speakers, and invited guests",
                        location: "Fourth Estate Meeting Room"
                    }
                ]
            }

        ]
    },
    {
        id: 2,
        schedule: [
            {
                date: "March 17, 2025",
                items: [
                    {
                        time: "3:00 PM - 6:00 PM",
                        title: "Exhibitor Set-up",
                    },
                ],
            },
            {
                date: "March 18, 2025",
                items: [
                    {
                        time: "7:30 AM - 8:30 AM",
                        title: "Registration & Networking Breakfast, On-Site Sign-up for Matchmaking Sessions",
                        // location: "Ballroom and Foyer",
                    },
                    {
                        time: "8:30 AM - 10:00 AM",
                        title: "General Sessions",
                        // location: "Ballroom",
                    },
                    {
                        time: "10:00 AM - 10:15 AM",
                        title: "Networking Break",
                        // location: "Fourth Estate Meeting Room"
                    },
                    {
                        time: "10:15 AM - 12:30 PM",
                        title: "General Sessions",
                        // location: "Ballroom",
                    },
                    {
                        time: "12:30 PM - 1:30 PM",
                        title: "Networking Lunch for speakerss, Sponsors, Exhibitors, and Attendees",
                        // location: "Ballroom",
                    },
                    {
                        time: "1:30 PM - 3:00 PM",
                        title: "General Sessions",
                        // location: "Ballroom",
                    },
                    {
                        time: "3:00 PM - 3:15 PM",
                        title: "Networking Break",
                        // location: "Fourth Estate Meeting Room"
                    },
                    {
                        time: "3:15 PM - 4:00 PM",
                        title: "General Sessions",
                        // location: "Ballroom",
                    },
                    {
                        time: "4:00 PM - 5:30 PM",
                        title: "Matchmaking Sessions",
                        // location: "Fourth Estate Meeting Room"
                    },
                    {
                        time: "5:30 PM - 7:30 PM",
                        title: "VIP Networking Reception with speakerss, Sponsors, Exhibitors, and VIP Attendees",
                        // location: "Fourth Estate Meeting Room"
                    },

                ],
            },
            {
                date: "March 19, 2025",
                items: [
                    {
                        time: "7:30 AM - 8:30 AM",
                        title: "Registration & Networking Breakfast, On-Site Signup for Matchmaking Sessions",
                        // location: "Ballroom and Foyer",
                    },
                    {
                        time: "8:30 AM - 10:30 AM",
                        title: "General Sessions",
                        // location: "Ballroom",
                    },
                    {
                        time: "10:30 AM - 10:45 AM",
                        title: "Networking Break",
                        // location: "Fourth Estate Meeting Room"
                    },
                    {
                        time: "10:45 AM - 12:00 PM",
                        title: "General Sessions",
                        // location: "Ballroom",
                    },
                ],
            }

        ]
    },
    {
        id: 3,
        schedule: [
            {
                date: "December 8, 2024",
                items: [
                    {
                        time: "6:00 PM - 8:00 PM",
                        title: "Meet & Greet Bourbon Tasting with Astronauts",
                        location: "Zarrellas, 8801 Astronaut Blvd. Cape Canaveral, FL 32920",
                        sponsorLogo: '/events/2025DTIOS/sponsors/zarrellas.png',
                        description: "(Add-On Registration and Payment is Required for this Event)"
                    },

                ],
            },
            {
                date: "December 9, 2024",
                items: [
                    {
                        time: "10:00 AM - 10:30 AM",
                        title: "Overview – Exponential Space Sector Activity – The Commercial, Government & Defense Dimensions",
                        location: "The Center for Space Education at the Astronauts Memorial Foundation"
                    },
                    {
                        time: "10:30 AM - 11:15 AM",
                        title: "NASA & Space Force – Engaging the Innovative Private Sector",
                        location: "The Center for Space Education at the Astronauts Memorial Foundation"
                    },
                    {
                        time: "11:15 AM - 12:00 PM",
                        title: "Funding Space Industrialization – Space Industry Investment",
                        location: "The Center for Space Education at the Astronauts Memorial Foundation"
                    },
                    {
                        time: "12:00 PM - 12:30 PM",
                        title: "Manufacturing Opportunities in Space",
                        location: "The Center for Space Education at the Astronauts Memorial Foundation"
                    },
                    {
                        time: "12:30 PM - 1:15 PM",
                        title: "Lunch Networking Break",
                        location: "The Center for Space Education at the Astronauts Memorial Foundation"
                    },
                    {
                        time: "1:15 PM - 1:55 PM",
                        title: "Spaceport Infrastructure Needs",
                        location: "The Center for Space Education at the Astronauts Memorial Foundation"
                    },
                    {
                        time: "1:55 PM - 2:30 PM",
                        title: "Attracting Local Tech Companies to the U.S. Space Enterprise",
                        location: "The Center for Space Education at the Astronauts Memorial Foundation"
                    },
                    {
                        time: "2:30 PM - 3:15 PM",
                        title: "U.S. Space Defense – Challenges & Imperatives",
                        location: "The Center for Space Education at the Astronauts Memorial Foundation"
                    },
                    {
                        time: "3:15 PM - 4:00 PM",
                        title: "Quantum & AI Driving New Frontiers in Space",
                        location: "The Center for Space Education at the Astronauts Memorial Foundation"
                    },
                    {
                        time: "4:00 PM - 4:30 PM",
                        title: "Cybersecurity – Protecting the Industrialization of Space",
                        location: "The Center for Space Education at the Astronauts Memorial Foundation"
                    },
                    {
                        time: "4:30 PM - 5:00 PM",
                        title: "Propulsion, Propellants & Fuels",
                        location: "The Center for Space Education at the Astronauts Memorial Foundation"
                    },
                    {
                        time: "5:00 PM - 5:30 PM",
                        title: "Space Asset Supply Chain Challenges",
                        location: "The Center for Space Education at the Astronauts Memorial Foundation"
                    },
                    {
                        time: "5:30 PM",
                        title: "Closing Comments",
                        location: "The Center for Space Education at the Astronauts Memorial Foundation"
                    }
                ]
            }
        ]
    }
    // Add more event schedules here...
];