# The Abyss

**AI-Native Monorepo for the Sentra Artificial Intelligence Ecosystem**

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](./LICENSE)
[![Node.js](https://img.shields.io/badge/Node-%3E%3D22.0.0-brightgreen)](https://nodejs.org)
[![pnpm](https://img.shields.io/badge/pnpm-9.15.0-orange)](https://pnpm.io)
[![CI](https://github.com/Docsynapse/abyss-monorepo/actions/workflows/ci.yml/badge.svg)](https://github.com/Docsynapse/abyss-monorepo/actions/workflows/ci.yml)

---

## Overview

The Abyss is the core infrastructure monorepo powering the **Sentra Artificial Intelligence** healthcare platform — an Artificial Intelligence-native system designed for clinical decision support, patient trajectory analysis, and secure health data orchestration in Indonesia.

This repository contains all shared packages, tooling, and infrastructure configurations that underpin the Sentra ecosystem. Application-level services live in their own dedicated repositories and consume packages published from this monorepo.

---

## Architecture

```
abyss-monorepo/
├── packages/                  # Shared packages (published via GitHub Packages)
│   ├── artificial-core/       # Artificial Intelligence consensus engine & orchestration
│   ├── database/              # Prisma client & schema — single source of truth
│   ├── iskandar-gatekeeper/   # Auth gateway: JWT enforcement, rate limiting, security
│   ├── fhir-engine/           # FHIR R4 data models & parsing for healthcare data
│   ├── langflow-client/       # LangFlow workflow integration client
│   ├── vector-store/          # Vector embeddings store for Artificial Intelligence retrieval
│   ├── integration-bridge/    # External service integrations (SATUSEHAT, BPJS, etc.)
│   ├── shared-types/          # Shared TypeScript types across all packages and apps
│   ├── sentra-ui/             # Sentra Healthcare UI component library
│   ├── design-token/          # Design tokens — colors, typography, spacing, borders
│   ├── config-eslint/         # Shared ESLint configuration
│   └── config-typescript/     # Shared TypeScript configuration
│
├── tooling/
│   └── abyss-cli/             # Internal CLI for scaffolding and workspace management
│
├── infrastructure/
│   └── docker/                # Docker Compose for local development stack
│
├── .github/workflows/         # CI/CD + DevSecOps pipelines
└── .agent/                    # Agent context files (PROGRESS, HANDOFF, LESSONS)
```

---

## Prerequisites

| Tool     | Version    | Purpose                        |
|----------|------------|--------------------------------|
| Node.js  | `>=22.0.0` | Runtime                        |
| pnpm     | `>=9.0.0`  | Package manager (workspace)    |
| Docker   | Latest     | Local infrastructure stack     |
| Git      | `>=2.40`   | Version control                |

---

## Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/Docsynapse/abyss-monorepo.git
cd abyss-monorepo

# 2. Install dependencies (all packages in workspace)
pnpm install

# 3. Generate Prisma client
pnpm db:generate

# 4. Start local infrastructure (PostgreSQL, Redis)
docker compose -f infrastructure/docker/docker-compose.yml up -d

# 5. Build all packages
pnpm build
```

---

## Development

```bash
# Build all packages (Turborepo incremental)
pnpm build

# Run tests across all packages
pnpm test

# Lint all packages
pnpm lint

# Format all files
pnpm format

# Type-check without emitting
pnpm typecheck

# Visualize dependency graph
pnpm graph

# Run a specific package command
pnpm --filter @the-abyss/database db:studio
```

### Working with the Database

```bash
pnpm db:generate   # Generate Prisma client from schema
pnpm db:push       # Push schema changes to dev database (no migration file)
pnpm db:migrate    # Create and apply a migration
pnpm db:studio     # Open Prisma Studio GUI
```

---

## Packages

| Package | Description |
|---------|-------------|
| `@the-abyss/ai-core` | Artificial Intelligence consensus engine — multi-model orchestration and clinical decision support |
| `@the-abyss/database` | Prisma ORM client and schema definitions shared across all services |
| `@the-abyss/iskandar-gatekeeper` | Security gateway — JWT enforcement, timing-safe auth, rate limiting |
| `@the-abyss/fhir-engine` | FHIR R4 data models, parsers, and validators for healthcare interoperability |
| `@the-abyss/langflow-client` | TypeScript client for LangFlow Artificial Intelligence workflow orchestration |
| `@the-abyss/vector-store` | Vector embedding store for Artificial Intelligence retrieval-augmented generation |
| `@the-abyss/integration-bridge` | Adapter layer for SATUSEHAT, BPJS, and external healthcare APIs |
| `@the-abyss/shared-types` | Shared TypeScript interfaces, enums, and DTOs |
| `@the-abyss/ui` | Accessible, healthcare-grade UI component library (React) |
| `@the-abyss/design-token` | Design token primitives — colors, typography, spacing, borders |
| `@the-abyss/config-eslint` | Shared ESLint ruleset for consistent code quality |
| `@the-abyss/config-typescript` | Shared `tsconfig` base configurations |

---

## CI / DevSecOps

This repository runs a layered, automated security and quality pipeline:

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| **CI** | Push / PR | Build, lint, test across all affected packages |
| **Security Scan** | Push / PR / Weekly | Semgrep SAST, TruffleHog secret detection, Trivy container scan |
| **Auto-Fix** | CI failure | Automatically opens a PR with format and lint fixes |
| **Auto-Merge** | Renovate PR | Auto-merges patch dependency updates when CI passes |
| **Dependency Audit** | Push / Weekly | `pnpm audit` + Snyk vulnerability scan |

Dependency updates are managed by **Renovate**:
- Patch updates → auto-merged immediately after CI passes
- Minor updates → grouped into a weekly PR for review
- Major updates → require manual review and approval

---

## Security

Healthcare applications handle sensitive patient data. This repository enforces:

- **PHI/PII Policy** — No patient data in source code, logs, commits, fixtures, or test data — ever
- **Secret Detection** — TruffleHog scans every push for leaked credentials
- **SAST** — Semgrep scans against OWASP Top 10, TypeScript, and Node.js rulesets
- **Dependency Auditing** — Automated weekly audits with Snyk and `pnpm audit`
- **Container Scanning** — Trivy scans Docker images for critical CVEs on every push

To run the primary healthcare security scan locally:

```bash
pnpm security:primary-healthcare
```

---

## Contributing

This is a private repository maintained by the Claudesy engineering team. Internal contributors should follow the **JET Protocol** defined in [CONTRIBUTING.md](./CONTRIBUTING.md) and read the `.agent/` context files before starting any session.

Branch strategy:
- `main` — stable, production-ready
- `feat/*` — feature branches, opened as PRs against `main`
- Direct pushes to `main` are reserved for documentation changes only

---

## License

Copyright 2026 **Claudesy** (Dr. Ferdi Iskandar)

Licensed under the **Apache License, Version 2.0** (the "License"); you may not use files in this repository except in compliance with the License.

You may obtain a copy of the License at:

> http://www.apache.org/licenses/LICENSE-2.0

### What This Means

| You Can | Requirement |
|---------|-------------|
| Use commercially | Preserve copyright notice |
| Modify freely | State all changes made |
| Distribute copies | Include the full Apache 2.0 license text |
| Sublicense | Distribute under the same Apache 2.0 terms |
| Use privately | No requirement to disclose source |
| Use patents | Contributors grant patent rights explicitly |

**Patent Protection:** Apache 2.0 includes an explicit patent grant from every contributor. If any entity initiates patent litigation claiming that a contribution in this repository constitutes patent infringement, that entity's patent license is automatically terminated.

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an **"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND**, either express or implied. See the [LICENSE](./LICENSE) file for the full text governing permissions and limitations.

---

*Built with precision by the Claudesy engineering team · Powered by [Claude Code](https://claude.ai/claude-code)*
