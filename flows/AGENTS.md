# AGENTS.md — flows

<!-- LangFlow workflow definitions and related assets. -->
<!-- Last updated: 2026-04-12 | Owner: Chief | Projects: Sentra / The Abyss -->

---

## Monorepo root (SSOT)

Read the root [`AGENTS.md`](../AGENTS.md) first. **Root wins** on any conflict.

---

## Scope

`definitions/`, `components/`, and `tests/` hold **LangFlow** (and related) AI
workflow assets. Treat changes as **versioned contracts** for anything consumed
by `apps/*` or `packages/langflow-client` when present.

---

## Conventions

- Prefer **explicit** inputs/outputs and failure semantics; align with
  `packages/shared-types` when flows expose API-shaped payloads.
- Do not embed **API keys** or patient data in flow JSON — use env/secret
  injection at runtime.
- Large or breaking flow edits: follow **JET** and Chief **GO** when required by
  root policy.

---

_Confirm with:_ ✅ AGENTS.md read. Reading `.agent/` now.
