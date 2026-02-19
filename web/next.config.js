const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      // GCP Storage (ONNX models)
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
      // Clerk user avatars (if you use Clerk)
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
      {
        protocol: 'https',
        hostname: 'clerk.com',
      },
      {
        protocol: 'https',
        hostname: 'images.clerk.dev',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx'],
    }
    
    // LanceDB configuration for Next.js
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config
  },
  // Proxy API calls to remote GCP gateway or local dev
  async rewrites() {
    // Use NEXT_PUBLIC_BACKEND_URL or NEXT_PUBLIC_API_URL, with fallback for build time
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 
                      process.env.NEXT_PUBLIC_API_URL || 
                      'https://placeholder.example.com'; // Placeholder for build, overridden at runtime
    
    // Only throw error if we're in a build context and it's truly missing
    // (Runtime will use the actual Cloud Run env var)
    if (!backendUrl || backendUrl === 'https://placeholder.example.com') {
      // Allow build to proceed with placeholder - actual value set at runtime
      console.warn('NEXT_PUBLIC_BACKEND_URL not set at build time, using placeholder');
    }
    
    return [
      {
        source: '/v1/:path*',
        destination: `${backendUrl}/v1/:path*`,
      },
      {
        source: '/modelguard/:path*',
        destination: `${backendUrl}/modelguard/:path*`,
      },
      {
        source: '/docs',
        destination: `${backendUrl}/docs`,
      },
      {
        source: '/redoc',
        destination: `${backendUrl}/redoc`,
      },
      {
        source: '/openapi.json',
        destination: `${backendUrl}/openapi.json`,
      },
      {
        source: '/healthz',
        destination: `${backendUrl}/healthz`,
      },
      {
        source: '/readyz',
        destination: `${backendUrl}/readyz`,
      },
    ];
  },
};

module.exports = nextConfig;
