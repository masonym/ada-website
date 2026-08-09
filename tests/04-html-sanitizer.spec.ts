import { test, expect } from '@playwright/test';

import { escapeHtml, escapeHtmlWithBreaks, htmlToText, sanitizeRichText } from '@/lib/html';

/**
 * The sanitiser that stands between Sanity-authored copy and every event page.
 *
 * Offline - no network, no credentials, no browser. Sponsor descriptions,
 * speaker bios and schedule text are all rendered through
 * dangerouslySetInnerHTML, so a hole here is a stored XSS on public pages.
 * These cases are the ones a hand-rolled sanitiser usually gets wrong.
 */

test.describe('escapeHtml', () => {
  test('escapes every character that can start markup', () => {
    expect(escapeHtml(`<>&"'`)).toBe('&lt;&gt;&amp;&quot;&#39;');
  });

  test('escapes before converting newlines, so only <br> survives', () => {
    expect(escapeHtmlWithBreaks('a\n<b>')).toBe('a<br>&lt;b&gt;');
  });
});

test.describe('sanitizeRichText', () => {
  test('keeps the formatting tags authors actually use', () => {
    const input = '<p>A <strong>bold</strong> and <em>italic</em> line.<br/>Next</p>';
    expect(sanitizeRichText(input)).toBe(
      '<p>A <strong>bold</strong> and <em>italic</em> line.<br>Next</p>'
    );
  });

  test('treats a closing </br> as a line break, the way browsers do', () => {
    // Several speaker bios use </br></br> as a paragraph break. Discarding it as
    // a stray end tag would run those paragraphs together.
    expect(sanitizeRichText('one</br></br>two')).toBe('one<br><br>two');
  });

  test('drops disallowed tags but keeps their text', () => {
    expect(sanitizeRichText('<div>hello <span>there</span></div>')).toBe(
      'hello <span>there</span>'
    );
  });

  test('removes the event-handler payloads this exists to stop', () => {
    const result = sanitizeRichText('<img src=x onerror="alert(1)">caption');
    expect(result).toBe('caption');
    expect(result).not.toContain('onerror');
  });

  test('strips script tags, leaving their contents as inert text', () => {
    const result = sanitizeRichText('<script>alert(document.cookie)</script>');
    expect(result).not.toContain('<script');
    expect(result).toBe('alert(document.cookie)');
  });

  test('a stray angle bracket in prose cannot start a tag', () => {
    // The classic failure of a strip-and-repeat sanitiser: removing the inner
    // tag lets the outer fragments join into a live one. A single pass with the
    // leftovers escaped cannot do that.
    const result = sanitizeRichText('<scr<script>ipt>alert(1)</scr</script>ipt>');
    expect(result).not.toContain('<script');
    expect(result).not.toMatch(/<[a-zA-Z]/);
  });

  test('keeps safe link targets and discards every other attribute', () => {
    expect(sanitizeRichText('<a href="https://example.com" onclick="steal()">x</a>')).toBe(
      '<a href="https://example.com" rel="noopener noreferrer">x</a>'
    );
    expect(sanitizeRichText('<a href="/events/2026-nmcpc">x</a>')).toBe(
      '<a href="/events/2026-nmcpc" rel="noopener noreferrer">x</a>'
    );
    expect(sanitizeRichText('<a href="mailto:info@example.com">x</a>')).toContain('mailto:');
  });

  test('drops javascript: and data: hrefs, keeping the link text', () => {
    expect(sanitizeRichText('<a href="javascript:alert(1)">click</a>')).toBe('<a>click</a>');
    expect(sanitizeRichText('<a href="data:text/html,<script>">click</a>')).toBe('<a>click</a>');
    expect(sanitizeRichText('<a href="JaVaScRiPt:alert(1)">click</a>')).toBe('<a>click</a>');
    // Protocol-relative URLs go off-site without declaring a scheme.
    expect(sanitizeRichText('<a href="//evil.example/x">click</a>')).toBe('<a>click</a>');
  });

  test('quoted attribute values cannot smuggle a tag boundary', () => {
    const result = sanitizeRichText('<a href="x> <img src=y onerror=alert(1)>">link</a>');
    expect(result).not.toContain('onerror');
    expect(result).not.toContain('<img');
  });

  test('is idempotent, so double-sanitising does not mangle copy', () => {
    const input = '<p>Ben &amp; Co <strong>&lt;the best&gt;</strong></p>';
    const once = sanitizeRichText(input);
    expect(sanitizeRichText(once)).toBe(once);
  });

  test('leaves plain prose exactly as written', () => {
    const input = 'Director, Office of Small Business Programs';
    expect(sanitizeRichText(input)).toBe(input);
  });
});

/**
 * The other half of the contract: a sanitised value is HTML, so anywhere it is
 * rendered as text it has to come back through here first.
 *
 * Sanitising a speaker's position - which is plain text in the CMS, ampersand
 * and all - turned "Founder & President" into "Founder &amp; President" on the
 * speakers page, because that line is rendered as text. Positions are no longer
 * sanitised; names still are, and these are the sites that flatten them.
 */
test.describe('htmlToText', () => {
  test('decodes the entities escaping produced', () => {
    expect(htmlToText(sanitizeRichText('Founder & President'))).toBe('Founder & President');
    expect(htmlToText('Ben &amp; Co &lt;tag&gt; &quot;quoted&quot; &#39;s')).toBe(
      `Ben & Co <tag> "quoted" 's`
    );
  });

  test('decodes once, so an escaped entity stays visible', () => {
    // "&amp;lt;" is how an author writes a literal "&lt;". Decoding twice would
    // turn it into a "<" and reintroduce markup into supposedly plain text.
    expect(htmlToText('&amp;lt;')).toBe('&lt;');
  });

  test('turns a line-break name into a real line break', () => {
    // One CMS name splits the district onto its own line this way.
    expect(htmlToText('Representative Neal Dunn <br/>(R-FL)')).toBe(
      'Representative Neal Dunn \n(R-FL)'
    );
  });

  test('drops tags and keeps their text', () => {
    expect(htmlToText('<strong>Dr.</strong> Reynaldo A. Santana')).toBe('Dr. Reynaldo A. Santana');
    expect(htmlToText('<a href="https://example.com">President</a>')).toBe('President');
  });

  test('leaves a name with no markup untouched', () => {
    expect(htmlToText('Lieutenant General Darrell K. Williams, U.S. Army (Ret.)')).toBe(
      'Lieutenant General Darrell K. Williams, U.S. Army (Ret.)'
    );
  });

  test('decodes numeric references, including hex', () => {
    expect(htmlToText('caf&#233; &#x2013; bar')).toBe('café – bar');
  });
});
