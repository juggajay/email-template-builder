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
  
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;