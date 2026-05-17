import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  const userAgent = request.headers.get('user-agent') || ''
  const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || ''
  
  // Log suspicious activity for investigation
  if (isBot(userAgent)) {
    console.log('Bot detected:', {
      userAgent,
      ip,
      path: url.pathname,
      timestamp: new Date().toISOString()
    })
  }
  
  // Allow request to proceed
  return NextResponse.next()
}

function isBot(userAgent: string): boolean {
  const bots = [
    'googlebot',
    'bingbot',
    'slurp',
    'duckduckbot',
    'baiduspider',
    'yandexbot',
    'facebookexternalhit',
    'twitterbot',
    'rogerbot',
    'linkedinbot',
    'embedly',
    'quora link preview',
    'showyoubot',
    'outbrain',
    'pinterest',
    'developers.google.com'
  ]
  
  return bots.some(bot => userAgent.toLowerCase().includes(bot))
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
