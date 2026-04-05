// Claudesy Transformer Engine V2 — Sentry Client Config
// Runs in the browser. Captures unhandled exceptions and React render errors.

import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // 10% of transactions in prod, 100% in dev
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Session replays: 1% normal, 100% on error
  replaysSessionSampleRate: 0.01,
  replaysOnErrorSampleRate: 1.0,

  debug: false,

  integrations: [
    Sentry.replayIntegration({
      // Mask all text/media for user privacy
      maskAllText: true,
      blockAllMedia: true,
      // Block prompt/textarea inputs from being captured in replays
      block: ['textarea', '[data-sentry-block]', '.prompt-input'],
    }),
  ],
})
