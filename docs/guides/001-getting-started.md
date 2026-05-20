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
git clone https://github.com/drclassy/abyss-monorepo.git
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

## FAQ

### PNPM install gagal di drive `V:` dengan error copy-on-write / reflink

Beberapa volume Windows tidak mendukung copy-on-write yang dipakai PNPM secara default. Jika install gagal dengan error seperti `Destination volume does not support copy-on-write` atau `reflink`, jalankan:

```bash
pnpm install --package-import-method=copy
```

Gunakan mode ini juga saat perlu rebuild `node_modules` dari nol di volume `V:`.

### Husky atau pre-commit hook tidak jalan

Pastikan Git repo ini memakai hooks path yang benar:

```bash
git config core.hooksPath .husky/_
```

Lalu verifikasi toolchain hook tersedia:

```bash
pnpm exec lint-staged --version
```

Jika `lint-staged` tidak ditemukan atau masih menunjuk ke path repo lama, rebuild install dengan:

```bash
pnpm install --frozen-lockfile --ignore-scripts --package-import-method=copy
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

- Read [workspace-setup.md](./002-workspace-setup.md) to understand workspace commands
- Read [code-quality.md](./003-code-quality.md) for code quality standards
- Read [CONTRIBUTING.md](../../CONTRIBUTING.md) for the contribution workflow
