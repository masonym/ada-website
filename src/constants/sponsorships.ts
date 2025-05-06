export const SPONSORSHIP_TYPES = [
    {
        id: 1,
        sponsorships: [
            {
                title: "Premier",
                cost: "$5,000",
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
                title: "Prestige",
                cost: "$3,000",
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
                title: "Executive",
                cost: "$1,500",
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
                title: "Gold Sponsor",
                cost: "$7,000",
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
                colour: "#ffaf00"
            },
            {
                title: "Silver Sponsor",
                cost: "$5,000",
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
                title: "Bronze Sponsor",
                cost: "$3,000",
                perks: [
                    { tagline: "Event Access", description: "(2) Sponsor Passes. Additional Passes can be Purchased for $395 each" },
                    { tagline: "Speaking Opportunity", description: "5-Minute Speaking Session for a Representative of your Company" },
                    { tagline: "Exhibit Space", description: "8'x10' Exhibit Space in Exhibit Area/Foyer. 6' Exhibit Table and Chairs" },
                    { tagline: "Matchmaking Host", description: "Invitation to Host a One-on-One Matchmaking Session" },
                    { tagline: "Brand Visibility", description: "Logo Placement on all Conference Materials, including Banners, Marketing Emails, Website, and Programs" },
                    { tagline: "Recognition", description: "Acknowledgement during Key Moments of the Conference" },
                    { tagline: "Media Coverage", description: " Inclusion in Social Media Mentions. Photographs and Videos of your Participation" },
                ],
                colour: "#CD7F32"
            },
            {
                title: "VIP Networking Reception Sponsor",
                cost: "$3,500",
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
                title: "Networking Luncheon Sponsor",
                cost: "$2,500",
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
                title: "Small Business Sponsor",
                cost: "$1,500",
                perks: [
                    { tagline: "Event Access", description: "(2) Sponsor Passes. Additional Passes can be Purchased for $395 each" },
                    { tagline: "Exhibit Space", description: ": 8'x10' Exhibit Space in Exhibit Area/Foyer. 6' Exhibit Table and Chairs" },
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
                title: "Gold Sponsor",
                cost: "$10,000",
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
                title: "Silver Sponsor",
                cost: "$5,000",
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
                title: "Bronze Sponsor",
                cost: "$3,000",
                perks: [
                    { tagline: "Event Access", description: "(1) Attendee Event Pass" },
                    { tagline: "Networking", description: "(1) Pass to Meet & Greet Bourbon Tasting with Astronauts" },
                    { tagline: "Exhibit Space", description: "Table-Top Display" },
                    { tagline: "Brand Visibility", description: "Logo on Event Marketing Materials and on Event Screen" },
                ],
                colour: "#CD7F32"
            },
            {
                title: "Meet & Greet Bourbon Tasting with Astronauts",
                cost: "$2,000",
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
        primeSponsor:
        {
            title: "Platinum Sponsor",
            cost: "$10,000",
            slotsPerEvent: 1,
            perks: [
                { tagline: "Event Access", description: "(5) Sponsor Passes. Additional Passes can be Purchased for $395 each" },
                { tagline: "Lanyard Sponsor", description: "Exclusive Company Logo on Lanyards" },
                { tagline: "Name Badge Sponsor", description: "Company Logo on Name Badges" },
                { tagline: "Speaking Opportunity", description: "20-Minute Speaking Session for a Representative of your Company" },
                { tagline: "VIP Introductions", description: "Strategic Introductions to Key Speakers and VIP Guests" },
                { tagline: "Exhibit Space", description: "8'x10' Exhibit Space Strategically Placed in Exhibit Area/Foyer. 6' Exhibit Table and Chairs" },
                { tagline: "Matchmaking Host", description: "Invitation to Host a One-on-One Matchmaking Session" },
                { tagline: "Sponsor Spotlight Email", description: "(1) Promotional Email sent to all Registered Attendees Pre-Conference Highlighting your Capabilities" },
                { tagline: "Brand Visibility", description: "Prime Logo Placement on all Conference Materials, including Banners, Marketing Emails, Website, and Programs" },
                { tagline: "Recognition", description: "Acknowledgement during Key Moments of the Conference" },
                { tagline: "Media Coverage", description: "Inclusion in Press Releases, Promotional Materials and Social Media Mentions. Photographs and Videos of your Participation" },
            ],
            colour: "bg-sky-300",
        },

        sponsorships: [
            {
                title: "Gold Sponsor",
                cost: "$7,000",
                slotsPerEvent: 2,
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
                showRemaining: true
            },
            {
                title: "Silver Sponsor",
                cost: "$5,000",
                slotsPerEvent: 3,
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
                colour: "#C0C0C0",
                showRemaining: true
            },
            {
                title: "Bronze Sponsor",
                cost: "$3,000",
                slotsPerEvent: 5,
                perks: [
                    { tagline: "Event Access", description: "(2) Sponsor Passes. Additional Passes can be Purchased for $395 each" },
                    { tagline: "Speaking Opportunity", description: "5-Minute Speaking Session for a Representative of your Company" },
                    { tagline: "Exhibit Space", description: "8'x10' Exhibit Space in Exhibit Area/Foyer. 6' Exhibit Table and Chairs" },
                    { tagline: "Matchmaking Host", description: "Invitation to Host a One-on-One Matchmaking Session" },
                    { tagline: "Brand Visibility", description: "Logo Placement on all Conference Materials, including Banners, Marketing Emails, Website, and Programs" },
                    { tagline: "Recognition", description: "Acknowledgement during Key Moments of the Conference" },
                    { tagline: "Media Coverage", description: " Inclusion in Social Media Mentions. Photographs and Videos of your Participation" },
                ],
                colour: "#CD7F32",
                showRemaining: true
            },
            {
                title: "VIP Networking Reception Sponsor",
                cost: "$3,500",
                slotsPerEvent: 1,
                perks: [
                    { tagline: "Event Access", description: "(2) Sponsor Passes. Additional Passes can be Purchased for $395 each" },
                    { tagline: "VIP Networking Reception Hosting", description: "Exclusive Host of the VIP Networking Reception on July 29 from 5:30 PM - 7:30 PM" },
                    { tagline: "Speaking Opportunity", description: "Provide Welcoming Remarks at the VIP Networking Reception" },
                    { tagline: "Exhibit Space", description: "8'x10' Exhibit Space Strategically Placed in Exhibit Area/Foyer. 6' Exhibit Table and Chairs" },
                    { tagline: "Matchmaking Host", description: "Invitation to Host a One-on-One Matchmaking Session" },
                    { tagline: "Brand Visibility", description: "Prime Logo Placement on all Conference Materials, including Banners, Marketing Emails, Website, and Programs" },
                    { tagline: "Recognition", description: "Acknowledgement during Key Moments of the Conference" },
                    { tagline: "Media Coverage", description: "Inclusion in Promotional Materials and Social Media Mentions" },
                    { tagline: "Photos and Videos", description: "Photographs and Videos of your Participation" },
                ],
                colour: "#3FB4E6"
            },
            {
                title: "Networking Luncheon Sponsor",
                cost: "$2,500",
                slotsPerEvent: 2,
                perks: [
                    { tagline: "Event Access", description: "(2) Sponsor Passes. Additional Passes can be Purchased for $395 each" },
                    { tagline: "Networking Luncheon Hosting", description: "Host of the Networking Luncheon" },
                    { tagline: "Exhibit Space", description: "8'x10' Exhibit Space Strategically Placed in Exhibit Area/Foyer. 6' Exhibit Table and Chairs" },
                    { tagline: "Matchmaking Host", description: "Invitation to Host a One-on-One Matchmaking Session" },
                    { tagline: "Brand Visibility", description: "Prominent Logo Placement on all Conference Materials, including Banners, Marketing Emails, Website, and Programs" },
                    { tagline: "Recognition", description: "Acknowledgement during Key Moments of the Conference" },
                    { tagline: "Media Coverage", description: "Inclusion in Promotional Materials and Social Media Mentions" },
                    { tagline: "Photos and Videos", description: "Photographs and Videos of your Participation" },
                ],
                colour: "#3FB4E6"
            },
            {
                title: "Small Business Sponsor",
                cost: "$1,500",
                slotsPerEvent: 15,
                perks: [
                    { tagline: "Event Access", description: "(2) Sponsor Passes. Additional Passes can be Purchased for $395 each" },
                    { tagline: "Exhibit Space", description: ": 8'x10' Exhibit Space in Exhibit Area/Foyer. 6' Exhibit Table and Chairs" },
                    { tagline: "Brand Visibility", description: "Logo Placement on select Conference Material" },
                    { tagline: "Media Coverage", description: "Photographs of your Participation" },
                ],
            },
        ],
    },
];
