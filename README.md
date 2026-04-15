# The Abyss

**AI-Native Monorepo for the Sentra AI Ecosystem**

[![CI](https://img.shields.io/github/actions/workflow/status/Docsynapse/abyss-monorepo/ci.yml?branch=main)](https://github.com/Docsynapse/abyss-monorepo/actions)
[![License](https://img.shields.io/badge/license-UNLICENSED-red)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D22.0.0-brightgreen)](https://nodejs.org)
[![pnpm](https://img.shields.io/badge/pnpm-%3E%3D9.0.0-yellow)](https://pnpm.io)
[![TypeScript](https://img.shields.io/badge/typescript-5.7.x-blue)](https://www.typescriptlang.org)
[![Next.js](https://img.shields.io/badge/next.js-16.x-black)](https://nextjs.org)

---

## Overview

The Abyss is an AI-native monorepo designed to serve as the unified infrastructure layer for all Sentra AI products — from healthcare referral systems and clinical simulators to AI orchestration and internal tooling.

It enforces a disciplined, agent-compatible engineering workflow through three core principles: every task is declared before execution, every deployment is gated, and every commit is traceable. The architecture is built on domain isolation with shared packages, enabling independent scaling of applications while preserving a single source of truth for cross-cutting concerns such as database schemas, AI model abstractions, FHIR validation, and design systems.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                         THE ABYSS MONOREPO                           │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  .agent/              AI Steering & agent governance rules          │
│  .github/              CI/CD pipelines & GO-Gate enforcement         │
│                                                                      │
│  apps/                 (migrated to separate repos — see polyrepo)  │
│                                                                      │
│  flows/                Versioned Langflow JSON definitions           │
│                                                                      │
│  packages/                                                           │
│    ├── ui              Design System (Shadcn UI)                     │
│    ├── database        Prisma Schema & Client                        │
│    ├── ai-core         Multi-Model Consensus Engine                  │
│    ├── langflow-client Langflow TypeScript SDK                       │
│    ├── fhir-engine     FHIR R4 Validation                            │
│    ├── vector-store    RAGOps & Vector Search                        │
│    ├── iskandar-gatekeeper  GO-Gate Validator                        │
│    └── shared-types    Global TypeScript Definitions                 │
│                                                                      │
│  tooling/                                                            │
│    └── abyss-cli       Internal developer CLI                        │
│                                                                      │
│  infrastructure/       Terraform, ArgoCD, Docker Compose             │
│  docs/                 ADRs, session logs, templates                 │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Quick Start

### Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | >= 22.0.0 |
| pnpm | >= 9.0.0 |
| Git | >= 2.40.0 |
| Docker | optional, for local infra |

### Installation

```bash
# Clone the repository
git clone https://github.com/Docsynapse/abyss-monorepo.git
cd abyss-monorepo

# Install all workspace dependencies
pnpm install

# Configure local environment
cp .env.example .env.local

# Start development servers across all apps
pnpm dev
```

### Local Infrastructure (Docker)

```bash
# Spin up PostgreSQL 16, Langflow, and Redis 7
cd infrastructure/docker
docker-compose up -d
```

---

## Available Commands

### Root Workspace

```bash
pnpm build          # Build all packages and apps in topological order
pnpm dev            # Start all apps in watch/development mode
pnpm lint           # Run ESLint across all workspaces
pnpm test           # Execute full test suite
pnpm format         # Format code with Prettier
pnpm typecheck      # TypeScript type checking (no emit)
pnpm graph          # Generate workspace dependency graph
```

### Database

```bash
pnpm db:generate    # Generate Prisma client from schema
pnpm db:push        # Push schema to database (development only)
pnpm db:migrate     # Apply pending migrations
pnpm db:studio      # Open Prisma Studio
```

### Abyss CLI

```bash
# Initialize a new task session with HANDOFF.md
pnpm abyss init-task "Implement FHIR validation pipeline"

# Grant GO approval for a session
pnpm abyss go docs/sentratorium/sessions/SESSION-... --by "Chief"

# Sync a Langflow flow definition to the repository
pnpm abyss sync-flow path/to/flow.json

# Scaffold a new application in the monorepo
pnpm abyss create app my-new-app

# Check overall monorepo health and gate status
pnpm abyss status
```

---

## Packages

### Applications

| App | Domain | Description |
|-----|--------|-------------|
| `referralink-api` | Healthcare | AI-driven medical referral system |
| `aadi-service` | Healthcare | Diagnostic orchestration with multi-model consensus |
| `clinical-simulator` | Academic | Medical education simulator |
| `evaluation-engine` | Academic | AI model performance benchmarking |
| `admin-dashboard` | Internal | Internal admin panel |
| `orchestrator` | AI | Langflow Gateway — entry point for all AI flows |

### Shared Libraries

| Package | Description |
|---------|-------------|
| `@the-abyss/ui` | Unified design system built on Shadcn UI. Consumed by all frontend applications. |
| `@the-abyss/database` | Prisma ORM schema and generated client. Single source of truth for all database models. |
| `@the-abyss/ai-core` | Multi-model consensus engine. Abstracts provider-specific APIs into a unified interface. |
| `@the-abyss/langflow-client` | TypeScript SDK for interacting with the Langflow API. |
| `@the-abyss/fhir-engine` | FHIR R4 schema validation and resource normalization. |
| `@the-abyss/vector-store` | RAGOps pipeline and vector search abstraction for retrieval-augmented generation. |
| `@the-abyss/iskandar-gatekeeper` | GO-Gate validator. Programmatically enforces deployment approval in CI/CD. |
| `@the-abyss/shared-types` | Global TypeScript type definitions shared across the entire monorepo. |

---

## Technology Stack

### Core Runtime

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 22.x | Runtime |
| TypeScript | 5.7.x | Language |
| pnpm | 9.x | Package manager |
| Turborepo | 2.x | Build system |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.x | Application framework |
| React | 19.x | UI library |
| Tailwind CSS | 3.4.x | Styling |
| Shadcn UI | latest | Component library |

### Backend & Data

| Technology | Version | Purpose |
|------------|---------|---------|
| Prisma | 6.x | ORM |
| PostgreSQL | 16.x | Primary database |
| Redis | 7.x | Cache & pub/sub |
| Langflow | latest | AI flow orchestration |

### Infrastructure

| Technology | Purpose |
|------------|---------|
| Docker | Containerization & local development |
| Terraform | Infrastructure-as-Code |
| ArgoCD | GitOps delivery |
| GitHub Actions | CI/CD pipelines |

---

## Claudesy Workflow

All development in this monorepo — whether by human engineers or AI agents — follows the three-phase Claudesy Workflow. There are no exceptions.

### Phase 1 — HANDOFF First

No coding begins without a `HANDOFF.md`. Every task session is declared before any implementation work starts.

```bash
pnpm abyss init-task "Implement FHIR validation pipeline"
```

### Phase 2 — GO-Gate

Execution only proceeds after a `GO` approval is recorded by an authorized principal. The `iskandar-gatekeeper` package enforces this requirement programmatically in CI.

```bash
pnpm abyss go docs/sentratorium/sessions/SESSION-... --by "Chief"
```

### Phase 3 — Traceability

Every commit carries structured trailers linking it to the originating agent, phase number, and HANDOFF document. This enables full audit trails for all changes.

```git
feat: implement FHIR R4 resource validation

- Add schema validation for Patient, Encounter, and Condition resources
- Integrate validation middleware with referralink-api request pipeline
- Add unit tests for all supported FHIR resource types

Agent: coder-agent
Phase: 3
Handoff: docs/sentratorium/sessions/SESSION-.../HANDOFF.md
```

---

## Security & Compliance

### GO-Gate CI/CD Requirements

All deployments must satisfy all four gates before reaching any production environment:

| Gate | Requirement |
|------|-------------|
| 01 | `HANDOFF.md` created and declared prior to implementation |
| 02 | GO approval recorded by an authorized principal |
| 03 | All CI/CD test suites pass with no regressions |
| 04 | Automated security scan passes OWASP Top 10 checks |

### Compliance Standards

| Domain | Standards |
|--------|-----------|
| Healthcare | HIPAA compliance, FHIR R4 interoperability |
| Academic | Student data privacy, institutional data governance |
| General | OWASP Top 10, secure dependency management |

---

## Contributing

All contributors — human or AI agent — must follow the same workflow.

### For AI Agents

1. Read [.agent/AGENTS.md](.agent/AGENTS.md) — understand behavioral constraints
2. Create a task session via `pnpm abyss init-task`
3. Wait for GO approval before writing any code
4. Implement with full commit traceability
5. Run tests and verify all gates pass

### For Engineers

1. Fork the repository
2. Create a feature branch (`feature/my-feature`)
3. Create `HANDOFF.md` before implementing
4. Open a Pull Request with structured commit trailers

---

## Documentation

| Resource | Location |
|----------|----------|
| Global Agent Steering | [.agent/AGENTS.md](.agent/AGENTS.md) |
| Session Logs | [docs/sentratorium/](docs/sentratorium/) |
| Document Templates | [docs/templates/](docs/templates/) |
| Architecture Decision Records | [docs/adr/](docs/adr/) |
| CLI Documentation | [tooling/abyss-cli/](tooling/abyss-cli/) |

---

## Roadmap

### Q2 2026

- [ ] ReferraLink API — production launch
- [ ] Clinical Simulator — public beta
- [ ] Multi-Model Consensus integration
- [ ] RAGOps pipeline — full deployment

### Q3 2026

- [ ] Edge AI prototype — proof of concept
- [ ] Kubernetes production deployment
- [ ] Advanced monitoring and observability dashboard
- [ ] Mobile application (React Native)

---

## Team

| Role | Name |
|------|------|
| CEO | Dr. Ferdi Iskandar (Claudesy) |
| Company | Sentra Artificial Intelligence |
| Location | Surabaya, Indonesia (WIB / UTC+7) |

---

## License

**UNLICENSED** — Proprietary software. All rights reserved.

---

**Version:** 0.0.1
**Last Updated:** 2026-03-30

---

© 2026 Sentra Artificial Intelligence