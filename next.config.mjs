/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        unoptimized: true, // temporary due to vercel limits
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'americandefensealliance.org',
                port: '',
            },
            {
                protocol: 'https',
                hostname: 'd3hatd5vc8h86k.cloudfront.net',
                port: '',
            }
        ],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840, 4096],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512],
    },
    env: {
        AWS_REGION: process.env.AWS_REGION,
        AWS_S3_BUCKET_NAME: process.env.AWS_BUCKET_NAME,
        AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    },
    // Configure for handling large file uploads
    api: {
        bodyParser: false,
        responseLimit: false,
    },
};

export default nextConfig;
