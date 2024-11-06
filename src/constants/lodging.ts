

type Hotel = {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  image: string;
};

type LodgingInfo = {
  eventId: number;
  hotels: Hotel[];
  note?: string;
};


export const LODGING_INFO: LodgingInfo[] = [
    {
      eventId: 3, // Match with event ID from EVENTS
      hotels: [
        {
          name: "Hampton Inn & Suites",
          address: "9004 Astronaut Blvd.",
          city: "Cape Canaveral",
          state: "Florida",
          zip: "32920",
          phone: "321-784-0021",
          image: "/hotels/hampton-inn.png"
        },
        {
          name: "Courtyard by Marriott Titusville – Kennedy Space Center",
          address: "6245 Riverfront Center Blvd,",
          city: "Titusville",
          state: "FL",
          zip: "",
          phone: "321-966-9200",
          image: "/hotels/courtyard-marriott.png"
        }
      ],
      note: "Please note there is no room block for this event."
    }
    // Add more events' lodging info here
  ];