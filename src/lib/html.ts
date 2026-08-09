/**
 * Escaping and sanitising for text that ends up inside markup.
 *
 * Dependency-free on purpose: this is imported by API routes that run on the
 * Workers runtime, where a DOM-based sanitiser like DOMPurify needs a jsdom
 * shim it cannot have.
 */

const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/**
 * Escapes a string for interpolation into HTML.
 *
 * The contact form used to put the submitted name and message straight into the
 * mail body. It is our own inbox, so the blast radius was small - but a
 * submitted `<a href>` rendered as a live link in a message that appears to come
 * from our own domain, which is a tidy phishing primitive against staff.
 */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, character => HTML_ENTITIES[character]);
}

/**
 * Escapes text and turns newlines into <br>, for a plain-text field being shown
 * as HTML. Escaping happens first, so the <br> tags are the only markup that
 * survives.
 */
export function escapeHtmlWithBreaks(value: string): string {
  return escapeHtml(value).replace(/\r?\n/g, '<br>');
}

/** A well-formed named, decimal or hex character reference. */
const ENTITY_PATTERN = /&(?:[a-zA-Z][a-zA-Z0-9]{1,31}|#\d{1,7}|#[xX][0-9a-fA-F]{1,6});/g;

/**
 * Escapes text that already lives in HTML, leaving existing entities alone.
 *
 * Plain escapeHtml would turn an authored `&amp;` into `&amp;amp;`, so the page
 * would show the characters "&amp;". Entities are safe to keep: `&lt;` decodes
 * to a literal `<` in text, never to the start of a tag. Keeping them is also
 * what makes sanitizeRichText idempotent.
 */
function escapeHtmlPreservingEntities(value: string): string {
  // Split on entities so each run between them can be escaped in full.
  const parts: string[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;
  const pattern = new RegExp(ENTITY_PATTERN.source, 'g');

  while ((match = pattern.exec(value)) !== null) {
    parts.push(escapeHtml(value.slice(cursor, match.index)), match[0]);
    cursor = pattern.lastIndex;
  }

  parts.push(escapeHtml(value.slice(cursor)));
  return parts.join('');
}

/**
 * Tags a CMS author is allowed to use. Everything outside this list is dropped,
 * keeping the text inside it - so pasting from Word yields plain prose rather
 * than a broken page, and `<img onerror>` yields nothing at all.
 */
const ALLOWED_TAGS = new Set([
  'a', 'b', 'br', 'em', 'i', 'li', 'ol', 'p', 's', 'span', 'strong', 'sub', 'sup', 'u', 'ul',
]);

/**
 * Tags with no closing form.
 *
 * A closing `</br>` is emitted as a `<br>` rather than discarded, which is what
 * browsers do with it. Several speaker bios in the CMS use `</br></br>` as a
 * paragraph break; dropping those would silently run their paragraphs together.
 */
const VOID_TAGS = new Set(['br']);

/** Matches one tag, treating quoted attribute values as opaque. */
const TAG_PATTERN = /<\/?([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^>])*)>/g;

const HREF_PATTERN = /href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i;

/** http(s), mailto, tel, and same-site links. Notably not javascript: or data:. */
const SAFE_HREF = /^(?:https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i;

function sanitizeAnchor(attributes: string): string {
  const match = HREF_PATTERN.exec(attributes);
  const href = (match?.[1] ?? match?.[2] ?? match?.[3] ?? '').trim();

  // Every other attribute is discarded, which is what removes onclick, style
  // and the rest without having to enumerate them.
  if (!href || !SAFE_HREF.test(href)) return '<a>';

  return `<a href="${escapeHtmlPreservingEntities(href)}" rel="noopener noreferrer">`;
}

/**
 * Reduces CMS-authored HTML to an allowlist of formatting tags.
 *
 * Sponsor descriptions, speaker bios and schedule text are written in Sanity and
 * rendered through dangerouslySetInnerHTML on public event pages. Combined with
 * the admin routes that were unauthenticated until recently, that was a stored
 * XSS path onto every event page: an `<img onerror>` in a sponsor description
 * would have executed for every visitor. Authoring is gated now; this makes the
 * rendering safe on its own, so the two failures have to happen together.
 *
 * Deliberately not DOMPurify: this runs during server rendering on the Workers
 * runtime, where there is no DOM for it to work against.
 *
 * The scan escapes everything between tags and emits only recognised tags, so a
 * stray `<` in prose becomes text rather than the start of something. Nothing is
 * applied twice or looped, which is where hand-rolled sanitisers usually go
 * wrong - a dropped tag cannot combine with its neighbours to form a new one.
 */
export function sanitizeRichText(html: string): string {
  let output = '';
  let cursor = 0;
  let match: RegExpExecArray | null;

  // exec() with /g is stateful; a fresh regex per call keeps this re-entrant.
  const pattern = new RegExp(TAG_PATTERN.source, 'g');

  while ((match = pattern.exec(html)) !== null) {
    output += escapeHtmlPreservingEntities(html.slice(cursor, match.index));
    cursor = pattern.lastIndex;

    const name = match[1].toLowerCase();
    if (!ALLOWED_TAGS.has(name)) continue;

    const isClosing = match[0][1] === '/';
    if (isClosing) {
      output += VOID_TAGS.has(name) ? `<${name}>` : `</${name}>`;
      continue;
    }

    output += name === 'a' ? sanitizeAnchor(match[2]) : `<${name}>`;
  }

  return output + escapeHtmlPreservingEntities(html.slice(cursor));
}

/** Sanitises a value that may be absent, preserving undefined. */
export function sanitizeOptionalRichText<T extends string | undefined | null>(
  value: T
): T extends string ? string : T {
  return (typeof value === 'string' ? sanitizeRichText(value) : value) as never;
}

/** The entities sanitizeRichText and escapeHtml can produce, plus &nbsp;. */
const NAMED_CHARACTERS: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

/** Resolves character references in one pass, so `&amp;lt;` yields `&lt;`. */
function decodeEntities(value: string): string {
  return value.replace(ENTITY_PATTERN, entity => {
    const body = entity.slice(1, -1);

    if (body[0] !== '#') return NAMED_CHARACTERS[body.toLowerCase()] ?? entity;

    const isHex = body[1] === 'x' || body[1] === 'X';
    const code = parseInt(isHex ? body.slice(2) : body.slice(1), isHex ? 16 : 10);
    return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : entity;
  });
}

/**
 * Turns a sanitised HTML value back into plain text.
 *
 * Speaker names are authored as HTML - one carries a `<br/>` to split the
 * parenthesised district onto its own line - but several places render a name as
 * text rather than markup: the agenda cards, the printable schedule, and the PDF
 * generator, which has no HTML renderer at all. Handing those the sanitised
 * string directly shows the tags and, worse, the `&amp;` an ampersand escaped
 * into. Tags become their text, `<br>` becomes a newline.
 */
export function htmlToText(html: string): string {
  const withBreaks = html.replace(/<\/?br\s*\/?>/gi, '\n');
  return decodeEntities(withBreaks.replace(/<[^>]*>/g, '')).trim();
}
