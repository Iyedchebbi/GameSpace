import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash-redirect.com',
      },
      {
        protocol: 'https',
        hostname: '**.insforge.app',
      },
    ],
  },
};

export default nextConfig;
