/** @type {import('next').NextConfig} */
// Classy Transformer Engine V2 — Next.js Config
const nextConfig = {
  // Shared TS-source packages must be transpiled by Next.
  transpilePackages: ['@the-abyss/observability'],
  // Keep the Respan runtime and its tracing stack out of the bundle.
  // The observability hook runs only on the Node server, and these packages
  // pull in Node built-ins like `stream`, `fs`, and `tls` that webpack should
  // leave to the runtime instead of trying to bundle.
  serverExternalPackages: [
    '@respan/respan',
    '@respan/tracing',
    '@opentelemetry/sdk-node',
    '@opentelemetry/exporter-logs-otlp-grpc',
    '@opentelemetry/otlp-grpc-exporter-base',
    '@grpc/grpc-js',
  ],
  // Windows: exclude user home paths from file tracing to avoid EPERM
  outputFileTracingExcludes: {
    '*': ['**/Users/**', '**/Application Data/**', '**/AppData/**'],
  },
  async headers() {
    const ContentSecurityPolicy = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.xendit.co",
      'frame-src https://accounts.google.com',
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')

    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          { key: 'Content-Security-Policy', value: ContentSecurityPolicy },
        ],
      },
    ]
  },
  webpack: (config, { isServer }) => {
    config.module.exprContextCritical = false
    if (isServer) {
      const existingExternals = Array.isArray(config.externals)
        ? config.externals
        : config.externals
          ? [config.externals]
          : []

      config.externals = [
        ...existingExternals,
        ({ request }, callback) => {
          if (
            request &&
            (request.startsWith('@respan/') ||
              request.startsWith('@opentelemetry/') ||
              request.startsWith('@grpc/'))
          ) {
            return callback(null, `commonjs ${request}`)
          }

          return callback()
        },
      ]
    }
    return config
  },
}

export default nextConfig
