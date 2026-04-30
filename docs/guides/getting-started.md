---
id: getting-started
type: guide
status: active
owner: sentra-engineering
tags: [onboarding, workspace]
---

# Getting started with The Abyss

Quick guide for new engineers from zero to first build.

## Prerequisites

- **Node.js** >= 22.0.0
- **pnpm** >= 9.0.0 (`npm install -g pnpm`)
- **Git** with repository access

## Quick start

```bash
# 1. Clone the repository
git clone https://github.com/Avvcenna+/abyss-monorepo.git
cd abyss-monorepo

# 2. Install all dependencies
pnpm install

# 3. Build the entire workspace
pnpm build

# 4. Start the dev server
pnpm dev
```

## Setup verification

```bash
# Check all workspace members are detected
pnpm ls --depth 0

# TypeScript strict check
pnpm typecheck

# Lint check
pnpm lint

# Format check
pnpm format:check
```

## Project structure

```
abyss-monorepo/
├── apps/           → Deployable applications (healthcare, academic, etc.)
├── packages/       → Shared libraries (@the-abyss/ui, @the-abyss/database, etc.)
├── tooling/        → Developer tools (abyss-cli, abyss-portal)
├── flows/          → Langflow workflow definitions
├── docs/           → Documentation, ADRs, guides
├── infrastructure/ → Docker, Terraform, ArgoCD
└── .agent/         → Agent memory, sessions, and handoff state
```

## Next steps

- Read [workspace-setup.md](./workspace-setup.md) to understand workspace commands
- Read [code-quality.md](./code-quality.md) for code quality standards
- Read [CONTRIBUTING.md](../../CONTRIBUTING.md) for the contribution workflow
