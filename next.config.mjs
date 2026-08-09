/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true, // temporary due to vercel limits
    remotePatterns: [
      {
        protocol: "https",
        hostname: "americandefensealliance.org",
        port: "",
      },
      {
        protocol: "https",
        hostname: "d3hatd5vc8h86k.cloudfront.net",
        port: "",
      },
      {
        protocol: "https",
        hostname: "cdn.americandefensealliance.org",
        port: "",
      },
      {
        protocol: "https",
        hostname: "nc4xlou0.cdn.sanity.io",
        port: "",
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840, 4096],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512],
  },
  // NOTE: do not add an `env` block here. Next inlines those values as string
  // literals into every bundle that references them, including client bundles -
  // which is how AWS_SECRET_ACCESS_KEY ended up shipping to browsers. Server
  // code reads process.env directly at runtime and needs nothing declared here;
  // anything the browser genuinely needs belongs behind a NEXT_PUBLIC_ prefix.
  async redirects() {
    return [
      {
        source:
          "/events/2025-defense-technology-aerospace-procurement-conference/:path*",
        destination:
          "/events/2026-defense-technology-aerospace-procurement-conference/:path*",
        permanent: true,
      },
      {
        source: "/events/:slug/sponsors-exhibitors/:path*",
        destination: "/events/:slug/sponsorships-exhibits/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
