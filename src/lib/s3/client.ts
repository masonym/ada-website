import 'server-only';

import { S3Client } from '@aws-sdk/client-s3';

/**
 * The single S3 client for the whole app.
 *
 * `server-only` is load-bearing here, not decorative: this module reads
 * AWS_SECRET_ACCESS_KEY, so importing it from a client component has to fail the
 * build rather than quietly inline the key into a browser bundle. Every other
 * module that talks to S3 should import from here instead of constructing its
 * own client - previously there were six, with three different default regions
 * between them.
 */
export const S3_REGION = process.env.AWS_REGION || 'us-west-2';
export const S3_BUCKET = process.env.AWS_BUCKET_NAME || 'americandefensealliance';

export const s3Client = new S3Client({
  region: S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

/** Public URL for an object key, via the CDN when one is configured. */
export function toAssetUrl(key: string): string {
  const cdn = process.env.NEXT_PUBLIC_CDN_DOMAIN;
  if (cdn) {
    return `${cdn.replace(/\/$/, '')}/${key.replace(/^\//, '')}`;
  }
  return `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key.replace(/^\//, '')}`;
}
