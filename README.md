# The Abyss

**Artificial Intelligence-Native Monorepo for the Sentra Artificial Intelligence
Ecosystem**

[![CI](https://img.shields.io/github/actions/workflow/status/Docsynapse/abyss-monorepo/ci.yml?branch=main)](https://github.com/Docsynapse/abyss-monorepo/actions)
[![License](https://img.shields.io/badge/license-UNLICENSED-red)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D22.0.0-brightgreen)](https://nodejs.org)
[![pnpm](https://img.shields.io/badge/pnpm-%3E%3D9.0.0-yellow)](https://pnpm.io)
[![TypeScript](https://img.shields.io/badge/typescript-5.7.x-blue)](https://www.typescriptlang.org)
[![Next.js](https://img.shields.io/badge/next.js-16.x-black)](https://nextjs.org)

---

## Overview

<table>
<tr>
<td valign="middle" width="180">
  <img src=".github/abyss.png" alt="The Abyss" width="160" />
</td>
<td valign="top">

The Abyss is the unified engineering backbone of Sentra Artificial Intelligence
— a production-grade monorepo that houses every application, shared library, and
infrastructure definition across the organization's healthcare and academic
Artificial Intelligence product lines.

It runs a medical referral system, a diagnostic orchestration service, a
clinical education simulator, and an Artificial Intelligence evaluation engine —
all sharing a single database schema, design system, FHIR validation engine, and
multi-model consensus layer. Every Artificial Intelligence workflow is
orchestrated through an integrated Langflow gateway, with vector search and RAG
pipelines built directly into the shared package layer.

Beyond the products themselves, The Abyss enforces a disciplined development
protocol called the Claudesy Workflow — no task starts without a declaration, no
deployment ships without a GO approval, and no commit lands without a full audit
trail. This makes the codebase as navigable by Artificial Intelligence agents as
it is by human engineers, by design.

</td>
</tr>
</table>

---

## Mission

Indonesia's primary healthcare and national health insurance ecosystem face an
extreme structural deficit that conventional software interventions cannot
resolve. Amidst a critical doctor-to-patient ratio crisis and massive daily
operational volume, the cognitive load on clinicians has exceeded sustainable
thresholds. Software engineered with a profound comprehension of this clinical
context and operational pressure is an absolute prerequisite to closing the gap.

Project Abyss is architected to eliminate a singular, critical failure mode: the
collapse of standard Artificial Intelligence systems — designed under the
assumption of resource-rich medical environments — when deployed in district
hospitals suffering from acute understaffing, asymmetric network connectivity,
and the complexities of a multilingual patient demographic.

Every architectural decision within this codebase — from the stringent FHIR R4
validation layer to the multi-model consensus engine — is executed for one
absolute objective: to ensure Artificial Intelligence-assisted Clinical Decision
Support is instantaneously accessible, fully auditable, and guarantees patient
safety at the last mile of Indonesian healthcare. This is not a mere framework.
It is an operating system custom-built for a critical clinical mission.

---

## Claudesy Genesis Framework

<table>
<tr>
<td valign="top" width="110">
  <img src=".github/claudesy.png" alt="Claudesy" width="90" />
</td>
<td valign="top">

**SENTRA GENESIS FRAMEWORK v2.4**  
_"Contract-First" Architecture & Governance Lifecycle_

A systematic multi-agent orchestration protocol for building production-grade
systems — from vision to deployment, with integrity gates at every phase.

</td>
</tr>
</table>

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SENTRA GENESIS FRAMEWORK v2.4                        │
│                "Contract-First" Architecture & Governance Lifecycle         │
└─────────────────────────────────────────────────────────────────────────────┘

Phase 1: THE VISION (Oracle Chamber)
┌──────────────────────┐
│  Dr. Claudesy / CHIEF   │
│    With CLAUDE       │
└──────────┬───────────┘
           │
           ▼
    [GATE 1: SCOPE] <--- "Does this align with clinical safety?"
           │
           ▼
  ┌──────────────────┐
  │ Project_Spec.md  │ (The Immutable Truth)
  └──────────────────┘

Phase 1.5: ATOMIZATION (The Decomposition Engine)
┌─────────────────────────────────────────────────────────────────────────────┐
│   TASKMASTER / TRYHAMSTER                                                   │
│   INPUT:   Spec.md                                                          │
│   PROCESS: Taskmaster Artificial Intelligence (The Planner)                 │
│   OUTPUT:  .taskmaster/tasks.json (or tasks.md)                             │
└──────────┬──────────────────────────────────────────────────────────────────┘
           │
           ▼
   [GATE 2: INTEGRITY] <--- "Are tasks granular & safe?"

Phase 2: INITIALIZATION (The Foundation)
┌─────────────────────────────────────────────────────────────────────────────┐
│   CLAUDE CODE                                                               │
│   ACTION: Generate Root Structure & Rules                                   │
│   OUTPUT STRUCTURE (Root Project):                                          │
│   / (Root Project)                                                          │
│   ├── .cursor/               <-- [THE BRAIN STEM]                           │
│   │   ├── rules/             <-- Modular Rules (.mdc files)                 │
│   │   │   ├── 00-identity.mdc  (Claudesy Persona & Genesis Protocol)        │
│   │   │   ├── 01-stack.mdc     (Next.js 15, Supabase, Tailwind Rules)       │
│   │   │   ├── 02-testing.mdc   (Vitest & Playwright Guidelines)             │
│   │   │   ├── 03-security.mdc  (Auth, RLS, Row Level Security)              │
│   │   │   ├── 04-governance.mdc (Commit Msg, PR Standards)                  │
│   │   │   ├── 05-workflow.mdc  (Workflow Rules)                             │
│   │   │   └── 06-identity.mdc  (Future Identity Rules)                      │
│   │   └── mcp.json           (Config connect ke Local DB/Tools)             │
│   ├── .github/               <-- [THE AUTOMATON]                            │
│   │   ├── CODEOWNERS, ISSUE_TEMPLATE/, workflows/ (ci-quality.yml)          │
│   ├── .husky/                <-- [THE GATEKEEPER] (pre-commit, pre-push)    │
│   ├── documentation/         <-- [THE KNOWLEDGE BASE]                       │
│   │   ├── genesis/ (spec.md, plan.md, tasks.md)                             │
│   │   ├── adr/, api/, PROJECT_CONTEXT.md                                    │
│   ├── infra/                 <-- [LOCAL OPS] (docker-compose, seed.sql)     │
│   ├── mcps/                  <-- [CUSTOM TOOLS] (Artificial Intelligence    │
│   │                               Hands)                                    │
│   ├── src/                   <-- [THE CODE PAYLOAD]                         │
│   │   ├── app/, components/, lib/, types/, env.mjs (Zod Runtime Check)      │
│   └── .env.example, .env.local, eslint.config.mjs, tsconfig.json            │
└──────────┬──────────────────────────────────────────────────────────────────┘
           │
           ▼
   [GATE 3: ACCESS] <--- "Least Privilege Environment Established?"

Phase 3a: THE SCAFFOLD (Contract-First Design)
┌─────────────────────────────────────────────────────────────────────────────┐
│   ACTION: ANTIGRAVITY / CURSOR runs `init-contract.sh` & Scaffolds Monorepo │
│                                                                             │
│   SCAFFOLD COMPONENTS (The Blueprint):                                      │
│   ├─ 0)  REPO STANDARDS       (Monorepo-first, strict ESLint)               │
│   ├─ 1)  MONOREPO LAYOUT      (apps/web, apps/api, packages/types)          │
│   ├─ 2)  FRONTEND SCAFFOLD    (App Router, Query Provider, Theme)           │
│   ├─ 3)  BACKEND/API SCAFFOLD (Hono Routes, Zod Validation Pipe)            │
│   ├─ 4)  DATA LAYER SCAFFOLD  (Prisma Singleton, Seeding Engine)            │
│   ├─ 5)  OBSERVABILITY        (OpenTelemetry, Health Checks)                │
│   ├─ 6)  TESTING STRATEGY     (Vitest Workspace, Playwright E2E)            │
│   ├─ 7)  CI/CD HOOKS          (Husky, GitHub Actions)                       │
│   ├─ 8)  OPERATIONAL CONTROL  (Feature Flags, Rate Limiting)                │
│   ├─ 9)  DOCUMENTATION        (Makefile / Justfile)                         │
│   └─ 10) ACCEPTANCE CRITERIA  (pnpm build/test/lint pass)                   │
│                                                                             │
│   THE CONTRACT (Shared Truth):                                              │
│   packages/types  -> UserSchema, ApiResponse                                │
│   packages/config -> EnvSchema, FeatureFlags                                │
└──────────┬──────────────────────────────────────────────────────────────────┘
           │
           ▼
   CLAUDE CODE
   [GATE 4: QUALITY] <--- "IS THE CONTRACT VALID?"
   REAL CHECK (Command): `pnpm run check:contract`
   1. `tsc --noEmit -p packages/types`  (Must be error-free)
   2. `eslint packages/types`           (No 'any' allowed)
   3. `zod-check packages/types`        (Schema validity)
   (If this command fails, Phase 3b is BLOCKED)

Phase 3b: PARALLEL FABRICATION (The Trinity Swarm)
           │
     ┌─────┼─────────────────────────────────────┐
     ▼     ▼                                     ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  FRONTEND AGENT  │ │  BACKEND AGENT   │ │  OPS AGENT       │
│  (CLAUDE CODE)   │ │     (CODEX)      │ │    (CLINE)       │
├──────────────────┤ ├──────────────────┤ ├──────────────────┤
│ INPUT:           │ │ INPUT:           │ │ INPUT:           │
│ Import { User }  │ │ Import { User }  │ │ Import { Env }   │
│ from types/zod   │ │ from types/zod   │ │ from config/zod  │
└──────────┬───────┘ └────────┬─────────┘ └────────┬─────────┘
           │                  │                     │
           └─────────┬────────┴─────────────────────┘
                     │
Phase 3c: CONVERGENCE (The Integration)
                     ▼
            ┌──────────────────┐
            │   CLAUDE CODE    │
            │   CI/CD MERGE    │
            │ (Automated Test) │
            └────────┬─────────┘

Phase 4: GOVERNANCE & RELEASE
┌─────────────────────────────────────────────────────────────────────────────┐
│                            THE GREAT WALL                                   │
└──────────┬──────────────────────────────────────────────────────────────────┘
           │
           ▼
 [GATE 5: APPROVALS] <--- CHIEF Review of the Artifact
           │
           ▼
 [GATE 6: AGENT EVAL] <--- CLAUDE CODE OPS 4.6+
 "Score >= 8.5/10 on Security, Safety, & Logic"
           │
           ▼
┌──────────────────────┐
│    DEPLOY TO PROD    │ --> JULES
│  (Immutable Record)  │ --> GITHUB COPILOT
└──────────────────────┘
```

---

## Architecture

```
+-----------------------------------------------------------------------------------+
|               THE ABYSS -- CORE ENGINEERING FOUNDATION                            |
|      Shared infrastructure for the Sentra AI Healthcare Ecosystem                 |
+-----------------------------------------------------------------------------------+

+--------------------------------- GOVERNANCE LAYER --------------------------------+
|                                                                                   |
|  .agent/            AI coordination: HANDOFF, GO-Gate, sessions, decisions        |
|  iskandar-gatekeeper  Blocks deployment without GO approval (CI enforced)         |
|  .github/workflows/ verify --> build --> test --> lint --> security               |
|                                                                                   |
+-----------------------------------------------------------------------------------+
                                        |
                              [GO approval required]
                                        |
                                        v
+--------------------------------- AI ENGINE LAYER ---------------------------------+
|                                                                                   |
|  +---------------------+  +---------------------+  +---------------------+       |
|  |      ai-core        |  |    fhir-engine      |  |    vector-store     |       |
|  |  Multi-Model        |  |  FHIR R4 Validation |  |  RAGOps + Vector    |       |
|  |  Consensus Engine   |  |  & Normalization    |  |  Search (pgvector)  |       |
|  |  Opus 4.6 Sonnet 4.6|  |                     |  |  Embed  Retrieve    |       |
|  |  Kimi 2.5  Gemini   |  |  Patient / Encounter|  |  Rerank  Index      |       |
|  +---------------------+  |  / Condition / Obs  |  +---------------------+       |
|                            +---------------------+                                |
|  +---------------------+  +------------------------------------------+          |
|  |   langflow-client   |  |         iskandar-gatekeeper (auth)        |          |
|  |  Langflow TS SDK    |  |  JWT · API key mgmt · Express middleware     |          |
|  |  Flow execution &   |  |  Permissions enforcement  .  Timing-safe  |          |
|  |  AI orchestration   |  +------------------------------------------+          |
|  +---------------------+                                                          |
|                                                                                   |
+-----------------------------------------------------------------------------------+
                                        |
                                        v
+----------------------------- SHARED FOUNDATION LAYER -----------------------------+
|                                                                                   |
|  +---------------------+  +---------------------+  +---------------------+       |
|  |      database       |  |         ui          |  |    shared-types     |       |
|  |  Prisma ORM +       |  |  Design System      |  |  Global TypeScript  |       |
|  |  Schema (single     |  |  Shadcn UI +        |  |  definitions across |       |
|  |  source of truth)   |  |  Tailwind CSS       |  |  all workspaces     |       |
|  +---------------------+  +---------------------+  +---------------------+       |
|                                                                                   |
|  +-----------------------------------------------------------------------+       |
|  |                         abyss-cli  (tooling/)                          |       |
|  |      init-task  .  go  .  sync-flow  .  create  .  status             |       |
|  +-----------------------------------------------------------------------+       |
|                                                                                   |
+-----------------------------------------------------------------------------------+
                                        |
                                        v
+------------------------------ DATA & INFRASTRUCTURE ------------------------------+
|                                                                                   |
|   PostgreSQL 16         Redis 7               Langflow                            |
|   Primary DB            Cache & pub/sub        AI flow orchestration              |
|   (Prisma managed)      (Socket.IO relay)      (clinical workflow engine)         |
|                                                                                   |
|   Terraform             ArgoCD                 Docker Compose                     |
|   Infrastructure-as-Code  GitOps delivery      Local development                  |
|                                                                                   |
+-----------------------------------------------------------------------------------+
                                        |
                          @the-abyss/* via pnpm workspace
                                        |
                                        v
+------------------------------ POLYREPO CONSUMER APPS -----------------------------+
|                                                                                   |
|  HEALTHCARE              PLATFORM              ACADEMIC          COMMUNITY        |
|  sentra-dashboard        platform-orchestrator clinical-         claudesy-        |
|  puskesmas               (NestJS + Kafka)      simulator         transformer      |
|  sentra-assist           sentra-portal         academic-         claudesy-memory  |
|  sentra-main                                   solutions         agent-hermes     |
|                                                evaluation-engine                  |
|                                                                                   |
+-----------------------------------------------------------------------------------+
```

---

## Multi-Agent Governance Roster

This codebase is operated by a structured multi-agent system — each agent has a
defined role, scope, and audit obligation. No agent acts outside its designated
function.

<div align="left">
<table>
  <tr>
    <td align="center" width="130">
      <img src=".github/logos/claudecode.svg" width="56" height="56" alt="Claude Code"/><br/>
      <sub><b>Claude Code</b></sub><br/>
      <sub>Architect &amp; Execution</sub>
    </td>
    <td align="center" width="130">
      <img src=".github/logos/cursor.svg" width="56" height="56" alt="Cursor"/><br/>
      <sub><b>Cursor</b></sub><br/>
      <sub>Implementation</sub>
    </td>
    <td align="center" width="130">
      <img src=".github/logos/kilocode.svg" width="56" height="56" alt="Kilo Code"/><br/>
      <sub><b>Kilo Code</b></sub><br/>
      <sub>Implementation</sub>
    </td>
    <td align="center" width="130">
      <img src=".github/logos/codex.svg" width="56" height="56" alt="Codex"/><br/>
      <sub><b>Codex</b></sub><br/>
      <sub>Backend Fabrication</sub>
    </td>
    <td align="center" width="130">
      <img src=".github/logos/gemini.svg" width="56" height="56" alt="Gemini"/><br/>
      <sub><b>Gemini</b></sub><br/>
      <sub>Supervisor &amp; Audit</sub>
    </td>
  </tr>
  <tr>
    <td align="center" width="130">
      <img src=".github/logos/antigravity.svg" width="56" height="56" alt="Antigravity"/><br/>
      <sub><b>Antigravity</b></sub><br/>
      <sub>Scaffold</sub>
    </td>
    <td align="center" width="130">
      <img src=".github/logos/vertexai.svg" width="56" height="56" alt="Vertex AI"/><br/>
      <sub><b>Vertex Artificial Intelligence</b></sub><br/>
      <sub>Orchestration</sub>
    </td>
    <td align="center" width="130">
      <img src=".github/logos/kimi.svg" width="56" height="56" alt="Kimi"/><br/>
      <sub><b>Kimi</b></sub><br/>
      <sub>Reasoning</sub>
    </td>
    <td align="center" width="130">
      <img src=".github/logos/qwen.svg" width="56" height="56" alt="Qwen"/><br/>
      <sub><b>Qwen</b></sub><br/>
      <sub>Reasoning</sub>
    </td>
    <td align="center" width="130">&nbsp;</td>
  </tr>
</table>
</div>

| Agent               | Model                           | Role                  | Responsibility                                                                                                                   |
| ------------------- | ------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Claude Code**     | Opus 4.6 High · Sonnet 4.6 High | Architect & Execution | Primary decision-making agent. Owns system design, HANDOFF creation, GO-Gate validation, and end-to-end implementation oversight |
| **Cursor Composer** | Composer Agent                  | Implementation        | In-editor agentic coding — long-context task execution, multi-file edits, and iterative refinement within defined task scopes    |
| **Kilo Code**       | Best Available                  | Implementation        | Parallel in-editor development agent for component-level coding, scaffolding, and task-scoped iterative work                     |
| **Codex**           | Codex 5.4 High                  | Backend Fabrication   | API scaffolding, schema generation, and high-throughput code generation tasks                                                    |
| **Kimi**            | Kimi 2.5 Thinking               | Deep Reasoning        | Extended reasoning tasks — architecture analysis, complex debugging, and multi-step technical problem solving                    |
| **Gemini**          | Gemini 3.1 Pro                  | Supervisor & Audit    | Reviews outputs from all agents, performs cross-validation, and flags inconsistencies before GO-Gate submission                  |
| **Antigravity**     | Agent                           | Scaffold              | Project initialization, monorepo scaffolding, and contract-first structure generation                                            |

All agent activity is traceable via commit trailers. No agent output ships
without a human GO approval.

---

## Quick Start

### Prerequisites

| Requirement | Version                   |
| ----------- | ------------------------- |
| Node.js     | >= 22.0.0                 |
| pnpm        | >= 9.0.0                  |
| Git         | >= 2.40.0                 |
| Docker      | optional, for local infra |

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
pnpm abyss go .agent/sessions/YYYY-MM-DD --by "Chief"

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

Applications have been migrated to their own repositories. This repo is **core
only** — shared packages & agent governance.

| Repo                    | Division   | Description                                                               |
| ----------------------- | ---------- | ------------------------------------------------------------------------- |
| `sentra-dashboard`      | Healthcare | Clinical staff dashboard — patient records, CDSS, and operational reports |
| `puskesmas`             | Healthcare | Public website + ICD-10 database                                          |
| `sentra-assist`         | Healthcare | Artificial Intelligence assistant for clinical workflow automation        |
| `sentra-main`           | Healthcare | Main healthcare application                                               |
| `platform-orchestrator` | Platform   | NestJS + Kafka Artificial Intelligence flow orchestrator                  |
| `sentra-portal`         | Platform   | Monorepo monitoring dashboard                                             |
| `academic-solutions`    | Academic   | Artificial Intelligence-based academic solutions                          |
| `clinical-simulator`    | Academic   | Clinical training simulator                                               |
| `evaluation-engine`     | Academic   | Clinical evaluation engine                                                |
| `claudesy-transformer`  | Community  | Artificial Intelligence transformer for community                         |
| `claudesy-memory`       | Community  | Memory management system                                                  |
| `agent-hermes`          | Prototype  | Multi-service Artificial Intelligence agent stack                         |

### Shared Libraries

| Package                          | Description                                                                              |
| -------------------------------- | ---------------------------------------------------------------------------------------- |
| `@the-abyss/ui`                  | Unified design system built on Shadcn UI. Consumed by all frontend applications.         |
| `@the-abyss/database`            | Prisma ORM schema and generated client. Single source of truth for all database models.  |
| `@the-abyss/ai-core`             | Multi-model consensus engine. Abstracts provider-specific APIs into a unified interface. |
| `@the-abyss/langflow-client`     | TypeScript SDK for interacting with the Langflow API.                                    |
| `@the-abyss/fhir-engine`         | FHIR R4 schema validation and resource normalization.                                    |
| `@the-abyss/vector-store`        | RAGOps pipeline and vector search abstraction for retrieval-augmented generation.        |
| `@the-abyss/iskandar-gatekeeper` | GO-Gate validator. Programmatically enforces deployment approval in CI/CD.               |
| `@the-abyss/shared-types`        | Global TypeScript type definitions shared across the entire monorepo.                    |

---

## Technology Stack

### Core Runtime

| Technology | Version | Purpose         |
| ---------- | ------- | --------------- |
| Node.js    | 22.x    | Runtime         |
| TypeScript | 5.7.x   | Language        |
| pnpm       | 9.x     | Package manager |
| Turborepo  | 2.x     | Build system    |

### Frontend

| Technology   | Version | Purpose               |
| ------------ | ------- | --------------------- |
| Next.js      | 16.x    | Application framework |
| React        | 19.x    | UI library            |
| Tailwind CSS | 3.4.x   | Styling               |
| Shadcn UI    | latest  | Component library     |

### Backend & Data

| Technology | Version | Purpose                                    |
| ---------- | ------- | ------------------------------------------ |
| Prisma     | 6.x     | ORM                                        |
| PostgreSQL | 16.x    | Primary database                           |
| Redis      | 7.x     | Cache & pub/sub                            |
| Langflow   | latest  | Artificial Intelligence flow orchestration |

### Infrastructure

| Technology     | Purpose                              |
| -------------- | ------------------------------------ |
| Docker         | Containerization & local development |
| Terraform      | Infrastructure-as-Code               |
| ArgoCD         | GitOps delivery                      |
| GitHub Actions | CI/CD pipelines                      |

---

## Claudesy Workflow

<img src=".github/claudesy.png" alt="Claudesy" width="80" align="right" />

All development in this monorepo — whether by human engineers or Artificial
Intelligence agents — follows the three-phase Claudesy Workflow. There are no
exceptions.

### Phase 1 — HANDOFF First

No coding begins without a `HANDOFF.md`. Every task session is declared before
any implementation work starts.

```bash
pnpm abyss init-task "Implement FHIR validation pipeline"
```

### Phase 2 — GO-Gate

Execution only proceeds after a `GO` approval is recorded by an authorized
principal. The `iskandar-gatekeeper` package enforces this requirement
programmatically in CI.

```bash
pnpm abyss go .agent/sessions/YYYY-MM-DD --by "Chief"
```

### Phase 3 — Traceability

Every commit carries structured trailers linking it to the originating agent,
phase number, and HANDOFF document. This enables full audit trails for all
changes.

```git
feat: implement FHIR R4 resource validation

- Add schema validation for Patient, Encounter, and Condition resources
- Integrate validation middleware with @the-abyss/fhir-engine package
- Add unit tests for all supported FHIR resource types

Agent: coder-agent
Phase: 3
Handoff: .agent/sessions/YYYY-MM-DD/HANDOFF.md
```

---

## Security & Compliance

### GO-Gate CI/CD Requirements

All deployments must satisfy all four gates before reaching any production
environment:

| Gate | Requirement                                               |
| ---- | --------------------------------------------------------- |
| 01   | `HANDOFF.md` created and declared prior to implementation |
| 02   | GO approval recorded by an authorized principal           |
| 03   | All CI/CD test suites pass with no regressions            |
| 04   | Automated security scan passes OWASP Top 10 checks        |

### Compliance Standards

| Domain     | Standards                                           |
| ---------- | --------------------------------------------------- |
| Healthcare | HIPAA compliance, FHIR R4 interoperability          |
| Academic   | Student data privacy, institutional data governance |
| General    | OWASP Top 10, secure dependency management          |

---

## Contributing

All contributors — human or Artificial Intelligence agent — must follow the same
workflow.

### For Artificial Intelligence Agents

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

| Resource                      | Location                                 |
| ----------------------------- | ---------------------------------------- |
| Global Agent Steering         | [.agent/AGENTS.md](.agent/AGENTS.md)     |
| Session Logs                  | [.agent/sessions/](.agent/sessions/)     |
| Document Templates            | [docs/templates/](docs/templates/)       |
| Architecture Decision Records | [docs/adr/](docs/adr/)                   |
| CLI Documentation             | [tooling/abyss-cli/](tooling/abyss-cli/) |

---

## Clinical Deployment

The Abyss is not a prototype. It is actively running a comprehensive pilot test
program validated at two clinical sites in East Java, Indonesia.

| Site                        | Type                                                                                                                                                            | Active Products |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| **Maternal Hospital**       | MELLY, Melinda Dashboard, Melinda Shield, Autonomous Admission, Smart Triage, Ambient Scribe, Critical Alert System, Predictive Bed Management, OR Orchestrator |
| **Primary Healthcare Site** | AADI, Audrey, Intelligence Dashboard, Sentra Assist, Telemedicine, ReferraLink                                                                                  |

**Active validation objectives:**

- Artificial Intelligence-assisted referral triage accuracy vs physician
  baseline
- FHIR R4 record export to secondary care integration
- Latency benchmarks under low-bandwidth conditions
- Multi-model diagnostic consensus under resource constraints
- Clinical simulator training outcomes for local health staff
- Offline-capable workflow resilience testing

---

## Product Ecosystem

<div align="center">
  <img src=".github/products.png" alt="Sentra Artificial Intelligence Product Ecosystem" width="800" />
</div>

Pilot sites: **Maternal Hospital** · **Primary Healthcare Site**

### Under Testing — Active Pilots

| Product                                                           | Description                                                                                                                                                                                        |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **AADI** — Autonomous Artificial Diagnostic Intelligence          | Autonomous diagnostic inference engine with multi-layer reasoning; Iskandar Engine V4.3, 159 diseases, 1,930 ICD-10 codes, safety gates, drug interaction detection (multi-safety-gate validation) |
| **Audrey** — Voice-First Clinical Intelligence                    | Real-time voice assistant (Gemini Live, 24 kHz), medical grounding, primary care clinical insights; SFT training + clinical alignment                                                              |
| **Intelligence Dashboard** — Unified Clinical Operations Platform | Unified command center — EMR/RPA automation, ICD-X unification, LB1 national reporting, SenCall calculator, telemedicine WebRTC, ACARS, KPI monitoring via Socket.IO                               |
| **Sentra Assist** — Clinical Workflow Automation                  | Chrome Extension (MV3) automating data transfer between Dashboard and national EMR systems via RPA — anamnesis, diagnosis, and prescription workflows                                              |
| **Telemedicine** — Remote Clinical Consultation                   | HD WebRTC consultation with virtual waiting room, e-prescription, lab upload, automated SOAP note generation, and schedule integration                                                             |
| **ReferraLink** — Awareness-Intelligence Protocol                 | Reasoning engine for BPJS and insurance regulatory flux — dynamic claim optimization and actionable recommendations for claim verification officers                                                |

### Deployed — Production Ready

| Product                                                                             | Description                                                                                                                                          |
| ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Med-Cognitive** — Neural Memory Architecture for Clinical Artificial Intelligence | Persistent memory layer for Artificial Intelligence agents — semantic embedding with cross-session decision retrieval and patient context continuity |

### Under Development

| Product                                                                      | Description                                                                                                                                                                                                                    |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **MELLY** — Hyper-Personalized Augmented Virtual Agent                       | Per-patient Artificial Intelligence agent spanning preconception through pediatric care; Vertex multi-agent orchestration, WHO education protocols, and automated report synthesis to EMR                                      |
| **Melinda Dashboard** — Zero-Friction Interoperability Platform              | Inter-departmental interoperability platform for the Maternal Hospital — KPI dashboards, service management, medical records, and Lifestyle Artificial Intelligence voice integration                                          |
| **Melinda Shield** — Cognitive Cybersecurity Infrastructure                  | Multi-layer cognitive security — AES-256 encryption, immutable audit ledger, Artificial Intelligence behavioral monitoring, EHR access geofencing, rapid threat containment, threat intelligence, and compliance dashboard     |
| **Autonomous Admission** — Admission & Journey Tracking                      | Zero-queue digital admission — referral document extraction (Vision Artificial Intelligence), SIMRS schedule verification, insurance bridging, and automated prenatal reminders (ultrasound, supplements) throughout pregnancy |
| **Smart Triage** — Pediatric & Maternal Algorithmic Assessment               | Pre-visit asynchronous triage assessment using pediatric and obstetric parameters; automated SOAP draft generation; emergency escalation protocol (e.g. premature rupture of membranes)                                        |
| **Proactive Care Navigator** — Post-Partum & Preventive Monitoring           | Post-discharge follow-up — immunization tracking, wound and lactation care, postpartum depression screening derived from medical record data                                                                                   |
| **Ambient Scribe** — Clinical Voice-to-EMR Engine                            | NLP engine separating clinical dialogue from ambient noise; automated vital sign transcription to EMR (fetal weight, fetal heart rate, and related parameters)                                                                 |
| **Critical Alert System** — Proactive NICU & Telemetry Intelligence          | Real-time critical alerts from lab results and NICU telemetry pushed to clinician devices when monitored parameters breach defined thresholds                                                                                  |
| **Predictive Bed Management** — Autonomous Turnaround Orchestration          | At discharge — automated orchestration chain across billing, take-home pharmacy, and housekeeping with SLA enforcement to maximize bed occupancy rate                                                                          |
| **Artificial Intelligence Coding Auditor** — Clinical Coding & Claim Defense | Cross-reference ICD-10 and ICD-9-CM codes against clinical documentation; reduce claim disputes and denial rates                                                                                                               |
| **OR Orchestrator** — Smart Operating Room Logistics                         | Operating room logistics — emergency C-section prioritization, on-call team coordination, blood supply management, and OR utilization optimization                                                                             |

---

## Team

| Role     | Name                              |
| -------- | --------------------------------- |
| CEO      | Dr. Claudesy                      |
| Company  | Sentra Artificial Intelligence    |
| Location | Surabaya, Indonesia (WIB / UTC+7) |

---

## License

**UNLICENSED** — Proprietary software. All rights reserved.

---

**Version:** 0.0.1  
**Last Updated:** 2026-03-30

---

© 2026 Sentra Artificial Intelligence
