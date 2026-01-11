import { EVENTS } from '@/constants/events';
import { notFound } from 'next/navigation';
import MatchmakingPage from './MatchmakingPage';
import { getEventMatchmakingSponsors, MatchmakingSponsorWithNote } from '@/lib/sanity';

// revalidate every 60 seconds - no redeploy needed for matchmaking sponsor updates
export const revalidate = 60;

export async function generateStaticParams() {
  return EVENTS.map((event) => ({
    slug: event.slug,
  }));
}

export default async function Page({ params }: { params: { slug: string } }) {
  const event = EVENTS.find((e) => e.slug === params.slug);

  if (!event) {
    notFound();
  }

  // fetch matchmaking sponsors on the server
  const matchmakingData = await getEventMatchmakingSponsors(params.slug);

  return <MatchmakingPage matchmakingData={matchmakingData} />;
}