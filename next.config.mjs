/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/images/**',
      },
    ],
  },
  // Disable TypeScript type checking during build
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  // Disable ESLint during build
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // Configuration for webpack to optimize Fast Refresh
  webpack: (config, { dev, isServer }) => {
    // Only apply in development and not on the server
    if (dev && !isServer) {
      // Increase time between rebuilds
      config.watchOptions = {
        ...config.watchOptions,
        aggregateTimeout: 300, // Wait this amount of time after changes before rebuilding
        poll: false, // Use native file system notification system
        ignored: /node_modules/, // Ignore node_modules to reduce rebuilds
      };
    }
    return config;
  },
}

export default nextConfig; 