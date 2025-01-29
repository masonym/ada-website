"use client";

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

interface ProspectusInstructionsButtonProps {
    eventShorthand: string;
}

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

const fetchFileNamesFromCloud = async (eventShorthand: string): Promise<string[]> => {
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    const prefix = `events/${eventShorthand}/`;

    const command = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix,
    });

    try {
        const data = await s3Client.send(command);
        const fileNames = data.Contents?.map(item => item.Key || '') || [];
        return fileNames.filter(name => name.includes("Prospectus"));
    } catch (error) {
        console.error("Error fetching file names from S3:", error);
        return [];
    }
};

const SponsorProspectus: React.FC<ProspectusInstructionsButtonProps> = ({ eventShorthand }) => {
    const [pdfLink, setPdfLink] = useState<string | null>(null);

    useEffect(() => {
        const fetchPdfLink = async () => {
            const fileNames = await fetchFileNamesFromCloud(eventShorthand);
            const ProspectusFile = fileNames.find(name => name.includes("Prospectus"));

            if (ProspectusFile) {
                setPdfLink(`${process.env.NEXT_PUBLIC_CDN_DOMAIN}/${ProspectusFile}`);
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
                View Sponsorship & Exhibitor Prospectus
            </span>
        </Link>
    )
}

export default SponsorProspectus
