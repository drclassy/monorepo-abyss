# Agent Hermes — CONTEXT.md

**Project:** Agent Hermes (Hermes Maximus)  
**Path:** `apps/prototype/agent-hermes`  
**Stack:** Python ≥3.12, Docker Compose, Node.js (via vendor images)  
**Division:** Prototype (experimental, no production PHI)  
**Last updated:** 2026-04-13

---

## 1. What this project is

A personal meta-agent / AI lab stack composed from 14 pinned open-source repositories in the Hermes ecosystem. It is a **thin-wrap orchestration** layer: we do not rewrite vendor code, we glue vendor containers together via Docker Compose, shared networks, and mounted config volumes.

---

## 2. Architecture (3 profiles)

### Base profile (running)
- **hermes-core** (NousResearch/hermes-agent) — agent runtime & gateway (port 8642)
- **hindsight** (vectorize-io/hindsight) — memory backend (ports 8888 API, 9999 CP)
- **mission-control** (builderz-labs/mission-control) — Next.js dashboard (port 3000)
- **workspace-ui** (outsourc-e/hermes-workspace) — Hermes-native chat UI (port 3001)

### Meta profile (pending)
- super-hermes, hermes-dojo, hermes-council, self-evolution

### Skills profile (pending)
- skill-factory, skill-marketplace

---

## 3. Key files

| File | Purpose |
|------|---------|
| `docker-compose.base.yml` | Glue compose for base profile |
| `config/hermes/config.yaml` | Gateway-mode config mounted into hermes-core |
| `.env.example` | Shared environment template |
| `docs/superpowers/specs/2026-04-12-hermes-maximus-design.md` | v2 design spec (ground truth) |
| `docs/superpowers/plans/2026-04-12-hermes-maximus-plan.md` | v2 implementation plan |
| `skills/` | 77 bundled skills + (pending) wondelai pack |
| `plugins/` | (pending) web-search-plus, evey-bridge |
| `vendor/` | Pinned git submodules |

---

## 4. Technology constraints

- **Windows 11 Home + Docker Desktop + WSL2 backend**
- hermes-core requires WSL2 for native install; inside Docker it is fine.
- Playwright/Chromium inside hermes-core needs `shm_size: 1gb`.
- No `terraform apply` allowed (Chief-only per monorepo rules).
- No production credentials or PHI in repo.
