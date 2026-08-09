// app/events/[slug]/layout.tsx

import { notFound } from "next/navigation";
import { getEventBundle } from "@/lib/events";
import EventLayout from "./EventLayout";

/**
 * Resolves the event once, here on the server, and hands the pieces down.
 *
 * The two components in this layout used to be client components that each
 * imported the whole EVENTS array and searched it by `useParams().slug` - which
 * meant every event's marketing copy, JSX and topical-coverage lists shipped in
 * the browser bundle of every event sub-page, to render one hero image and one
 * nav bar.
 */
export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const bundle = getEventBundle(slug);

  if (!bundle) {
    notFound();
  }

  return (
    <EventLayout event={bundle.event} navItems={bundle.navItems}>
      {children}
    </EventLayout>
  );
}
