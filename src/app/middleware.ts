import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  if (request.nextUrl.hostname === 'americandefensealliance.com') {
    return NextResponse.redirect('https://americandefensealliance.org' + request.nextUrl.pathname);
  }
}

export const config = {
  matcher: '/:path*',
};