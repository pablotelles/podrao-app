import type { NextConfig } from 'next';
import withSerwist from '@serwist/next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
};

export default withSerwist({
  swSrc: 'src/sw.ts',
  swDest: 'public/sw.js',
})(nextConfig);
