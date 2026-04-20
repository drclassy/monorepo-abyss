# LESSONS.md — The Abyss (Monorepo Root)
<!-- Append-only. Agent MUST read before starting any work. NEVER delete existing entries. -->

---

### [2026-04-10] Root .agent/ had wrong structure
**Mistake:** Root .agent/ contained conductor/, memory/, projects/, rules/, workflows/ instead of the standard 5-file structure.
**New rule:** .agent/ at ANY level = CONTEXT.md, PROGRESS.md, HANDOFF.md, LESSONS.md, DECISIONS.md, sessions/ — nothing else at root level of the folder.
**Trigger:** Any .agent/ initialization or audit.

### [2026-04-10] Session log protocol simplified
**Mistake:** Agent attempted to maintain two parallel log systems (.agent/sessions/ and an external audit folder) causing friction and missed updates.
**New rule:** Every session that changes code MUST update `.agent/sessions/YYYY-MM-DD.md` only. The external audit folder is deprecated.
**Trigger:** Every session end, every JET J9 commit.

### [2026-04-10] AGENTS.md documentation path pointed to wrong location
**Mistake:** AGENTS.md referenced /documentation/ — but the real system was an external audit folder.
**New rule:** All documentation path references must point to `.agent/sessions/` for session logs and `docs/adr/` for architectural decisions.
**Trigger:** Any update to AGENTS.md documentation section.

### [2026-04-13] NestJS business logic placed in controllers
**Mistake:** Business logic and database calls placed directly in NestJS controllers instead of services.
**New rule:** Controllers handle HTTP concerns only (routing, request parsing, response shaping). All business logic lives in services. All database access goes through packages/database.
**Trigger:** Any new NestJS controller creation.

### [2026-04-13] PHI fields not excluded from API responses
**Mistake:** PHI/PII fields returned in API responses without @Exclude() decorator, exposing sensitive patient data.
**New rule:** Every field containing PHI/PII in healthcare apps must be decorated with @Exclude() from class-transformer. Verify at J7 before any healthcare PR.
**Trigger:** Any new entity or DTO creation in apps/healthcare/.

---
<!-- Agent: append new lessons below this line -->

### [2026-04-19] pnpm-workspace.yaml is the real workspace config — not package.json#workspaces
**Mistake:** `apps/**` was never added to `pnpm-workspace.yaml`. pnpm uses THIS file as the workspace source of truth — the `workspaces` field in `package.json` is for npm/yarn compatibility only and is ignored by pnpm.
**New rule:** Always verify `pnpm-workspace.yaml` includes `apps/**`, `packages/**`, and `tooling/*`. Run `pnpm install` after any change to regenerate lockfile.
**Trigger:** Any new app added to `apps/`, any bootstrapping of workspace.

### [2026-04-19] Directory name and package name must be identical from day one
**Mistake:** `packages/artificial-core/` had directory name `artificial-core` but package.json name `@the-abyss/ai-core`. This mismatch caused documentation confusion and agent context errors across all sessions since project start.
**New rule:** When creating a new package, the directory name MUST match the package name suffix. e.g. directory `ai-core` ⇒ package `@the-abyss/ai-core`. Check this before first commit of any new package.
**Trigger:** Any new package creation in `packages/`.

### [2026-04-19] CI glob patterns must be updated when directory structure changes
**Mistake:** `ci.yml` validates `flows/definitions/*.json` (root glob). After reorganizing flows into subdirectories, none of the new flow files would be validated by CI.
**New rule:** When creating subdirectory structures for validated assets (flows, schemas, fixtures), immediately update the corresponding CI glob pattern in the same PR.
**Trigger:** Any restructuring of `flows/`, `repository/templates/`, or other CI-validated directories.

### [2026-04-19] External audit folder deprecated — single audit trail in .agent/
**Mistake:** Maintaining an external audit folder as a separate system created duplicate work, increased friction, and caused agents to miss logging requirements.
**New rule:** Session logs live ONLY in `.agent/sessions/YYYY-MM-DD.md`. There is no external audit system. AGENTS.md and CLAUDE.md are the SSOT for all agent governance.
**Trigger:** Any session that modifies code.

### [2026-04-19] vertex-provider naming vs actual auth mechanism must match
**Mistake:** Gemini left `vertex-provider.ts` calling the Gemini REST API (`generativelanguage.googleapis.com`) with an API key — not Vertex AI. File name implied GCP IAM auth but code used a bare API key. For PHI workloads this is a compliance violation (no HIPAA BAA on Gemini REST API).
**New rule:** Any file named `vertex-provider` MUST use `google-auth-library` or `@google-cloud/*` SDK with Service Account / Application Default Credentials. API keys are forbidden for healthcare embedding pipelines.
**Trigger:** Any new provider added to `packages/vector-store/src/`.

### [2026-04-19] VectorStoreConfig must reflect actual implementation
**Mistake:** `VectorStoreConfig` declared `provider: 'pinecone' | 'weaviate' | 'chroma' | 'memory'` — none of which were implemented. The actual provider was always pgvector (Neon). Dead enum created false impression of multi-provider support.
**New rule:** Config interfaces must only expose fields that are actually read and used by the implementation. Remove all dead enum values before committing.
**Trigger:** Any new config interface creation in any `packages/` package.

### [2026-04-19] Agent MUST audit full app landscape before any database or package work
**Mistake:** Multiple agents (Gemini, Claude) placed `KnowledgeBase` in `packages/database` without first auditing which apps have their own database. Result: migration never ran, table never existed, error at production query time.
**New rule:** Before any work touching database schema, shared packages, or cross-app architecture — run a full landscape scan: check every app under `apps/` for `.git`, `prisma/`, `package.json` type (Next.js vs Extension vs SPA). Map independently before writing a single line.
**Trigger:** ANY task involving: shared packages, database schema, RAG/vector store, migration, or cross-app data flow.
**Reference:** CONTEXT.md § Healthcare Apps — Complete Landscape (added 2026-04-19).

### [2026-04-19] LIMIT in raw SQL must use explicit ::int cast
**Mistake:** `LIMIT $2` in `$queryRawUnsafe` without `::int` cast. Prisma may bind JavaScript numbers as float8 depending on version, causing PostgreSQL to reject LIMIT with type mismatch error at runtime.
**New rule:** Always use `LIMIT $N::int` in any raw SQL query. Never rely on implicit type coercion for LIMIT/OFFSET parameters.
**Trigger:** Any raw SQL query using LIMIT or OFFSET with a bound parameter.

### [2026-04-19] Public package API must export all types needed by consumers
**Mistake:** `EmbeddingTaskType` was used in `VectorStoreConfig.defaultTaskType` but not exported from `index.ts`. Consumers could not import the type without reaching into internal module paths.
**New rule:** After writing any new type used in a public-facing interface, immediately check if it needs to be added to the package's `index.ts` exports. The test: can a consumer use the full public API using only imports from the package root?
**Trigger:** Any new type added to a `types.ts` or config interface in a shared package.

### [2026-04-20] Jangan mengandalkan ChatGPT Memory sebagai SSOT repo
**Mistake:** Menganggap memory produk sama dengan memory repo membuat keputusan/aturan hilang lintas sesi dan tidak bisa diaudit.
**New rule:** ChatGPT Memory hanya untuk preferensi stabil (khusus sesi Codex). Semua aturan, keputusan, dan blocker wajib dicatat di `.agent/` (CONTEXT/PROGRESS/HANDOFF/LESSONS/DECISIONS).
**Trigger:** Saat ada aturan kerja baru, perubahan arsitektur, atau blocker operasional.

### [2026-04-20] Larangan memory untuk data sensitif (secret/PHI/PII)
**Mistake:** Menaruh token, secret, PHI/PII dalam chat atau meminta untuk "diingat" berisiko bocor dan sulit dibersihkan total.
**New rule:** Jangan pernah membagikan atau menyimpan secret/token/PHI/PII ke memory. Untuk percakapan yang tidak boleh mempengaruhi memory gunakan Temporary Chat.
**Trigger:** Saat membahas kredensial, data pasien, atau konfigurasi rahasia.


### [2026-04-20] Shared vector-store package must not import a concrete database package
**Mistake:** `packages/vector-store/src/store.ts` imported `@the-abyss/database` directly even though healthcare apps own independent databases and inject their own Prisma clients. This would couple medical RAG to the wrong database boundary.
**New rule:** Shared vector-store code must accept a caller-owned Prisma-compatible database client through config. App-level runners are responsible for injecting the correct DB client.
**Trigger:** Any change to `packages/vector-store`, RAG ingestion, or cross-app DB access.

### [2026-04-20] Do not override Chief plan with inferred database ownership
**Mistake:** Codex inferred `packages/database` was the migration target because it contained `KnowledgeBase`, despite the master context stating healthcare apps own their databases and IntelligenceBoard is the source for SYMPHONY migration.
**New rule:** For healthcare DB/RAG work, read `MASTER_CONTEXT_2026-04-19.md` before commands. `packages/database` is platform-level only unless Chief explicitly changes ownership. KnowledgeBase for current RAG belongs to the IntelligenceBoard app schema.
**Trigger:** Any task involving Prisma, Neon, KnowledgeBase, vector-store ingest, or healthcare database ownership.

### [2026-04-20] SYMPHONY hierarchy is parent-first, never Dashboard-first
**Mistake:** Codex framed migration as if Dashboard was the sole source of truth. Chief corrected the hierarchy: `SYMPHONY` is the parent canonical engine; Dashboard and Assist are child consumers/hosts.
**New rule:** Before any SYMPHONY work, restate the hierarchy: `SYMPHONY -> Dashboard + Assist`. Audit local Dashboard/Assist logic only as candidate/evidence for canonicalization, never as a replacement for the parent model.
**Trigger:** Any task involving SYMPHONY, Dashboard, Assist, CDSS, clinical patterns, emergency override, or route parity.
