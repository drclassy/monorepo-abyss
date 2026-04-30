# The Abyss

**AI-native monorepo for the Sentra Healthcare AI ecosystem**

[![Node](https://img.shields.io/badge/node-%3E%3D22.0.0-brightgreen)](https://nodejs.org)
[![pnpm](https://img.shields.io/badge/pnpm-9.15.0-yellow)](https://pnpm.io)
[![TypeScript](https://img.shields.io/badge/typescript-5.7.x-blue)](https://www.typescriptlang.org)
[![Turborepo](https://img.shields.io/badge/turborepo-2.x-black)](https://turbo.build/repo)

---

## Overview

<table>
<tr>
<td valign="middle" width="180">
  <img src=".github/abyss.png" alt="The Abyss" width="160" />
</td>
<td valign="top">

The Abyss is the current engineering workspace for Sentra's healthcare,
academic, community, corporate, platform, and prototype products. It contains
active applications, shared AI engines, shared data and design packages,
tooling, infrastructure definitions, governance rules, and LangFlow flow
definitions in a single pnpm workspace.

This README is reality-first. It reflects the repository as it exists now in
`pnpm-workspace.yaml` and the actual folder tree. It is not a historical
brochure, and it does not hide prototype, legacy, or under-retirement surfaces.

</td>
</tr>
</table>

---

## Source of truth

- Workspace membership: [`pnpm-workspace.yaml`](pnpm-workspace.yaml)
- Repository rules and architecture: [`AGENTS.md`](AGENTS.md)
- Current docs index: [`docs/README.md`](docs/README.md)
- Current agent handoff surface: [`.agent/HANDOFF.md`](.agent/HANDOFF.md)

---

## Repository control surfaces

| Surface             | Path                 | Role                                                                |
| ------------------- | -------------------- | ------------------------------------------------------------------- |
| `AGENTS.md`         | `AGENTS.md`          | Supreme repo instruction set and architectural authority.           |
| `CLAUDE.md`         | `CLAUDE.md`          | Claude Code CLI entry surface.                                      |
| `.agent`            | `.agent/`            | Tracked governance memory and active handoff surfaces.              |
| `.claude`           | `.claude/`           | Claude Code local configuration and skills support.                 |
| `.cursor`           | `.cursor/`           | Shared Cursor rules, tracked subagents, and IDE behavior surfaces.  |
| `.mcp.json`         | `.mcp.json`          | Local-only MCP registry when present on disk.                       |
| `mcp.json.example`  | `mcp.json.example`   | Committed MCP template for local setup.                             |
| `.github/workflows` | `.github/workflows/` | CI, automation, docs guard, security, and reusable agent workflows. |

---

## Current stack

| Layer               | Current stack                                                                     |
| ------------------- | --------------------------------------------------------------------------------- |
| Runtime             | Node >= 22, pnpm 9.15.0, Turborepo 2.x                                            |
| Frontend            | Next.js 15/16, React 18/19, Tailwind CSS 3/4                                      |
| Backend             | NestJS 11, Next.js route handlers, Node/TypeScript services                       |
| Database            | PostgreSQL via Prisma in `packages/database`                                      |
| AI orchestration    | LangFlow + local-first inference + OpenAI + Anthropic + DeepSeek                  |
| Retrieval           | pgvector + local embeddings + `@the-abyss/sentra-rag` + `@the-abyss/vector-store` |
| Messaging and cache | Kafka, Zookeeper, Redis                                                           |
| Infra               | Docker, Docker Compose, ArgoCD, Terraform legacy modules under retirement         |
| Testing             | Vitest, Playwright, selected legacy Jest surfaces                                 |

---

## Monorepo inventory

### Applications

#### Academic

| Workspace                       | Path                               | Role                                                            |
| ------------------------------- | ---------------------------------- | --------------------------------------------------------------- |
| `@the-abyss/academic-solutions` | `apps/academic/academic-solutions` | Academic product UI surface built with Next.js 16 and React 19. |
| `@the-abyss/clinical-simulator` | `apps/academic/clinical-simulator` | Clinical case simulation and training surface.                  |
| `@the-abyss/evaluation-engine`  | `apps/academic/evaluation-engine`  | Competency and evaluation backend surface.                      |

#### Community

| Workspace                         | Path                                  | Role                                                  |
| --------------------------------- | ------------------------------------- | ----------------------------------------------------- |
| `@the-abyss/classy-memory`      | `apps/community/classy-memory`      | Memory-oriented community application surface.        |
| `@the-abyss/classy-transformer` | `apps/community/classy-transformer` | Multi-LLM platform and community transformer surface. |
| `@the-abyss/daf-website`          | `apps/community/daf-website`          | Foundation or outreach website surface.               |

#### Corporate

| Workspace                  | Path                           | Role                                                 |
| -------------------------- | ------------------------------ | ---------------------------------------------------- |
| `@the-abyss/ferdiiskandar` | `apps/corporate/ferdiiskandar` | Personal brand and corporate-facing website surface. |

#### Healthcare

| Workspace                          | Path                                         | Role                                                                     |
| ---------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------ |
| `aby-dashboard`                    | `apps/healthcare/aby-dashboard`              | Healthcare dashboard application surface.                                |
| `@classy/intelligenceboard` | `apps/healthcare/intelligenceboard`          | Clinical AI dashboard and operational command surface.                   |
| `@the-abyss/puskesmas-website`     | `apps/healthcare/primary-healthcare/website` | Public-facing primary healthcare website surface.                        |
| `@the-abyss/referralink`           | `apps/healthcare/referralink`                | Referral and routing surface for healthcare operations.                  |
| `@the-abyss/sentra-assist`         | `apps/healthcare/sentra-assist`              | Browser extension for clinical decision support and workflow automation. |
| `@the-abyss/sentra-main`           | `apps/healthcare/sentra-main`                | Sentra marketing and public main site.                                   |

Additional healthcare sub-surface:

- `apps/healthcare/primary-healthcare/database` holds Prisma schema and database
  assets for the primary healthcare domain.

#### Prototype

| Surface                        | Path                               | Role                                                                 |
| ------------------------------ | ---------------------------------- | -------------------------------------------------------------------- |
| `@the-abyss/edge-ai-prototype` | `apps/prototype/edge-ai-prototype` | Edge AI experimentation workspace.                                   |
| `ghost-protocol`               | `apps/prototype/ghost-protocol`    | Prototype or specification surface without its own package manifest. |
| `ghost-protocols`              | `apps/prototype/ghost-protocols`   | Prototype or specification surface without its own package manifest. |

### Platform

| Workspace                 | Path                     | Role                                                              |
| ------------------------- | ------------------------ | ----------------------------------------------------------------- |
| `@the-abyss/orchestrator` | `platform/orchestrator`  | NestJS 11 orchestration runtime with CQRS, Kafka, and Socket.IO.  |
| `sentra-portal`           | `platform/sentra-portal` | Portal and dashboard surface for platform or clinical visibility. |

---

## Shared engines and packages

| Package                           | Path                            | Role                                                                                    |
| --------------------------------- | ------------------------------- | --------------------------------------------------------------------------------------- |
| `@the-abyss/clinical-references`  | `packages/clinical-references`  | Shared clinical reference types and structured clinical data surfaces.                  |
| `@the-abyss/config-eslint`        | `packages/config-eslint`        | Shared ESLint flat-config presets and repo lint boundaries.                             |
| `@the-abyss/config-typescript`    | `packages/config-typescript`    | Shared TypeScript configuration presets across workspaces.                              |
| `@the-abyss/database`             | `packages/database`             | Prisma client, schema, and shared database access layer.                                |
| `@the-abyss/design-token`         | `packages/design-token`         | Sentra design tokens for color, borders, typography, and spacing.                       |
| `@the-abyss/document-ingestion`   | `packages/document-ingestion`   | Document ingestion surface for parsing and processing source material.                  |
| `@the-abyss/fhir-engine`          | `packages/fhir-engine`          | FHIR validation, normalization, and interoperability engine.                            |
| `@the-abyss/integration-bridge`   | `packages/integration-bridge`   | Bridge layer for external integrations such as Notion and Linear.                       |
| `@the-abyss/iskandar-gatekeeper`  | `packages/iskandar-gatekeeper`  | GO-gate and access-control enforcement surface.                                         |
| `@the-abyss/langflow-client`      | `packages/langflow-client`      | TypeScript client for LangFlow API integration and flow execution.                      |
| `@the-abyss/literature-harvester` | `packages/literature-harvester` | Open-access literature harvesting and collection tooling.                               |
| `@the-abyss/sentra-rag`           | `packages/sentra-rag`           | Sentra RAG engine for local-first medical knowledge retrieval with pgvector and Ollama. |
| `@the-abyss/ui`                   | `packages/sentra-ui`            | Shared Sentra UI component layer.                                                       |
| `@the-abyss/shared-types`         | `packages/shared-types`         | Cross-workspace TypeScript contracts and shared domain types.                           |
| `@the-abyss/symphony`             | `packages/symphony`             | Orchestration and clinical engine layer used across AI workflows.                       |
| `@the-abyss/vector-store`         | `packages/vector-store`         | PDF parsing, embedding helpers, and vector-store support utilities.                     |

### Engine focus

These are the engine surfaces most central to current AI behavior in the repo:

- `@the-abyss/sentra-rag`
- `@the-abyss/symphony`
- `@the-abyss/fhir-engine`
- `@the-abyss/vector-store`
- `@the-abyss/langflow-client`
- `@the-abyss/iskandar-gatekeeper`
- `@the-abyss/database`

---

## Tooling and operational facilities

| Surface                      | Path                        | Role                                                                              |
| ---------------------------- | --------------------------- | --------------------------------------------------------------------------------- |
| `@the-abyss/cli`             | `tooling/abyss-cli`         | Monorepo CLI for task init, GO flow, status, scaffolding, and flow sync.          |
| `governance`                 | `tooling/governance`        | Compliance standards, checklists, troubleshooting, templates, and `validate.ps1`. |
| `kilo`                       | `tooling/kilo`              | Supporting tooling surface currently kept inside the monorepo.                    |
| `classy-librarian-console` | `tooling/librarian-desktop` | Electron desktop console and literature worker surface.                           |
| `scripts`                    | `tooling/scripts`           | Supporting scripts for governance checks, RAG tasks, and maintenance work.        |

### Governance surfaces

| Surface               | Purpose                                                                     |
| --------------------- | --------------------------------------------------------------------------- |
| `AGENTS.md`           | Repository-wide single source of truth for agent behavior and architecture. |
| `.agent/CONTEXT.md`   | Architecture and runtime context.                                           |
| `.agent/PROGRESS.md`  | Current progress state.                                                     |
| `.agent/HANDOFF.md`   | Active execution handoff and task plan.                                     |
| `.agent/DECISIONS.md` | Architectural decisions and superseding directives.                         |
| `.agent/LESSONS.md`   | Durable mistakes-to-avoid memory.                                           |
| `.cursor/rules/`      | Shared Cursor behavior rules that are intentionally tracked.                |

Local-only operational notes:

- `.agent/sessions/` is a local working surface and is not part of the pushed
  repo history.

---

## Infrastructure and deployment facilities

| Surface     | Path                       | Role                                                                       |
| ----------- | -------------------------- | -------------------------------------------------------------------------- |
| `argocd`    | `infrastructure/argocd`    | GitOps application manifests.                                              |
| `docker`    | `infrastructure/docker`    | Shared Dockerfiles and `docker-compose.yml` for local stack orchestration. |
| `terraform` | `infrastructure/terraform` | Legacy infrastructure-as-code modules under retirement.                    |

### Local stack facilities

The current infrastructure folder explicitly supports these local facilities:

- PostgreSQL
- Redis
- LangFlow
- Docker-based service bring-up for development and integration work

---

## Flow definitions

| Surface      | Path                           | Role                                           |
| ------------ | ------------------------------ | ---------------------------------------------- |
| `academic`   | `flows/definitions/academic`   | LangFlow definitions for academic workflows.   |
| `healthcare` | `flows/definitions/healthcare` | LangFlow definitions for healthcare workflows. |
| `platform`   | `flows/definitions/platform`   | LangFlow definitions for platform workflows.   |

---

## Documentation surfaces

| Surface     | Path             | Role                                                                   |
| ----------- | ---------------- | ---------------------------------------------------------------------- |
| `adr`       | `docs/adr`       | Architectural decision records.                                        |
| `archive`   | `docs/archive`   | Historical docs that remain preserved but are not primary active docs. |
| `blueprint` | `docs/blueprint` | Blueprint and structure guidance.                                      |
| `guides`    | `docs/guides`    | Active guides and onboarding references.                               |
| `specs`     | `docs/specs`     | Current specifications and system-level contracts.                     |
| `templates` | `docs/templates` | Reusable documentation templates.                                      |

Primary docs entrypoint:

- [`docs/README.md`](docs/README.md)

---

## Development commands

### Root

```bash
pnpm dev
pnpm build
pnpm test
pnpm test:ui
pnpm lint
pnpm format
pnpm format:check
pnpm typecheck
pnpm graph
pnpm flows:test
```

### Database

```bash
pnpm db:generate
pnpm db:push
pnpm db:migrate
pnpm db:studio
```

### Governance

```bash
pnpm governance:agents-check
powershell -ExecutionPolicy Bypass -File tooling/governance/validate.ps1 -path .
```

### Abyss CLI

```bash
pnpm abyss init-task "Describe the task"
pnpm abyss go .agent/sessions/YYYY-MM-DD --by "Chief"
pnpm abyss sync-flow path/to/flow.json
pnpm abyss create app my-new-app
pnpm abyss status
```

---

## Quick start

```bash
git clone https://github.com/drclassy/abyss-monorepo.git
cd abyss-monorepo
pnpm install
pnpm dev
```

For local infrastructure:

```bash
cd infrastructure/docker
docker-compose up -d
```

---

## Notes on accuracy

- The authoritative workspace membership comes from
  [`pnpm-workspace.yaml`](pnpm-workspace.yaml), not from historical wording in
  older docs.
- Some package names and folder names differ slightly, such as
  `platform/sentra-portal` currently carrying a legacy package name in its
  `package.json`. This README uses the folder surface as the primary inventory
  anchor.
- `terraform` remains present in the tree but is treated as a legacy surface
  under retirement.

---

## License

The root package manifest currently declares this repository as **UNLICENSED**.

See:

- [`package.json`](package.json)
- [`LICENSE`](LICENSE)

---

**Version:** 0.0.1  
**Last updated:** 2026-04-30
