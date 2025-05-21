/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable SWC for production builds
  swcMinify: true,
  // Disable Babel in production
  experimental: {
    forceSwcTransforms: true,
  },
};

module.exports = nextConfig; 