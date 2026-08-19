import { NextRequest, NextResponse } from 'next/server';
import { listEventFiles } from '@/lib/s3/event-documents';

/**
 * The exhibitor instructions PDF an event's confirmation emails link to.
 *
 * /dev/email-preview renders the real templates client-side, but this one input
 * is resolved by scanning the event's bucket prefix, which only the server can
 * do. Without it the preview would silently drop the Exhibitor Instructions
 * section that the sent email includes.
 */
export async function GET(request: NextRequest) {
  const eventShorthand = request.nextUrl.searchParams.get('event') || '';

  if (!eventShorthand) {
    return NextResponse.json({ error: 'Missing event' }, { status: 400 });
  }

  const keys = await listEventFiles(eventShorthand);

  return NextResponse.json({
    exhibitorInstructions: keys.find((key) => key.includes('Instructions')) || '',
  });
}
