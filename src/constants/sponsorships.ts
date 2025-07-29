import { Sponsorship, SponsorshipTier } from '@/types/sponsorships';

export const SPONSORSHIP_TYPES: SponsorshipTier[] = [
    {
        id: 1,
        sponsorships: [
            {
                id: "premier-sponsor",
                title: "Premier",
                cost: 5000,
                sponsorPasses: 4,
                perks: [
                    { tagline: "Brand Visibility", description: "Prime logo placement on all conference materials, including banners, marketing emails, website, and programs" },
                    { tagline: "Speaking Opportunity", description: "An expanded speaking segment during the conference for a company principal" },
                    { tagline: "Recognition", description: "Acknowledgment during key moments of the conference, such as opening remarks" },
                    { tagline: "Reception Hosting", description: "Exclusive host of the <i>VIP Networking Reception</i>" },
                    { tagline: "Display Table", description: "Ability to host a company exhibit during the conference" },
                    { tagline: "Event Access", description: "(4) conference passes with reserved seating and (4) complimentary tickets to the VIP Networking Reception" },
                    { tagline: "Media Coverage", description: "Inclusion in press releases, promotional materials, social media mentions, and post- conference coverage" },
                ]
            },
            {
                id: "prestige-sponsor",
                title: "Prestige",
                cost: 3000,
                sponsorPasses: 3,
                perks: [
                    { tagline: "Brand Visibility", description: "Prominent logo placement on conference materials and signage" },
                    { tagline: "Speaking Opportunity", description: "A brief segment during the conference for a company principal" },
                    { tagline: "Recognition", description: "Acknowledgment during key moments of the conference, such as opening remarks" },
                    { tagline: "Luncheon Hosting", description: "Host of the <i>Networking Lunch</i>" },
                    { tagline: "Display Table", description: "Ability to host a company exhibit during the conference" },
                    { tagline: "Event Access", description: "(3) conference passes with reserved seating and (3) complimentary tickets to the VIP Networking Reception" },
                    { tagline: "Media Coverage", description: "Inclusion in select materials, social media mentions, and post-conference coverage" },
                ]
            },
            {
                id: "executive-sponsor",
                title: "Executive",
                cost: 1500,
                sponsorPasses: 2,
                perks: [
                    { tagline: "Brand Visibility", description: "Logo placement on select conference materials and signage" },
                    { tagline: "Recognition", description: "Acknowledgment during key moments of the conference, such as opening remarks" },
                    { tagline: "Display Table", description: "Ability to host a company exhibit during the conference" },
                    { tagline: "Event Access", description: "(2) conference passes with reserved seating and (2) complimentary tickets to the VIP Networking Reception" },
                    { tagline: "Media Coverage", description: "Basic inclusion in social media mentions or post-conference coverage" },
                ]
            },
        ]
    },
    {
        id: 2,
        sponsorships: [
            {
                id: "gold-sponsor",
                title: "Gold Sponsor",
                cost: 7000,
                sponsorPasses: 4,
                perks: [
                    { tagline: "Event Access", description: " (4) Sponsor Passes. Additional Passes can be Purchased for $395 each" },
                    { tagline: "Speaking Opportunity", description: "15-Minute Speaking Session for a Representative of your Company" },
                    // { tagline: "VIP Networking Reception Hosting", description: "Exclusive Host of the VIP Networking Reception on Day 1 of the Conference from 5:00 PM - 7:00 PM." },
                    { tagline: "VIP Introductions", description: "Strategic Introductions to Key Speakers and VIP Guests" },
                    { tagline: "Exhibit Space", description: "8'x10' Exhibit Space Strategically Placed in Exhibit Area/Foyer. 6' Exhibit Table and Chairs" },
                    { tagline: "Matchmaking Host", description: "Invitation to Host a One-on-One Matchmaking Session" },
                    { tagline: "Sponsor Spotlight Email", description: "(1) Promotional Email sent to all Registered Attendees Pre-Conference Highlighting your Capabilities" },
                    { tagline: "Brand Visibility", description: "Prime Logo Placement on all Conference Materials, including Banners, Marketing Emails, Website, and Programs" },
                    { tagline: "Recognition", description: "Acknowledgement during Key Moments of the Conference" },
                    { tagline: "Media Coverage", description: "Inclusion in Press Releases, Promotional Materials and Social Media Mentions. Photographs and Videos of your Participation" },
                ],
                colour: "#ffaf00",
                headerImage: "gold-sponsor.webp",
                buttonText: "Register Now",
                description: "Gold Sponsorship Package",
                isActive: true,
                requiresAttendeeInfo: false,
                maxQuantityPerOrder: 1,
                isGovtFreeEligible: false,
                shownOnRegistrationPage: true
            },
            {
                id: "silver-sponsor",
                title: "Silver Sponsor",
                cost: 5000,
                perks: [
                    { tagline: "Event Access", description: "(3) Sponsor Passes. Additional Passes can be Purchased for $395 each" },
                    { tagline: "Speaking Opportunity", description: "10-Minute Speaking Session for a Representative of your Company" },
                    // { tagline: "Networking Luncheon Hosting", description: "Host of the Networking Lunch on Day 1 of the Conference. Exclusive Signage around Lunch Buffet" },
                    { tagline: "Exhibit Space", description: "8'x10' Exhibit Space Strategically Placed in Exhibit Area/Foyer. 6' Exhibit Table and Chairs" },
                    { tagline: "Matchmaking Host", description: "Invitation to Host a One-on-One Matchmaking Session" },
                    { tagline: "Brand Visibility", description: " Prominent Logo Placement on all Conference Materials, including Banners, Marketing Emails, Website, and Programs" },
                    { tagline: "Recognition", description: "Acknowledgement during Key Moments of the Conference" },
                    { tagline: "Media Coverage", description: "Inclusion in Promotional Materials and Social Media Mentions. Photographs and Videos of your Participation" },
                ],
                colour: "#C0C0C0"
            },
            {
                id: "bronze-sponsor",
                title: "Bronze Sponsor",
                cost: 3000,
                perks: [
                    { tagline: "Event Access", description: "(2) Sponsor Passes. Additional Passes can be Purchased for $395 each" },
                    { tagline: "Speaking Opportunity", description: "5-Minute Speaking Session for a Representative of your Company" },
                    { tagline: "Exhibit Space", description: "8'x10' Exhibit Space in Exhibit Hall/Foyer. 6' Exhibit Table and Chairs" },
                    { tagline: "Matchmaking Host", description: "Invitation to Host a One-on-One Matchmaking Session" },
                    { tagline: "Brand Visibility", description: "Logo Placement on all Conference Materials, including Banners, Marketing Emails, Website, and Programs" },
                    { tagline: "Recognition", description: "Acknowledgement during Key Moments of the Conference" },
                    { tagline: "Media Coverage", description: " Inclusion in Social Media Mentions. Photographs and Videos of your Participation" },
                ],
                colour: "#CD7F32"
            },
            {
                id: "vip-networking-reception-sponsor",
                title: "VIP Networking Reception Sponsor",
                cost: 3500,
                sponsorPasses: 2,
                perks: [
                    { tagline: "Event Access", description: "(2) Sponsor Passes. Additional Passes can be Purchased for $395 each" },
                    { tagline: "VIP Networking Reception Hosting", description: "Exclusive Host of the VIP Networking Reception on March 11 from 5:30 PM - 7:30 PM" },
                    { tagline: "Speaking Opportunity", description: "Provide Welcoming Remarks at the VIP Networking Reception" },
                    { tagline: "Exhibit Space", description: "8'x10' Exhibit Space Strategically Placed in Exhibit Area/Foyer. 6' Exhibit Table and Chairs" },
                    { tagline: "Matchmaking Host", description: "Invitation to Host a One-on-One Matchmaking Session" },
                    { tagline: "Brand Visibility", description: "Prime Logo Placement on all Conference Materials, including Banners, Marketing Emails, Website, and Programs" },
                    { tagline: "Recognition", description: "Acknowledgement during Key Moments of the Conference" },
                    { tagline: "Media Coverage", description: "Inclusion in Promotional Materials and Social Media Mentions. Photographs and Videos of your Participation" },
                ],
                colour: "#3FB4E6"
            },
            {
                id: "networking-luncheon-sponsor",
                title: "Networking Luncheon Sponsor",
                cost: 2500,
                sponsorPasses: 2,
                perks: [
                    { tagline: "Event Access", description: "(2) Sponsor Passes. Additional Passes can be Purchased for $395 each" },
                    { tagline: "Networking Luncheon Hosting", description: "Host of the Networking Luncheon" },
                    { tagline: "Exhibit Space", description: "8'x10' Exhibit Space Strategically Placed in Exhibit Area/Foyer. 6' Exhibit Table and Chairs" },
                    { tagline: "Matchmaking Host", description: "Invitation to Host a One-on-One Matchmaking Session" },
                    { tagline: "Brand Visibility", description: "Prominent Logo Placement on all Conference Materials, including Banners, Marketing Emails, Website, and Programs" },
                    { tagline: "Recognition", description: "Acknowledgement during Key Moments of the Conference" },
                    { tagline: "Media Coverage", description: "Inclusion in Promotional Materials and Social Media Mentions. Photographs and Videos of your Participation" },
                ],
                colour: "#3FB4E6"
            },
            {
                id: "small-business-sponsor",
                title: "Small Business Sponsor",
                cost: 1500,
                sponsorPasses: 2,
                perks: [
                    { tagline: "Event Access", description: "(2) Sponsor Passes. Additional Passes can be Purchased for $395 each" },
                    { tagline: "Exhibit Space", description: ": 8'x10' Exhibit Space in Exhibit Hall/Foyer. 6' Exhibit Table and Chairs" },
                    { tagline: "Brand Visibility", description: "Logo Placement on all Conference Materials, including Banners, Marketing Emails, Website, and Programs" },
                    { tagline: "Recognition", description: "Acknowledgement during Key Moments of the Conference" },
                    { tagline: "Media Coverage", description: "Photographs and Videos of your Participation" },
                ],
            },
        ],
    },
    {
        id: 3,
        sponsorships: [
            {
                id: "gold-sponsor",
                title: "Gold Sponsor",
                cost: 10000,
                sponsorPasses: 3,
                perks: [
                    { tagline: "Speaking Opportunity", description: "8-Minute Audience Address" },
                    { tagline: "Event Access", description: "(3) Attendee Event Passes" },
                    { tagline: "Networking", description: "(3) Passes to Meet & Greet Bourbon Tasting with Astronauts" },
                    { tagline: "Exhibit Space", description: "Table-Top Display" },
                    { tagline: "Brand Visibility", description: "Logo on Event Marketing Materials and on Event Screen" },
                ],
                colour: "#ffaf00"
            },
            {
                id: "silver-sponsor",
                title: "Silver Sponsor",
                cost: 5000,
                perks: [
                    { tagline: "Speaking Opportunity", description: "3-Minute Audience Address" },
                    { tagline: "Event Access", description: "(2) Attendee Event Passes" },
                    { tagline: "Networking", description: "(2) Passes to Meet & Greet Bourbon Tasting with Astronauts" },
                    { tagline: "Exhibit Space", description: "Table-Top Display" },
                    { tagline: "Brand Visibility", description: "Logo on Event Marketing Materials and on Event Screen" },
                ],
                colour: "#C0C0C0"
            },
            {
                id: "bronze-sponsor",
                title: "Bronze Sponsor",
                cost: 3000,
                perks: [
                    { tagline: "Event Access", description: "(1) Attendee Event Pass" },
                    { tagline: "Networking", description: "(1) Pass to Meet & Greet Bourbon Tasting with Astronauts" },
                    { tagline: "Exhibit Space", description: "Table-Top Display" },
                    { tagline: "Brand Visibility", description: "Logo on Event Marketing Materials and on Event Screen" },
                ],
                colour: "#CD7F32"
            },
            {
                id: "meet-and-greet-sponsor",
                title: "Meet & Greet Bourbon Tasting with Astronauts",
                cost: 2000,
                sponsorPasses: 1,
                perks: [
                    { tagline: "Event Access", description: "(1) Attendee Event Pass" },
                    { tagline: "Networking", description: "(3) Passes to Meet & Greet Bourbon Tasting with Astronauts" },
                    { tagline: "Brand Visibility", description: "Logo on Event Marketing Materials and on Event Screen" },
                ],
            },
        ]
    },
    {
        id: 4,
        additionalPass: {
            name: 'Additional Sponsor Attendee Pass',
            title: 'Additional Sponsor Attendee Pass',
            description: 'For registered Sponsors. Purchase additional Sponsor passes for your team at a discounted rate. A valid order ID from a previous Exhibitor or Sponsor registration is required.',
            price: 395,
            headerImage: 'vip.webp',
            buttonText: 'Add',
            maxQuantityPerOrder: 10,
            perks: [
                { formatted: [
                    { content: "Event Access: (1) VIP Attendee Pass", bold: true },
                    { content: "Access to General Sessions", indent: 1 },
                    { content: "Access to Exhibit Area", indent: 1 },
                    { content: "Onsite Sign-up for Matchmaking Sessions", indent: 1 },
                    { content: "Breakfast & Buffet Lunch", indent: 1 },
                    { content: "Post-Event Access to Photos, Videos, and Speaker Presentation Slides", indent: 1 },
                    { content: "Access to VIP Networking Reception on July 29, 2025 from 6:00 PM - 8:00 PM", bold: true },
                ]},
            ],
        },
        primeSponsor:
        {
            id: "platinum-sponsor",
            title: "Platinum Sponsorship",
            cost: 10000,
            slotsPerEvent: 1,
            sponsorPasses: 5,
            requiresAttendeeInfo: true,
            perks: [
                { formatted: [
                    { content: "Event Access: (5) VIP Attendee Passes", bold: true },
                    { content: "Additional Sponsor Passes can be purchased for $395 each", indent: 1 }
                ]},
                { formatted: [
                    { content: "Exclusive Branding: Lanyards, Name Badges, and Conference Materials", bold: true },
                    { content: "Branded Lanyards used with all Attendee Name Badges (Sponsor Provided)", indent: 1 },
                    { content: "Company Logo prominently displayed on Attendee Name Badges", indent: 1 },
                    { content: "Prime Logo Placement on Conference Materials", indent: 1 },
                    { content: "Conference Pop-up Banners", indent: 2 },
                    { content: "Digital Agenda & Event Website", indent: 2 },
                    { content: "Marketing Emails & Printed Program", indent: 2 }
                ]},
                { formatted: [
                    { content: "Speaking Opportunity", bold: true },
                    { content: "20-Minute Speaking Opportunity during General Session", indent: 1 }
                ]},
                { formatted: [
                    { content: "Recognition/Visibility", bold: true },
                    { content: "Recognition during General Session & Networking Breaks", indent: 1 },
                    { content: "Sponsor Spotlight Email highlighting your Company's Capabilities to Attendees", indent: 1 },
                    { content: "Social Media Recognition", indent: 1 },
                    { content: "Photographs & Videos of your Participation", indent: 1 }
                ]},
                { formatted: [
                    { content: "Table-Top Exhibit Space", bold: true },
                    { content: "Priority Placement for your 8’x10’ Exhibit Space", indent: 1 },
                    { content: "6' Tablecloth Table & Chairs", indent: 2 },
                ]},
                { formatted: [
                    { content: "Matchmaking Host Invitation", bold: true },
                    { content: "Opportunity to Host a Matchmaking Table on either or both days", indent: 1 },
                    { content: "July 29: 4:30 PM - 5:30 PM", indent: 2 },
                    { content: "July 30: 12:30 PM - 1:30 PM", indent: 2 }
                ]}
            ],
            colour: "bg-sky-300",
            showRemaining: true,
        },

        sponsorships: [
            {
                id: "gold-sponsor",
                title: "Gold Sponsorship",
                cost: 7000,
                requiresAttendeeInfo: true,
                slotsPerEvent: 2,
                sponsorPasses: 4,
                perks: [
                    { formatted: [
                        { content: "Event Access: (4) VIP Attendee Passes", bold: true },
                        { content: "Additional Sponsor Passes can be purchased for $395 each", indent: 1 }
                    ]},
                    { formatted: [
                        { content: "Logo Branding: Conference Materials", bold: true },
                        { content: "Conference Pop-up Banners", indent: 1 },
                        { content: "Digital Agenda & Event Website", indent: 1 },
                        { content: "Marketing Emails & Printed Program", indent: 1 }
                    ]},
                    { formatted: [
                        { content: "Speaking Opportunity", bold: true },
                        { content: "15-Minute Speaking Opportunity during General Session", indent: 1 }
                    ]},
                    { formatted: [
                        { content: "Recognition/Visibility", bold: true },
                        { content: "Recognition during General Session & Networking Breaks", indent: 1 },
                        { content: "Social Media Recognition", indent: 1 },
                        { content: "Photographs & Videos of your Participation", indent: 1 }
                    ]},
                    { formatted: [
                        { content: "Table-Top Exhibit Space", bold: true },
                        { content: "Priority Placement for your 8’x10’ Exhibit Space", indent: 1 },
                        { content: "6' Tablecloth Table & Chairs", indent: 2 },
                    ]},
                    { formatted: [
                        { content: "Matchmaking Host Invitation", bold: true },
                        { content: "Opportunity to Host a Matchmaking Table on either or both days", indent: 1 },
                        { content: "July 29: 4:30 PM - 5:30 PM", indent: 2 },
                        { content: "July 30: 12:30 PM - 1:30 PM", indent: 2 }
                    ]}
                ],
                colour: "#ffaf00",
                showRemaining: true
            },
            {
                id: "silver-sponsor",
                title: "Silver Sponsorship",
                cost: 5000,
                requiresAttendeeInfo: true,
                slotsPerEvent: 3,
                sponsorPasses: 3,
                saleEndTime: "2025-07-26T04:00:20.000Z",
                perks: [
                    { formatted: [
                        { content: "Event Access: (3) VIP Attendee Passes", bold: true },
                        { content: "Additional Sponsor Passes can be purchased for $395 each", indent: 1 }
                    ]},
                    { formatted: [
                        { content: "Logo Branding: Conference Materials", bold: true },
                        { content: "Conference Pop-up Banners", indent: 1 },
                        { content: "Digital Agenda & Event Website", indent: 1 },
                        { content: "Marketing Emails & Printed Program", indent: 1 }
                    ]},
                    { formatted: [
                        { content: "Speaking Opportunity", bold: true },
                        { content: "10-Minute Speaking Opportunity during General Session", indent: 1 }
                    ]},
                    { formatted: [
                        { content: "Recognition/Visibility", bold: true },
                        { content: "Recognition during General Session & Networking Breaks", indent: 1 },
                        { content: "Social Media Recognition", indent: 1 },
                        { content: "Photographs & Videos of your Participation", indent: 1 }
                    ]},
                    { formatted: [
                        { content: "Table-Top Exhibit Space", bold: true },
                        { content: "Priority Placement for your 8’x10’ Exhibit Space", indent: 1 },
                        { content: "6' Tablecloth Table & Chairs", indent: 2 },
                    ]},
                    { formatted: [
                        { content: "Matchmaking Host Invitation", bold: true },
                        { content: "Opportunity to Host a Matchmaking Table on either or both days", indent: 1 },
                        { content: "July 29: 4:30 PM - 5:30 PM", indent: 2 },
                        { content: "July 30: 12:30 PM - 1:30 PM", indent: 2 }
                    ]}
                ],
                colour: "#C0C0C0",
                showRemaining: true
            },
            {
                id: "bronze-sponsor",
                title: "Bronze Sponsorship",
                cost: 3000,
                requiresAttendeeInfo: true,
                slotsPerEvent: 3,
                sponsorPasses: 2,
                saleEndTime: "2025-07-26T04:00:20.000Z",
                perks: [
                    { formatted: [
                        { content: "Event Access: (2) VIP Attendee Passes", bold: true },
                        { content: "Additional Sponsor Passes can be purchased for $395 each", indent: 1 }
                    ]},
                    { formatted: [
                        { content: "Logo Branding: Conference Materials", bold: true },
                        { content: "Conference Pop-up Banners", indent: 1 },
                        { content: "Digital Agenda & Event Website", indent: 1 },
                        { content: "Marketing Emails & Printed Program", indent: 1 }
                    ]},
                    { formatted: [
                        { content: "Speaking Opportunity", bold: true },
                        { content: "5-Minute Speaking Opportunity during General Session", indent: 1 }
                    ]},
                    { formatted: [
                        { content: "Recognition/Visibility", bold: true },
                        { content: "Recognition during General Session & Networking Breaks", indent: 1 },
                        { content: "Social Media Recognition", indent: 1 },
                        { content: "Photographs & Videos of your Participation", indent: 1 }
                    ]},
                    { formatted: [
                        { content: "Table-Top Exhibit Space", bold: true },
                        { content: "Priority Placement for your 8’x10’ Exhibit Space", indent: 1 },
                        { content: "6' Tablecloth Table & Chairs", indent: 2 },
                    ]},
                    { formatted: [
                        { content: "Matchmaking Host Invitation", bold: true },
                        { content: "Opportunity to Host a Matchmaking Table on either or both days", indent: 1 },
                        { content: "July 29: 4:30 PM - 5:30 PM", indent: 2 },
                        { content: "July 30: 12:30 PM - 1:30 PM", indent: 2 }
                    ]}
                ],
                colour: "#CD7F32",
                showRemaining: true
            },
            {
                id: "vip-networking-reception-sponsor",
                title: "VIP Networking Reception Sponsorship",
                cost: 3500,
                requiresAttendeeInfo: true,
                slotsPerEvent: 1,
                sponsorPasses: 2,
                saleEndTime: "2025-07-26T04:00:20.000Z",
                perks: [
                    { formatted: [
                        { content: "Event Access: (2) VIP Attendee Passes", bold: true },
                        { content: "Additional Sponsor Passes can be purchased for $395 each", indent: 1 }
                    ]},
                    { formatted: [
                        { content: "Logo Branding: Conference Materials", bold: true },
                        { content: "Conference Signage", indent: 1 },
                        { content: "Digital Agenda & Event Website", indent: 1 },
                        { content: "Marketing Emails & Printed Program", indent: 1 }
                    ]},
                    { formatted: [
                        { content: "Exclusive Host of the VIP Networking Reception", bold: true },
                        { content: "Provide Welcoming Remarks at the VIP Networking Reception", indent: 1 },
                        { content: "Logo Placement at VIP Networking Reception", indent: 1 },
                        { content: "Table Tents on VIP Networking Reception Tables", indent: 2 }
                    ]},
                    { formatted: [
                        { content: "Recognition/Visibility", bold: true },
                        { content: "Recognition during General Session before VIP Networking Reception", indent: 1 },
                        { content: "Social Media Recognition", indent: 1 },
                        { content: "Photographs & Videos of your Participation", indent: 1 }
                    ]},
                    { formatted: [
                        { content: "Table-Top Exhibit Space", bold: true },
                        { content: "8’x10' Exhibit Space", indent: 1 },
                        { content: "6' Tablecloth Table & Chairs", indent: 2 }
                    ]},
                    { formatted: [
                        { content: "Matchmaking Host Invitation", bold: true },
                        { content: "Opportunity to Host a Matchmaking Table on either or both days", indent: 1 },
                        { content: "July 29: 4:30 PM - 5:30 PM", indent: 2 },
                        { content: "July 30: 12:30 PM - 1:30 PM", indent: 2 }
                    ]},
                ],
                colour: "#3FB4E6",
                showRemaining: true,
            },
            {
                id: "networking-luncheon-sponsor",
                title: "Networking Luncheon Sponsorship",
                cost: 5000,
                requiresAttendeeInfo: true,
                slotsPerEvent: 2,
                sponsorPasses: 3,
                saleEndTime: "2025-07-26T04:00:20.000Z",
                perks: [
                { formatted: [
                    { content: "Event Access: (3) VIP Attendee Passes", bold: true },
                    { content: "Additional Sponsor Passes can be Purchased for $395 each", indent: 1 }
                ]},
                { formatted: [
                    { content: "Logo Branding: Conference Materials", bold: true },
                    { content: "Conference Pop-up Banners", indent: 1 },
                    { content: "Foam Boards & Signage", indent: 1 },
                    { content: "Digital Agenda & Event Website", indent: 1 },
                    { content: "Marketing Emails & Printed Program", indent: 1 }
                ]},
                { formatted: [
                    { content: "Host of the Networking Luncheon with Exhibitors", bold: true },
                    { content: "Provide 5-minute Remarks before the Networking Luncheon", indent: 1 },
                    { content: "Logo Placement at Networking Luncheon", indent: 1 },
                    { content: "Table Tents on Networking Luncheon Tables", indent: 2 },
                    { content: "Signage near Food/Beverage Areas", indent: 2 }
                ]},
                { formatted: [
                    { content: "Recognition/Visibility", bold: true },
                    { content: "Recognition during General Session before Networking Luncheon", indent: 1 },
                    { content: "Social Media Recognition", indent: 1 },
                    { content: "Photographs & Videos of your Participation", indent: 1 }
                ]},
                { formatted: [
                    { content: "Table-Top Exhibit Space", bold: true },
                    { content: "8’x10' Exhibit Space", indent: 1 },
                    { content: "6' Tablecloth Table & Chairs", indent: 2 }
                ]},
                { formatted: [
                    { content: "Matchmaking Host Invitation", bold: true },
                    { content: "Opportunity to Host a Matchmaking Table on either or both days", indent: 1 },
                    { content: "July 29: 4:30 PM - 5:30 PM", indent: 2 },
                    { content: "July 30: 12:30 PM - 1:30 PM", indent: 2 }
                ]},
                ],
                colour: "#3FB4E6",
                showRemaining: true,
            },
            {
                id: "small-business-sponsor",
                title: "Small Business Sponsorship",
                cost: 1500,
                slotsPerEvent: 23,
                requiresAttendeeInfo: true,
                sponsorPasses: 2,
                saleEndTime: "2025-07-26T04:00:20.000Z",
                perks: [
                    { formatted: [
                        { content: "Event Access: (2) VIP Attendee Passes", bold: true },
                        { content: "Additional Sponsor Passes can be Purchased for $395 each", indent: 1 }
                    ]},
                    { formatted: [
                        { content: "Logo Branding: Conference Materials", bold: true },
                        { content: "Digital Agenda & Event Website", indent: 1 },
                        { content: "Marketing Emails & Printed Program", indent: 1 }
                    ]},
                    { formatted: [
                        { content: "Recognition/Visibility", bold: true },
                        { content: "Photographs of your Participation", indent: 1 }
                    ]},
                    { formatted: [
                        { content: "Exhibit Space", bold: true },
                        { content: "8'x10' Exhibit Space", indent: 1 },
                        { content: "6' Tablecloth Table & Chairs", indent: 2 }
                    ]},
                ],
                showRemaining: true,
            },
            {
                id: "small-business-sponsor-without-exhibit-space",
                title: "Small Business Sponsorship without Exhibit Space",
                cost: 1250,
                requiresAttendeeInfo: true,
                slotsPerEvent: 20,
                sponsorPasses: 2,
                saleEndTime: "2025-07-26T04:00:20.000Z",
                perks: [
                    { formatted: [
                        { content: "Event Access: (2) VIP Attendee Passes", bold: true },
                        { content: "Additional Sponsor Passes can be Purchased for $395 each", indent: 1 }
                    ]},
                    { formatted: [
                        { content: "Logo Branding: Conference Materials", bold: true },
                        { content: "Conference Pop-up Banners", indent: 1 },
                        { content: "Digital Agenda & Event Website", indent: 1 },
                        { content: "Marketing Emails & Printed Program", indent: 1 }
                    ]},
                    { formatted: [
                        { content: "Recognition/Visibility", bold: true },
                        { content: "Photographs of your Participation", indent: 1 }
                    ]},
                ],
                showRemaining: true,
                showOnSponsorshipPage: false,
            },
        ],
    },
    {
        id: 5,
        additionalPass: {
            name: 'Additional Sponsor Attendee Pass',
            title: 'Additional Sponsor Attendee Pass',
            description: 'For registered Sponsors. Purchase additional Sponsor passes for your team at a discounted rate. A valid order ID from a previous Exhibitor or Sponsor registration is required.',
            price: 395,
            headerImage: 'vip.webp',
            buttonText: 'Add',
            maxQuantityPerOrder: 10,
            perks: [
                { formatted: [
                    { content: "Event Access: (1) VIP Attendee Pass", bold: true },
                    { content: "Access to General Sessions", indent: 1 },
                    { content: "Access to Exhibit Area", indent: 1 },
                    { content: "Onsite Sign-up for Matchmaking Sessions", indent: 1 },
                    { content: "Breakfast & Buffet Lunch", indent: 1 },
                    { content: "Post-Event Access to Photos, Videos, and Speaker Presentation Slides", indent: 1 },
                    { content: "Access to VIP Networking Reception on November 5, 2025 from 6:00 PM - 8:00 PM", bold: true },
                ]},
            ],
        },
        primeSponsor:
        {
            id: "platinum-sponsor",
            title: "Platinum Sponsorship",
            cost: 10000,
            slotsPerEvent: 1,
            sponsorPasses: 5,
            perks: [
                { formatted: [
                    { content: "Event Access: (5) VIP Attendee Passes", bold: true },
                    { content: "Additional Sponsor Passes can be purchased for $395 each", indent: 1 }
                ]},
                { formatted: [
                    { content: "Exclusive Branding: Lanyards, Name Badges, and Conference Materials", bold: true },
                    { content: "Branded Lanyards used with all attendee Name Badges (Sponsor Provided)", indent: 1 },
                    { content: "Company Logo prominently displayed on Name Badges", indent: 1 },
                    { content: "Prime Logo Placement on Conference Materials", indent: 1 },
                    { content: "Conference Pop-up Banners", indent: 2 },
                    { content: "Digital Agenda & Event Website", indent: 2 },
                    { content: "Marketing Emails & Printed Program", indent: 2 }
                ]},
                { formatted: [
                    { content: "Speaking Opportunity", bold: true },
                    { content: "20-Minute Speaking Opportunity during General Session", indent: 1 }
                ]},
                { formatted: [
                    { content: "Recognition/Visibility", bold: true },
                    { content: "Recognition during General Session & Networking Breaks", indent: 1 },
                    { content: "Sponsor Spotlight Email highlighting your Company's Capabilities to Attendees", indent: 1 },
                    { content: "Social Media Recognition", indent: 1 },
                    { content: "Photographs & Videos of your Participation", indent: 1 }
                ]},
                { formatted: [
                    { content: "Table-Top Exhibit Space", bold: true },
                    { content: "Priority Placement for your 8’x10’ Exhibit Space", indent: 1 },
                    { content: "6' Tablecloth Table & Chairs", indent: 2 },
                ]},
                { formatted: [
                    { content: "Matchmaking Host Invitation", bold: true },
                    { content: "Opportunity to Host a Matchmaking Table on either or both days", indent: 1 },
                    { content: "November 5: 4:30 PM - 5:30 PM", indent: 2 },
                    { content: "November 6: 12:30 PM - 1:30 PM", indent: 2 }
                ]}
            ],
            colour: "bg-sky-300",
            showRemaining: true,
        },

        sponsorships: [
            {
                id: "gold-sponsor",
                title: "Gold Sponsorship",
                cost: 7000,
                slotsPerEvent: 2,
                sponsorPasses: 4,
                perks: [
                    { formatted: [
                        { content: "Event Access: (4) VIP Attendee Passes", bold: true },
                        { content: "Additional Sponsor Passes can be purchased for $395 each", indent: 1 }
                    ]},
                    { formatted: [
                        { content: "Logo Branding: Conference Materials", bold: true },
                        { content: "Conference Pop-up Banners", indent: 1 },
                        { content: "Digital Agenda & Event Website", indent: 1 },
                        { content: "Marketing Emails & Printed Program", indent: 1 }
                    ]},
                    { formatted: [
                        { content: "Speaking Opportunity", bold: true },
                        { content: "15-Minute Speaking Opportunity during General Session", indent: 1 }
                    ]},
                    { formatted: [
                        { content: "Recognition/Visibility", bold: true },
                        { content: "Recognition during General Session & Networking Breaks", indent: 1 },
                        { content: "Social Media Recognition", indent: 1 },
                        { content: "Photographs & Videos of your Participation", indent: 1 }
                    ]},
                    { formatted: [
                        { content: "Table-Top Exhibit Space", bold: true },
                        { content: "Priority Placement for your 8’x10’ Exhibit Space", indent: 1 },
                        { content: "6' Tablecloth Table & Chairs", indent: 2 },
                    ]},
                    { formatted: [
                        { content: "Matchmaking Host Invitation", bold: true },
                        { content: "Opportunity to Host a Matchmaking Table on either or both days", indent: 1 },
                        { content: "November 5: 4:30 PM - 5:30 PM", indent: 2 },
                        { content: "November 6: 12:30 PM - 1:30 PM", indent: 2 }
                    ]}
                ],
                colour: "#ffaf00",
                showRemaining: true
            },
            {
                id: "silver-sponsor",
                title: "Silver Sponsorship",
                cost: 5000,
                slotsPerEvent: 3,
                sponsorPasses: 3,
                perks: [
                    { formatted: [
                        { content: "Event Access: (3) VIP Attendee Passes", bold: true },
                        { content: "Additional Sponsor Passes can be purchased for $395 each", indent: 1 }
                    ]},
                    { formatted: [
                        { content: "Logo Branding: Conference Materials", bold: true },
                        { content: "Conference Pop-up Banners", indent: 1 },
                        { content: "Digital Agenda & Event Website", indent: 1 },
                        { content: "Marketing Emails & Printed Program", indent: 1 }
                    ]},
                    { formatted: [
                        { content: "Speaking Opportunity", bold: true },
                        { content: "10-Minute Speaking Opportunity during General Session", indent: 1 }
                    ]},
                    { formatted: [
                        { content: "Recognition/Visibility", bold: true },
                        { content: "Recognition during General Session & Networking Breaks", indent: 1 },
                        { content: "Social Media Recognition", indent: 1 },
                        { content: "Photographs & Videos of your Participation", indent: 1 }
                    ]},
                    { formatted: [
                        { content: "Table-Top Exhibit Space", bold: true },
                        { content: "Priority Placement for your 8’x10’ Exhibit Space", indent: 1 },
                        { content: "6' Tablecloth Table & Chairs", indent: 2 },
                    ]},
                    { formatted: [
                        { content: "Matchmaking Host Invitation", bold: true },
                        { content: "Opportunity to Host a Matchmaking Table on either or both days", indent: 1 },
                        { content: "November 5: 4:30 PM - 5:30 PM", indent: 2 },
                        { content: "November 6: 12:30 PM - 1:30 PM", indent: 2 }
                    ]}
                ],
                colour: "#C0C0C0",
                showRemaining: true
            },
            {
                id: "bronze-sponsor",
                title: "Bronze Sponsorship",
                cost: 3000,
                slotsPerEvent: 3,
                sponsorPasses: 2,
                perks: [
                    { formatted: [
                        { content: "Event Access: (2) VIP Attendee Passes", bold: true },
                        { content: "Additional Sponsor Passes can be purchased for $395 each", indent: 1 }
                    ]},
                    { formatted: [
                        { content: "Logo Branding: Conference Materials", bold: true },
                        { content: "Conference Pop-up Banners", indent: 1 },
                        { content: "Digital Agenda & Event Website", indent: 1 },
                        { content: "Marketing Emails & Printed Program", indent: 1 }
                    ]},
                    { formatted: [
                        { content: "Speaking Opportunity", bold: true },
                        { content: "5-Minute Speaking Opportunity during General Session", indent: 1 }
                    ]},
                    { formatted: [
                        { content: "Recognition/Visibility", bold: true },
                        { content: "Recognition during General Session & Networking Breaks", indent: 1 },
                        { content: "Social Media Recognition", indent: 1 },
                        { content: "Photographs & Videos of your Participation", indent: 1 }
                    ]},
                    { formatted: [
                        { content: "Table-Top Exhibit Space", bold: true },
                        { content: "Priority Placement for your 8’x10’ Exhibit Space", indent: 1 },
                        { content: "6' Tablecloth Table & Chairs", indent: 2 },
                    ]},
                    { formatted: [
                        { content: "Matchmaking Host Invitation", bold: true },
                        { content: "Opportunity to Host a Matchmaking Table on either or both days", indent: 1 },
                        { content: "November 5: 4:30 PM - 5:30 PM", indent: 2 },
                        { content: "November 6: 12:30 PM - 1:30 PM", indent: 2 }
                    ]}
                ],
                colour: "#CD7F32",
                showRemaining: true
            },
            {
                id: "vip-networking-reception-sponsor",
                title: "VIP Networking Reception Sponsorship",
                cost: 6000,
                slotsPerEvent: 1,
                sponsorPasses: 3,
                perks: [
                    { formatted: [
                        { content: "Event Access: (3) VIP Attendee Passes", bold: true },
                        { content: "Additional Sponsor Passes can be purchased for $395 each", indent: 1 }
                    ]},
                    { formatted: [
                        { content: "Exclusive Host of the VIP Networking Reception", bold: true },
                        { content: "Provide Welcoming Remarks at the Reception Opening", indent: 1 },
                        { content: "Branding on Reception Tables", indent: 1 },
                    ]},
                    { formatted: [
                        { content: "Logo Branding: Conference Materials", bold: true },
                        { content: "Conference Signage", indent: 1 },
                        { content: "Digital Agenda & Event Website", indent: 1 },
                        { content: "Marketing Emails & Printed Program", indent: 1 }
                    ]},
                    { formatted: [
                        { content: "Recognition/Visibility", bold: true },
                        { content: "Recognition during General Session before VIP Networking Reception", indent: 1 },
                        { content: "Social Media Recognition", indent: 1 },
                        { content: "Photographs & Videos of your Participation", indent: 1 }
                    ]},
                    { formatted: [
                        { content: "Table-Top Exhibit Space", bold: true },
                        { content: "8’x10' Exhibit Space", indent: 1 },
                        { content: "6' Tablecloth Table & Chairs", indent: 2 }
                    ]},
                    { formatted: [
                        { content: "Matchmaking Host Invitation", bold: true },
                        { content: "Opportunity to Host a Matchmaking Table on either or both days", indent: 1 },
                        { content: "November 5: 4:30 PM - 5:30 PM", indent: 2 },
                        { content: "November 6: 12:30 PM - 1:30 PM", indent: 2 }
                    ]},
                ],
                colour: "#3FB4E6",
                showRemaining: true,
            },
            {
                id: "networking-luncheon-sponsor",
                title: "Coffee Station Sponsorship",
                cost: 2500,
                slotsPerEvent: 2,
                sponsorPasses: 2,
                perks: [
                { formatted: [
                    { content: "Event Access: (2) VIP Attendee Passes", bold: true },
                    { content: "Additional Sponsor Passes can be Purchased for $395 each", indent: 1 }
                ]},
                { formatted: [
                    { content: "Logo Branding: Conference Materials", bold: true },
                    { content: "Signage near Coffee Station", indent: 1 },
                    { content: "Conference Pop-up Banners", indent: 1 },
                    { content: "Foam Boards & Signage", indent: 1 },
                    { content: "Digital Agenda & Event Website", indent: 1 },
                    { content: "Marketing Emails & Printed Program", indent: 1 }
                ]},
                { formatted: [
                    { content: "Recognition/Visibility", bold: true },
                    { content: "Branded Coffee Napkins (Sponsor Provided)", indent: 1 },
                    { content: "Social Media Recognition", indent: 1 },
                    { content: "Photographs of your Participation", indent: 1 }
                ]},
                { formatted: [
                    { content: "Table-Top Exhibit Space", bold: true },
                    { content: "8’x10' Exhibit Space", indent: 1 },
                    { content: "6' Tablecloth Table & Chairs", indent: 2 },
                    { content: "Exhibit Near Coffee Station", indent: 2 }
                ]},
                ],
                colour: "#3FB4E6",
                showRemaining: true,
            },
            {
                id: "small-business-sponsor",
                title: "Small Business Sponsorship",
                cost: 1500,
                slotsPerEvent: 20,
                sponsorPasses: 2,
                perks: [
                    { formatted: [
                        { content: "Event Access: (2) VIP Attendee Passes", bold: true },
                        { content: "Additional Sponsor Passes can be Purchased for $395 each", indent: 1 }
                    ]},
                    { formatted: [
                        { content: "Logo Branding: Conference Materials", bold: true },
                        { content: "Digital Agenda & Event Website", indent: 1 },
                        { content: "Marketing Emails & Printed Program", indent: 1 }
                    ]},
                    { formatted: [
                        { content: "Recognition/Visibility", bold: true },
                        { content: "Photographs of your Participation", indent: 1 }
                    ]},
                    { formatted: [
                        { content: "Exhibit Space", bold: true },
                        { content: "8'x10' Exhibit Space", indent: 1 },
                        { content: "6' Tablecloth Table & Chairs", indent: 2 }
                    ]},
                ],
                showRemaining: true,
            },
            {
                id: "small-business-sponsor-without-exhibit-space",
                title: "Small Business Sponsorship without Exhibit Space",
                cost: 1250,
                slotsPerEvent: 20,
                sponsorPasses: 2,
                perks: [
                    { formatted: [
                        { content: "Event Access: (2) VIP Attendee Passes", bold: true },
                        { content: "Additional Sponsor Passes can be Purchased for $395 each", indent: 1 }
                    ]},
                    { formatted: [
                        { content: "Logo Branding: Conference Materials", bold: true },
                        { content: "Conference Pop-up Banners", indent: 1 },
                        { content: "Digital Agenda & Event Website", indent: 1 },
                        { content: "Marketing Emails & Printed Program", indent: 1 }
                    ]},
                    { formatted: [
                        { content: "Recognition/Visibility", bold: true },
                        { content: "Photographs of your Participation", indent: 1 }
                    ]},
                ],
                showRemaining: true,
                showOnSponsorshipPage: false,
            },
        ],
    },
    {
        id: 6,
        additionalPass: {
            name: 'Additional Sponsor Attendee Pass',
            title: 'Additional Sponsor Attendee Pass',
            description: 'For registered Sponsors. Purchase additional Sponsor passes for your team at a discounted rate. A valid order ID from a previous Exhibitor or Sponsor registration is required.',
            price: 395,
            headerImage: 'vip.webp',
            buttonText: 'Add',
            maxQuantityPerOrder: 10,
            perks: [
                { formatted: [
                    { content: "Event Access: (1) VIP Attendee Pass", bold: true },
                    { content: "Access to General Sessions", indent: 1 },
                    { content: "Access to Exhibit Area", indent: 1 },
                    { content: "Onsite Sign-up for Matchmaking Sessions", indent: 1 },
                    { content: "Breakfast & Buffet Lunch", indent: 1 },
                    { content: "Post-Event Access to Photos, Videos, and Speaker Presentation Slides", indent: 1 },
                    { content: "Access to VIP Networking Reception", bold: true },
                ]},
            ],
        },
        primeSponsor:
        {
            id: "platinum-sponsor",
            title: "Platinum Sponsorship",
            cost: 10000,
            slotsPerEvent: 1,
            sponsorPasses: 5,
            requiresAttendeeInfo: true,
            perks: [
                { formatted: [
                    { content: "Event Access: (5) VIP Attendee Passes", bold: true },
                    { content: "Additional Sponsor Passes can be purchased for $395 each", indent: 1 }
                ]},
                { formatted: [
                    { content: "Exclusive Branding: Lanyards, Name Badges, and Conference Materials", bold: true },
                    { content: "Branded Lanyards used with all Attendee Name Badges (Sponsor Provided)", indent: 1 },
                    { content: "Company Logo prominently displayed on Attendee Name Badges", indent: 1 },
                    { content: "Prime Logo Placement on Conference Materials", indent: 1 },
                    { content: "Conference Pop-up Banners", indent: 2 },
                    { content: "Digital Agenda & Event Website", indent: 2 },
                    { content: "Marketing Emails & Printed Program", indent: 2 }
                ]},
                { formatted: [
                    { content: "Speaking Opportunity", bold: true },
                    { content: "20-Minute Speaking Opportunity during General Session", indent: 1 }
                ]},
                { formatted: [
                    { content: "Recognition/Visibility", bold: true },
                    { content: "Recognition during General Session & Networking Breaks", indent: 1 },
                    { content: "Sponsor Spotlight Email highlighting your Company's Capabilities to Attendees", indent: 1 },
                    { content: "Social Media Recognition", indent: 1 },
                    { content: "Photographs & Videos of your Participation", indent: 1 }
                ]},
                { formatted: [
                    { content: "Table-Top Exhibit Space", bold: true },
                    { content: "Priority Placement for your 8’x10’ Exhibit Space", indent: 1 },
                    { content: "6' Tablecloth Table & Chairs", indent: 2 },
                ]},
                { formatted: [
                    { content: "Matchmaking Host Invitation", bold: true },
                    { content: "Opportunity to Host a Matchmaking Table on either or both days", indent: 1 },
                    // { content: "July 29: 4:30 PM - 5:30 PM", indent: 2 },
                    // { content: "July 30: 12:30 PM - 1:30 PM", indent: 2 }
                ]}
            ],
            colour: "bg-sky-300",
            showRemaining: true,
        },

        sponsorships: [
            {
                id: "gold-sponsor",
                title: "Gold Sponsorship",
                cost: 7000,
                requiresAttendeeInfo: true,
                slotsPerEvent: 2,
                sponsorPasses: 4,
                perks: [
                    { formatted: [
                        { content: "Event Access: (4) VIP Attendee Passes", bold: true },
                        { content: "Additional Sponsor Passes can be purchased for $395 each", indent: 1 }
                    ]},
                    { formatted: [
                        { content: "Logo Branding: Conference Materials", bold: true },
                        { content: "Conference Pop-up Banners", indent: 1 },
                        { content: "Digital Agenda & Event Website", indent: 1 },
                        { content: "Marketing Emails & Printed Program", indent: 1 }
                    ]},
                    { formatted: [
                        { content: "Speaking Opportunity", bold: true },
                        { content: "15-Minute Speaking Opportunity during General Session", indent: 1 }
                    ]},
                    { formatted: [
                        { content: "Recognition/Visibility", bold: true },
                        { content: "Recognition during General Session & Networking Breaks", indent: 1 },
                        { content: "Social Media Recognition", indent: 1 },
                        { content: "Photographs & Videos of your Participation", indent: 1 }
                    ]},
                    { formatted: [
                        { content: "Table-Top Exhibit Space", bold: true },
                        { content: "Priority Placement for your 8’x10’ Exhibit Space", indent: 1 },
                        { content: "6' Tablecloth Table & Chairs", indent: 2 },
                    ]},
                    { formatted: [
                        { content: "Matchmaking Host Invitation", bold: true },
                        { content: "Opportunity to Host a Matchmaking Table on either or both days", indent: 1 },
                        // { content: "July 29: 4:30 PM - 5:30 PM", indent: 2 },
                        // { content: "July 30: 12:30 PM - 1:30 PM", indent: 2 }
                    ]}
                ],
                colour: "#ffaf00",
                showRemaining: true
            },
            {
                id: "silver-sponsor",
                title: "Silver Sponsorship",
                cost: 5000,
                requiresAttendeeInfo: true,
                slotsPerEvent: 3,
                sponsorPasses: 3,
                perks: [
                    { formatted: [
                        { content: "Event Access: (3) VIP Attendee Passes", bold: true },
                        { content: "Additional Sponsor Passes can be purchased for $395 each", indent: 1 }
                    ]},
                    { formatted: [
                        { content: "Logo Branding: Conference Materials", bold: true },
                        { content: "Conference Pop-up Banners", indent: 1 },
                        { content: "Digital Agenda & Event Website", indent: 1 },
                        { content: "Marketing Emails & Printed Program", indent: 1 }
                    ]},
                    { formatted: [
                        { content: "Speaking Opportunity", bold: true },
                        { content: "10-Minute Speaking Opportunity during General Session", indent: 1 }
                    ]},
                    { formatted: [
                        { content: "Recognition/Visibility", bold: true },
                        { content: "Recognition during General Session & Networking Breaks", indent: 1 },
                        { content: "Social Media Recognition", indent: 1 },
                        { content: "Photographs & Videos of your Participation", indent: 1 }
                    ]},
                    { formatted: [
                        { content: "Table-Top Exhibit Space", bold: true },
                        { content: "Priority Placement for your 8’x10’ Exhibit Space", indent: 1 },
                        { content: "6' Tablecloth Table & Chairs", indent: 2 },
                    ]},
                    { formatted: [
                        { content: "Matchmaking Host Invitation", bold: true },
                        { content: "Opportunity to Host a Matchmaking Table on either or both days", indent: 1 },
                        // { content: "July 29: 4:30 PM - 5:30 PM", indent: 2 },
                        // { content: "July 30: 12:30 PM - 1:30 PM", indent: 2 }
                    ]}
                ],
                colour: "#C0C0C0",
                showRemaining: true
            },
            {
                id: "bronze-sponsor",
                title: "Bronze Sponsorship",
                cost: 3000,
                requiresAttendeeInfo: true,
                slotsPerEvent: 3,
                sponsorPasses: 2,
                perks: [
                    { formatted: [
                        { content: "Event Access: (2) VIP Attendee Passes", bold: true },
                        { content: "Additional Sponsor Passes can be purchased for $395 each", indent: 1 }
                    ]},
                    { formatted: [
                        { content: "Logo Branding: Conference Materials", bold: true },
                        { content: "Conference Pop-up Banners", indent: 1 },
                        { content: "Digital Agenda & Event Website", indent: 1 },
                        { content: "Marketing Emails & Printed Program", indent: 1 }
                    ]},
                    { formatted: [
                        { content: "Speaking Opportunity", bold: true },
                        { content: "5-Minute Speaking Opportunity during General Session", indent: 1 }
                    ]},
                    { formatted: [
                        { content: "Recognition/Visibility", bold: true },
                        { content: "Recognition during General Session & Networking Breaks", indent: 1 },
                        { content: "Social Media Recognition", indent: 1 },
                        { content: "Photographs & Videos of your Participation", indent: 1 }
                    ]},
                    { formatted: [
                        { content: "Table-Top Exhibit Space", bold: true },
                        { content: "Priority Placement for your 8’x10’ Exhibit Space", indent: 1 },
                        { content: "6' Tablecloth Table & Chairs", indent: 2 },
                    ]},
                    { formatted: [
                        { content: "Matchmaking Host Invitation", bold: true },
                        { content: "Opportunity to Host a Matchmaking Table on either or both days", indent: 1 },
                        // { content: "July 29: 4:30 PM - 5:30 PM", indent: 2 },
                        // { content: "July 30: 12:30 PM - 1:30 PM", indent: 2 }
                    ]}
                ],
                colour: "#CD7F32",
                showRemaining: true
            },
            {
                id: "vip-networking-reception-sponsor",
                title: "VIP Networking Reception Sponsorship",
                cost: 3500,
                requiresAttendeeInfo: true,
                slotsPerEvent: 1,
                sponsorPasses: 2,
                perks: [
                    { formatted: [
                        { content: "Event Access: (2) VIP Attendee Passes", bold: true },
                        { content: "Additional Sponsor Passes can be purchased for $395 each", indent: 1 }
                    ]},
                    { formatted: [
                        { content: "Logo Branding: Conference Materials", bold: true },
                        { content: "Conference Signage", indent: 1 },
                        { content: "Digital Agenda & Event Website", indent: 1 },
                        { content: "Marketing Emails & Printed Program", indent: 1 }
                    ]},
                    { formatted: [
                        { content: "Exclusive Host of the VIP Networking Reception", bold: true },
                        { content: "Provide Welcoming Remarks at the VIP Networking Reception", indent: 1 },
                        { content: "Logo Placement at VIP Networking Reception", indent: 1 },
                        { content: "Table Tents on VIP Networking Reception Tables", indent: 2 }
                    ]},
                    { formatted: [
                        { content: "Recognition/Visibility", bold: true },
                        { content: "Recognition during General Session before VIP Networking Reception", indent: 1 },
                        { content: "Social Media Recognition", indent: 1 },
                        { content: "Photographs & Videos of your Participation", indent: 1 }
                    ]},
                    { formatted: [
                        { content: "Table-Top Exhibit Space", bold: true },
                        { content: "8’x10' Exhibit Space", indent: 1 },
                        { content: "6' Tablecloth Table & Chairs", indent: 2 }
                    ]},
                    { formatted: [
                        { content: "Matchmaking Host Invitation", bold: true },
                        { content: "Opportunity to Host a Matchmaking Table on either or both days", indent: 1 },
                        // { content: "July 29: 4:30 PM - 5:30 PM", indent: 2 },
                        // { content: "July 30: 12:30 PM - 1:30 PM", indent: 2 }
                    ]},
                ],
                colour: "#3FB4E6",
                showRemaining: true,
            },
            {
                id: "networking-luncheon-sponsor",
                title: "Coffee Station Sponsorship",
                cost: 2500,
                slotsPerEvent: 2,
                sponsorPasses: 2,
                perks: [
                { formatted: [
                    { content: "Event Access: (2) VIP Attendee Passes", bold: true },
                    { content: "Additional Sponsor Passes can be Purchased for $395 each", indent: 1 }
                ]},
                { formatted: [
                    { content: "Logo Branding: Conference Materials", bold: true },
                    { content: "Signage near Coffee Station", indent: 1 },
                    { content: "Conference Pop-up Banners", indent: 1 },
                    { content: "Foam Boards & Signage", indent: 1 },
                    { content: "Digital Agenda & Event Website", indent: 1 },
                    { content: "Marketing Emails & Printed Program", indent: 1 }
                ]},
                { formatted: [
                    { content: "Recognition/Visibility", bold: true },
                    { content: "Branded Coffee Napkins (Sponsor Provided)", indent: 1 },
                    { content: "Social Media Recognition", indent: 1 },
                    { content: "Photographs of your Participation", indent: 1 }
                ]},
                { formatted: [
                    { content: "Table-Top Exhibit Space", bold: true },
                    { content: "8’x10' Exhibit Space", indent: 1 },
                    { content: "6' Tablecloth Table & Chairs", indent: 2 },
                    { content: "Exhibit Near Coffee Station", indent: 2 }
                ]},
                ],
                colour: "#3FB4E6",
                showRemaining: true,
            },
            {
                id: "small-business-sponsor",
                title: "Small Business Sponsorship",
                cost: 1500,
                slotsPerEvent: 20,
                requiresAttendeeInfo: true,
                sponsorPasses: 2,
                perks: [
                    { formatted: [
                        { content: "Event Access: (2) VIP Attendee Passes", bold: true },
                        { content: "Additional Sponsor Passes can be Purchased for $395 each", indent: 1 }
                    ]},
                    { formatted: [
                        { content: "Logo Branding: Conference Materials", bold: true },
                        { content: "Digital Agenda & Event Website", indent: 1 },
                        { content: "Marketing Emails & Printed Program", indent: 1 }
                    ]},
                    { formatted: [
                        { content: "Recognition/Visibility", bold: true },
                        { content: "Photographs of your Participation", indent: 1 }
                    ]},
                    { formatted: [
                        { content: "Exhibit Space", bold: true },
                        { content: "8'x10' Exhibit Space", indent: 1 },
                        { content: "6' Tablecloth Table & Chairs", indent: 2 }
                    ]},
                ],
                showRemaining: true,
            },
            {
                id: "small-business-sponsor-without-exhibit-space",
                title: "Small Business Sponsorship without Exhibit Space",
                cost: 1250,
                requiresAttendeeInfo: true,
                slotsPerEvent: 20,
                sponsorPasses: 2,
                perks: [
                    { formatted: [
                        { content: "Event Access: (2) VIP Attendee Passes", bold: true },
                        { content: "Additional Sponsor Passes can be Purchased for $395 each", indent: 1 }
                    ]},
                    { formatted: [
                        { content: "Logo Branding: Conference Materials", bold: true },
                        { content: "Conference Pop-up Banners", indent: 1 },
                        { content: "Digital Agenda & Event Website", indent: 1 },
                        { content: "Marketing Emails & Printed Program", indent: 1 }
                    ]},
                    { formatted: [
                        { content: "Recognition/Visibility", bold: true },
                        { content: "Photographs of your Participation", indent: 1 }
                    ]},
                ],
                showRemaining: true,
                showOnSponsorshipPage: false,
            },
        ],
    },
];

