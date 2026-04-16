# The Abyss Monorepo — Architecture & Project Briefing
<!-- Dokumen ini adalah single source of truth untuk briefing thread baru. -->
<!-- Last updated: 2026-04-15 · Author: Claude (Architect) -->

---

## 1. Ringkasan Eksekutif

**The Abyss** adalah AI-native Turborepo monorepo milik Dr. Ferdi Iskandar (Avvcenna+).
Berisi seluruh ekosistem digital Sentra — dari platform AI healthcare, dashboard klinis,
hingga sistem agent multi-AI.

| Field | Value |
|-------|-------|
| Owner | Dr. Ferdi Iskandar (Chief / Avvcenna+) |
| Stack utama | TypeScript, Next.js 16, NestJS, React 19, Tailwind v4, Prisma, Neon DB |
| Monorepo tool | Turborepo + pnpm workspaces |
| Agent system | Multi-agent: Claude + Kilo + Cursor + Gemini |
| Status saat ini | **SENTRA AI HYBRID MASTER PLAN selesai — 39/41 tasks done** |

---

## 2. Struktur Direktori

```
abyss-monorepo/
├── apps/                    ← Semua aplikasi (akan dipecah jadi repo sendiri)
│   ├── academic/            ← Divisi akademik
│   ├── community/           ← Divisi komunitas
│   ├── healthcare/          ← Divisi healthcare (core business)
│   ├── platform/            ← Infrastruktur platform AI
│   └── prototype/           ← Experimental / R&D
├── packages/                ← Shared libraries (tetap di monorepo)
├── .agent/                  ← Agent memory, governance, session logs
├── flows/                   ← LangFlow flow definitions
├── infrastructure/          ← Terraform, Docker, CI/CD configs
├── tooling/                 ← Shared build tooling
└── docs/                    ← Dokumentasi teknis
```

---

## 3. Apps — Semua Project

### 3.1 Healthcare Division (Core Business)

| App | Package name | Stack | Tujuan |
|-----|-------------|-------|--------|
| `sentra-dashboard` | `@the-abyss/puskesmas-dashboard` | Next.js 16, React 19, Prisma, Neon | Dashboard admin staf Puskesmas: rekam medis, CDSS, laporan klinis |
| `primary-healthcare` | umbrella | — | Folder umbrella: database ICD-10 + website publik Puskesmas |
| `primary-healthcare/database` | — | JSON/CSV static | Master data: ICD-10 (~2.6MB), 144 penyakit Puskesmas, referensi CDSS |
| `primary-healthcare/website` | `@the-abyss/puskesmas-website` | Vite 7, React 19, Tailwind v4 | Website publik PONED Balowerti — info layanan + reservasi via WhatsApp |
| `sentra-assist` | — | — | AI assistant untuk staf Puskesmas |
| `sentra-main` | — | — | Main healthcare app |

**Key constraint healthcare:** PHI/PII mutlak dilarang di semua log, commit, fixture.

### 3.2 Platform Division (AI Infrastructure)

| App | Stack | Tujuan |
|-----|-------|--------|
| `orchestrator` | NestJS, Kafka, Prisma | AI flow orchestrator — menjalankan DiagnosisFlowSaga dan ReferralFlowSaga |
| `sentra-portal` | Next.js | Monitoring dashboard untuk seluruh monorepo (ditemukan Cursor, Apr 2026) |

**Orchestrator pattern:** NestJS hybrid app (HTTP + Kafka). Saga choreography dengan `BaseSaga` — step-chain + reverse compensation (rollback). CQRS mandatory. Deployment plan di `ORCHESTRATOR.md`.

### 3.3 Academic Division

| App | Tujuan |
|-----|--------|
| `academic-solutions` | Solusi akademik berbasis AI |
| `clinical-simulator` | Simulator klinis untuk training |
| `evaluation-engine` | Engine evaluasi hasil klinis |

### 3.4 Community Division

| App | Tujuan |
|-----|--------|
| `avvcenna+-transformer` | AI transformer untuk komunitas |
| `avvcenna+-memory` | Memory management system (Python + Next.js) — di-rename dari `avvcenna+-memory` oleh Kilo Apr 2026 |

### 3.5 Prototype Division

| App | Stack | Tujuan |
|-----|-------|--------|
| `agent-hermes` | Docker, multi-service | AI agent stack — Phase 1-8 roadmap, base stack verified |

---

## 4. Packages — Shared Libraries

Semua package ada di `packages/` dan dipublish sebagai `@the-abyss/*`.

| Package | Nama | Tujuan |
|---------|------|--------|
| `artificial-core` | `@the-abyss/ai-core` | Multi-model LLM orchestration + consensus engine |
| `config-eslint` | `@the-abyss/config-eslint` | Shared ESLint configs (base, node, react) |
| `config-typescript` | `@the-abyss/config-typescript` | Shared tsconfig base (strict) |
| `database` | `@the-abyss/database` | Prisma singleton + semua model types |
| `design-token` | — | Design token system — Avvcenna+ Dark Theme |
| `fhir-engine` | `@the-abyss/fhir-engine` | FHIR R4 validation + transformation layer |
| `integration-bridge` | `@the-abyss/integration-bridge` | Notion + Linear integration client |
| `iskandar-gatekeeper` | `@the-abyss/iskandar-gatekeeper` | Security layer: JWT (HS256-only) + API key auth + GO-Gate CI/CD validator |
| `langflow-client` | `@the-abyss/langflow-client` | HTTP client untuk Langflow AI orchestration server |
| `sentra-ui` | `@the-abyss/ui` | Shared React component library (Radix + Tailwind v4) |
| `shared-types` | `@the-abyss/shared-types` | Central TypeScript type contracts untuk seluruh monorepo |
| `vector-store` | `@the-abyss/vector-store` | RAGOps + vector search abstraction (pgvector) |

---

## 5. Agent System

### 5.1 Multi-Agent Roles

| Agent | Role | Tools | Assigned Tasks |
|-------|------|-------|---------------|
| **Claude** | Architect + Reviewer | Claude Code CLI | B3-A/B, B1-B, P1-10, P2-01/06/07/10/12 |
| **Kilo** | Implementer | Kilocode | B1-A, B3-B*, B4-B/C, P1-01/04/07/08/09/12, P2-09 |
| **Cursor** | Scaffolder + Tooling | Cursor IDE | B4-A, P1-02/03/05/06/11/13, P2-02/03/04/05/08/11, S6 |
| **Gemini** | Supervisor + Auditor | Gemini CLI | Audit + P1-03 (supervisor override) |
| **Chief** | Decision maker | — | B2, S2/3/4/5/7, B5, S1 |

*B3-B diassign ulang ke Kilo setelah Claude implementasi referensi (agent boundary violation corrected)

### 5.2 JET Workflow Protocol

Setiap task non-trivial ikuti JET Protocol:

| Phase | Gate | Keterangan |
|-------|------|-----------|
| J1 Context | Auto | Scan `.agent/` dulu |
| J2 Validate | Auto | Cek AGENTS.md + rules |
| J3 Diagnose | Auto | Document findings |
| J4 Plan | Auto | Step-by-step plan |
| J5 Risk Gate | **Class-based** | A=auto, B=checkpoint, C=hard GO |
| J6 Execute | Post-plan | Verifiable diffs |
| J7 Verify | Post-exec | Tests must pass |
| J8 Docs | Post-verify | Update .agent/ |
| J9 Commit | Post-docs | Dengan Agent trailer |

### 5.3 .agent/ Structure

```
.agent/
├── CONTEXT.md      ← Arsitektur + stack (baca pertama)
├── PROGRESS.md     ← Status pekerjaan saat ini
├── HANDOFF.md      ← Plan + instruksi sesi ini (overwrite tiap sesi)
├── LESSONS.md      ← Kesalahan yang harus dihindari
├── DECISIONS.md    ← Keputusan arsitektur yang sudah dibuat
├── ARCHITECTURE.md ← Dokumen ini
├── tasks/
│   ├── TASKS.json  ← Task queue semua agent (machine-readable)
│   └── SENTRA AI HYBRID MASTER PLAN.md ← Master plan dokumen
└── sessions/
    └── YYYY-MM-DD.md ← Session logs audit trail
```

---

## 6. Keamanan (iskandar-gatekeeper)

Package `@the-abyss/iskandar-gatekeeper` adalah security layer terpusat:

- **JWT**: HS256-only — reject `alg !== 'HS256'` di header level (algorithm confusion prevention)
- **API Key**: `timingSafeEqual` comparison (timing oracle prevention)
- **Permissions**: `apiKeyMiddleware(keys, requiredPermissions?)` enforce di middleware level
- **GO-Gate**: CI/CD validator — scan `.agent/sessions/HANDOFF.md` untuk approval string
- **Tests**: 15 vitest tests termasuk attack scenarios (alg:none, alg:RS256, timing)

---

## 7. Status Saat Ini (2026-04-15)

### Task Queue
- **39/41 tasks DONE** — SENTRA AI HYBRID MASTER PLAN selesai
- **2 tasks DEFERRED** (butuh Chief decision):
  - `B5` — LangFlow strategy (populate flows/ atau defer)
  - `S1` — GO untuk Orchestrator Phase A/B/C (DB migration, Class C)

### Commits Terakhir (belum dipush — menunggu GitHub baru)
```
393754f  Kilo   — packages tests + avvcenna+-memory rename
c007506  Cursor — orchestrator + sentra-portal + sentra-main
1edc926  Claude — P2-10 package docs + .agent/ housekeeping
7c6b834  Claude — B3-B iskandar-gatekeeper hardening
```

---

## 8. Next Phase — Repo Restructuring Plan

**Keputusan Chief (2026-04-15):** Split monorepo → 13 repos terpisah.

### Target: 13 Repos

| # | Repo | Source |
|---|------|--------|
| 0 | `abyss-monorepo` (CORE) | root — packages/ + .agent/ + configs, NO apps/ |
| 1 | `sentra-dashboard` | apps/healthcare/sentra-dashboard |
| 2 | `puskesmas` | apps/healthcare/primary-healthcare |
| 3 | `sentra-assist` | apps/healthcare/sentra-assist |
| 4 | `sentra-main` | apps/healthcare/sentra-main |
| 5 | `academic-solutions` | apps/academic/academic-solutions |
| 6 | `clinical-simulator` | apps/academic/clinical-simulator |
| 7 | `evaluation-engine` | apps/academic/evaluation-engine |
| 8 | `avvcenna+-transformer` | apps/community/avvcenna+-transformer |
| 9 | `avvcenna+-memory` | apps/community/avvcenna+-memory |
| 10 | `platform-orchestrator` | apps/platform/orchestrator |
| 11 | `sentra-portal` | apps/platform/sentra-portal |
| 12 | `agent-hermes` | apps/prototype/agent-hermes |

### Packages Strategy: GitHub Packages (npm private registry)

```
abyss-monorepo/packages/* → publish → github.com/packages (@the-abyss/*)
                                              ↓
                              tiap project repo:
                              pnpm add @the-abyss/fhir-engine
```

### Execution Steps (Phase 3 — setelah akun GitHub baru siap)

1. Setup GitHub Packages di `abyss-monorepo` (`publishConfig` di package.json)
2. Publish semua `packages/*` ke `https://npm.pkg.github.com`
3. Buat 12 repo baru via `gh repo create` (batch)
4. Extract tiap app ke repo-nya (fresh push, no history)
5. Update `package.json` tiap app — ganti `workspace:*` → GitHub Packages version
6. Hapus `apps/` dari `abyss-monorepo`
7. Force-push clean state ke `abyss-monorepo`

### Trigger

**Chief konfirmasi akun GitHub baru siap + username → Claude eksekusi Phase 3**

---

## 9. Open Questions (Butuh Chief Decision)

| # | Pertanyaan | Context |
|---|-----------|---------|
| 1 | **Staging DB strategy** untuk Orchestrator Phase A | New Neon branch vs shared staging DB |
| 2 | **LangFlow strategy** (B5) | Populate `flows/` dengan flow definitions, atau defer integrasi |
| 3 | **GitHub username baru** | Untuk setup 13 repos + GitHub Packages |

---

*Architecture doc by Claude · 2026-04-15 · Untuk briefing thread baru*
