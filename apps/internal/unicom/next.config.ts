import path from 'path'

import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@the-abyss/unicom-client', '@the-abyss/unicom-core'],
  turbopack: {
    root: path.join(__dirname, '..', '..', '..'),
  },
  outputFileTracingRoot: path.join(__dirname, '..', '..', '..'),
}

export default nextConfig
