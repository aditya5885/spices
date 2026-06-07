import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },
  ...(isDev ? {
    async rewrites() {
      return [
        {
          source: '/:path*.html',
          destination: '/:path*',
        },
      ];
    }
  } : {})
};

export default nextConfig;


