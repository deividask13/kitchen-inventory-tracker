import type { NextConfig } from "next";

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  // Add empty turbopack config to silence the warning
  turbopack: {},
  
  // Performance optimizations
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Enable compression
  compress: true,
  
  // Optimize production builds
  productionBrowserSourceMaps: false,
  
  // Code splitting optimization
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
};

// For now, we'll configure PWA manually in the app
// The next-pwa plugin has compatibility issues with Next.js 16 and Turbopack
export default withBundleAnalyzer(nextConfig);
