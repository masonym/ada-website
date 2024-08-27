export const REGISTRATION_TYPES = [
    {
        id: 1,
        registrations: [
            {
                title: "In-Person",
                headerImage: "/registration-cards/attendee-pass.png",
                perks: [
                    "Registration for 1 Person",
                    "Access to All Event Sessions",
                    "Speaker Presentations and Materials",
                    "Digital/Physical Copies of Agenda",
                    "Breakfast & Buffet Lunch",
                    "Coffee Service",
                    "Access to Photos & Videos from Conference",
                ],
                subtitle: "Includes:",
                buttonText: "Register Now",
                buttonLink: "/",
                earlyBirdPrice: "$550",
                regularPrice: "$750",
                earlyBirdDeadline: "2024-10-01T03:00:00Z",
                type: "paid"
            },
            {
                title: "Government/Military Personnel Registration",
                headerImage: "/registration-cards/gov-pass.png",
                perks: [
                    "Registration for 1 Person",
                    "Access to All Event Sessions",
                    "Speaker Presentations and Materials",
                    "Digital/Physical Copies of Agenda",
                    "Breakfast & Buffet Lunch",
                    "Coffee Service",
                    "Access to Photos & Videos from Conference",
                ],
                subtitle: "Includes:",
                buttonText: "Register Now",
                buttonLink: "/",
                type: "complimentary",
                availabilityInfo: "Limited availability."
            },
            {
                title: "Sponsor",
                headerImage: "/registration-cards/sponsor-pass.png",
                perks: [
                    "Brand Visibility",
                    "Speaking Opportunity",
                    "Recognition",
                    "Reception Hosting (Premiere)",
                    "Luncheon Hosting (Prestige)",
                    "Display Table",
                    "Event Access",
                    "Media Coverage",
                ],
                subtitle: "Includes:",
                buttonText: "Explore Sponsorship Opportunities",
                buttonLink: "/about/sponsor",
                type: "sponsor",
                availabilityInfo: "Limited availability."
            },
        ],
        addOns: [
            {
                title: "Networking Reception",
                description: "Join us for an exclusive evening networking event from 5:30 PM - 7:00 PM",
                price: "+$100"
            }
        ]
    }
];