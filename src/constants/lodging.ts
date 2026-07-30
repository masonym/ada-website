type Hotel = {
  name: string;
  address: string;
  city?: string;
  state?: string;
  zip?: string;
  phone: string;
  image: string;
  link?: {
    href: string;
    label: string;
  };
};

type LodgingResourceImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

type LodgingResourceLink = {
  href: string;
  label: string;
};

export type LodgingResource = {
  title: string;
  description?: string;
  images?: LodgingResourceImage[];
  link?: LodgingResourceLink;
};

export type LodgingInfo = {
  eventId: number;
  hotels: Hotel[];
  note?: string;
  resources?: LodgingResource[];
};

export const LODGING_INFO: LodgingInfo[] = [
  {
    eventId: 2, // 2025SDPC
    hotels: [
      {
        name: "Hilton Atlanta Downtown Hotel",
        address: "255 Courtland St NE",
        city: "Atlanta",
        state: "Georgia",
        zip: "30303",
        phone: "(404) 659-2000",
        image: "/hotels/hilton-atlanta.webp",
        link: {
          href: "https://www.hilton.com/en/hotels/atlahhh-hilton-atlanta/",
          label: "Hilton Atlanta",
        },
      },
    ],
    note: "Group Name: Southeast Defense Procurement Conference<br />Group Rate: $219.00 USD + Tax<br />Rate Available: March 9-13, 2025 (From 2 Days Before and 2 Days After the Event Dates Based on Hotel's Availability)<br />Group Rate Cut-off Date: March 3, 2025 or Until Group Block is Sold Out<br /><a href='https://book.passkey.com/go/sedefenseprocurementconf' target='_blank' rel='noopener noreferrer' class=' underline hover:text-accent text-blue-500'>Reservation Link</a>",
  },
  {
    eventId: 3, // 2025DTIOS
    hotels: [
      {
        name: "Hampton Inn & Suites",
        address: "9004 Astronaut Blvd.",
        city: "Cape Canaveral",
        state: "Florida",
        zip: "32920",
        phone: "(321) 784-0021",
        image: "/hotels/hampton-inn.webp",
      },
      {
        name: "Courtyard by Marriott Titusville – Kennedy Space Center",
        address: "6245 Riverfront Center Blvd,",
        city: "Titusville",
        state: "FL",
        zip: "",
        phone: "(321) 966-9200",
        image: "/hotels/courtyard-marriott.webp",
      },
    ],
    note: "PLEASE NOTE THERE IS NO ROOM BLOCK FOR THIS EVENT.",
  },
  {
    eventId: 4, // 2025NMCPC
    hotels: [
      {
        name: "Norfolk Waterside Marriott",
        address: "235 E Main St",
        city: "Norfolk",
        state: "Virginia",
        zip: "23510",
        phone: "(757) 627-4200",
        image: "/hotels/norfolk-waterside-marriott.webp",
        link: {
          href: "https://www.marriott.com/en-us/hotels/orfws-norfolk-waterside-marriott/overview/",
          label: "Norfolk Waterside Marriott",
        },
      },
    ],
    note: `
    <b>Group Block Name</b>: Navy & Marine Corps Procurement Conference<br />
    <b>Group Rate</b>: Standard Room: $159.00 + Tax | Waterview Room: $179.00 + Tax<br />
    <b>Rate Available</b>: July 27-31, 2025<br />
    <b>Group Rate Cut-off Date</b>: <s>July 14, 2025</s> Extended to July 18, 2025 (More Rooms Added)<br />
    <a href='https://www.marriott.com/event-reservations/reservation-link.mi?guestreslink2=true&id=1740589200251&key=GRP' target='_blank' rel='noopener noreferrer' class='underline hover:text-accent text-blue-500'>Reservation Link</a>`,
    resources: [
      {
        title: "Norfolk Dining Guide",
        description:
          "Explore the local dining scene with this guide provided by Visit Norfolk.",
        images: [
          {
            src: "/events/2025NMCPC/norfolk-dining-guide-1.webp",
            alt: "Norfolk Dining Guide Page 1",
            width: 790,
            height: 1024,
          },
          {
            src: "/events/2025NMCPC/norfolk-dining-guide-2.webp",
            alt: "Norfolk Dining Guide Page 2",
            width: 790,
            height: 1024,
          },
        ],
      },
    ],
  },
  {
    eventId: 5, // 2025DTAPC
    hotels: [
      {
        name: "Renaissance Austin Hotel",
        address: "9721 Arboretum Blvd",
        city: "Austin",
        state: "Texas",
        zip: "78759",
        phone: "(512) 343-2626",
        image: "/hotels/renaissance-austin.webp",
        link: {
          href: "https://www.marriott.com/en-us/hotels/aussh-renaissance-austin-hotel/overview/",
          label: "Renaissance Austin Hotel",
        },
      },
    ],
    note: `
<b>Event Room</b>: Rio Grande Hall, Plaza Lower Level<br />
<b>Group Block Name</b>: 2026 Defense Technology & Aerospace Procurement Conference<br />
<b>Group Rate</b>: Standard King $244 Plus Tax / Standard Queen Queen $269 Plus Tax<br />
<b>Rate Available</b>: March 2–7, 2026<br />
<b>Booking Deadline</b>: February 17, 2026<br />
<br/>
<b>Update: </b> The Group Rate is sold out and no longer available. For a list of nearby hotels, please see the document below.<br/>
<br/>
<b>Overflow Hotel Directory</b>: <a href="https://cdn.americandefensealliance.org/locations/austin_hotels.pdf" target="_blank" rel="noopener noreferrer" class="underline hover:text-accent text-blue-500">Download PDF</a>
<br/>
<br/>
<p class="font-bold">Parking:</p>
<ul class="list-inside">
  <li>Self-Parking Fee of $11.50 for Overnight Hotel Guests</li>
  <li>Complimentary for Meeting Attendees up to 8 Hours</li>
</ul>
`,
  },
  {
    eventId: 6, // 2026NMCPC
    hotels: [
      {
        name: "Norfolk Waterside Marriott",
        address: "235 E Main St",
        city: "Norfolk",
        state: "Virginia",
        zip: "23510",
        phone: "(757) 627-4200",
        image: "/hotels/norfolk-waterside-marriott.webp",
        link: {
          href: "https://www.marriott.com/en-us/hotels/orfws-norfolk-waterside-marriott/overview/",
          label: "Norfolk Waterside Marriott",
        },
      },
    ],
    note: `
    <b>Group Block Name</b>: Navy & Marine Corps Procurement Conference<br />
    <b>Group Rate</b>: Standard Room: $159.00 + Tax | Waterview Room: $179.00 + Tax<br />
    <b>Rate Available</b>: May 26-31, 2026<br />
    <b>Group Rate Cut-off Date</b>: May 20, 2026<br />
    <br/>
    <a href="https://www.marriott.com/event-reservations/reservation-link.mi?guestreslink2=true&id=1760457928560&key=GRP&dtt=true" target="_blank" rel="noopener noreferrer" class="underline hover:text-accent text-blue-500">
      Book your group rate for 2026 Navy & Marine Corps Procurement Conference
    </a>
    `,
    resources: [
      {
        title: "Norfolk Dining Guide",
        description:
          "Explore the local dining scene with this guide provided by Visit Norfolk.",
        images: [
          {
            src: "/events/2025NMCPC/norfolk-dining-guide-1.webp",
            alt: "Norfolk Dining Guide Page 1",
            width: 790,
            height: 1024,
          },
          {
            src: "/events/2025NMCPC/norfolk-dining-guide-2.webp",
            alt: "Norfolk Dining Guide Page 2",
            width: 790,
            height: 1024,
          },
        ],
      },
      {
        title: "Show Your Badge Discount Program at Norfolk Restaurants",
        images: [
          {
            src: "/events/2026NMCPC/show-your-badge-discount-program-1.webp",
            alt: "Show Your Badge Discount Program at Norfolk Restaurants",
            width: 790,
            height: 1024,
          },
          {
            src: "/events/2026NMCPC/show-your-badge-discount-program-2.webp",
            alt: "Show Your Badge Discount Program at Norfolk Restaurants",
            width: 790,
            height: 1024,
          },
        ],
      },
    ],
  },
  {
    eventId: 7, // 2026AFSFPC
    hotels: [
      {
        name: "Hotel Polaris at the U.S. Air Force Academy",
        address: "8989 North Gate Boulevard",
        city: "Colorado Springs",
        state: "CO",
        zip: "80921",
        phone: "(719) 886-1100",
        image: "/hotels/hotel-polaris-exterior.webp",
        link: {
          href: "https://www.thehotelpolaris.com/",
          label: "Hotel Polaris at the U.S. Air Force Academy",
        },
      },
    ],
    note: `
    <div class="mb-4 bg-gray-100 p-4 rounded-xl">
    <b>Update:</b> At this time Hotel Polaris has no sleeping rooms availability. Below are some alternative options. Note: we do not have room block rates at these hotels.<br />
    <br />
    <b>Staybridge Suites Colorado Springs North</b><br />
    Tel: <a href="tel:+18772388889" class="underline hover:text-accent text-blue-500">+1 877-238-8889</a><br />
    <br />
    <b>Home2 Suites by Hilton Colorado Springs South</b><br />
    1235 Tenderfoot Hill Rd, Colorado Springs, Colorado, 80906, USA<br />
    Tel: <a href="tel:+17192263440" class="underline hover:text-accent text-blue-500">+1 719-226-3440</a><br />
    <br />
    <b>Colorado Springs Marriott</b><br />
    5580 Tech Center Drive, Colorado Springs, Colorado, 80919, USA<br />
    Tel: <a href="tel:+17192601800" class="underline hover:text-accent text-blue-500">+1 719-260-1800</a><br />
    </div>
    <b>Event Location</b>: Generations Ballroom<br />
    <br />
    <b>NOTE</b>: Hotel is located outside of the base security gates, no special access is required<br />
    <b>Dates</b>: Aug 4-5, 2026<br />
    <b>Group Name</b>: Air Force & Space Force Procurement<br />
    <b>Group Rate</b>: $209.00 ($239.00 including Fees) + Tax<br />
    <b>Group Rate Available</b>: August 2, 2026 - August 6, 2026<br />
    <b>Group Reservation Code (Booking Over Phone)</b>: 7666607<br />
    <b>Group Rate Cut Off</b>: July 13, 2026<br />
    <br />
    <br />
    <b>NOTE</b>: The deadline for the group block has passed and is no longer available for online booking. For further assistance with your reservation send an email request to the Group Rooms Coordinator, Cissy Schat-Wilk at <a href="mailto:cissy.schat-wilk@thehotelpolaris.com" class="underline hover:text-accent text-blue-500">cissy.schat-wilk@thehotelpolaris.com</a>. The hotel will make every reasonable attempt to honor the Group Rate.    <br />
    <br />
    <div class="mb-4 bg-gray-100 p-4 rounded-xl">
    <b>Additional Information:</b><br />
    • $15 Amenity Fee will be Added to your Room (Reduced from $25 for our Group)<br />
    • Complimentary Wi-Fi in Meeting Space for the Group<br />
    • Hotel Polaris and its Lovie's Market, Bars and Restaurants Operate as a Cashless Property<br />
    <br />
    <b>Amenity Fee Covers:</b><br />
    • Wireless In-Room High Speed Internet (5Mbps)<br />
    • Unlimited Lavazza In-Room Coffee<br />
    • Unlimited Filtered Water at Property Wide Refilling Stations<br />
    • Sporting Equipment & Games (Ping Pong, Pool, Cornhole, Bocce Ball, and More)<br />
    • 10% off Ascend Spa Services<br />
    • 10% off all Grab 'n Go Food and Beverage (Excludes Alcohol)<br />
    • 10% off Flight Simulator Experiences<br />
    • Pool Towel Services<br />
    • 24 Hour Fitness Center Access<br />
    • Heated Outdoor Swimming Pool (Open All Year Long)<br />
    • Santa Fe Trail access via Hotel Polaris Trailhead<br />
    </div>
    `,
  },
  {
    eventId: 8, // 2027NMCPC
    hotels: [
      {
        name: "Norfolk Waterside Marriott",
        address: "235 E Main St",
        city: "Norfolk",
        state: "Virginia",
        zip: "23510",
        phone: "(757) 627-4200",
        image: "/hotels/norfolk-waterside-marriott.webp",
        link: {
          href: "https://www.marriott.com/en-us/hotels/orfws-norfolk-waterside-marriott/overview/",
          label: "Norfolk Waterside Marriott",
        },
      },
    ],
    // Rates carried over from 2026. TODO: the 2027 room block still needs to be
    // negotiated — confirm rates, the availability window, the cut-off date, and
    // replace the booking link below (the 2026 link is event-specific and will not work).
    // note: `
    // <b>Group Block Name</b>: Navy & Marine Corps Procurement Conference<br />
    // <b>Group Rate</b>: Standard Room: $159.00 + Tax | Waterview Room: $179.00 + Tax<br />
    // <b>Rate Available</b>: June 20-25, 2027<br />
    // <b>Group Rate Cut-off Date</b>: TBD<br />
    // `,
    note: `
    <b>Room Block is Coming Soon.</b><br />
    `,
    resources: [
      {
        title: "Norfolk Dining Guide",
        description:
          "Explore the local dining scene with this guide provided by Visit Norfolk.",
        images: [
          {
            src: "/events/2025NMCPC/norfolk-dining-guide-1.webp",
            alt: "Norfolk Dining Guide Page 1",
            width: 790,
            height: 1024,
          },
          {
            src: "/events/2025NMCPC/norfolk-dining-guide-2.webp",
            alt: "Norfolk Dining Guide Page 2",
            width: 790,
            height: 1024,
          },
        ],
      },
      {
        title: "Show Your Badge Discount Program at Norfolk Restaurants",
        images: [
          {
            src: "/events/2026NMCPC/show-your-badge-discount-program-1.webp",
            alt: "Show Your Badge Discount Program at Norfolk Restaurants",
            width: 790,
            height: 1024,
          },
          {
            src: "/events/2026NMCPC/show-your-badge-discount-program-2.webp",
            alt: "Show Your Badge Discount Program at Norfolk Restaurants",
            width: 790,
            height: 1024,
          },
        ],
      },
    ],
  },
];
