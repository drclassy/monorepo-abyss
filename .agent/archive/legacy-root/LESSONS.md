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

### [2026-04-21] The Danger of Global Replacements in Monorepo
**Mistake:** Performed global string replacement across monorepo root without directory filtering, leading to infrastructure name collisions.
**New rule:** Never perform mass replacements at root. Always scope to specific packages or apps. Infrastructure names (Hermes/Hermen) must be protected from domain rebranding.
**Trigger:** Any request for global string replacement or rebranding.

### [2026-04-21] Vertex AI Authentication Standard
**Mistake:** Attempted to use REST API with manual keys for enterprise embeddings.
**New rule:** Use `google-auth-library` for automatic Service Account token resolution (ADC) in all Vertex AI integrations to ensure HIPAA compliance and scalability.
**Trigger:** Any new integration with Vertex AI services.

### [2026-04-21] Memory Location Resilience
**Mistake:** Interpreted Git "deleted" status as loss of data.
**New rule:** Git "deleted" status + new "untracked" folder often indicates a directory move. Verify physical file existence on disk before reacting with destructive recovery commands.
**Trigger:** Any audit showing massive file deletions in .agent/ folders.
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

### [2026-05-07] .agent root must separate live state from archives and references
**Mistake:** Root `.agent/` mixed active startup files with historical ledgers and bulky reference documents, while an older lesson claimed the root could contain only the five core files plus sessions. The result was contradictory structure rules and noisy startup context.
**New rule:** Root `.agent/` is reserved for live operational state: `CONTEXT.md`, `PROGRESS.md`, `HANDOFF.md`, `LESSONS.md`, `DECISIONS.md`, `SESSION_STATE.md`, and support directories such as `sessions/`, `archive/`, `references/`, and tightly-scoped operational folders when needed. Historical ledgers belong in `archive/`. Non-startup reference material belongs in `references/`.
**Trigger:** Any `.agent/` cleanup, SSOT refactor, or new governance document creation.
**Supersedes:** The 2026-04-10 lesson that root `.agent/` must contain only the standard five files plus `sessions/`.

### [2026-05-07] Cross-agent authority and cloud direction must stay synchronized
**Mistake:** Codex, Claude, and Cursor layers drifted apart: some files still treated `AGENTS.md` as the operational SSOT, some still pointed to old `V:\class-sentra\...` paths, and some quality notes still implied Vertex/GCP was the active cloud target.
**New rule:** Keep cross-agent governance aligned on three points: `AGENTS.md` = repository policy authority, `.agent/` = operational SSOT, and Google Cloud / Vertex AI / Gemini are legacy surfaces unless a newer decision explicitly reactivates them.
**Trigger:** Any edit to `CLAUDE.md`, `.cursor/*`, `.codex/*`, or root governance docs.
**Supersedes:** Any older lesson text implying `AGENTS.md` and `CLAUDE.md` jointly act as the operational SSOT, or that Vertex AI remains the active future direction.

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

### [2026-05-16] Every agent must load `.agent/` before substantive repo work
**Mistake:** Codex treated `AGENTS.md` as enough startup context and continued technical diagnosis without first loading `.agent/` as the operational SSOT.
**New rule:** For any non-trivial Sentra / ABYSS repo work, every agent must verify `.agent/` exists, read the active `.agent/` continuity state, and report the current `.agent/` status before continuing when governance, handoff, continuity, or protected-state risk is involved. `AGENTS.md` is the public rulebook; `.agent/` is the operational SSOT.
**Trigger:** Any task in `D:\Devops\abyss-monorepo` that touches repo state, build blockers, governance, handoff, workflow continuity, verification, or cross-agent work.


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

### [2026-04-23] pdf-parse tidak bisa handle PDF modern — gunakan PyMuPDF
**Mistake:** `pdf-parse` menggunakan PDF.js versi lama yang tidak bisa handle PDF 1.6+ dengan compressed streams. Seluruh kategori medical library (int/, gen/, bas/) gagal diekstrak.
**New rule:** Untuk PDF extraction di Node.js, gunakan PyMuPDF via Python subprocess (`pdf_extract.py`) sebagai primary extractor. `pdf-parse` hanya reliable untuk PDF 1.2 format sederhana.
**Trigger:** Setiap implementasi PDF ingestion pipeline baru.

### [2026-04-23] PyMuPDF di Windows menulis error ke stdout (fd 1), bukan stderr
**Mistake:** MuPDF C-level error messages tertulis ke stdout saat Python berjalan di Windows. `execFileAsync` capture stdout → error messages ikut ter-embed sebagai chunk content di database.
**New rule:** Selalu tambahkan `fitz.TOOLS.mupdf_display_errors(False)` di awal setiap script PyMuPDF. Jangan assume MuPDF errors pergi ke stderr.
**Trigger:** Setiap script Python yang menggunakan PyMuPDF/fitz.

### [2026-04-23] PDF chunker wajib punya fallback untuk plain-text tanpa markdown headings
**Mistake:** Chunker hanya split by `\n\n+` (double newline). PyMuPDF output pakai `\n` single, sehingga seluruh teks dokumen menjadi 1 chunk raksasa — Ollama embedding gagal karena token limit.
**New rule:** Chunker harus cek apakah `\n\n+` split menghasilkan ≤1 paragraph. Jika ya, fallback ke line-grouping: group lines sampai `MAX_TOKENS` token, lalu buat chunk baru.
**Trigger:** Setiap perubahan pada `chunker.ts` atau pipeline ingestion PDF.

### [2026-04-23] Binary PDF yang ditransfer sebagai text file menjadi permanently corrupt
**Mistake:** PDF di `int/`, `gen/`, `bas/` rusak karena ditransfer/download dalam mode text. Setiap byte non-ASCII (> 0x7F) di-replace dengan `\xef\xbf\xbd` (UTF-8 replacement character U+FFFD), merusak seluruh compressed stream content.
**Diagnostic:** Cek 20 byte pertama file. Jika ada `\xef\xbf\xbd` di binary header, file corrupt — tidak bisa diperbaiki tanpa file asli.
**New rule:** PDF dan binary file HARUS di-download/transfer dalam binary mode. Di Git, pastikan `.gitattributes` mendefinisikan `*.pdf binary`. Corruption ini tidak reversible.
**Trigger:** Setiap kali PDF baru ditambahkan ke library, atau saat ada laporan PDF gagal diekstrak.
