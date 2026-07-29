/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow cross-origin requests from private development network origins
  allowedDevOrigins: ['100.73.186.4'],

  // Ignore ESLint errors during production build steps
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Ignore TypeScript build errors during production build steps
  typescript: {
    ignoreBuildErrors: true,
  },

  // Serving unoptimized static image assets
  images: {
    unoptimized: true,
  },
}

export default nextConfig

