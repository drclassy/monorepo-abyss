# Getting Started — The Abyss

Panduan untuk engineer baru dari nol sampai build pertama.

## Prerequisites

- **Node.js** >= 22.0.0
- **pnpm** >= 9.0.0 (`npm install -g pnpm`)
- **Git** dengan akses ke repository

## Quick Start

```bash
# 1. Clone repository
git clone https://github.com/Claudesy/abyss-monorepo.git
cd abyss-monorepo

# 2. Install semua dependencies
pnpm install

# 3. Build seluruh workspace
pnpm build

# 4. Jalankan dev server
pnpm dev
```

## Verifikasi Setup

```bash
# Cek semua workspace members terdeteksi
pnpm ls --depth 0

# TypeScript strict check
pnpm typecheck

# Lint check
pnpm lint

# Format check
pnpm format:check
```

## Struktur Project

```
abyss-monorepo/
├── apps/           → Deployable applications (healthcare, academic, etc.)
├── packages/       → Shared libraries (@the-abyss/ui, @the-abyss/database, etc.)
├── tooling/        → Developer tools (abyss-cli, abyss-portal)
├── flows/          → Langflow workflow definitions
├── docs/           → Documentation, ADRs, guides
├── infrastructure/ → Docker, Terraform, ArgoCD
└── .agents/        → AI agent governance (AGENTS.md, HANDOFF.md)
```

## Langkah Selanjutnya

- Baca [workspace-setup.md](./workspace-setup.md) untuk memahami workspace commands
- Baca [code-quality.md](./code-quality.md) untuk standar kualitas kode
- Baca [CONTRIBUTING.md](../../CONTRIBUTING.md) untuk workflow kontribusi
