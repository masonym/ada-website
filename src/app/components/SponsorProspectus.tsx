import Link from 'next/link';
import React from 'react';

/**
 * Link to the event's sponsorship & exhibitor prospectus.
 *
 * The URL is resolved on the server (see lib/s3/event-documents) and passed in.
 * This component used to look it up itself with an S3Client in a useEffect,
 * which meant shipping AWS credentials to the browser.
 */
interface SponsorProspectusProps {
  /** Resolved prospectus URL, or null when the event has no prospectus uploaded. */
  href?: string | null;
}

const SponsorProspectus: React.FC<SponsorProspectusProps> = ({ href }) => {
  if (!href) return null;

  return (
    <Link
      href={href}
      target="_blank"
      className="inline-flex justify-center items-center px-6 py-3 mb-4 max-w-sm sm:max-w-lg bg-blue-900 text-white rounded-full hover:bg-blue-950 transition-all duration-300"
    >
      <span className="font-semibold text-center">
        View Sponsorship &amp; Exhibitor Prospectus
      </span>
    </Link>
  );
};

export default SponsorProspectus;
