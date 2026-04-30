# CONTEXT.md — The Abyss (Monorepo Root)
<!-- Static. Update only when stack or architecture changes. -->
<!-- Last updated: 2026-04-19 · Major revision: Full healthcare landscape audit -->

---

## Project Identity

| Field | Value |
|-------|-------|
| Name | The Abyss |
| Type | AI-native Turborepo monorepo (polyrepo hybrid) |
| Author | Dr. Ferdi Iskandar (Classy) |
| Email | ferdi@sentra.ai |
| License | UNLICENSED (private) |
| Engine | Node ≥22, pnpm ≥9 |
| Build | Turborepo v2 |
| Root path | D:\Devop\abyss-monorepo\ |

---

## ⚠️ CRITICAL ARCHITECTURE NOTE — Read Before Acting

This is a **polyrepo embedded in a monorepo shell**.

Each healthcare app is an **independent repository** with its own:
- `.git` directory
- `package.json` + `pnpm-lock.yaml`
- `node_modules`
- Database schema + migrations (if applicable)
- Deployment config (Railway or Vercel)

**The monorepo shell provides:** shared `packages/`, `flows/`, `infrastructure/`, `conductor/`, and Turborepo build orchestration.

**The monorepo shell does NOT provide:** a single shared database. Every app that has a database owns it exclusively.

Any agent that assumes `packages/platform/database` is the database for all apps is WRONG.
Always check each app's own `prisma/` folder before touching any database concern.

Current session direction: Google Cloud, Vertex AI, and Gemini are being exited from
the monorepo. Do not treat "migration to Vertex AI" as the active target.

---

## Healthcare Apps — Complete Landscape

### `intelligenceboard`
| Field | Value |
|-------|-------|
| Path | `apps/healthcare/intelligenceboard/` |
| Package name | `@classy/intelligenceboard` |
| Type | Next.js 16 server app (custom Express server via server.ts) |
| Deploy | Railway (`railway.toml`) |
| Database | Own Neon PostgreSQL via Prisma — **12 migrations active as of 2026-04** |
| Prisma path | `apps/healthcare/intelligenceboard/prisma/schema.prisma` |
| AI providers | `@google/genai`, `@google/generative-ai` (legacy; removal in progress) |
| Purpose | Clinical Intelligence Dashboard: telemedicine, CDSS, consult logs, screening audit, vital records |
| RAG status | `KnowledgeBase` model to be added here (Prisma migration pending — see DECISIONS.md) |
| Status | **PRODUCTION ACTIVE** |

### `sentra-assist`
| Field | Value |
|-------|-------|
| Path | `apps/healthcare/sentra-assist/` |
| Package name | `@the-abyss/sentra-assist` |
| Type | **Browser Extension** (WXT framework — NOT a NestJS/REST app) |
| Deploy | Chrome Web Store / Firefox Add-ons |
| Database | None — browser extension cannot connect to databases |
| AI providers | `@google-cloud/vertexai` (legacy; removal in progress) |
| Purpose | Clinical decision support overlay inside ePuskesmas EMR |
| RAG access | Via API call to intelligenceboard — never direct DB |
| Status | Active development |

### `referralink`
| Field | Value |
|-------|-------|
| Path | `apps/healthcare/referralink/` |
| Package name | `@the-abyss/referralink` |
| Type | React SPA (Vite) |
| Deploy | Vercel (`vercel.json`) |
| Database | Own Neon via `@neondatabase/serverless` + `@vercel/postgres` |
| Vector store | `@upstash/vector` — already has independent RAG (migration to shared package: future task) |
| AI providers | OpenAI |
| Purpose | Patient referral routing with semantic matching |
| Status | Active on Vercel |

### `sentra-main`
| Field | Value |
|-------|-------|
| Path | `apps/healthcare/sentra-main/` |
| Package name | `@the-abyss/sentra-main` |
| Type | Next.js 16 (marketing website) |
| Deploy | TBD |
| Database | None |
| Purpose | Marketing website — sentrahai.com |
| Status | Active |

### `primary-healthcare`
| Field | Value |
|-------|-------|
| Path | `apps/healthcare/primary-healthcare/` |
| Type | Static website + JSON data files |
| Database | None (local JSON: ICD-10, penyakit puskesmas) |
| Purpose | Primary healthcare reference data and website |
| Status | Active |

---

## Platform Apps

### `orchestrator`
| Field | Value |
|-------|-------|
| Path | `apps/platform/orchestrator/` |
| Type | NestJS (CQRS mandatory) |
| Purpose | SAGA engine, multi-agent coordination |

### `sentra-portal`
| Field | Value |
|-------|-------|
| Path | `apps/platform/sentra-portal/` |
| Type | Next.js |
| Database | Own — has `.git` and own node_modules |
| Purpose | Clinical dashboard |

---

## Shared Packages — Actual State

| Package | Path | Purpose | Notes |
|---------|------|---------|-------|
| `database` | `packages/platform/database/` | Prisma schema for platform apps | ⚠️ NOT used by healthcare apps — each has own schema |
| `vector-store` | `packages/sentra/sentra-cermin/` | pgvector RAG with pluggable embedding provider | Refactored to dependency injection — injectable Prisma client |
| `design-token` | `packages/shared/design-token/` | UI token system | |
| `shared-types` | `packages/shared/shared-types/` | Cross-app TypeScript types | |

---

## Shared Package Strategy — `vector-store`

**Vision:** Every healthcare product uses `@the-abyss/vector-store` for RAG.

**Architecture:** Dependency injection — `VectorStore` accepts any Prisma client from the caller.
Each server-side app brings its own Prisma client.
Browser extensions and SPAs access RAG via API (never direct DB).

```
@the-abyss/vector-store
  ↓ used directly (server-side)
intelligenceboard         → injects its own prismaClient
                          → owns KnowledgeBase table

  ↓ future migration
referralink               → currently @upstash/vector → migrate to vector-store (future task)

  ↓ via API only (no direct DB)
sentra-assist             → calls intelligenceboard RAG endpoint
sentra-main               → calls intelligenceboard RAG endpoint (if needed)
```

**KnowledgeBase table location:** `intelligenceboard` Prisma schema — single source of truth for medical RAG. Not in `packages/platform/database`.

---

## AI Provider Map

| App | Current Provider | Target Provider | Notes |
|-----|-----------------|-----------------|-------|
| intelligenceboard | Gemini REST API | Local-first runtime / provider-neutral fallback | Google exit in progress |
| sentra-assist | `@google-cloud/vertexai` | Local-first runtime / provider-neutral fallback | Google exit in progress |
| referralink | OpenAI | TBD | Out of scope for current sprint |
| packages/sentra/sentra-cermin | Provider-neutral abstraction | — | Vertex provider scheduled for removal |

---

## Database Map

| App | Database | Prisma? | Migrations? | Location |
|-----|----------|---------|-------------|----------|
| intelligenceboard | Neon PostgreSQL | ✅ | ✅ 12 migrations | `apps/healthcare/intelligenceboard/prisma/` |
| referralink | Neon (serverless) + Vercel Postgres | ❌ raw SQL | N/A | Direct queries in `database/` |
| packages/platform/database | Neon PostgreSQL | ✅ | ❌ never migrated | Platform-level only |
| sentra-assist | None | ❌ | — | Browser extension |
| sentra-main | None | ❌ | — | Marketing site |
| primary-healthcare | None | ❌ | — | JSON files only |

---

## CI/CD Pipeline

GitHub Actions: `.github/workflows/ci.yml`
Sequence: verify → build → test → lint → security → flows
Security scan mandatory before any healthcare PR merge.

---

## Deployment Map

| App | Platform | Config file |
|-----|----------|-------------|
| intelligenceboard | Railway | `railway.toml` |
| referralink | Vercel | `vercel.json` |
| sentra-assist | Browser Store | WXT build |
| platform/orchestrator | TBD | — |
| platform/sentra-portal | TBD | — |

---

## Hard Constraints

- `terraform apply` — Chief only, never agent-executed
- PHI/PII — absolute prohibition in logs, commits, fixtures, test data
- Security scan — must pass before any healthcare PR
- JET Protocol J5 — hard gate, no execution before explicit "GO"
- Session logs — `.agent/sessions/` must be updated every session
- Database operations — each app uses its OWN Prisma client. Never cross-inject.
- `packages/platform/database` — platform-level only, not for healthcare apps
- KnowledgeBase (RAG) — lives in intelligenceboard schema, not packages/platform/database
