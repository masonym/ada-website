import { NextResponse } from "next/server";
import { client, urlFor } from "@/lib/sanity";
import { EVENTS } from "@/constants/events";

export async function GET() {
  try {
    // fetch all event sponsors from sanity
    const eventSponsors = await client.fetch(`
      *[_type == "eventSponsor"] {
        _id,
        eventId,
        title,
        tiers[] {
          id,
          name,
          style,
          sponsors[] {
            _type,
            _ref
          }
        }
      }
    `);

    // fetch all sponsors to get logo URLs
    const allSponsors = await client.fetch(`
      *[_type == "sponsor"] {
        _id,
        name,
        logo,
        description,
        website
      }
    `);

    // create sponsor lookup map
    const sponsorMap = new Map(
      allSponsors.map((s: any) => [
        s._id,
        {
          _id: s._id,
          name: s.name,
          logoUrl: s.logo ? urlFor(s.logo).url() : "",
          description: s.description,
          website: s.website,
        },
      ])
    );

    // build events with sponsor data
    const events = eventSponsors.map((es: any) => {
      // find event name from EVENTS constant
      const eventInfo = EVENTS.find((e) => e.id === es.eventId);
      const eventName = eventInfo?.title || `Event ${es.eventId}`;

      return {
        eventId: es.eventId,
        eventName,
        title: es.title,
        tiers: (es.tiers || []).map((tier: any) => ({
          id: tier.id,
          name: tier.name,
          style: tier.style,
          sponsors: (tier.sponsors || [])
            .map((ref: any) => sponsorMap.get(ref._ref))
            .filter(Boolean)
            .sort((a: any, b: any) => a.name.localeCompare(b.name)),
        })),
      };
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Failed to fetch banner data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
