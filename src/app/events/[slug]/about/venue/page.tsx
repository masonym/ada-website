import { notFound } from 'next/navigation';
import { getEventBySlug } from '@/lib/events';
import VenuePageClient from './VenuePageClient';

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  return <VenuePageClient event={event} />;
}
