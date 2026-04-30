# AGENTS.md — The Abyss Monorepo

# Supreme authority. All local AGENTS.md files defer to this document.

# Last updated: 2026-04-25

---

## §0 — SSOT Declaration

This file is the Single Source of Truth for all agents operating in this
monorepo. Division-level and sub-app-level AGENTS.md files are scoped additions
only — they never duplicate or contradict this document. When conflict exists,
this file wins.

---

## §1 — Project Overview

**The Abyss** is an AI-native monorepo powering the **Sentra Healthcare AI**
ecosystem. It is organized as a multi-domain pnpm workspace managed by
Turborepo v2, with applications spanning healthcare, academic, community,
corporate, and platform domains.

### Key Facts

| Attribute | Value |
|-----------|-------|
| **Monorepo name** | the-abyss |
| **Package manager** | pnpm 9.15.0 |
| **Node runtime** | >= 22.0.0 |
| **Build system** | Turborepo v2 |
| **Primary language** | TypeScript |
| **Author** | Dr. Ferdi Iskandar (Avvcenna+) |
| **License** | UNLICENSED |

### High-Level Architecture

- **Frontend:** Next.js 15/16 + React 19 + Tailwind CSS v3/v4
- **Backend:** NestJS 11 (orchestrator) + Next.js API routes (healthcare apps)
- **Database:** PostgreSQL (legacy Cloud SQL / current Neon surfaces) accessed exclusively via `packages/database` (Prisma)
- **AI Orchestration:** LangFlow (REST API) + local-first inference + OpenAI + Anthropic + DeepSeek
- **Message Broker:** Kafka + Zookeeper (for saga orchestration)
- **Cache:** Redis
- **Vector Store:** pgvector + local embeddings (`nomic-embed-text`, 768 dimensions)
- **Containerization:** Docker + Docker Compose (multi-stage builds, PHI-hardened images)
- **IaC:** Terraform (legacy GCP modules under retirement; Chief-only execution)
- **GitOps:** ArgoCD

---

## §2 — Monorepo Directory Map

```
v:\avcn-sentra\abyss-monorepo\
├── AGENTS.md                    ← this file (supreme authority)
├── CLAUDE.md                    ← Claude Code CLI entry point
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── .agent/                      ← agent memory (CONTEXT, PROGRESS, HANDOFF, LESSONS, DECISIONS, sessions/)
├── .claude/                     ← Claude Code config (agents/, commands/, skills/, settings.json)
├── .cursor/                     ← IDE rules, hooks, subagents (tracked — see root .gitignore negations)
├── .mcp.json                    ← MCP server registry (local only; gitignored)
├── mcp.json.example             ← Copy to .mcp.json; committed template (empty servers)
├── apps/
│   ├── academic/
│   │   ├── academic-solutions/       ← Next.js 16, React 19, Tailwind v4 (education UI)
│   │   ├── clinical-simulator/       ← Next.js 16, React 19 (AI clinical case simulation)
│   │   └── evaluation-engine/        ← Node/TS backend (competency evaluation)
│   ├── community/
│   │   ├── avvcenna-memory/          ← Next.js 16, React 19, Tailwind v4, Playwright (memory UI)
│   │   ├── avvcenna-transformer/     ← Next.js 15, React 19, Tailwind v3, Prisma, Vitest (multi-LLM platform)
│   │   │   └── website/              ← Next.js 14 marketing site
│   │   └── daf-website/              ← Next.js 15, React 19, Tailwind v3 (foundation site)
│   ├── corporate/
│   │   └── ferdiiskandar/            ← Next.js 16, React 19, Tailwind v4 (personal brand site)
│   ├── healthcare/                     ← PHI-aware domain
│   │   ├── aby-dashboard/            ← Next.js 15, React 19, Tailwind v3
│   │   ├── intelligenceboard/        ← Next.js 16, React 19, Tailwind v4, Prisma, Neon, LiveKit (clinical AI dashboard)
│   │   ├── primary-healthcare/
│   │   │   ├── database/             ← Prisma schema + migrations
│   │   │   └── website/              ← Vite 7, React 19, Tailwind v4 (Puskesmas public site)
│   │   ├── referralink/              ← Vite 6, React 19, Tailwind v4, Upstash Vector (referral network)
│   │   ├── sentra-assist/            ← WXT browser extension, React 18, Tailwind v3, Vitest, Playwright (CDSS sidepanel)
│   │   └── sentra-main/              ← Next.js 16, React 19, Tailwind v4 (sentrahai.com marketing)
│   └── prototype/
│       ├── agent-hermes/             ← Python + Node hybrid (Hermes Maximus meta-agent)
│       └── edge-ai-prototype/        ← Node/TS (edge AI experiments)
├── platform/
│   ├── orchestrator/                 ← NestJS 11, CQRS, Kafka, Socket.io (Saga Engine)
│   └── sentra-portal/                ← Next.js 15, React 19, Tailwind v3 (clinical dashboard)
├── packages/
│   ├── clinical-references/          ← @the-abyss/clinical-references (clinical data types)
│   ├── config-eslint/                ← @the-abyss/config-eslint (shared ESLint v9 flat configs)
│   ├── config-typescript/            ← @the-abyss/config-typescript (shared TS configs)
│   ├── database/                     ← @the-abyss/database (Prisma client + schema)
│   ├── design-token/                 ← @the-abyss/design-token (Sentra UI tokens)
│   ├── fhir-engine/                  ← @the-abyss/fhir-engine (FHIR compliance engine)
│   ├── integration-bridge/           ← @the-abyss/integration-bridge (Notion, Linear)
│   ├── iskandar-gatekeeper/          ← @the-abyss/iskandar-gatekeeper (access gatekeeper)
│   ├── langflow-client/              ← @the-abyss/langflow-client (LangFlow REST client)
│   ├── literature-harvester/         ← @the-abyss/literature-harvester (open-access literature CLI)
│   ├── sentra-rag/                   ← @the-abyss/sentra-rag (local-first RAG: pgvector + Ollama)
│   ├── sentra-ui/                    ← @the-abyss/ui (React component library, Radix + Tailwind)
│   ├── shared-types/                 ← @the-abyss/shared-types (cross-app TypeScript contracts)
│   ├── symphony/                     ← @the-abyss/symphony (orchestration layer)
│   └── vector-store/                 ← @the-abyss/vector-store (PDF parsing, local embedding helpers)
├── tooling/
│   ├── abyss-cli/                    ← @the-abyss/cli (monorepo CLI)
│   ├── governance/                   ← Compliance: STANDARD.md, CHECKLIST.md, TROUBLESHOOTING.md, validate.ps1
│   ├── librarian-desktop/            ← Electron console + literature worker
│   └── scripts/                      ← RAG triggers, governance healthchecks
├── infrastructure/
│   ├── argocd/                       ← ArgoCD application manifest
│   ├── docker/                       ← Base Dockerfiles (nestjs, healthcare, generic Next.js)
│   │   └── docker-compose.yml        ← Core platform stack (Postgres, Kafka, LangFlow, Redis)
│   └── terraform/                    ← legacy GCP IaC modules under retirement
├── flows/
│   └── definitions/                  ← LangFlow JSON workflow definitions
│       ├── platform/
│       ├── healthcare/
│       └── academic/
└── docs/
    ├── adr/                          ← Architectural Decision Records
    ├── blueprint/
    ├── cursor/
    ├── guides/
    ├── handbook/
    ├── research/
    ├── specs/
    ├── superpowers/
    └── templates/
```

### §2.1 — Cursor Subagents (Explicit Invoke)

Specialized prompts under `.cursor/agents/` (tracked in Git). Invoke by name when
the task matches (not auto-loaded like rules). MCP: use `mcp.json.example` →
`.mcp.json` per `.cursor/README.md`.

| Name | Role |
| ---- | ---- |
| `code-reviewer` | Review diffs and changed files for quality, security, reuse, and rule compliance. |
| `test-writer` | Author high-value tests across unit/component/E2E/integration layers. |
| `config-writer` | Decide whether behavior belongs in central config, a rule, a skill, or an agent; then create or update the artifact and cross-references. |

---

## §3 — Mandatory Initialization (GUARD 1)

Every agent MUST execute GUARD 1 at session start without exception.

Read in this exact order:

1. `.agent/CONTEXT.md` — Architecture and stack
2. `.agent/PROGRESS.md` — Current state of work
3. `.agent/HANDOFF.md` — Active plan and session instructions
4. `.agent/LESSONS.md` — Previously made mistakes to avoid
5. `.agent/DECISIONS.md` — Prior architectural decisions

After reading, output:

> ✅ CONTEXT LOADED: [architecture state] · PROGRESS: [work state] · ACTIVE
> TASK: [session goal] · KNOWN RISKS: [relevant lessons]

Wait for Chief confirmation before proceeding to J1.

---

## §4 — JET Workflow Protocol (GUARD 2)

Every non-trivial task (2+ steps) follows the JET Protocol without exception.

| Phase | Name          | Action                                                                                | Gate           |
| ----- | ------------- | ------------------------------------------------------------------------------------- | -------------- |
| J1    | **Context**   | Scan `.agent/`, repo, env vars → log confirmation                                     | Auto           |
| J2    | **Validate**  | Check against `.cursor/rules/` + `AGENTS.md` → report discrepancies, halt if critical | Auto           |
| J3    | **Diagnose**  | Identify root issues/needs → document in `HANDOFF.md`                                 | Auto           |
| J4    | **Plan**      | Write step-by-step `HANDOFF.md` + rollback plan                                       | Auto           |
| J5    | **Risk Gate** | Task classification → determine JET depth and GO requirement                          | **Risk-based** |
| J6    | **Execute**   | Implement code changes — diff must be verifiable                                      | Post-planning  |
| J7    | **Verify**    | Run tests → 100% pass or rollback                                                     | Post-execution |
| J8    | **Docs**      | Update `.agent/` (sessions/ + HANDOFF.md)                                             | Post-verify    |
| J9    | **Commit**    | `git commit` with trailer: `Agent: Claude · Phase: Execution · Handoff: [session-id]` | Post-docs      |

### §4.1 — Task Classification & Risk-Based Gates

Not all tasks carry the same risk. Agents MUST classify tasks before execution:

| Class       | Risk Level | Examples                                               | JET Required | GO Gate               |
| ----------- | ---------- | ------------------------------------------------------ | ------------ | --------------------- |
| **Class A** | Minimal    | Read files, grep search, typo fix, rename variable     | J1-J4 only   | Auto-approve          |
| **Class B** | Standard   | New component, API endpoint, bug fix, refactor         | J1-J7        | Checkpoint (self-log) |
| **Class C** | High       | DB migration, terraform, security config, PHI handling | J1-J9 Full   | ⛔ Hard J5            |

**Classification Heuristics:**

- Only reading/searching? → **Class A**
- Writing code in existing patterns? → **Class B**
- Touching infrastructure/database/PHI? → **Class C**

**GO Status Tracking:** Check `.agent/SESSION_STATE.md` before Class B or C
tasks:

- If GO already granted for session scope → proceed
- If Class C and no GO → halt, request Chief "GO"
- If Class B and no GO → log plan, proceed (checkpoint mode)

**Note:** J5 hard gate still applies to Class C tasks regardless of session
state.

---

## §5 — Absolute Prohibitions

The following are forbidden under any circumstance:

- `terraform apply` / `terraform destroy` — Chief execution only, never agent-executed
- PHI/PII in logs, commits, fixtures, or test data — zero tolerance
- `rm -rf`, `git reset --hard`, `git clean` without explicit Chief approval
- Creating a new repository without direct instruction in the current session
- Cross-repository file operations without confirmed source and destination paths
- Database migrations, drops, or truncations executed autonomously
- Pushing to any remote branch without explicit approval
- Skipping J5 for Class C tasks

---

## §6 — Technology Stack

| Layer             | Technology                                           |
| ----------------- | ---------------------------------------------------- |
| Runtime           | Node >= 22                                           |
| Package manager   | pnpm >= 9                                            |
| Build system      | Turborepo v2                                         |
| Frontend          | Next.js 15/16, React 19, Tailwind CSS v3/v4, Radix UI |
| Backend framework | NestJS 11 (TypeScript)                               |
| ORM               | Prisma (via `packages/database`)                     |
| Validation        | class-validator + class-transformer, Zod             |
| API docs          | Swagger / OpenAPI (NestJS apps)                      |
| AI orchestration  | LangFlow (`flows/definitions/`)                      |
| CI/CD             | GitHub Actions                                       |
| IaC               | Terraform (legacy GCP modules under retirement; Chief-only) |
| Container         | Docker + Docker Compose                              |
| Message broker    | Kafka + Zookeeper                                    |
| Vector DB         | pgvector + Upstash Vector                            |
| Browser testing   | Playwright                                           |
| Unit testing      | Vitest (dominant), Jest (legacy vendor subprojects)  |

---

## §7 — Build and Test Commands

### Root-Level Scripts (from `package.json`)

```bash
# Development
pnpm dev                    # Turbo dev mode (persistent)

# Build
pnpm build                  # Turbo build all affected packages
pnpm graph                  # Generate dependency graph PNG

# Testing
pnpm test                   # Turbo test all affected projects
pnpm test:ui                # Turbo test:ui (persistent, no cache)
pnpm flows:test             # Validate LangFlow definitions

# Lint & Format
pnpm lint                   # Turbo lint
pnpm format                 # Prettier write
pnpm format:check           # Prettier check (CI)
pnpm typecheck              # tsc --noEmit (root)

# Database (via packages/database)
pnpm db:generate            # Prisma generate
pnpm db:push                # Prisma db push
pnpm db:migrate             # Prisma migrate deploy
pnpm db:studio              # Prisma Studio

# Security
pnpm security:primary-healthcare   # Runs catch-scan + secret-scan + audit for healthcare apps

# Governance
pnpm governance:agents-check       # Run agents healthcheck
```

### Per-Project Filtering

Use `pnpm --filter <package-name>` to target a specific workspace package:

```bash
pnpm --filter @the-abyss/orchestrator dev
pnpm --filter @the-abyss/intelligenceboard build
pnpm --filter @the-abyss/sentra-assist test
```

### Turborepo Task Dependencies

From `turbo.json`:

- `build` → depends on `^build` (upstream builds first)
- `test` → depends on `build`
- `lint` → depends on `^build`
- `dev` → persistent, no cache, no dependencies
- `db:*` → cache disabled

---

## §8 — Code Style Guidelines

### Prettier

Config: root `.prettierrc`

| Setting | Value |
|---------|-------|
| `semi` | `false` |
| `singleQuote` | `true` |
| `tabWidth` | `2` |
| `trailingComma` | `"es5"` |
| `printWidth` | `100` |
| `endOfLine` | `"lf"` |

Overrides:
- `*.json`: `printWidth: 120`
- `*.md`, `*.mdx`: `printWidth: 80`, `proseWrap: "always"`

### ESLint

Config: root `eslint.config.mjs` (ESLint v9 flat config)

```js
import { base, boundaries } from '@the-abyss/config-eslint/base'
export default [{ ignores: ['docs/**', '.output/**'] }, ...base, ...boundaries]
```

Shared presets exported by `@the-abyss/config-eslint`:
- `./base` — `@eslint/js` recommended + `typescript-eslint` strict + `import-x`
- `./react` — React-specific rules
- `./node` — Node.js-specific rules

Key enforced rules:
- `@typescript-eslint/no-unused-vars`: error (ignores `_` prefix)
- `@typescript-eslint/no-explicit-any`: error
- `@typescript-eslint/consistent-type-imports`: error (prefer `type` imports, inline fix)
- `import-x/order`: error (builtin → external → internal → parent → sibling → index, alphabetized)
- `import-x/no-duplicates`: error
- `no-restricted-imports`: **Domain boundaries** — Healthcare cannot import from Academic/Incubator/Internal, and vice versa.

### EditorConfig

```ini
root = true
[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true
```

### Lint-Staged

Root `package.json` configures `lint-staged`:
- `*.{ts,tsx}` → `eslint --fix` → `prettier --write`
- `*.{js,jsx,mjs}` → `prettier --write`
- `*.{json,md,mdx,yml,yaml}` → `prettier --write`

---

## §9 — NestJS Architecture Standards

These rules apply to all NestJS applications in this monorepo (primarily
`platform/orchestrator/`).

**Module structure:** Every module must follow the pattern `module/`,
`controller/`, `service/`, `dto/`, `entities/`. No deviations without an ADR
entry.

**Validation:** DTOs must use `class-validator` decorators. Plain interfaces are
not acceptable for request validation.

**Separation of concerns:** Business logic lives in services only. Controllers
handle HTTP concerns exclusively.

**Database access:** All database operations must route through
`packages/database`. No raw queries or direct ORM calls in application code.

**PHI/PII protection:** All PHI/PII fields in healthcare apps must be decorated
with `@Exclude()` from `class-transformer`. This is enforced at the
serialization layer — not optional.

**API documentation:** Every controller endpoint in `apps/healthcare/` requires
a `@ApiOperation` Swagger decorator.

**CQRS:** Mandatory for `platform/orchestrator/`. Commands and Queries are
strictly separated. No mixing.

**Testing:** Every service requires a corresponding `.spec.ts` file. Minimum
coverage threshold: 80% for healthcare apps, 60% for other apps.

---

## §10 — Testing Instructions

### Test Runners

| Runner | Projects | Config Location |
|--------|----------|-----------------|
| **Vitest** | Most apps/packages | `vitest.config.ts` at project root |
| **Playwright** | E2E apps (`sentra-assist`, `sentra-main`, `avvcenna-memory`, `agent-hermes`) | `playwright.config.ts` |
| **Jest** | Legacy vendor subprojects only (`agent-hermes/vendor/*`) | `jest.config.*` |

### Typical Vitest Config

```ts
// vitest.config.ts
export default {
  globals: true,
  environment: 'jsdom', // or 'node'
  setupFiles: ['./tests/setup.ts'],
  exclude: ['**/node_modules/**', '**/dist/**', 'tests/e2e/**'],
}
```

### Test Commands by Project Type

```bash
# Unit / integration tests
pnpm --filter <package> test          # vitest run
pnpm --filter <package> test:ui       # vitest --ui (persistent)

# E2E tests
pnpm --filter <package> test:e2e      # playwright test tests/e2e --pass-with-no-tests

# Quality gate (common in sentra-assist)
pnpm --filter <package> quality       # typecheck + lint + test
```

### Coverage

- Coverage artifacts uploaded in CI with 7-day retention (`**/coverage`).
- Minimum thresholds: **80% healthcare apps**, **60% other apps**.
- Do not fabricate test results. Always run tests and report actual output.

---

## §11 — CI/CD Pipeline

### Workflow Files (`.github/workflows/`)

| Workflow | Purpose |
|----------|---------|
| `ci.yml` | **Main pipeline**. Triggers on push/PR to `main`/`develop`. Sequence: **Verify** → **Build** → **Test** → **Lint** → **Security** → **Flows**. Uses `--filter=[HEAD^1]` to only build/test affected projects. |
| `security-scan.yml` | Dedicated security: npm audit, Snyk, TruffleHog secret detection, Trivy container scan. Runs weekly via cron. |
| `doc-guard.yml` | Checks mandatory docs, flags oversized markdown (>500KB), validates Mermaid diagrams. |
| `pr-label.yml` | Auto-labels PRs using `.github/labeler.yml`. |
| `auto-merge.yml` | Auto-merges Renovate patch PRs via squash. |
| `auto-fix.yml` | Self-healing CI: runs `prettier --write` + `eslint --fix`; creates PR if changes found. |
| `generate-documentation.yml` | Runs doc generators on `main` push; opens PR with updates. |
| `reusable-ai-agent.yml` | Reusable workflow for dispatching AI agents. |

### CI Environment

- **Runner:** `ubuntu-latest`
- **Node:** 22
- **pnpm:** 9
- **Remote caching:** Turborepo remote cache via `TURBO_TOKEN` / `TURBO_TEAM`

### Pipeline Sequence

```
verify → build → test → lint → security → flows
```

Security scan must pass before any healthcare PR is merged. No exceptions.

---

## §12 — Repository Compliance System

Every agent MUST follow the Repository Compliance System before pushing any project.

**Rules (grounded in real incidents):** [`tooling/governance/STANDARD.md`](tooling/governance/STANDARD.md)
**Pre-push gate:** [`tooling/governance/CHECKLIST.md`](tooling/governance/CHECKLIST.md)
**Fix guides:** [`tooling/governance/TROUBLESHOOTING.md`](tooling/governance/TROUBLESHOOTING.md)
**Automated validator:** [`tooling/governance/validate.ps1`](tooling/governance/validate.ps1)
**Bootstrap templates:** [`tooling/governance/templates/`](tooling/governance/templates/)

### Mandatory checks before every `git push`:

1. Run `tooling/governance/validate.ps1 -path <project-root>` — must exit 0
2. Verify `pnpm-lock.yaml` overrides match `package.json` pnpm.overrides exactly
3. Confirm `.gitattributes` exists with `* text=auto eol=lf`
4. Confirm `docs/api/` and `dist/` are in `.gitignore`

### Mandatory checks when bootstrapping a new project:

1. Copy `tooling/governance/templates/.gitignore` to project root
2. Copy `tooling/governance/templates/.gitattributes` to project root
3. Copy `tooling/governance/templates/.editorconfig` to project root
4. Run `git add --renormalize .` before first commit

### Key Rules (Summary — read STANDARD.md for full context)

- Lockfile regeneration must happen in `/tmp/` — never inside the monorepo root
- Auto-generated directories (`dist/`, `.output/`, `docs/api/`) must be in `.gitignore`
  before the first build is ever run
- Agent coordination via `.agent/HANDOFF.md` — read before acting, write before starting

---

## §13 — Security Considerations

### PHI/PII Handling

- **Zero tolerance:** PHI/PII must never appear in logs, commits, fixtures, or test data.
- **Serialization:** Use `@Exclude()` from `class-transformer` on all PHI fields.
- **Client-side:** Never store patient identifiers in browser localStorage/sessionStorage.
- **Error handling:** No silent `catch` blocks in healthcare code — every error must be logged (without PHI) or re-thrown.

### Healthcare App Security Scripts

Several healthcare apps expose security commands:

```bash
pnpm --filter <healthcare-app> security:baseline
pnpm --filter <healthcare-app> security:audit
pnpm --filter <healthcare-app> security:catch-scan
pnpm --filter <healthcare-app> security:secret-scan
pnpm --filter <healthcare-app> security:semgrep
```

### Container Hardening

- `healthcare.Dockerfile` removes shell binaries (`/bin/sh`, `wget`, `curl`) from the runner stage.
- Read-only filesystem recommended for PHI workloads.
- `PHI_MODE=true` triggers additional runtime guards.
- Non-root users (`nestjs` uid 1001, `nextjs` uid 1001) in all production images.

### Infrastructure

- Terraform security module is **Chief-only**.
- Legacy GCP Cloud SQL configs require encryption at rest and backup retention >= 7 days (enforced by validation).
- Healthcare subnet is PHI-isolated (`infrastructure/terraform/modules/networking`).
- Secrets managed via provider-native secret storage or local secure stores (`database-url`, `anthropic-api-key`, `langflow-api-url`, `avvcenna-api-key`).

---

## §14 — Session Log Protocol (Dual Write)

Every session that modifies code must write to both systems:

1. `.agent/sessions/YYYY-MM-DD.md` — agent memory and audit trail

Log to `.agent/sessions/` at J8 and J9. No external audit system required.

---

## §15 — Environment Variable Conventions

Key env domains (from `.env.example`):

| Domain | Variables |
|--------|-----------|
| **Database** | `DATABASE_URL` |
| **AI Providers** | `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GROQ_API_KEY`, `OLLAMA_BASE_URL` |
| **Legacy GCP / Vertex AI** | `GOOGLE_APPLICATION_CREDENTIALS`, `GCP_PROJECT_ID`, `GCP_LOCATION` |
| **LangFlow** | `LANGFLOW_API_URL`, `LANGFLOW_API_KEY` |
| **Redis** | `REDIS_URL` |
| **Auth** | `NEXTAUTH_URL`, `NEXTAUTH_SECRET` |
| **Turborepo** | `TURBO_TOKEN`, `TURBO_TEAM` |
| **Sentry** | `SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT` |
| **Feature Flags** | `ENABLE_SHADOW_MODE`, `ENABLE_AI_CONSENSUS`, `ENABLE_RAG` |
| **Vector Store** | `VECTOR_STORE_EMBEDDING_MODEL`, `VECTOR_STORE_EMBEDDING_DIMENSIONS` |

---

## §16 — Continual Learning (Plugin)

- Agent transcripts for this workspace live under `C:\Users\claud\.cursor\projects\d-Devop-abyss-monorepo\agent-transcripts\` (session folders contain `*.jsonl`); newest files are the default Continual Learning mining surface.
- Flow `/continual-learning` plus the `agents-memory-updater` subagent merges durable bullets into this `AGENTS.md` after transcript review.
- Incremental transcript index expected at `.cursor/hooks/state/continual-learning-index.json` is not in the tree yet; add it when the plugin starts recording processed transcript mtimes.
- Session transcripts show Chief-facing answers in Bahasa Indonesia with neutral wording and without second-person pronouns.
- Before push, run `tooling/governance/validate.ps1 -path <project-root>` per the compliance section.

---

_If a local rule contradicts this document, this document wins._ _Append new
decisions to `.agent/DECISIONS.md` and new lessons to `.agent/LESSONS.md`._
