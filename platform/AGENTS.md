# AGENTS.md — apps/platform

<!-- Division bridge: AI coordination & Sentra portal. -->
<!-- Last updated: 2026-04-12 | Owner: Chief | Projects: Sentra / The Abyss -->

---

## Monorepo root (SSOT)

Read the root [`AGENTS.md`](../../AGENTS.md) first. **Root wins** on any
conflict.

---

## Sub-apps (each has its own `AGENTS.md`)

| Package       | Path                                                   |
| ------------- | ------------------------------------------------------ |
| Orchestrator  | [`orchestrator/AGENTS.md`](./orchestrator/AGENTS.md)   |
| Sentra Portal | [`sentra-portal/AGENTS.md`](./sentra-portal/AGENTS.md) |

---

## Division scope

Public interfaces for **orchestration** and **portal** — breaking changes in
`orchestrator` exports require review per app `AGENTS.md` and root
contract-first rules.

---

_Confirm with:_ ✅ AGENTS.md read. Reading `.agent/` now.
