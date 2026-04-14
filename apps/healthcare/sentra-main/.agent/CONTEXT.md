# CONTEXT.md — sentra-main
<!-- Static. Update only when stack or architecture changes. -->
<!-- Last updated: 2026-04-10 -->

## Project Identity

| Field | Value |
|-------|-------|
| Name | Sentra Main |
| Package | `@the-abyss/sentra-main` |
| Division | apps/healthcare |
| Purpose | Sentra Healthcare AI primary brand and marketing website — core platform orchestration hub |
| Owner | Dr. Ferdi Iskandar (Chief) |
| Status | Active |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Frontend | React 19, Tailwind CSS v4 |
| Language | TypeScript (strict) |
| Animation | GSAP, Framer Motion |
| Dev mode | Webpack (default), Turbopack (`dev:turbo`) |
| Deploy | Vercel / Custom Infrastructure |

## Architecture

Modern Micro-Frontend-ready Monolith Core. SSR-first.
Data flow: `Request → Core Gateway → Service Orchestration → Unified Response`

Key modules: `app/core/`, `lib/orchestrator/`, `components/shared/`

## Critical Files

| File/Folder | Rule |
|-------------|------|
| `next.config.mjs` | Do NOT modify without Chief approval |
| `tsconfig.json` | Do NOT modify without Chief approval |
| `ARCHITECTURE.md` | Highest authority for architectural decisions |

## Hard Constraints

- Brand colors, typography, logo — NEVER modify without Chief approval
- GSAP and Framer Motion animations are intentional — do not remove or simplify
- Tailwind v4 only — do not introduce v3 syntax or downgrade
- Core logic must remain generically modular — no hyper-specific business logic in core modules
- Compatibility with satellite services (sentra-assist, sentra-portal, dashboard) must not break
- Use `next dev --webpack` for default dev; `dev:turbo` is available but secondary
