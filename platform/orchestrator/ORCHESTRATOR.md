# ORCHESTRATOR.md — Transition Readiness: Phase A/B/C

**Prepared by:** Claude Code (Sonnet 4.6) — Strategic Execution **Date:**
2026-04-14 **Task ref:** S1 — Chief GO gate for ORCHESTRATOR Phase A/B/C
**Status:** AWAITING CHIEF GO — document ready for review

---

## TL;DR untuk Chief

Orchestrator punya **fondasi yang solid** tapi belum production-ready. Tiga
pre-requisites harus selesai sebelum Phase A GO:

1. **B4-A selesai** (Cursor) — CQRS folders scaffold
2. **Database env var** dikonfigurasi (`DATABASE_URL`)
3. **Kafka** tersedia di environment target (local atau staging broker)

Jika ketiga ini terpenuhi, **berikan GO** — Claude + Kilo dapat menyelesaikan
Phase A dalam satu sesi.

---

## Current State Assessment

### Yang sudah ada ✅

| Komponen                     | File                                                 | Status                                                                          |
| ---------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------- |
| Saga engine abstrak          | `src/sagas/base.saga.ts`                             | Functional — step-chain + compensation pattern                                  |
| NestJS hybrid (HTTP + Kafka) | `src/main.ts`                                        | Configured — port 3001, Swagger di `/docs`                                      |
| Flow runner                  | `src/flows/flows.service.ts`                         | Functional tapi mocked (3 hardcoded steps)                                      |
| Kafka module                 | `src/kafka/kafka.module.ts`                          | Configured — groupId `orchestrator-consumer`                                    |
| API key guard                | `src/common/guards/api-key.guard.ts`                 | Present                                                                         |
| Shadow mode interceptor      | `src/common/interceptors/shadow-mode.interceptor.ts` | Present                                                                         |
| Dependencies                 | `package.json`                                       | Lengkap — termasuk `@the-abyss/langflow-client`, `@the-abyss/database`, KafkaJS |

### Yang belum ada ❌

| Komponen                         | Keterangan                                                     | Owner             |
| -------------------------------- | -------------------------------------------------------------- | ----------------- |
| `src/commands/` + `src/queries/` | CQRS mandate dari root AGENTS.md                               | **Cursor (B4-A)** |
| `diagnosis-flow.saga.ts`         | Concrete saga untuk CDSS flow                                  | **Kilo (B4-B)**   |
| `referral-flow.saga.ts`          | Concrete saga untuk referral flow                              | **Kilo (B4-C)**   |
| Database schema untuk saga state | Prisma schema audit trail belum ada                            | **Phase A**       |
| LangFlow client wiring           | `langflow-client` di deps tapi belum di-wire ke `FlowsService` | **Phase B**       |
| Vitest test coverage             | Zero tests saat ini                                            | **Kilo (P1-12)**  |

---

## Phase A — Database Schema & Saga Persistence

**Goal:** Orchestrator bisa persist saga execution state ke database — untuk
audit trail, retry, dan observability.

### Apa yang perlu dilakukan

**1. Prisma schema tambahan di `packages/database`**

Buat tabel `SagaExecution` untuk tracking:

```prisma
model SagaExecution {
  id          String   @id @default(cuid())
  flowId      String
  sagaType    String   // "diagnosis-flow" | "referral-flow"
  status      String   // "running" | "completed" | "failed" | "compensated"
  input       Json
  output      Json?
  error       String?
  steps       Json     // Array of step execution records
  startedAt   DateTime @default(now())
  completedAt DateTime?
  orgId       String?

  @@index([flowId])
  @@index([status])
  @@index([startedAt])
}
```

**2. Update `BaseSaga.execute()` di `base.saga.ts`**

Inject `DatabaseService` dan persist execution record:

- Buat record saat `execute()` dipanggil
- Update step log setiap step selesai
- Mark final status saat done atau compensated

**3. Env var yang dibutuhkan**

```env
DATABASE_URL=postgresql://...  # Neon DB atau Postgres lokal
KAFKA_BROKER=localhost:9092
```

### Pre-requisites untuk Phase A

- [ ] `packages/database` expose `SagaExecution` repository
- [ ] `DATABASE_URL` available di environment target
- [ ] `B4-A` selesai (CQRS folders) — tidak blocking tapi lebih baik structure
      siap

### Definition of Done — Phase A

- [ ] Migration applied: `pnpm --filter @the-abyss/database db:push`
- [ ] Orchestrator bisa create, update, dan query `SagaExecution` records
- [ ] `FlowsService.runFlow()` persist execution ke DB
- [ ] `GET /flows/:id/status` endpoint mengembalikan saga status dari DB

---

## Phase B — LangFlow Integration

**Goal:** Ganti mock "Inference" step di `FlowsService` dengan real call ke
LangFlow client.

### Apa yang perlu dilakukan

**1. Periksa `@the-abyss/langflow-client`**

Package sudah di-declare sebagai dependency tapi belum di-wire. Perlu periksa
apakah package ini sudah implemented.

**2. Wire ke `FlowsService` Inference step**

```typescript
// Ganti mock di flows.service.ts:
saga.addStep({
  name: 'Inference',
  invoke: async (input) => {
    const result = await this.langflow.run(flowId, input)
    await this.kafka.emit('flow-events', {
      flowId,
      step: 'Inference',
      status: 'running',
    })
    return { ...input, result: result.output, confidence: result.confidence }
  },
  compensate: async (input, error) => {
    await this.kafka.emit('flow-events', {
      flowId,
      step: 'Inference',
      status: 'failed',
      error: error.message,
    })
  },
})
```

**3. Env var yang dibutuhkan**

```env
LANGFLOW_BASE_URL=http://localhost:7860  # atau staging LangFlow instance
LANGFLOW_API_KEY=...                      # jika LangFlow auth enabled
```

### Pre-requisites untuk Phase B

- [ ] Phase A selesai (saga state persistence)
- [ ] `@the-abyss/langflow-client` package implemented dan exported
- [ ] LangFlow instance running (local atau staging)
- [ ] Minimal 1 flow definition tersedia di LangFlow

### Definition of Done — Phase B

- [ ] `POST /flows/run` memanggil LangFlow dan mengembalikan real result
- [ ] Saga execution record menunjukkan actual LangFlow response
- [ ] Kafka events emit dengan confidence score dari LangFlow
- [ ] Error handling: jika LangFlow down → saga compensates dan marks status
      `failed`

---

## Phase C — Staging Deploy & Smoke Test

**Goal:** Orchestrator berjalan di staging environment dengan semua dependencies
terhubung.

### Infrastruktur yang dibutuhkan

```
staging environment:
├── Orchestrator (this service) — port 3001
├── Kafka broker — accessible dari orchestrator
├── PostgreSQL (Neon DB staging) — DATABASE_URL
└── LangFlow instance — LANGFLOW_BASE_URL
```

### Dockerfile assessment

`apps/platform/orchestrator/Dockerfile` sudah ada. Perlu verifikasi:

- [ ] Multi-stage build (build → production image)
- [ ] `ENV NODE_ENV=production`
- [ ] Health check endpoint (`GET /health`)

### Smoke tests yang dibutuhkan

```bash
# 1. Health check
curl -f http://orchestrator:3001/health

# 2. API docs tersedia
curl -f http://orchestrator:3001/docs-json

# 3. Flow execution (happy path)
curl -X POST http://orchestrator:3001/flows/run \
  -H "x-api-key: $ORCHESTRATOR_API_KEY" \
  -d '{"flowId":"test-flow","organizationId":"test-org","input":{}}'

# 4. Kafka connectivity
# Verify consumer group `orchestrator-consumer` appears in Kafka
```

### Definition of Done — Phase C

- [ ] Orchestrator container starts dan healthy
- [ ] Swagger UI accessible
- [ ] Flow execution end-to-end: HTTP → Saga → LangFlow → Kafka → DB
- [ ] All smoke tests pass
- [ ] Kafka consumer group registered

---

## Execution Order (setelah Chief GO)

```
B4-A (Cursor)     → CQRS scaffold [concurrent dengan Phase A prep]
     ↓
Phase A (Kilo)    → DB schema + saga persistence
     ↓
B4-B + B4-C (Kilo) → diagnosis-flow + referral-flow sagas
     ↓
Phase B (Kilo)    → LangFlow client wiring
     ↓
P1-12 (Kilo)      → Vitest tests
     ↓
Phase C (Chief/Infra) → Staging deploy + smoke tests
```

---

## Risks & Mitigations

| Risk                                                | Likelihood | Impact | Mitigation                                                           |
| --------------------------------------------------- | ---------- | ------ | -------------------------------------------------------------------- |
| `@the-abyss/langflow-client` belum implemented      | Medium     | High   | Audit package dulu sebelum Phase B                                   |
| Kafka tidak tersedia di staging                     | Medium     | High   | Docker Compose dengan Kafka untuk local dev                          |
| Database migration conflict dengan existing schema  | Low        | Medium | Run di staging Neon branch, bukan production                         |
| `BaseSaga` tidak thread-safe untuk concurrent flows | Low        | High   | Add saga instance isolation — buat new instance per `runFlow()` call |

---

## Satu hal yang perlu Chief putuskan sebelum GO

> **Apakah staging menggunakan Neon DB branch baru, atau shared staging DB?**

Ini mempengaruhi apakah migration Phase A aman untuk dijalankan tanpa
mempengaruhi data yang ada.

---

_Prepared for S1 Chief Decision Gate · Claude Code · 2026-04-14_
