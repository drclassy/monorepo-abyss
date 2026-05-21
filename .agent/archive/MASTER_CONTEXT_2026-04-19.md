> # ⚠️ ARCHIVE — SUPERSEDED
> **Status:** ARCHIVED · **Captured:** 2026-04-19 · **Superseded by:** `.agent/CONTEXT.md` (post-Phase-1 state)
>
> This file is a **historical snapshot** of monorepo context taken before
> SYMPHONY Phase 1 canonicalization (commits `9644530` → `a587b41`). It is
> preserved for audit trail only. **Do NOT read this as current state.**
>
> Authoritative live context lives in `.agent/CONTEXT.md`, `PROGRESS.md`,
> `HANDOFF.md`, `LESSONS.md`, `DECISIONS.md`. If any section below conflicts
> with live `.agent/` files, **live files win**.
>
> Committed as archive: 2026-04-20 housekeeping pass.

---

# MASTER CONTEXT — The Abyss Monorepo
<!-- Backup lengkap sesi 2026-04-19 — dibuat sebagai safety net memory -->
<!-- Author: Dr. Ferdi Iskandar (Classy) | Documented by: Claude -->

---

## 1. VISI ARSITEKTUR (Chief's Intent)

Setiap produk kesehatan (intelligenceboard, sentra-assist, referralink, dll)
hanya bertugas sebagai **visualisasi dan interaksi** — bukan sebagai pemilik
logic klinis atau database.

Semua kecerdasan klinis dan data terpusat di root monorepo:

```
ROOT MONOREPO
├── packages/symphony        ← SSOT algoritma klinis (otak)
├── packages/vector-store    ← SSOT RAG + knowledge medis
├── packages/database        ← SSOT platform-level schema
└── apps/platform/
    └── orchestrator/        ← Engine koordinasi (fase berikutnya)

PRODUK (thin clients):
├── intelligenceboard        ← Dashboard klinis (host sementara Symphony)
├── sentra-assist            ← Browser extension (cockpit dokter)
├── referralink              ← Rujukan pasien
└── sentra-main              ← Marketing website
```

---

## 2. REALITA LANDSCAPE HEALTHCARE APPS

### intelligenceboard
- Path: `apps/healthcare/intelligenceboard/`
- Type: Next.js 16, custom Express server (server.ts)
- Deploy: Railway
- Database: **Neon PostgreSQL — 12 migrations aktif sejak Maret 2026**
- AI: Gemini (migrasi ke Vertex AI sedang berjalan)
- Status: **PRODUCTION ACTIVE — sistem paling matang**
- Peran sekarang: Host sementara Symphony engine + CDSS lokal

### sentra-assist
- Path: `apps/healthcare/sentra-assist/`
- Type: **Browser Extension (WXT)** — BUKAN server app
- Database: **Tidak ada** — tidak bisa koneksi DB langsung
- AI: `@google-cloud/vertexai` — sudah benar
- Peran: Cockpit dokter — DOM scraper, anonymizer, render Symphony output

### referralink
- Path: `apps/healthcare/referralink/`
- Type: React SPA (Vite), deploy di Vercel
- Database: Neon via `@neondatabase/serverless` + `@upstash/vector`
- AI: OpenAI (migrasi ke Symphony: future task)

### sentra-main
- Path: `apps/healthcare/sentra-main/`
- Type: Next.js marketing website
- Database: Tidak ada

### primary-healthcare
- Path: `apps/healthcare/primary-healthcare/`
- Type: Static + JSON files (ICD-10, penyakit puskesmas)
- Database: Tidak ada

---

## 3. SYMPHONY — STATUS DAN PROGRESS

### Apa itu Symphony
Symphony adalah **migrasi** dari logic klinis intelligenceboard ke shared package
di root monorepo — bukan membangun dari nol. Intelligenceboard adalah sumber
kebenaran algoritmanya.

### Engine dan Phase A yang Sudah Selesai (latest handoff synced)
| Module | Status |
|--------|--------|
| NEWS2 scoring + alerts | Done |
| Hard vital alerts | Done |
| Early-warning patterns | Done |
| Instant screening gates | Done |
| Composite deterioration | Done |
| Trajectory + momentum + prediction | Done |
| CDSS hybrid decisioning | Done |
| Parity fixtures | Done |
| PE Suspect Gate (`GATE_9_PE`) | Phase A Done |
| Anaphylaxis Gate (`GATE_10_ANAPHYLAXIS`) | Phase A Done |
| Assist `platform-api-client.ts` + `pii-guard.ts` | Phase A Done |
| 70 Assist Clinical Patterns adapter parity (CP-001-CP-070) | Phase B Done |
| Dashboard Emergency Override Layer | Phase C Done |
| Phase E route-level parity harness + CP route fixtures | Partial, Chief-gated |

### Phase A-C + Phase E Partial yang Baru Disinkronkan (2026-04-20)
- PE Suspect Gate + Anaphylaxis Gate sudah selesai di SYMPHONY dan Dashboard adapter.
- Contract terbaru: `SYMPHONY_CONTRACT_VERSION = '0.1.3'` dengan `GATE_9_PE` dan `GATE_10_ANAPHYLAXIS`.
- Naming client Assist yang berlaku: `platform-api-client.ts` + `pii-guard.ts`, bukan `dashboard-api-client.ts`.
- Alasan naming: client harus host-agnostic via `PLATFORM_API_BASE_URL` agar sekarang bisa menunjuk intelligenceboard dan nanti bisa pindah ke orchestrator tanpa refactor.
- Phase B selesai: `packages/symphony/src/adapters/assist-patterns-parity.ts` berisi 70 definisi parity dari `CP-001` sampai `CP-070`, dengan per-CP fixtures di `packages/symphony/src/__tests__/assist-patterns-parity.test.ts`.
- Phase C selesai: Dashboard Emergency Override Layer di `apps/healthcare/intelligenceboard/src/app/emr/emergency-override.ts`, `src/app/emr/page.tsx`, dan `src/app/globals.css`. Sumber emergency: CDSS red flag emergency, hard-stop screening critical, composite critical. Override memaksa Row 1 sampai ACK selesai.
- Phase E partial harness selesai: `apps/healthcare/intelligenceboard/scripts/test-symphony-route-parity.ts` menjalankan route-level parity Dashboard vs `assessSymphonyInput()` dengan status manifest JSON.
- CP route-level fixtures selesai: `SYMPHONY_PARITY_FIXTURE_CASES` sekarang 75 fixtures total, termasuk `cp-001-route` sampai `cp-070-route`; route coverage 70/70 dan adapter coverage 70/70.
- Release gate tetap terkunci: `routeParityStatus=partial`, `productionImportReplacementAllowed=false`, `reason=chief_go_required_for_production_import_replacement`; tidak ada production import replacement dan `metadata.status` tetap `degraded`.

### Yang Belum Selesai (urutan eksekusi terbaru)
1. Phase D - Assist renderer/consumer adapter bila diperlukan setelah payload stabil.
2. Phase E final release gate - CP route fixtures sudah 70/70, tetapi Layer 1/Layer 2 masih info-only dan Chief explicit GO masih wajib sebelum ganti import lokal intelligenceboard.

### Status Saat Ini
```typescript
metadata.status = 'degraded'
degradedReason = 'symphony_engine_partial_migration'
```
Status ini TIDAK BOLEH diubah sampai Phase E route parity tests hijau dan production import replacement aman.

---

## 4. RENCANA EKSEKUSI (4 Langkah)

```
Step 1 → Selesaikan Symphony migration (Phase A-C done; Phase E partial + CP fixtures done; hapus degraded hanya setelah Phase E final gate + Chief GO)
Step 2 → Wire intelligenceboard ke Symphony (ganti CDSS lokal)
Step 3 → Wire sentra-assist ke Symphony via API
Step 4 → RAG/KnowledgeBase (paralel, independent dari Step 1-3)
```

Step 4 berjalan paralel — tidak perlu menunggu Symphony selesai.

---

## 5. ARSITEKTUR SENTRA-ASSIST (Keputusan 2026-04-19)

### Client Target
**Pilihan: Abstraksi base URL**
- Canonical naming sekarang: `platform-api-client.ts` + `pii-guard.ts`.
- Wording lama `dashboard-api-client.ts` dianggap superseded naming, bukan target file baru, kecuali Chief meminta compatibility alias eksplisit.
- `PLATFORM_API_BASE_URL` di env.
- Sekarang: isi URL intelligenceboard.
- Nanti: ganti ke orchestrator (1 line env var, zero refactor).
- Assist tidak peduli siapa yang hosting.
### State Orchestrator
**Pilihan: Masih konstruksi, belum ready**
- Orchestrator folder sudah ada
- Assist dan Dashboard sudah bisa digunakan
- Tapi SYMPHONY endpoint belum di-expose di orchestrator
- Sementara: Assist call intelligenceboard

### Logic yang TETAP di Assist (browser-only)
- DOM scraper — baca data dari ePuskesmas EMR
- Content script — interaksi halaman web
- Background service worker — lifecycle extension
- Anonymizer — hapus PHI/PII sebelum kirim ke platform
- Bedside UX — render SymphonyResult ke dokter

### Logic yang KELUAR dari Assist → masuk Symphony
- Semua kalkulasi klinis (NEWS2, vital, CDSS, dll)
- Clinical patterns CP-001 s/d CP-070 sudah masuk adapter parity SYMPHONY Phase B; Assist local fallback tetap dipertahankan

---

## 6. RAG / VECTOR STORE (packages/vector-store)

### Yang Sudah Selesai (2026-04-19)
- vertex-provider.ts: Gemini REST API → Vertex AI SDK (GCP IAM)
- types.ts: Dead enum dihapus, VectorStoreConfig honest
- store.ts: Dependency injection, LIMIT::int fix, ef_search=100
- index.ts: EmbeddingTaskType diekspor
- .gitignore: gcp-sa*.json + gcp-*.json ditambahkan

### Database Target
- KnowledgeBase table masuk ke schema **intelligenceboard** (bukan packages/database)
- Alasan: intelligenceboard satu-satunya yang punya server + DB aktif

### HNSW Index (Chief eksekusi di Neon SQL Editor)
```sql
-- Step 1
CREATE EXTENSION IF NOT EXISTS vector;

-- Step 2 (setelah Prisma migration intelligenceboard)
CREATE INDEX kb_embedding_hnsw_idx
ON "KnowledgeBase"
USING hnsw (embedding vector_cosine_ops)
WITH (m = 24, ef_construction = 256);
```

### Parameter Rationale
| Parameter | Nilai | Alasan |
|-----------|-------|--------|
| m | 24 | Recall lebih tinggi untuk data medis |
| ef_construction | 256 | Kualitas index build ~98%+ |
| ef_search | 100 | Set di runtime, default 40 terlalu rendah |

---

## 7. PACKAGES DATABASE MAP

| Package | Database | Prisma | Catatan |
|---------|----------|--------|---------|
| intelligenceboard | Neon PostgreSQL | ✅ 12 migrations | Production aktif |
| referralink | Neon serverless | ❌ raw SQL | + @upstash/vector |
| packages/database | Neon PostgreSQL | ✅ belum migrate | Platform-level only |
| sentra-assist | Tidak ada | ❌ | Browser extension |
| sentra-main | Tidak ada | ❌ | Marketing site |

### Aturan Kritis
- `packages/database` BUKAN database untuk healthcare apps
- Setiap app healthcare punya database-nya sendiri
- KnowledgeBase (RAG) milik intelligenceboard schema

---

## 8. VERTEX AI SETUP

### Credential
```env
GOOGLE_APPLICATION_CREDENTIALS="/path/to/gcp-sa-key.json"
GCP_PROJECT_ID=""
GCP_LOCATION="us-central1"
```

### Service Account
- Role: Vertex AI User (roles/aiplatform.user)
- File key: JANGAN masuk Git (sudah di .gitignore)
- Auth: GCP IAM — BUKAN API key

### Perbedaan Kritis
| | Gemini REST API | Vertex AI |
|--|----------------|-----------|
| Auth | API Key | Service Account |
| HIPAA BAA | ❌ | ✅ |
| Untuk PHI | ❌ TIDAK AMAN | ✅ AMAN |

---

## 9. PESAN UNTUK AGENT BARU

Paste ini ke Claude Code atau agent apapun yang masuk:

---
Status terbaru 2026-04-20: Phase A-C selesai dan Phase E partial harness + CP route-level fixtures selesai. PE Suspect Gate (`GATE_9_PE`), Anaphylaxis Gate (`GATE_10_ANAPHYLAXIS`), Assist `platform-api-client.ts` + `pii-guard.ts`, 70 Assist Clinical Patterns adapter-parity (`CP-001`-`CP-070`), Dashboard Emergency Override Layer, dan CP route fixtures `cp-001-route` sampai `cp-070-route` sudah masuk memory. Route parity harness GREEN 76/76, tetapi release gate tetap `partial` dan `productionImportReplacementAllowed=false` sampai Chief explicit GO + final parity policy. Jangan kembali memakai wording lama `dashboard-api-client.ts` sebagai target utama kecuali Chief meminta compatibility alias eksplisit.

Apa yang sedang kita lakukan di SYMPHONY bukan membangun dari nol — ini adalah
**migrasi**. Logic klinis yang paling proven dan matang sudah ada di
`intelligenceboard` (12 migrations aktif, production-ready, sudah dipakai
dokter). Kita sedang **mengangkat** logic itu ke `packages/symphony` supaya
bisa dipakai bersama oleh semua produk.

Rujukan utama untuk algoritma:
- `apps/healthcare/intelligenceboard/src/lib/intelligence/`
- `apps/healthcare/intelligenceboard/src/lib/cdss/`

Orchestrasi via `apps/platform/orchestrator` adalah **fase berikutnya** —
setelah Symphony selesai di-wire ke intelligenceboard. Saat ini intelligenceboard
adalah host-nya, bukan orchestrator.

Untuk sentra-assist: gunakan `PLATFORM_API_BASE_URL` sebagai abstraksi.
Logic yang tetap di Assist hanya browser-only: DOM scraper, content script,
anonymizer, bedside UX. Semua kalkulasi klinis keluar dari Assist, masuk Symphony.
---

---

## 10. LESSONS KRITIS (jangan diulang)

1. **Landscape audit wajib** sebelum menyentuh database/package apapun
2. **packages/database bukan untuk healthcare apps** — setiap app punya schema sendiri
3. **vertex-provider.ts harus pakai GCP IAM** — API key tidak aman untuk PHI
4. **LIMIT $N::int** — selalu cast di raw SQL
5. **Public package API** harus ekspor semua types yang dipakai consumer
6. **VectorStoreConfig** harus reflect implementasi aktual — no dead enums
7. **pnpm-workspace.yaml** adalah source of truth workspace — bukan package.json#workspaces
8. **Directory name = package name suffix** — harus identik dari hari pertama

---

## 11. GO STATUS

| Class | Status |
|-------|--------|
| A — Minimal | ✅ Auto-approve |
| B — Standard | ✅ GO active |
| C — High risk | ✅ GO active |

*Authorized: 2026-04-18, carried forward*

---

*Document created: 2026-04-19*
*Author: Dr. Ferdi Iskandar (Classy)*
*Documented by: Claude (claude-sonnet-4-6)*
*Monorepo: D:\Devop\abyss-monorepo*
