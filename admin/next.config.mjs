/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['100.73.186.4'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
