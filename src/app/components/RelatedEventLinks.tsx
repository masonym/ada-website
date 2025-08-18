import React from 'react';
import Link from 'next/link';
import { Event, EventLink } from '@/types/events';
import { EVENTS } from '@/constants/events';
import { Link as LinkIcon, ArrowRight, ArrowLeft, Clock } from 'lucide-react';

function resolveHref(link: EventLink): string {
  if (link.hrefOverride) return link.hrefOverride;
  const slug = link.targetSlug;
  switch (link.intent) {
    case 'speakers':
      return `/events/${slug}/speakers`;
    case 'sponsor':
      return `/events/${slug}/sponsor`;
    case 'event':
      return `/events/${slug}`;
    case 'custom':
      return link.hrefOverride || `/events/${slug}`;
    case 'recap':
    default:
      return `/events/${slug}/about/event-recap`;
  }
}

function resolveLabel(link: EventLink): string {
  if (link.label) return link.label;
  const target = EVENTS.find(e => e.slug === link.targetSlug);
  const targetTitle = target?.title ?? link.targetSlug;
  if (link.intent === 'recap') {
    if (link.relation === 'previous') return 'View Previous Event Recap';
    if (link.relation === 'next') return 'View Next Event Recap';
    return `View ${targetTitle} Recap`;
  }
  return `View ${targetTitle}`;
}

function resolveRelationBadge(link: EventLink): React.ReactNode | null {
  if (!link.relation) return null;
  if (link.relation === 'previous') return <Clock />;
  if (link.relation === 'next') return <ArrowRight />;
  return null;
}

export default function RelatedEventLinks({ event }: { event: Event }) {
  const links = event.links ?? [];
  if (!links.length) return null;

  const renderLink = (link: EventLink, key?: string | number) => {
    const badge = resolveRelationBadge(link);
    return (
      <Link
        key={key ?? link.targetSlug}
        href={resolveHref(link)}
        className="group inline-flex items-center gap-3 rounded-lg border border-slate-300 bg-white/90 px-4 py-3 text-slate-700 shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:border-navy-300 hover:shadow-md"
      >
        {badge && (
          <span className="text-[10px] font-semibold uppercase tracking-wide text-navy-700 bg-navy-600/10 px-2 py-1 rounded">
            {badge}
          </span>
        )}
        <span className="font-medium">{resolveLabel(link)}</span>
        <ArrowRight className="h-4 w-4 text-navy-700 transition-transform group-hover:translate-x-0.5" />
      </Link>
    );
  };

  if (links.length === 1) {
    return <div className="w-fit mx-auto mb-4">{renderLink(links[0])}</div>;
  }

  return (
    <section className="w-fit max-w-6xl mx-auto px-4 mb-4">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 shadow-sm">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-navy-600/10 text-navy-700">
            <LinkIcon className="h-5 w-5" />
          </span>
          <h2 className="text-xl sm:text-2xl font-gotham font-bold text-slate-800">Related Links</h2>
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          {links.map((link, idx) => renderLink(link, idx))}
        </div>
      </div>
    </section>
  );
}

