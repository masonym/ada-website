import { test, expect } from '@playwright/test';

import { escapeHtml, escapeHtmlWithBreaks, sanitizeRichText } from '@/lib/html';

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
