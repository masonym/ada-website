export const REGISTRATION_TYPES = [
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
                earlyBirdPrice: 550,
                price: 395,
                earlyBirdDeadline: "2024-10-18T08:00:00Z",
                type: "paid",
                receptionPrice: "$450"
            },


            // Display table information moved to exhibitors.ts

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
                earlyBirdPrice: 550,
                price: 550,
                // earlyBirdDeadline: "2025-02-18T08:00:00Z",
                type: "paid",
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
                type: "complimentary",
                // availabilityInfo: "Limited availability."
            },

        ],
        addOns: [
            {
                title: "VIP Networking Reception",
                description: "The VIP Networking Reception is available to all Speakers, Sponsors, Exhibitors, VIP Attendee Passes, and Special Guests and will take place from 5:30 PM - 7:30 PM on March 11, 2025.",
                price: "+$100"
            },
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
                    {
                        formatted: [
                            { content: "Event Access: (1) Attendee Pass", bold: true },
                            { content: "Access to General Sessions", indent: 1 },
                            { content: "Access to Exhibit Area", indent: 1 },
                            { content: "Onsite Sign-up for Matchmaking Sessions", indent: 1 },
                            { content: "Breakfast & Buffet Lunch", indent: 1 },
                            { content: "Post-Event Access to Photos, Videos, and Speaker Presentation Slides", indent: 1 },
                        ]
                    }
                ],
                buttonText: "Register Now",
                price: 545,
                earlyBirdPrice: 495,
                earlyBirdDeadline: "2025-07-11T04:00:00Z", // midnight ET on July 11th
                type: "paid",
                saleEndTime: "2025-07-20T16:00:00Z", // noon ET on July 30th
            },

            {
                id: "vip-attendee-pass",
                title: "VIP Attendee Pass",
                headerImage: "vip-attendee-pass.webp",
                perks: [
                    {
                        formatted: [
                            { content: "Event Access: (1) VIP Attendee Pass", bold: true },
                            { content: "Access to General Sessions", indent: 1 },
                            { content: "Access to Exhibit Area", indent: 1 },
                            { content: "Onsite Sign-up for Matchmaking Sessions", indent: 1 },
                            { content: "Breakfast & Buffet Lunch", indent: 1 },
                            { content: "Post-Event Access to Photos, Videos, and Speaker Presentation Slides", indent: 1 },
                            { content: "Access to VIP Networking Reception on July 29, 2025 from 6:00 PM - 8:00 PM", bold: true },
                        ]
                    }
                ],
                buttonText: "Register Now",
                price: 600,
                earlyBirdPrice: 550,
                earlyBirdDeadline: "2025-07-11T04:00:00Z", // midnight ET on July 11th
                type: "paid",
                saleEndTime: "2025-07-24T04:00:20.000Z",
            },


            {
                id: "govt-official-military-pass",
                title: "Government Official & Military Pass",
                headerImage: "gov-pass.webp",
                perks: [
                    {
                        formatted: [
                            { content: "Event Access: (1) Attendee Pass", bold: true },
                            { content: "Access to General Sessions", indent: 1 },
                            { content: "Access to Exhibit Area", indent: 1 },
                            { content: "Onsite Sign-up for Matchmaking Sessions", indent: 1 },
                            { content: "Post-Event Access to Photos, Videos, and Speaker Presentation Slides", indent: 1 },
                        ]
                    }
                ],
                buttonText: "Register Now",
                type: "complimentary",
                price: "Complimentary",
                // availabilityInfo: "Limited availability."
            },
            {
                id: "reception-add-on",
                title: "VIP Networking Reception Add-On",
                description: "Exclusive add-on pass. Requires special access code to register.",
                price: 100,
                headerImage: "vip-reception.webp",
                buttonText: "Add to Cart",
                type: "paid",
                requiresCode: true,  // New property
                validationCode: "RECEPTION0729",  // The required code
                maxQuantityPerOrder: 5,
                saleEndTime: "2025-07-30T04:00:00.000Z",
                perks: [
                    "Access to VIP Networking Reception on July 29, 2025 from 6:00 PM - 8:00 PM"
                ],
                availabilityInfo: "Access code required."

            }
        ],
    },
    {
        id: 5,
        registrations: [
            {
                id: "attendee-pass",
                title: "Attendee Pass",
                headerImage: "attendee-pass.webp",
                perks: [
                    {
                        formatted: [
                            { content: "Event Access: (1) Attendee Pass", bold: true },
                            { content: "Access to General Sessions", indent: 1 },
                            { content: "Access to Exhibit Area", indent: 1 },
                            { content: "Onsite Sign-up for Matchmaking Sessions", indent: 1 },
                            { content: "Breakfast & Buffet Lunch", indent: 1 },
                            { content: "Post-Event Access to Photos, Videos, and Speaker Presentation Slides", indent: 1 },
                        ]
                    }
                ],
                buttonText: "Register Now",
                price: 545,
                earlyBirdPrice: 495,
                earlyBirdDeadline: "2026-02-03T04:00:00Z", // midnight ET on February 3rd
                type: "paid",
            },

            {
                id: "vip-attendee-pass",
                title: "VIP Attendee Pass",
                headerImage: "vip-attendee-pass.webp",
                perks: [
                    {
                        formatted: [
                            { content: "Event Access: (1) VIP Attendee Pass", bold: true },
                            { content: "Access to General Sessions", indent: 1 },
                            { content: "Access to Exhibit Area", indent: 1 },
                            { content: "Onsite Sign-up for Matchmaking Sessions", indent: 1 },
                            { content: "Breakfast & Buffet Lunch", indent: 1 },
                            { content: "Post-Event Access to Photos, Videos, and Speaker Presentation Slides", indent: 1 },
                            { content: "Access to VIP Networking Reception on March 4, 2026 from 6:30 PM - 8:30 PM", bold: true },
                        ]
                    }
                ],
                buttonText: "Register Now",
                price: 645,
                earlyBirdPrice: 595,
                earlyBirdDeadline: "2026-02-03T04:00:00Z", // midnight ET on February 3rd
                type: "paid",
            },
            {
                id: "govt-official-military-pass",
                title: "Government Official & Military Pass",
                headerImage: "gov-pass.webp",
                perks: [
                    {
                        formatted: [
                            { content: "Event Access: (1) Attendee Pass", bold: true },
                            { content: "Access to General Sessions", indent: 1 },
                            { content: "Access to Exhibit Area", indent: 1 },
                            { content: "Onsite Sign-up for Matchmaking Sessions", indent: 1 },
                            { content: "Post-Event Access to Photos, Videos, and Speaker Presentation Slides", indent: 1 },
                        ]
                    }
                ],
                buttonText: "Register Now",
                type: "complimentary",
                price: "Complimentary",
                // availabilityInfo: "Limited availability."
            },
        ],
    },
    {
        id: 6,
        registrations: [
            {
                id: "attendee-pass",
                title: "Attendee Pass",
                headerImage: "attendee-pass.webp",
                perks: [
                    {
                        formatted: [
                            { content: "Event Access: (1) Attendee Pass", bold: true },
                            { content: "Access to General Sessions", indent: 1 },
                            { content: "Access to Exhibit Area", indent: 1 },
                            { content: "Onsite Sign-up for Matchmaking Sessions", indent: 1 },
                            { content: "Breakfast & Buffet Lunch", indent: 1 },
                            { content: "Post-Event Access to Photos, Videos, and Speaker Presentation Slides", indent: 1 },
                        ]
                    }
                ],
                buttonText: "Register Now",
                price: 595,
                earlyBirdPrice: 545,
                earlyBirdDeadline: "2026-05-01T07:59:59Z", // May 1, 2026
                type: "paid",
            },

            {
                id: "vip-attendee-pass",
                title: "VIP Attendee Pass",
                headerImage: "vip-attendee-pass.webp",
                perks: [
                    {
                        formatted: [
                            { content: "Event Access: (1) VIP Attendee Pass", bold: true },
                            { content: "Access to General Sessions", indent: 1 },
                            { content: "Access to Exhibit Area", indent: 1 },
                            { content: "Onsite Sign-up for Matchmaking Sessions", indent: 1 },
                            { content: "Breakfast & Buffet Lunch", indent: 1 },
                            { content: "Post-Event Access to Photos, Videos, and Speaker Presentation Slides", indent: 1 },
                            { content: "Access to VIP Networking Reception", bold: true },
                        ]
                    }
                ],
                buttonText: "Register Now",
                price: 695,
                earlyBirdPrice: 645,
                earlyBirdDeadline: "2026-05-01T07:59:59Z", // May 1, 2026
                type: "paid",
            },


            {
                id: "govt-official-military-pass",
                title: "Government Official & Military Pass",
                headerImage: "gov-pass.webp",
                perks: [
                    {
                        formatted: [
                            { content: "Event Access: (1) Attendee Pass", bold: true },
                            { content: "Access to General Sessions", indent: 1 },
                            { content: "Access to Exhibit Area", indent: 1 },
                            { content: "Onsite Sign-up for Matchmaking Sessions", indent: 1 },
                            { content: "Post-Event Access to Photos, Videos, and Speaker Presentation Slides", indent: 1 },
                        ]
                    }
                ],
                buttonText: "Register Now",
                type: "complimentary",
                price: "Complimentary",
                // availabilityInfo: "Limited availability."
            },
        ],
    },
];
