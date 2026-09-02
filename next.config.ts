import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'olmekyhmduxbahjmebsd.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;