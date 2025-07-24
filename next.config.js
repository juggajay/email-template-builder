const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['res.cloudinary.com', 'images.unsplash.com', 'www.zebamail.com', 'zebamail.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // SEO-friendly redirects
  async redirects() {
    return [
      // Add www to non-www
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'zebamail.com',
          },
        ],
        destination: 'https://www.zebamail.com/:path*',
        permanent: true,
      },
    ];
  },
  
  // Performance optimizations
  compress: true,
  productionBrowserSourceMaps: false,
  
  // Enable SWC minification
  swcMinify: true,
  
  webpack: (config, { isServer }) => {
    // Tree shaking optimization
    config.optimization = {
      ...config.optimization,
      // usedExports: true, // Commented out - conflicts with Next.js caching
      sideEffects: false,
    };
    
    // Split chunks more aggressively
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
      
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true
          }
        }
      };
    }
    
    return config;
  },
};

module.exports = withBundleAnalyzer(nextConfig);