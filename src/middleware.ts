import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticatedAdmin } from '@/lib/admin-auth'

/**
 * Paths that require a valid admin session.
 *
 * Gating here rather than route-by-route is deliberate: previously only one of
 * the eighteen routes under /api/admin called isAuthenticatedAdmin, so every
 * other one - create a promo code, remove a sponsor from their tiers, rewrite a
 * published agenda, upload to the bucket - executed for any anonymous caller. A
 * central matcher means a new admin route is protected by default rather than by
 * remembering to add the check.
 */
const ADMIN_PREFIXES = [
  '/admin',
  '/api/admin',
  // Direct-to-S3 uploads. Only the admin UI calls these, and unauthenticated
  // writes to the production bucket are both a defacement and a storage-cost lever.
  '/api/upload',
  '/api/get-presigned-url',
  // Renders every email template with mock data; useful internally, not publicly.
  '/dev',
  // Reports whether AWS credentials are configured, plus bucket and region.
  // Consumed by the admin dashboard's status widget.
  '/api/s3-config',
  // Proxies the iContact account and returns its mailing lists.
  '/api/get-lists',
]

/** Reachable without a session, so an admin can actually log in. */
const ADMIN_PUBLIC_PATHS = ['/admin/login', '/api/admin-auth']

function requiresAdmin(pathname: string): boolean {
  if (ADMIN_PUBLIC_PATHS.some(path => pathname === path || pathname.startsWith(`${path}/`))) {
    return false
  }

  return ADMIN_PREFIXES.some(
    prefix => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )
}

export async function middleware(request: NextRequest) {
  const url = request.nextUrl

  if (requiresAdmin(url.pathname)) {
    if (!(await isAuthenticatedAdmin(request))) {
      // API callers get a status they can act on; page requests get the login
      // form, with the original path so they land back where they were going.
      if (url.pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const loginUrl = new URL('/admin/login', url)
      loginUrl.searchParams.set('returnUrl', url.pathname + url.search)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Everything except static assets and image optimisation. Unlike the
     * previous matcher this deliberately includes /api, because the admin API
     * routes are the surface that actually needed protecting.
     */
    '/((?!_next/static|_next/image|favicon.ico|icon.ico|robots.txt|sitemap.*\\.xml).*)',
  ],
}
