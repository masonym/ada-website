export const REGISTRATION_TYPES = [
    // Test Event with Stripe - 2025TEST
    {
        id: 0, // Matches the event ID
        registrations: [
            {
                title: "Attendee Pass",
                headerImage: "standard-pass.webp",
                perks: [
                    "(1) Attendee Pass",
                    "Access to General Sessions",
                    "Access to Exhibit Area",
                    "Onsite Sign-up for Matchmaking Sessions",
                    "Breakfast & Buffet Lunch",
                    "Post-Event Access to Photos, Videos, and Speaker Presentation Slides",
                ],
                buttonText: "Register Now",
                earlyBirdPrice: 79.99,
                price: 99.99,
                earlyBirdDeadline: "2025-11-15T23:59:59Z",
                type: 'paid' as const,
                id: 'test-attendee',
                name: 'Attendee Pass',
                description: 'Standard registration for the test event',
                isActive: true,
                requiresAttendeeInfo: true,
                maxQuantityPerOrder: 5,
                isGovtFreeEligible: true
            },
            {
                title: "VIP Attendee Pass",
                headerImage: "vip-pass.webp",
                perks: [
                    "(1) VIP Attendee Pass",
                    "Access to General Sessions",
                    "Access to Exhibit Area",
                    "Onsite Sign-up for Matchmaking Sessions",
                    "Breakfast & Buffet Lunch",
                    "Post-Event Access to Photos, Videos, and Speaker Presentation Slides",
                    "<b>Access to VIP Networking Reception on July 29, 2025 from 5:30 PM - 7:30 PM</b>",
                ],
                buttonText: "Register Now",
                earlyBirdPrice: 149.99,
                price: 199.99,
                earlyBirdDeadline: "2025-11-15T23:59:59Z",
                type: 'paid' as const,
                id: 'test-vip',
                name: 'VIP Attendee Pass',
                description: 'VIP registration with exclusive benefits',
                isActive: true,
                requiresAttendeeInfo: true,
                maxQuantityPerOrder: 2,
                isGovtFreeEligible: false
            },
            {
                title: "Table-Top Exhibit Space",
                headerImage: "exhibit-table-pass.webp",
                perks: [
                    "(1) Exhibitor Pass",
                    "Additional Passes can be purchased for $395 each",
                    "<b>8'x10' Exhibit Space in Exhibit Area/Foyer. 6' Exhibit Table and Chairs</b>",
                    "Post-Event Access to Photos, Videos, and Speaker Presentation Slides",
                    "Access to VIP Networking Reception on July 29, 2025 from 5:30 PM - 7:30 PM",
                ],
                buttonText: "Register Now",
                earlyBirdPrice: 1250,
                price: 1500,
                earlyBirdDeadline: "2025-01-18T08:00:00Z",
                type: 'paid' as const,
                id: 'test-exhibit',
                name: 'Table-Top Exhibit Space',
                description: 'Exhibitor registration with table-top space',
                isActive: true,
                requiresAttendeeInfo: true,
                maxQuantityPerOrder: 1,
                isGovtFreeEligible: false
            },
            {
                title: "Government Official & Military Pass",
                headerImage: "gov-pass.webp",
                perks: [
                    "(1) Attendee Pass",
                    "Access to General Sessions",
                    "Access to Exhibit Area",
                    "Onsite Sign-up for Matchmaking Sessions",
                    "Breakfast & Buffet Lunch",
                    "Post-Event Access to Photos, Videos, and Speaker Presentation Slides",
                ],
                buttonText: "Register Now",
                type: 'complimentary' as const,
                id: 'test-govt',
                name: 'Government Official & Military Pass',
                description: 'Complimentary pass for government officials and military personnel',
                price: "Complimentary",
                isActive: true,
                quantityAvailable: 50,
                requiresAttendeeInfo: true,
            },
        ]
    },
    // 2025 Defense Industry Forecast - DIF2025
    {
        id: 1,
        registrations: [
            {
                title: "Attendee Pass",
                headerImage: "attendee-pass.webp",
                perks: [
                    "Registration for 1 Person",
                    "Access to All Event Sessions",
                    "Speaker Presentations and Materials",
                    "Digital/Physical Copies of Agenda",
                    "Buffet Lunch",
                    "Access to Photos & Videos from Conference",
                ],
                buttonText: "Register Now",
                buttonLink: "https://www.eventbrite.com/e/2025-defense-industry-forecast-tickets-997306910817",
                earlyBirdPrice: 550,
                price: 395,
                earlyBirdDeadline: "2024-10-18T08:00:00Z",
                type: "paid",
                receptionPrice: "$450"
            },


            // display table
            {
                title: "Display Table",
                headerImage: "display-table-pass.webp",
                perks: [
                    "Registration for 2 People",
                    "2 Networking Reception Tickets",
                    "6' Display Table in General Session",
                    "Access to All Event Sessions",
                    "Speaker Presentations and Materials",
                    "Digital/Physical Copies of Agenda",
                    "Buffet Lunch",
                    "Access to Photos & Videos from Conference",
                    "Use code ADDITIONAL to Register 2nd Attendee"
                ],
                buttonText: "Register Now",
                buttonLink: "https://www.eventbrite.com/e/2025-defense-industry-forecast-tickets-997306910817",
                // earlyBirdPrice: 550,
                price: 1000,
                // earlyBirdDeadline: "2024-10-18T08:00:00Z",
                type: "paid"
            },

            {
                title: "Government Official & Military Pass",
                headerImage: "gov-pass.webp",
                perks: [
                    "Registration for 1 Person",
                    "Access to All Event Sessions",
                    "Speaker Presentations and Materials",
                    "Digital/Physical Copies of Agenda",
                    "Buffet Lunch",
                    "Access to Photos & Videos from Conference",
                ],
                buttonText: "Register Now",
                buttonLink: "https://www.eventbrite.com/e/2025-defense-industry-forecast-tickets-997306910817",
                type: "complimentary",
                availabilityInfo: "Limited availability."
            },
            {
                title: "Sponsorship Opportunities",
                headerImage: "sponsor-pass.webp",
                perks: [
                    "Brand Visibility",
                    "Speaking Opportunity",
                    "Recognition",
                    "<i>Reception Hosting</i> (Premier)",
                    "<i>Luncheon Hosting </i>(Prestige)",
                    "Display Table",
                    "Event Access",
                    "Media Coverage",
                ],
                buttonText: "Explore Sponsorship Opportunities",
                buttonLink: `2025-defense-industry-forecast/sponsors-exhibitors/sponsorship-opportunities`,
                type: "sponsor",
                availabilityInfo: "Limited availability."
            },
        ],
        addOns: [
            // {
            //     title: "Networking Reception",
            //     description: "Join us for an exclusive evening networking event from 5:30 PM - 7:30 PM",
            //     price: "+$100"
            // }
        ]

    },
    {
        id: 2,
        registrations: [
            {
                title: "Attendee Pass",
                headerImage: "attendee-pass.webp",
                perks: [
                    "(1) Attendee Pass",
                    "Access to General Sessions",
                    "Access to Exhibit Area",
                    "Onsite Sign-up for Matchmaking Sessions",
                    "Breakfast & Buffet Lunch",
                    "Post-Event Access to Photos, Videos, and Speaker Presentation Slides",
                ],
                buttonText: "Register Now",
                buttonLink: "https://www.eventbrite.com/e/2025-southeast-defense-procurement-conference-registration-1059452313389",
                earlyBirdPrice: 550,
                price: 495,
                // earlyBirdDeadline: "2025-02-18T08:00:00Z",
                type: "paid",
                // receptionPrice: "$550"
            },

            {
                title: "VIP Attendee Pass",
                headerImage: "vip-attendee-pass.webp",
                perks: [
                    "(1) VIP Attendee Pass",
                    "Access to General Sessions",
                    "Access to Exhibit Area",
                    "Onsite Sign-up for Matchmaking Sessions",
                    "Breakfast & Buffet Lunch",
                    "Post-Event Access to Photos, Videos, and Speaker Presentation Slides",
                    "<b>Access to VIP Networking Reception on March 11, 2025 from 5:30 PM - 7:30 PM</b>",
                ],
                buttonText: "Register Now",
                buttonLink: "https://www.eventbrite.com/e/2025-southeast-defense-procurement-conference-registration-1059452313389",
                earlyBirdPrice: 550,
                price: 550,
                // earlyBirdDeadline: "2025-02-18T08:00:00Z",
                type: "paid",
            },

            {
                title: "Table-Top Exhibit Space",
                headerImage: "exhibit-table-pass.webp",
                perks: [
                    "(1) Exhibitor Pass",
                    "Additional Passes can be purchased for $395 each",
                    "<b>8'x10' Exhibit Space in Exhibit Area/Foyer. 6' Exhibit Table and Chairs</b>",
                    "Post-Event Access to Photos, Videos, and Speaker Presentation Slides",
                    "Access to VIP Networking Reception on March 11, 2025 from 5:30 PM - 7:30 PM",
                ],
                buttonText: "Register Now",
                buttonLink: "https://www.eventbrite.com/e/2025-southeast-defense-procurement-conference-registration-1059452313389",
                earlyBirdPrice: 1250,
                price: 1500,
                earlyBirdDeadline: "2025-01-18T08:00:00Z",
                type: "paid"
            },

            {
                title: "Government Official & Military Pass",
                headerImage: "gov-pass.webp",
                perks: [
                    "(1) Attendee Pass",
                    "Access to General Sessions",
                    "Access to Exhibit Area",
                    "Onsite Sign-up for Matchmaking Sessions",
                    "Breakfast & Buffet Lunch",
                    "Post-Event Access to Photos, Videos, and Speaker Presentation Slides",
                ],
                buttonText: "Register Now",
                buttonLink: "https://www.eventbrite.com/e/2025-southeast-defense-procurement-conference-registration-1059452313389",
                type: "complimentary",
                // availabilityInfo: "Limited availability."
            },

            // {
            //     title: "Sponsor",
            //     headerImage: "sponsor-pass.webp",
            //     perks: [
            //         "Brand Visibility",
            //         "Speaking Opportunity",
            //         "Recognition",
            //         "<i>Reception Hosting</i> (Premier)",
            //         "<i>Luncheon Hosting </i>(Prestige)",
            //         "Display Table",
            //         "Event Access",
            //         "Media Coverage",
            //     ],
            //     subtitle: "Includes:",
            //     buttonText: "Explore Sponsorship Opportunities",
            //     buttonLink: `2025-southeast-defense-procurement-conference/about/sponsor`,
            //     type: "sponsor",
            //     availabilityInfo: "Limited availability."
            // },
        ],
        addOns: [
            {
                title: "VIP Networking Reception",
                description: "The VIP Networking Reception is available to all Speakers, Sponsors, Exhibitors, VIP Attendee Passes, and Special Guests and will take place from 5:30 PM - 7:30 PM on March 11, 2025.",
                price: "+$100"
            },
            // {
            //     title: "Networking Reception",
            //     description: "Join us for an exclusive evening networking
        ],
    },
    {
        id: 3,
        registrations: [
            {
                title: "Attendee Pass",
                headerImage: "attendee-pass.webp",
                perks: [
                    "(1) Attendee Pass",
                    "Access to General Sessions",
                    "(1) Complimentary Pass to the KSC's Visitor Center attractions",
                    "Meals",
                ],
                buttonText: "Register Now",
                buttonLink: "https://www.industrializing.space/product/attendee-pass/",
                earlyBirdPrice: 550,
                price: 299,
                earlyBirdDeadline: "2024-10-18T08:00:00Z",
                type: "paid",
            },
            {
                title: "Meet & Greet Bourbon Tasting with Astronauts Pass",
                headerImage: "bourbon-tasting-pass.webp",
                perks: [
                    "Mix and Mingle with our Guest Star Astronauts and other VIP Guests at Zarrella’s Italian & Wood Fired Pizza in Cape Canaveral, FL while Sampling Select Smooth Bourbons."
                ],
                buttonText: "Register Now",
                buttonLink: "https://www.industrializing.space/product/pass-to-meet-greet-bourbon-tasting-with-astronauts/",
                price: 100,
                type: "paid",
            },
            {
                title: "Sponsorship Opportunities",
                headerImage: "sponsors.webp",
                perks: [
                    "Event Access",
                    "Meet & Greet Bourbon Tasting with Astronauts",
                    "Speaking Opportunity",
                    "Exhibit Space: Table-Top Display",
                    "Brand Visibility",
                ],
                buttonText: "View Sponsorship Packages",
                buttonLink: "/events/2025-driving-the-industrialization-of-space/sponsors-exhibitors/sponsorship-opportunities",
                type: "sponsor",
            }
        ],
    },
    {
        id: 4,
        registrations: [
            {
                id: "attendee-pass",
                title: "Attendee Pass",
                headerImage: "attendee-pass.webp",
                perks: [
                    "(1) Attendee Pass",
                    "Access to General Sessions",
                    "Access to Exhibit Area",
                    "Onsite Sign-up for Matchmaking Sessions",
                    "Breakfast & Buffet Lunch",
                    "Post-Event Access to Photos, Videos, and Speaker Presentation Slides",
                ],
                buttonText: "Register Now",
                buttonLink: "https://www.eventbrite.com/e/2025-navy-marine-corps-procurement-conference-tickets-1119534781669",
                earlyBirdPrice: 550,
                price: 495,
                // earlyBirdDeadline: "2025-02-18T08:00:00Z",
                type: "paid",
                // receptionPrice: "$550"
            },

            {
                id: "vip-attendee-pass",
                title: "VIP Attendee Pass",
                headerImage: "vip-attendee-pass.webp",
                perks: [
                    "(1) VIP Attendee Pass",
                    "Access to General Sessions",
                    "Access to Exhibit Area",
                    "Onsite Sign-up for Matchmaking Sessions",
                    "Breakfast & Buffet Lunch",
                    "Post-Event Access to Photos, Videos, and Speaker Presentation Slides",
                    "<b>Access to VIP Networking Reception on July 29, 2025 from 5:30 PM - 7:30 PM</b>",
                ],
                buttonText: "Register Now",
                buttonLink: "https://www.eventbrite.com/e/2025-navy-marine-corps-procurement-conference-tickets-1119534781669",
                earlyBirdPrice: 550,
                price: 550,
                // earlyBirdDeadline: "2025-02-18T08:00:00Z",
                type: "paid",
            },

            {
                id: "table-top-exhibit-space",
                title: "Table-Top Exhibit Space",
                headerImage: "exhibit-table-pass.webp",
                perks: [
                    "(1) Exhibitor Pass",
                    "Additional Passes can be purchased for $395 each",
                    "<b>8'x10' Exhibit Space in Exhibit Area/Foyer. 6' Exhibit Table and Chairs</b>",
                    "Post-Event Access to Photos, Videos, and Speaker Presentation Slides",
                    "Access to VIP Networking Reception on July 29, 2025 from 5:30 PM - 7:30 PM",
                ],
                buttonText: "Register Now",
                buttonLink: "https://www.eventbrite.com/e/2025-navy-marine-corps-procurement-conference-tickets-1119534781669",
                earlyBirdPrice: 1250,
                price: 1250,
                earlyBirdDeadline: "2025-04-10T08:00:00Z",
                type: "paid"
            },

            {
                id: "govt-official-military-pass",
                title: "Government Official & Military Pass",
                headerImage: "gov-pass.webp",
                perks: [
                    "(1) Attendee Pass",
                    "Access to General Sessions",
                    "Access to Exhibit Area",
                    "Onsite Sign-up for Matchmaking Sessions",
                    "Breakfast & Buffet Lunch",
                    "Post-Event Access to Photos, Videos, and Speaker Presentation Slides",
                ],
                buttonText: "Register Now",
                buttonLink: "https://www.eventbrite.com/e/2025-navy-marine-corps-procurement-conference-tickets-1119534781669",
                type: "complimentary",
                // availabilityInfo: "Limited availability."
            },

            // {
            //     title: "Sponsor",
            //     headerImage: "sponsor-pass.webp",
            //     perks: [
            //         "Brand Visibility",
            //         "Speaking Opportunity",
            //         "Recognition",
            //         "<i>Reception Hosting</i> (Premier)",
            //         "<i>Luncheon Hosting </i>(Prestige)",
            //         "Display Table",
            //         "Event Access",
            //         "Media Coverage",
            //     ],
            //     subtitle: "Includes:",
            //     buttonText: "Explore Sponsorship Opportunities",
            //     buttonLink: `2025-southeast-defense-procurement-conference/about/sponsor`,
            //     type: "sponsor",
            //     availabilityInfo: "Limited availability."
            // },
        ],
        addOns: [
            {
                title: "VIP Networking Reception",
                description: "The VIP Networking Reception is available to all Speakers, Sponsors, Exhibitors, VIP Attendee Passes, and Special Guests and will take place from 5:30 PM - 7:30 PM on July 29, 2025.",
                price: "+$100"
            },
            // {
            //     title: "Networking Reception",
            //     description: "Join us for an exclusive evening networking
        ],
    },
];
