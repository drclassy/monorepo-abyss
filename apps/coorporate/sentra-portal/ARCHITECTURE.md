# File: ARCHITECTURE.md | App: sentra-portal | Repo: abyss-v3 | Updated: 2026-03-16
# Architected and built by Claudesy.

# Architecture — Sentra Portal

## Stack
- Next.js 15 App Router + React 19
- TypeScript strict + Tailwind CSS + shadcn/ui
- pnpm workspace package: sentra-portal

## Structure
`
sentra-portal/
├── app/          Next.js App Router pages
├── components/   UI components
├── lib/          Utilities
└── public/       Static assets
`

## Platform Dependencies
- @abyss/ui, @abyss/types, @abyss/utils (packages layer)
- @abyss/guardrails (platform layer — always active)

## Design Tokens
Background: #0d0d0d | Foreground: #b7ab98 | Accent: #eb5939

<sub>Architected and built by Claudesy — 2026 · Sentra Healthcare Artificial Intelligence</sub>
