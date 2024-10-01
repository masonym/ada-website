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
                    "Access to Photos & Videos from Conference",
                ],
                subtitle: "Includes:",
                buttonText: "Register Now",
                buttonLink: "https://www.eventbrite.com/e/2025-defense-industry-forecast-tickets-997306910817",
                earlyBirdPrice: "$550",
                regularPrice: "$750",
                earlyBirdDeadline: "2024-10-18T03:00:00Z",
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
                    "Access to Photos & Videos from Conference",
                ],
                subtitle: "Includes:",
                buttonText: "Register Now",
                buttonLink: "https://www.eventbrite.com/e/2025-defense-industry-forecast-tickets-997306910817",
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
                    "<i>Reception Hosting</i> (Premier)",
                    "<i>Luncheon Hosting </i>(Prestige)",
                    "Display Table",
                    "Event Access",
                    "Media Coverage",
                ],
                subtitle: "Includes:",
                buttonText: "Explore Sponsorship Opportunities",
                buttonLink: `2025-defense-industry-forecast/about/sponsor`,
                type: "sponsor",
                availabilityInfo: "Limited availability."
            },
        ],
        addOns: [
            {
                title: "Networking Reception",
                description: "Join us for an exclusive evening networking event from 5:30 PM - 7:30 PM",
                price: "+$100"
            }
        ]
    }
];