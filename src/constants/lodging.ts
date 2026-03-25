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
          label: "Hilton Atlanta"
        },
      },
    ],
    note: "Group Name: Southeast Defense Procurement Conference<br />Group Rate: $219.00 USD + Tax<br />Rate Available: March 9-13, 2025 (From 2 Days Before and 2 Days After the Event Dates Based on Hotel's Availability)<br />Group Rate Cut-off Date: March 3, 2025 or Until Group Block is Sold Out<br /><a href='https://book.passkey.com/go/sedefenseprocurementconf' target='_blank' rel='noopener noreferrer' class=' underline hover:text-accent text-blue-500'>Reservation Link</a>"
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
        image: "/hotels/hampton-inn.webp"
      },
      {
        name: "Courtyard by Marriott Titusville – Kennedy Space Center",
        address: "6245 Riverfront Center Blvd,",
        city: "Titusville",
        state: "FL",
        zip: "",
        phone: "(321) 966-9200",
        image: "/hotels/courtyard-marriott.webp"
      }
    ],
    note: "PLEASE NOTE THERE IS NO ROOM BLOCK FOR THIS EVENT."
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
          label: "Norfolk Waterside Marriott"
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
        description: "Explore the local dining scene with this guide provided by Visit Norfolk.",
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
    ]
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
          label: "Renaissance Austin Hotel"
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
`
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
          label: "Norfolk Waterside Marriott"
        },
      },
    ],
    note: `
    <b>Group Block Name</b>: Navy & Marine Corps Procurement Conference<br />
    <b>Group Rate</b>: Standard Room: $159.00 + Tax | Waterview Room: $179.00 + Tax<br />
    <b>Rate Available</b>: May 26-31, 2026<br />
    <b>Group Rate Cut-off Date</b>: May 11, 2026<br />
    <br/>
    <a href="https://www.marriott.com/event-reservations/reservation-link.mi?guestreslink2=true&id=1760457928560&key=GRP&dtt=true" target="_blank" rel="noopener noreferrer" class="underline hover:text-accent text-blue-500">
      Book your group rate for 2026 Navy & Marine Corps Procurement Conference
    </a>
    `,
    resources: [
      {
        title: "Norfolk Dining Guide",
        description: "Explore the local dining scene with this guide provided by Visit Norfolk.",
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
    ]
  },
  {
    eventId: 7, // 2026AFSFPC
    hotels: [
      {
        name: "Hotel Polaris by U.S. Air Force Academy",
        address: "8989 North Gate Boulevard",
        city: "Colorado Springs",
        state: "CO",
        zip: "80921",
        phone: "(719) 886-1100",
        image: "/hotels/hotel-polaris-exterior.webp",
        link: {
          href: "https://www.thehotelpolaris.com/",
          label: "Hotel Polaris by U.S. Air Force Academy"
        },
      },
    ],
    note: `
    <b>NOTE</b>: Hotel is located outside of the base security gates, no special access is required<br />
    <b>Event Location</b>: Generations Ballroom<br />
    <b>Dates</b>: Aug 4-5, 2026<br />
    <b>Group Name</b>: Air Force & Space Force Procurement<br />
    <b>Group Rate</b>: $209.00 ($239.00 including Fees) + Tax<br />
    <b>Group Rate Available</b>: August 2, 2026 - August 6, 2026<br />
    <b>Group Reservation Code (Booking Over Phone)</b>: 7666607<br />
    <b>Group Rate Cut Off</b>: July 13, 2026<br />
    <br/>
    <a href="https://be.synxis.com/?Hotel=43597&Chain=25042&config=Group&arrive=2026-08-03&depart=2026-08-05&adult=1&child=0&group=7666607" target="_blank" rel="noopener noreferrer" class="underline hover:text-accent text-blue-500">
      Book your group rate for the 2026 Air Force & Space Force Procurement Conference
    </a>
    <br />
    <br />
    <b>NOTE</b>: If you need to stay outside of the Official Group Dates (August 2 - August 5), Please call the Reservation Team at (833) 311-5581, or Email the Group Rooms Coordinator, Cissy Schat-Wilk at cissy.schat-wilk@thehotelpolaris.com. Group Rate honored 2 days before & after Group Dates based on hotel availability
    <br />
    <br />
    <div class="mb-4 bg-gray-100 p-4 rounded-xl">
    <b>Amenity Fee Covers:</b><br />
    • Wireless in room high speed internet (5Mbps)<br />
    • Unlimited Lavazza in-room coffee<br />
    • Unlimited filtered water at property wide refilling stations<br />
    • Sporting equipment & games (ping pong, pool, cornhole, bocce ball, and more)<br />
    • 10% off Ascend Spa Services<br />
    • 10% off all Grab 'n Go food and beverage (excludes alcohol)<br />
    • 10% off Flight Simulator Experiences<br />
    • Pool Towel Services<br />
    • 24 Hour Fitness Center access<br />
    • Santa Fe Trail access via Hotel Polaris Trailhead
    </div>
    `
  },
];
