# Agent Hermes — HANDOFF.md

**Session goal:** Complete the stalled Phase 1 operator tooling, tests, and documentation; then mount pending skills/plugins submodules and write integration tests.

**Date:** 2026-04-13  
**Agent:** Kimi Code CLI  
**Chief:** Dr. Ferdi Iskandar

---

## Active Plan

### Step 1 — Memory & Compliance
- Write `.agent/CONTEXT.md`, `PROGRESS.md`, `HANDOFF.md`, `LESSONS.md`, `DECISIONS.md`.
- Update `apps/prototype/AGENTS.md` sub-app table if needed.

### Step 2 — Operator Ergonomics
- Create `scripts/up.ps1`, `scripts/down.ps1`, `scripts/smoke.ps1`.
- Create `Makefile` with `up`, `down`, `logs`, `ps`, `smoke`, `smoke-all` targets.

### Step 3 — Real Smoke Tests
- Write `tests/smoke/test_base_profile.py` covering:
  1. hindsight postgres ready (`pg_isready`)
  2. hermes-core CLI responds (`hermes --version`)
  3. hermes gateway HTTP reachable (httpx GET :8642)
  4. mission-control UI loads (httpx GET :3000)
  5. workspace-ui loads (httpx GET :3001)

### Step 4 — Documentation
- Rewrite `README.md` as operator runbook (quickstart, ports, profiles, troubleshooting).
- Create `docs/ARCHITECTURE.md` (condense spec v2 §3-5).
- Create `docs/OPERATIONS.md` (backup/restore, chaos drills, secret rotation).

### Step 5 — Skills + Plugins
- Add `skills/wondelai` submodule (pinned to `4d322538`).
- Add `plugins/web-search-plus` submodule (pinned to `v1.3.0`).
- Add `plugins/evey-bridge` submodule (pinned to `663b240c`).
- Update `config/hermes/config.yaml` to wire plugin search paths.
- Write `tests/integration/test_skill_discovery.py`.

### Step 6 — Session Log
- Write `.agent/sessions/2026-04-13.md`.
- Commit all changes with appropriate trailers.

---

## Rollback Plan
- If any submodule add fails (network issues), skip it and leave a TODO comment in `PROGRESS.md`.
- If Docker is unavailable, write tests but mark them as pending/skippable if containers are not running.
