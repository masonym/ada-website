import { EVENTS } from '@/constants/events';
import { notFound } from 'next/navigation';
import MatchmakingPage from './MatchmakingPage';

export async function generateStaticParams() {
  return EVENTS.map((event) => ({
    slug: event.slug,
  }));
}

export default function Page({ params }: { params: { slug: string } }) {
  const event = EVENTS.find((e) => e.slug === params.slug);

  if (!event) {
    notFound();
  }

  return <MatchmakingPage />;
}