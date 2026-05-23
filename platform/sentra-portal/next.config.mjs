/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@sentra/design-token', '@sentra/ui'],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
