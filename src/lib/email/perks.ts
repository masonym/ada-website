/**
 * Shared rendering for the perk lists that back both sponsorship and exhibitor
 * confirmation emails. Sponsorships (`@/constants/sponsorships`) and exhibit
 * spaces (`@/constants/exhibitors`) declare perks in the same two shapes - the
 * legacy `tagline`/`description` pair and the newer indent-tagged `formatted`
 * array - so the email side renders them with one implementation rather than a
 * copy per category.
 */

export interface FormattedPerkItem {
  content: string;
  bold?: boolean;
  indent?: number;
}

export interface PerkLike {
  tagline?: string;
  description?: string;
  formatted?: FormattedPerkItem[];
}

/** Flattens every perk to plain text, for keyword checks. */
export function perkText(perks: PerkLike[]): string {
  return perks
    .map((perk) => {
      if (perk.formatted?.length) {
        return perk.formatted.map((f) => f.content).join(' ');
      }
      return [perk.tagline, perk.description].filter(Boolean).join(' ');
    })
    .join(' ')
    .toLowerCase();
}

interface PerkNode {
  content: string;
  bold?: boolean;
  children: PerkNode[];
}

/** Groups a flat, indent-tagged perk list into a tree. */
function buildPerkTree(items: FormattedPerkItem[]): PerkNode[] {
  const roots: PerkNode[] = [];
  // stack[i] holds the node currently open at indent level i.
  const stack: PerkNode[] = [];

  for (const item of items) {
    const node: PerkNode = { content: item.content, bold: item.bold, children: [] };
    // Clamp to one level deeper than what's open, so a jump from indent 0 to 2
    // (a data typo) still nests rather than dropping the item.
    const depth = Math.min(item.indent ?? 0, stack.length);

    if (depth === 0) {
      roots.push(node);
    } else {
      stack[depth - 1].children.push(node);
    }

    stack.length = depth;
    stack.push(node);
  }

  return roots;
}

function renderPerkNodes(nodes: PerkNode[]): string {
  return nodes
    .map(
      (node) =>
        `<li>${node.bold ? `<strong>${node.content}</strong>` : node.content}${
          node.children.length ? `<ul>${renderPerkNodes(node.children)}</ul>` : ''
        }</li>`
    )
    .join('');
}

/** Renders one perk group, nesting sub-items by their indent level. */
export function renderPerk(perk: PerkLike): string {
  // Legacy tagline/description perks.
  if (!perk.formatted?.length) {
    if (!perk.description) return perk.tagline ? `<p><strong>${perk.tagline}</strong></p>` : '';
    return perk.tagline
      ? `<p><strong>${perk.tagline}:</strong> ${perk.description}</p>`
      : `<p>${perk.description}</p>`;
  }

  return buildPerkTree(perk.formatted)
    .map((node) => {
      const heading = node.bold
        ? `<p><strong>${node.content}</strong></p>`
        : `<p>${node.content}</p>`;
      return node.children.length
        ? `${heading}<ul>${renderPerkNodes(node.children)}</ul>`
        : heading;
    })
    .join('\n      ');
}

/** Renders a whole perk list. */
export function renderPerks(perks: PerkLike[]): string {
  return perks.map(renderPerk).join('\n      ');
}

export const CONTACT =
  '<a href="mailto:events@americandefensealliance.org">events@americandefensealliance.org</a>';

/** "a, b, and c" */
export function joinList(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

/** "$395" - additional-pass prices are always whole dollars. */
export function formatUsd(amount: number): string {
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
}

/** The additional-pass product as it should be named in prose. */
export interface AdditionalPassLike {
  name?: string;
  title?: string;
  price?: number;
}

/**
 * "$395 Additional Exhibitor Attendee Pass" - or just the pass name when the
 * event's data has no price, so an email never quotes a number we can't back up.
 */
export function additionalPassLabel(
  pass: AdditionalPassLike | undefined,
  fallbackName: string
): string {
  const name = pass?.title || pass?.name || fallbackName;
  return pass?.price ? `${formatUsd(pass.price)} ${name}` : name;
}
