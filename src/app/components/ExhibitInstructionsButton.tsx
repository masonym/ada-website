"use client";

import React, { useEffect, useState } from 'react';
import { getCdnPath } from '@/utils/image';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

interface ExhibitInstructionsButtonProps {
  eventShorthand: string;
}

const ExhibitInstructionsButton: React.FC<ExhibitInstructionsButtonProps> = ({ eventShorthand }) => {
  const [pdfLink, setPdfLink] = useState<string | null>(null);

  useEffect(() => {
    const fetchPdfLink = async () => {
      // Simulate fetching file names from the cloud directory
      const fileNames = await fetchFileNamesFromCloud(eventShorthand);
      const exhibitFile = fileNames.find(name => name.includes("Exhibit Instructions"));

      if (exhibitFile) {
        setPdfLink(getCdnPath(`/events/${eventShorthand}/${exhibitFile}`));
      }
    };

    fetchPdfLink();
  }, [eventShorthand]);

  if (!pdfLink) return null;

  return (
    <a href={pdfLink} target="_blank" rel="noopener noreferrer">
      <button>View Exhibit Instructions</button>
    </a>
  );
};

// Mock function to simulate fetching file names from the cloud
async function fetchFileNamesFromCloud(eventShorthand: string): Promise<string[]> {
  const bucketName = process.env.AWS_S3_BUCKET_NAME!;
  const prefix = `events/${eventShorthand}/`;
  console.log("bucketName:", bucketName);

  const command = new ListObjectsV2Command({
    Bucket: bucketName,
    Prefix: prefix,
  });

  try {
    const data = await s3Client.send(command);
    const fileNames = data.Contents?.map(item => item.Key || '') || [];
    return fileNames.filter(name => name.includes("Exhibit Instructions"));
  } catch (error) {
    console.error("Error fetching file names from S3:", error);
    return [];
  }
}

export default ExhibitInstructionsButton;
