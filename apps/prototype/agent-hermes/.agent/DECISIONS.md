# Agent Hermes — DECISIONS.md

**Last updated:** 2026-04-13

---

## D1 — Thin-wrap orchestration (no unified custom compose)

**Decision:** Use each vendor's own Dockerfile + docker-compose, glued by a shared Docker network (`hermes-net`) and a thin overlay compose (`docker-compose.base.yml`).  
**Rationale:** Prevents drift from upstream, minimizes custom code, and respects each vendor's native config model.  
**Consequence:** We must learn each vendor's env vars and entrypoints rather than forcing a uniform interface.

---

## D2 — Port assignments

**Decision:**
- Mission Control → host `3000`
- Workspace UI → host `3001` (remapped from container `3000`)
- Hermes gateway → host `8642`
- Hindsight API → host `8888`
- Hindsight CP → host `9999`

**Rationale:** Avoid collisions between mission-control and workspace-ui (both default to 3000). Keep hindsight ports exposed for debugging even though they are internal-only in later phases.

---

## D3 — Nous Portal as primary LLM provider

**Decision:** Configure both hermes-core and hindsight to point at Nous Research inference API, reusing `NOUS_API_KEY`.  
**Rationale:** Chief has an active Nous subscription; this avoids managing multiple API keys.  
**Consequence:** If Nous Portal is down, both core reasoning and hindsight memory embedding/LLM calls are affected.

---

## D4 — Local bundled skills + optional wondelai pack

**Decision:** Keep the 77 bundled skills in-repo (no submodule) and add `wondelai/skills` as an optional submodule under `skills/wondelai`.  
**Rationale:** Bundled skills are static reference material; wondelai is a larger production pack that may update independently.  
**Consequence:** `skills/` mixes versioned and unversioned content; documented in `docs/SKILLS-CATALOG.md`.

---

## D5 — Smoke tests use real vendor protocols

**Decision:** Smoke tests do NOT assume fictional REST endpoints. Tests use `docker exec`, `pg_isready`, and `httpx` against actual documented paths.  
**Rationale:** Prevents false confidence and test breakage when vendor interfaces change.  
**Consequence:** Tests are slightly more heterogeneous, but they reflect reality.
