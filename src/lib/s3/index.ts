import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const fetchFileNamesFromCloud = async (eventShorthand: string): Promise<string[]> => {
  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  const prefix = `events/${eventShorthand}/`;


  const command = new ListObjectsV2Command({
    Bucket: bucketName,
    Prefix: prefix,
  });

  try {
    const data = await s3Client.send(command);
    const fileNames = data.Contents?.map(item => item.Key || '') || [];
    console.log(fileNames.filter(name => name.includes("Instructions")));
    return fileNames.filter(name => name.includes("Instructions"));
  } catch (error) {
    console.error("Error fetching file names from S3:", error);
    return [];
  }
};
