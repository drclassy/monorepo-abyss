// Claudesy Transformer Engine V2 — Sentry Server Config
// Runs in Node.js runtime: API routes, Server Components, SSR.

import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  debug: false,
})