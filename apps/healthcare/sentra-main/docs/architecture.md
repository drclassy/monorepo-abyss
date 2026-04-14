<!-- Architected and built by Claudesy. -->

# Architecture Documentation — Sentra AI Landing Site

_Last updated: 2026-03-11_

---

## Overview

Sentra AI is a **single-page application (SPA)** built with Next.js 16 App Router and React 19. It serves as the primary marketing and product showcase for Sentra's healthcare AI platform.

The site is designed to be:

- **Static-first** — no server-side data fetching, no database
- **Animation-rich** — Framer Motion + GSAP for polished UX
- **Maintainable** — one component per section, clear responsibility boundaries
- **Performant** — Next.js Image optimisation, font subsetting, Tailwind CSS purging

---

## Technology Decisions

See the [Architecture Decision Records](./adr/) directory for formal ADRs.

---

## Component Architecture

```
app/
  layout.tsx        — Root HTML shell, font loading, global metadata
  page.tsx          — Page composition (imports all 13 section components)
  globals.css       — Tailwind v4 @theme block, CSS custom properties

components/
  Navbar.tsx        — Fixed navigation bar with mobile menu
  Hero.tsx          — Full-viewport hero with animated headline
  ProjectSlider.tsx — Horizontal scroll slider for project highlights
  About.tsx         — Company about/mission section
  Clients.tsx       — Auto-scrolling client logo marquee
  SentraSim.tsx     — Interactive clinical simulation engine (~22KB, 21+ hooks)
  Showcase.tsx      — Product showcase grid
  Services.tsx      — Services list with icons
  Audrey.tsx        — Audrey AI assistant section
  News.tsx          — Latest news / blog article cards
  ScrollGallery.tsx — Full-viewport immersive scroll-based gallery
  CTA.tsx           — Call-to-action section
  Footer.tsx        — Site footer with links

  ui/
    immersive-scroll-gallery.tsx    — Scroll-driven full-viewport gallery primitive
    interactive-image-accordion.tsx — Image accordion with hover/click interaction
    sentra-bento-cards.tsx          — Bento grid card layout primitive
    sentra-kinetic-nav.tsx          — Kinetic/animated navigation primitive

lib/
  utils.ts          — cn() helper (clsx + tailwind-merge)
```

---

## Design System

**Tailwind v4** — configured entirely in `app/globals.css` via the `@theme` directive. No `tailwind.config.ts` file exists.

### Colour Tokens

| Token Name | Value | Usage |
|---|---|---|
| `--color-background` | `#0d0d0d` | Page background |
| `--color-foreground` | `#b7ab98` | Primary text |
| `--color-accent` | `#eb5939` | CTAs, highlights |
| `--color-muted` | `#b8ac99cc` | Secondary text |

### SentraSim Tokens (prefixed `--sdx-*`)

Additional CSS variables in `:root` power the SentraSim clinical simulation UI exclusively. They are scoped to the `[data-sentra-sim]` attribute selector.

### Typography

- **Primary:** Plus Jakarta Sans (`--font-jakarta`) — loaded via `next/font/google`
- **Secondary:** Inter (`--font-inter`) — loaded via `next/font/google`

---

## SentraSim Architecture

SentraSim is the most architecturally significant component (~22KB). It implements a **sequential async clinical simulation** with:

- 21+ `useState` hooks orchestrating simulation state
- Step-by-step progression through a patient case
- Animated text reveal (blur → clear) per step
- Colour-coded clinical findings (anamnesis, assessment, critical, warning)
- No external state management — all local to the component

**Key pattern:** Each simulation step sets `isTyping: true`, triggers a timeout, appends content to the display buffer, then sets `isTyping: false`. The UI is driven entirely by derived state from these hooks.

---

## Performance Considerations

- `next/image` — automatic WebP/AVIF conversion, lazy loading, size optimisation
- Google Fonts loaded via `next/font` — zero layout shift, automatic subsetting
- Tailwind CSS v4 — zero-runtime CSS, only used classes included in output
- Framer Motion — tree-shaken, `AnimatePresence` used for enter/exit animations
- No client-side data fetching — no loading states, no API waterfall

---

## Future Improvements

- Add OpenTelemetry SDK for performance observability (traces, Web Vitals)
- Add automated E2E tests with Playwright
- Add `@next/bundle-analyzer` to monitor bundle size regressions
- Consider React Server Components for static sections (Hero, About, Footer) to reduce JS bundle
- Add CSP headers in `next.config.mjs` `headers()` for XSS protection

---

_Architected and built by Claudesy._
