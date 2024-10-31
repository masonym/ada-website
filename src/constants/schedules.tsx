export const SCHEDULES = [
    {
        id: 1, // This should match the event ID from EVENTS
        schedule: [
            {
                date: "November 14th, 2024",
                items: [
                    {
                        time: "8:00 AM - 9:00 AM",
                        title: "Registration & Networking Breakfast",
                        // duration: "1 hour"
                        location: "Ballroom and Foyer",
                    },
                    {
                        time: "9:00 AM - 12:30 PM",
                        title: "General Sessions",
                        location: "Ballroom",
                        // duration: "3 hours 30 minutes",
                    },
                    {
                        time: "12:30 PM - 1:30 PM",
                        title: "Networking Lunch",
                        location: "Ballroom",
                        // duration: "1 hour",
                    },
                    {
                        time: "1:30 PM - 5:00 PM",
                        title: "General Sessions",
                        location: "Ballroom",
                        // duration: "3 hours 30 minutes",
                    },
                    {
                        time: "5:30 PM - 7:30 PM",
                        title: "Networking Reception",
                        location: "Fourth Estate Meeting Room"
                        // duration: "2 hours",
                    },

                ]
            },

        ]
        // sample:
        //   schedule: [
        //     {
        //       date: "September 24, 2024",
        //       items: [
        //         {
        //           time: "10:00 AM",
        //           title: "Registration",
        //           location: "Exhibit Hall A",
        //           duration: "510 mins"
        //         },
        //         {
        //           time: "12:30 PM",
        //           title: "Capability Briefing: DoD Fuze Integrated Product Team (IPT)",
        //           location: "Suite 1BCD",
        //           duration: "210 mins",
        //           speaker: {
        //             name: "Philip Gorman, Jr.",
        //             title: "Senior Consultant",
        //             affiliation: "Booz Allen Hamilton",
        //             photo: "/speakers/philip-gorman.png" // You'll need to add this image to your public folder
        //           },
        //           description: "Presentations from OSD and the Services on IPT topics to include industrial base analytic survey results, Fuze National Plan, and Small Business tools and assistance."
        //         },
        //         {
        //           time: "2:00 PM",
        //           title: "Capability Briefing",
        //           location: "Suite 2A-D",
        //           duration: "60 mins"
        //         },
        //         {
        //           time: "3:00 PM",
        //           title: "Capability Briefing",
        //           location: "Suite 2A-D",
        //           duration: "60 mins"
        //         }
        //       ]
        //     },
        //     {
        //       date: "September 25, 2024",
        //       items: [
        //         {
        //           time: "9:00 AM",
        //           title: "Keynote Address",
        //           location: "Main Hall",
        //           duration: "60 mins",
        //           speaker: {
        //             name: "John Doe",
        //             title: "Chief Technology Officer",
        //             affiliation: "Department of Defense",
        //             photo: "/speakers/john-doe.png" // You'll need to add this image to your public folder
        //           }
        //         },
        //         {
        //           time: "10:30 AM",
        //           title: "Panel Discussion: Future of Defense Technology",
        //           location: "Suite 3A-C",
        //           duration: "90 mins"
        //         },
        //         // Add more items for this day...
        //       ]
        //     },
        //     // Add more days as needed...
        //   ]
    },
    {
        id: 2,
        schedule: [
            {
                date: "March 17th, 2025",
                items: [
                    {
                        time: "3:00 PM - 6:00 PM",
                        title: "Exhibitor Set-up",
                    },
                ],
            },
            {
                date: "March 18th, 2025",
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
                        title: "Networking Lunch for Speakers, Sponsors, Exhibitors, and Attendees",
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
                        title: "VIP Networking Reception with Speakers, Sponsors, Exhibitors, and VIP Attendees",
                        // location: "Fourth Estate Meeting Room"
                    },

                ],
            },
            {
                date: "March 19th, 2025",
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
                date: "December 8th, 2024",
                items: [
                    {
                        time: "6:00 PM - 8:00 PM",
                        title: "Meet & Greet Bourbon Tasting with Astronauts",
                        location: "Zarrellas, 8801 Astronaut Blvd. Cape Canaveral, FL 32920",
                        sponsorLogo: '/events/2025DTIOS/sponsors/zarrellas.png'
                    },

                ],
            },
            {
                date: "December 9th, 2024",
                items: [
                    {
                        time: "10:00 AM - 10:30 AM",
                        title: "Overview – Exponential Space Sector Activity – The Commercial, Government & Defense Dimensions"
                    },
                    {
                        time: "10:30 AM - 11:15 AM",
                        title: "NASA & Space Force – Engaging the Innovative Private Sector"
                    },
                    {
                        time: "11:15 AM - 12:00 PM",
                        title: "Funding Space Industrialization – Space Industry Investment"
                    },
                    {
                        time: "12:00 PM - 12:30 PM",
                        title: "Manufacturing Opportunities in Space"
                    },
                    {
                        time: "12:30 PM - 1:15 PM",
                        title: "Lunch Networking Break"
                    },
                    {
                        time: "1:15 PM - 1:55 PM",
                        title: "Spaceport Infrastructure Needs – the State of Florida Role"
                    },
                    {
                        time: "1:55 PM - 2:30 PM",
                        title: "Attracting Local Tech Companies to the U.S. Space Enterprise"
                    },
                    {
                        time: "2:30 PM - 3:15 PM",
                        title: "U.S. Space Defense – Challenges & Imperatives"
                    },
                    {
                        time: "3:15 PM - 4:00 PM",
                        title: "Quantum & AI Driving New Frontiers in Space"
                    },
                    {
                        time: "4:00 PM - 4:30 PM",
                        title: "Cybersecurity – Protecting the Industrialization of Space"
                    },
                    {
                        time: "4:30 PM - 5:00 PM",
                        title: "Propulsion, Propellants & Fuels"
                    },
                    {
                        time: "5:00 PM - 5:30 PM",
                        title: "Space Asset Supply Chain Challenges"
                    },
                    {
                        time: "5:30 PM",
                        title: "Closing Comments"
                    }
                ]
            }
        ]
    }
    // Add more event schedules here...
];