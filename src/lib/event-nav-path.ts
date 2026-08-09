/**
 * The single transform from a nav group's label to its URL segment.
 *
 * Nav groups in src/constants/eventNavs.tsx carry a label but no path, so the
 * route segment is derived from the label. That derivation used to exist twice -
 * here's shape in EventNavBar, and a different one in app/sitemap.ts that
 * lowercased and then replaced every non-alphanumeric run with a hyphen. They
 * agree on today's labels and would diverge on the next one: "Venue & Parking"
 * becomes `venue-parking` under one and `venueparking` under the other, so the
 * navbar would link somewhere the sitemap never advertised.
 *
 * This module is the version that produces the live URLs, and both consumers
 * import it. Deliberately dependency-free: EventNavBar is a client component, so
 * anything reachable from here ends up in the browser bundle.
 *
 * The real fix is still to put the path in the data - renaming a nav label
 * silently changes a live URL, and nothing in eventNavs.tsx says so (MAINT-04).
 * One shared function at least means a rename cannot break the two apart.
 */
export function navGroupPath(label: string): string {
  return label
    // Only the first ampersand, matching the live behaviour: "Sponsorships &
    // Exhibits" -> "sponsorships-exhibits".
    .replace('&', '-')
    .replace(/\s/g, '')
    .toLowerCase();
}

export type EventNavItem = {
  label: string;
  path?: string;
  subItems?: Array<{ label: string; path: string }>;
};

/**
 * Builds an event page URL, tolerating the slash conventions in the data.
 *
 * Nav entries are inconsistent about leading slashes - event 2 has
 * `path: 'venue-and-lodging'` while events 4 through 8 have
 * `path: '/venue-and-lodging'`. Interpolated naively that produced
 * `/events/<slug>//venue-and-lodging`, so the Venue & Lodging link on five
 * events answered 308 and redirected before rendering, and the sitemap
 * advertised the redirecting form. Normalising here means the data can stay
 * however it is written.
 */
export function eventPageUrl(slug: string, path?: string): string {
  const segment = (path ?? '').replace(/^\/+|\/+$/g, '');
  return segment ? `/events/${slug}/${segment}` : `/events/${slug}`;
}

/**
 * Every route segment a nav tree points at, relative to /events/<slug>.
 *
 * The overview entry (path '/') is excluded - the event's own URL covers it.
 */
export function eventNavPaths(navItems: EventNavItem[]): string[] {
  const paths: string[] = [];

  for (const item of navItems) {
    const segment = (item.path ?? '').replace(/^\/+|\/+$/g, '');
    if (segment) {
      paths.push(segment);
    }

    for (const subItem of item.subItems ?? []) {
      paths.push(`${navGroupPath(item.label)}/${subItem.path.replace(/^\/+/, '')}`);
    }
  }

  return paths;
}
