/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'americandefensealliance.org',
                port: '',
            },
            {
                protocol: 'https',
                hostname: 'dmeayq7l2oy8v.cloudfront.net',
                port: '',
            }
        ],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840, 4096],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512],
    }
};

export default nextConfig;
