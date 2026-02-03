import type { NextConfig } from "next";

// Bundle analyzer setup
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year caching for public images
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.efalcon.sa',
      },
      {
        protocol: 'https',
        hostname: 'efalcon.sa',
      },
      {
        protocol: 'https',
        hostname: '**.vercel.app',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Disable optimization for API routes to avoid 400 errors
    unoptimized: process.env.NODE_ENV === 'development',
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['framer-motion', '@radix-ui/react-icons', 'lucide-react'],
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  // Production optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // Enhanced webpack configuration for better performance
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle splitting
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        maxSize: 244000, // Smaller chunks for mobile (244KB)
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            maxSize: 200000, // Smaller vendor chunks for mobile
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
            maxSize: 150000, // Smaller common chunks for mobile
          },
          // Mobile-specific chunk for heavy components
          mobile: {
            test: /[\\/]components[\\/](sections|pages)[\\/]/,
            name: 'mobile-components',
            chunks: 'async',
            maxSize: 100000, // Very small chunks for mobile
            priority: 10,
          },
        },
      };
    }
    
    return config;
  },
  // Smart caching headers
  async headers() {
    return [
      // Public images - aggressive caching
      {
        source: '/gallery/:path(.*)*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'CDN-Cache-Control',
            value: 'public, max-age=31536000',
          },
        ],
      },
      {
        source: '/_next/image/:path(.*)*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path(.*)*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Admin uploads - with ETag for cache validation
      {
        source: '/uploads/:path(.*)*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, must-revalidate',
          },
          {
            key: 'CDN-Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=3600',
          },
        ],
      },
      // GridFS files - moderate caching with revalidation
      {
        source: '/api/gridfs/:path(.*)*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, must-revalidate',
          },
        ],
      },
      // Admin routes - no caching
      {
        source: '/admin/:path(.*)*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
      // Admin API routes - no caching
      {
        source: '/api/admin/:path(.*)*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
