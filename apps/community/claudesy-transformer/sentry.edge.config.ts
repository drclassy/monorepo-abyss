// Claudesy Transformer Engine V2 — Sentry Edge Config
// Runs in Edge runtime: middleware, edge API routes.
// Subset of Sentry features available (no Node.js APIs).

import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  debug: false,
})
