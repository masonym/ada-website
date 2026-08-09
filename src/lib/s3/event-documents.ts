import 'server-only';

import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { s3Client, S3_BUCKET, toAssetUrl } from './client';

/**
 * Per-event PDFs that staff upload straight to the bucket rather than
 * registering anywhere in code - the sponsorship prospectus and the exhibitor
 * instructions. They are found by scanning the event's prefix for a filename
 * containing a keyword, which is why this cannot just be a static path.
 *
 * This used to run in the browser: two client components each constructed an
 * S3Client from process.env and listed the bucket on mount. That shipped the
 * AWS credentials and the whole S3 SDK to every visitor. Resolve on the server
 * and pass the URLs down as props instead.
 */
export type EventDocumentUrls = {
  prospectus: string | null;
  exhibitInstructions: string | null;
};

const EMPTY: EventDocumentUrls = { prospectus: null, exhibitInstructions: null };

/** Every object key under an event's prefix. Returns [] rather than throwing. */
export async function listEventFiles(eventShorthand: string): Promise<string[]> {
  if (!eventShorthand) return [];

  try {
    const data = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: S3_BUCKET,
        Prefix: `events/${eventShorthand}/`,
      })
    );

    return data.Contents?.map(item => item.Key || '').filter(Boolean) ?? [];
  } catch (error) {
    console.error(`[s3] Failed to list files for event ${eventShorthand}:`, error);
    return [];
  }
}

/**
 * Both document URLs from a single listing. The old code made one ListObjectsV2
 * call per document over the same prefix; this halves that.
 */
export async function getEventDocumentUrls(
  eventShorthand: string
): Promise<EventDocumentUrls> {
  const keys = await listEventFiles(eventShorthand);
  if (keys.length === 0) return EMPTY;

  const prospectus = keys.find(key => key.includes('Prospectus'));
  const exhibitInstructions = keys.find(key => key.includes('Instructions'));

  return {
    prospectus: prospectus ? toAssetUrl(prospectus) : null,
    exhibitInstructions: exhibitInstructions ? toAssetUrl(exhibitInstructions) : null,
  };
}
