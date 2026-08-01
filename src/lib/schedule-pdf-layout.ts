/**
 * Newspaper-style column pagination for the printable schedule.
 *
 * Lives outside SchedulePDF so the admin controls can enumerate the same pages
 * the PDF will produce - the placement dropdowns need to offer "Aug 4 - page 2"
 * before the document is rendered.
 *
 * LETTER size: 612 x 792 points.
 */

/**
 * Sentinel used in place of a day's date to target the dedicated full-width
 * sponsor page, which sits outside the paginated schedule.
 */
export const SPONSOR_PAGE_KEY = '__sponsor-page__';

/** the shape pagination actually reads; both callers pass richer items */
export type LayoutItem = {
  location?: string;
  speakers?: unknown[];
};

export type LayoutDay<T> = {
  date: string;
  items: T[];
};

export type PageColumns<T> = {
  left: T[];
  right: T[];
  /** estimated filled height of each column, used to find leftover space */
  leftHeight: number;
  rightHeight: number;
};

export type PaginatedDay<T> = {
  date: string;
  pages: PageColumns<T>[];
};

export type PaginationOptions = {
  twoColumnLayout: boolean;
  showSpeakers: boolean;
  showLocations: boolean;
};

// simple count-based cap as a backup to the height estimate
const MAX_ITEMS_PER_COLUMN = 12;
/** page height minus header/footer overhead - a loose budget tuned for pagination */
export const CONTENT_HEIGHT = 740;

export function estimateItemHeight(item: LayoutItem, opts: PaginationOptions): number {
  // very conservative fixed estimates
  let height = 25; // base height for time + title

  if (opts.showLocations && item.location) {
    height += 12;
  }

  // speakers are where most of the height comes from
  if (opts.showSpeakers && item.speakers && item.speakers.length > 0) {
    height += item.speakers.length * 46;
  }

  return height;
}

export function paginateSchedule<T extends LayoutItem>(
  days: LayoutDay<T>[],
  opts: PaginationOptions
): PaginatedDay<T>[] {
  const paginated: PaginatedDay<T>[] = [];

  days.forEach(day => {
    if (!opts.twoColumnLayout) {
      const height = day.items.reduce((sum, item) => sum + estimateItemHeight(item, opts), 0);
      paginated.push({
        date: day.date,
        pages: [{ left: day.items, right: [], leftHeight: height, rightHeight: 0 }],
      });
      return;
    }

    const pages: PageColumns<T>[] = [];
    let currentPage: PageColumns<T> = { left: [], right: [], leftHeight: 0, rightHeight: 0 };
    let currentColumn: 'left' | 'right' = 'left';

    day.items.forEach(item => {
      const itemHeight = estimateItemHeight(item, opts);

      // fill left first, then right, then start a new page
      const leftFull =
        currentPage.leftHeight + itemHeight > CONTENT_HEIGHT ||
        currentPage.left.length >= MAX_ITEMS_PER_COLUMN;
      const rightFull =
        currentPage.rightHeight + itemHeight > CONTENT_HEIGHT ||
        currentPage.right.length >= MAX_ITEMS_PER_COLUMN;

      if (currentColumn === 'left' && leftFull) {
        currentColumn = 'right';
      }

      if (currentColumn === 'right' && rightFull) {
        pages.push(currentPage);
        currentPage = { left: [], right: [], leftHeight: 0, rightHeight: 0 };
        currentColumn = 'left';
      }

      if (currentColumn === 'left') {
        currentPage.left.push(item);
        currentPage.leftHeight += itemHeight;
      } else {
        currentPage.right.push(item);
        currentPage.rightHeight += itemHeight;
      }
    });

    if (currentPage.left.length > 0 || currentPage.right.length > 0) {
      pages.push(currentPage);
    }

    paginated.push({ date: day.date, pages });
  });

  return paginated;
}

/** Human-readable label for a page, e.g. "Tuesday, August 4 - page 2 of 3" */
export function describePage(date: string, pageIndex: number, pageCount: number): string {
  const parsed = new Date(date);
  const label = isNaN(parsed.getTime())
    ? date
    : parsed.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return pageCount > 1 ? `${label} — page ${pageIndex + 1} of ${pageCount}` : label;
}
