import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, '..'),
  outputFileTracingIncludes: {
    '/api/command': ['./claudesy_memory/**/*.py'],
    '/api/daemon': ['./claudesy_memory/**/*.py'],
    '/api/facts/[id]': ['./claudesy_memory/**/*.py'],
    '/api/state': ['./claudesy_memory/**/*.py'],
    '/api/search': ['./claudesy_memory/**/*.py'],
  },
}

export default nextConfig
