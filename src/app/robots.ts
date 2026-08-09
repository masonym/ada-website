import { MetadataRoute } from 'next'

/**
 * robots.txt.
 *
 * This handler previously never shipped: next-sitemap's postbuild step wrote
 * public/robots.txt, and a static file in public/ wins over a route handler. The
 * generated one was `Allow: /` with no disallows, so /admin and /dev were fully
 * crawlable while the only rule here disallowed /private/, a path that does not
 * exist.
 *
 * The disallows below are the paths that are gated in src/middleware.ts. Keep
 * the two lists in step: robots.txt is a request to well-behaved crawlers, the
 * middleware is what actually enforces it.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/dev', '/api'],
    },
    sitemap: 'https://www.americandefensealliance.org/sitemap.xml',
  }
}
