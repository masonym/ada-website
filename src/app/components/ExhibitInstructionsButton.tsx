"use client";

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { fetchFileNamesFromCloud } from '@/lib/s3';

interface ExhibitInstructionsButtonProps {
  eventShorthand: string;
}

const ExhibitInstructionsButton: React.FC<ExhibitInstructionsButtonProps> = ({ eventShorthand }) => {
  const [pdfLink, setPdfLink] = useState<string | null>(null);

  useEffect(() => {
    const fetchPdfLink = async () => {
      const fileNames = await fetchFileNamesFromCloud(eventShorthand);
      const exhibitFile = fileNames.find(name => name.includes("Instructions"));

      if (exhibitFile) {
        setPdfLink(`${process.env.NEXT_PUBLIC_CDN_DOMAIN}/${exhibitFile}`);
      }
    };

    fetchPdfLink();
  }, [eventShorthand]);

  if (!pdfLink) return null;

  return (
    <Link
      href={pdfLink}
      target='_blank'
      className="inline-flex justify-center items-center px-6 py-3 mb-4 max-w-sm sm:max-w-lg bg-blue-900 text-white rounded-full hover:bg-blue-950 transition-all duration-300"
    >
      <span className="font-semibold text-center">
        View Exhibit Instructions
      </span>
    </Link>
  );
};

export default ExhibitInstructionsButton;
