import { notFound } from 'next/navigation';
import { getEventBySlug } from '@/lib/events';
import VenueAndLodgingClient from './VenueAndLodgingClient';

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  return <VenueAndLodgingClient event={event} />;
}
