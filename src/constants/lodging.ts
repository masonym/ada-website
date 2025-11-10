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

type LodgingInfo = {
  eventId: number;
  hotels: Hotel[];
  note?: string;
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
    <a href='https://www.marriott.com/event-reservations/reservation-link.mi?guestreslink2=true&id=1740589200251&key=GRP' target='_blank' rel='noopener noreferrer' class='underline hover:text-accent text-blue-500'>Reservation Link</a>`
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
<a href="https://www.marriott.com/event-reservations/reservation-link.mi?id=1753131167945&key=GRP&app=resvlink" target="_blank" rel="noopener noreferrer" class="underline hover:text-accent text-blue-500">
  Book your group rate for 2026 Defense Technology & Aerospace Procurement Conference
</a>
<br/>
<br/>
<b>To Book Extra Nights at the Group Rate, please email 
  <a href="mailto:kaitlin.cahill@renaissancehotels.com" class="text-blue-600 hover:underline text-nowrap">
    kaitlin.cahill@renaissancehotels.com
  </a>
</b><br/>
<b>Subject Line:</b> "Request to Add Reservation at Group Rate" 2026 Defense Technology & Aerospace Procurement Conference
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
    `
  },
];
