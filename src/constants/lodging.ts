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
    note: "Group Block Name: Navy & Marine Corps Procurement Conference<br />Group Rate: Standard Room: $159.00 + Tax | Waterview Room: $179.00 + Tax<br />Rate Available: July 27-31, 2025<br />Group Rate Cut-off Date: July 8, 2025 or Until Group Block is Sold Out<br /><a href='https://url.emailprotection.link/?bkrcT345E6zVHw_8ljjFpQ-xX1mnPDJ-PmtO0uopQbtNNK2iEErtjkhVxQZqXMCjKOCuqwesnHGKdX9d_6bIHn1B3_vJOAZFRbiTXqQ2Xhzbduf-VmJ14lRDHAUG5i0H1gyjLd7lII6holldgQyruxuiWsPnvLfKN6BKL_A5KPu0~' target='_blank' rel='noopener noreferrer' class='underline hover:text-accent text-blue-500'>Reservation Link</a>"
  }
  // Add more events' lodging info here
];
