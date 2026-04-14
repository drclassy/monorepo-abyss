// Designed and constructed by Claudesy.
import type { NextConfig } from 'next'

const isProduction = process.env.NODE_ENV === 'production'

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  `script-src 'self' 'unsafe-inline'${isProduction ? '' : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https:",
  [
    "connect-src 'self'",
    'https://puskesmasbalowerti.com',
    'https://www.puskesmasbalowerti.com',
    'https://crew.puskesmasbalowerti.com',
    'https://primary-healthcare-production.up.railway.app',
    'ws:',
    'wss:',
    ...(isProduction ? [] : ['http://localhost:*', 'ws://localhost:*']),
  ].join(' '),
].join('; ')

const nextConfig: NextConfig = {
  reactStrictMode: false,
  transpilePackages: ['socket.io-client', 'engine.io-client', '@socket.io/component-emitter'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
          { key: 'Content-Security-Policy', value: contentSecurityPolicy.replace(/\s{2,}/g, ' ') },
        ],
      },
    ]
  },
}

export default nextConfig
