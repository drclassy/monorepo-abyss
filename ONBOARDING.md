# The Abyss Onboarding Guide

## What Is This?

The Abyss is the Artificial Intelligence-Native Monorepo for the Sentra AI Ecosystem. It serves as the unified engineering backbone housing every application, shared library, and infrastructure definition for the organization's healthcare and academic product lines.

This project is built to endure extreme structural deficits in Indonesian primary healthcare. It operates assuming understaffed district hospitals, low bandwidth, and multilingual patient demographics. Every architectural decision is designed to ensure that AI-assisted Clinical Decision Support is safe, accessible, and fully auditable at the last mile of healthcare.

---

## User and Developer Experience

Clinicians and hospital staff interact with the end-user applications like **AADI** (Autonomous Diagnostic Intelligence) and the **Sentra Dashboard**. These tools automate medical records via ambient voice, validate referrals, and provide multi-model diagnostic consensus, dramatically reducing cognitive load during patient encounters.

Developers and AI agents consume this project through the **Avvcenna+ Genesis Framework**. Contributors participate in a "Contract-First" governance lifecycle. Development starts by defining a task with the Abyss CLI (`pnpm abyss init-task`), which creates a mandatory `HANDOFF.md` document. After implementing features across the Next.js applications or NestJS APIs, changes must pass strict continuous integration checks and receive a manual `GO` approval from the Chief before deployment.

---

## How Is It Organized?

The system is organized into layers, separating governance, AI orchestration, shared foundations, and consumer applications.

```text
abyss-monorepo/
  .agent/          # AI coordination: HANDOFF, GO-Gate, sessions
  .github/         # CI/CD and deployment gating
  apps/
    healthcare/    # Clinical products (AADI, Sentra Assist)
    platform/      # Orchestrators and dashboards
  packages/
    database/      # Prisma ORM and schema
    fhir-engine/   # FHIR R4 validation
  infrastructure/  # Terraform and Docker Compose files
```

### Architecture

```text
       Web / Clinical Users
                |
                v
+-------------------------------+
|  Consumer Apps (apps/)        |
|  Next.js & NestJS Interfaces  |
+---------------+---------------+
                |
                v
+-------------------------------+
|  AI Engine Layer (packages/)  |
|  fhir-engine & shared packages |
+---------------+---------------+
                |
                v
+-------------------------------+
|  Data Layer (database)        |
|  Prisma Singleton             |
+---------------+---------------+
                |
                v
          PostgreSQL 16
```

### External Dependencies

| Dependency | What it's used for | Configured via |
|-----------|-------------------|---------------|
| PostgreSQL 16 | Primary data store | `DATABASE_URL` |
| Redis 7 | Cache and pub/sub | `REDIS_URL` |
| Langflow | AI flow orchestration | `LANGFLOW_API_URL` |
| Local-first / provider-neutral AI | Inference, retrieval, and fallback orchestration | `OLLAMA_BASE_URL` and provider-specific API keys |

---

## Key Concepts and Abstractions

| Concept | What it means in this codebase |
|---------|-------------------------------|
| `GO-Gate` | Mandatory deployment approval enforced in CI by `iskandar-gatekeeper` |
| `HANDOFF` | Task declaration document that must be created before coding begins |
| JET Protocol | Multi-phase workflow standard required for all non-trivial tasks |
| `packages/database` | Single source of truth for DB access. No raw queries allowed |
| CQRS | Strict Command/Query separation, required in NestJS orchestrators |
| Class-validator | Required for all DTOs and input validation in NestJS apps |

---

## Primary Flows

The most critical flow for any new contributor (human or AI) is the Avvcenna+ Development Workflow. Nothing ships without following this precise sequence.

```text
Developer / Agent
  |
  v
pnpm abyss init-task
  generates .agent/HANDOFF.md
  |
  v
Implement feature
  modifies apps/ and packages/
  |
  v
pnpm test & pnpm lint
  validates contract and types
  |
  v
pnpm abyss go
  records Chief approval
  |
  v
CI/CD Pipeline
  verifies security and deploys
```

---

## Developer Guide

### Setup and Running

Ensure Node.js 22.x and pnpm 9.x are installed.

```bash
pnpm install
cp .env.example .env.local
cd infrastructure/docker
docker-compose up -d
pnpm dev
```

### Testing and Linting

Run these commands before submitting any pull request:

```bash
pnpm lint
pnpm test
pnpm typecheck
```

### Common Changes

- **Adding a new DB Model**: Update `packages/database/schema.prisma` and run `pnpm db:generate` followed by `pnpm db:migrate`.
- **Creating a new API endpoint**: In a NestJS application under `apps/`, create the route in the `controller/` and place business logic strictly in the `service/`.
- **Using AI Models**: Route inference through the active domain package or orchestrator integration surface rather than reviving removed legacy AI-core helpers.

### Key Files

| Area | File | Why |
|------|------|-----|
| Global Steering | `AGENTS.md` | Contains the supreme authority rules for all AI agents |
| App Scaffold | `packages/database/schema.prisma` | The unified data model across the entire monorepo |
| Project Root | `package.json` | Contains all global scripts and workspace definitions |

---
