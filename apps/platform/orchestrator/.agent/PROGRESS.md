# PROGRESS.md — Orchestrator

## Current Status

**Last Updated:** 2026-04-15  
**Phase:** Phase A & C Complete — Phase B Pending

---

## ✅ Completed

### Phase A: Database Schema & Saga Persistence
- [x] SagaExecution model in Prisma schema
- [x] SagaRepository service for persistence
- [x] BaseSaga dengan logging hooks
- [x] FlowsService integrated dengan SagaRepository
- [x] GET /flows/:executionId/status endpoint

### Phase C: Health Check & API Security
- [x] @nestjs/terminus installed
- [x] HealthController dengan /health endpoint
- [x] ApiKeyGuard applied ke FlowsController
- [x] Swagger docs updated dengan auth info

---

## 🔄 In Progress

### Phase B: LangFlow Integration
- [ ] Wire AbyssFlowClient ke diagnosis-flow.saga
- [ ] Wire AbyssFlowClient ke referral-flow.saga
- [ ] Remove mock data dari CDSS query
- [ ] Test end-to-end dengan real LangFlow

---

## ⏳ Not Started

- [ ] WebSocket integration (FlowsGateway → FlowsService)
- [ ] Test coverage (Vitest tests)
- [ ] Staging deployment

---

## Blockers

- None — Phase B ready untuk dikerjakan

