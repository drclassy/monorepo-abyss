# AGENTS.md — apps/platform/sentra-portal

<!-- Cross-tool agent instructions: Claude Code, Cursor, Codex, Windsurf, Copilot -->
<!-- Last updated: 2026-04-12 | Owner: Chief | Projects: Sentra / The Abyss -->

---

## 0. Monorepo root (SSOT)

**Authoritative monorepo rules:** read the root
[`AGENTS.md`](../../../AGENTS.md) first (JET, contract-first, memory protocol,
technical conventions).

This file adds **scoped** instructions for this package only. If anything
conflicts, **root `AGENTS.md` wins**.

**Also:** `packages/shared-types` for shared contracts; **never** run
`terraform apply` / `terraform destroy` (Chief only).

---

## 1. Project introduction

**Sentra Portal** (`@the-abyss/sentra-portal`) — Next.js app (Biome for
lint/format per `package.json`). DevOps / portal UX; follow existing patterns in
`src/`.

---

## 2. Memory protocol

Follow root [`AGENTS.md`](../../../AGENTS.md) §2. Use local `.agent/` if
present; otherwise root `.agent/` for cross-cutting handoff.

---

## 3. JET workflow

Non-trivial tasks follow JET (root [`AGENTS.md`](../../../AGENTS.md) §2). No
execution before **J5 "GO"** when that gate applies per root §2.1 task
classification (Class A auto, Class B checkpoint, Class C hard J5).

---

## 4. Commands (from monorepo root)

```powershell
pnpm install
pnpm --filter @the-abyss/sentra-portal dev
pnpm --filter @the-abyss/sentra-portal build
pnpm --filter @the-abyss/sentra-portal check
```

---

## 5. Technical conventions

**Always do:** English for code and agent-facing docs; explicit error handling;
Conventional Commits; respect Biome (`check` / `check:fix`).

**Never do:** secrets or PII in logs; fabricate test output; silent catch
blocks.

---

## 6. Pre-PR checklist

Align with root [`AGENTS.md`](../../../AGENTS.md) §7: quality gates, no
secrets/PII, `.agent/` updates when applicable, commit trailer when required.

---

_Confirm with:_ ✅ AGENTS.md read. Reading `.agent/` now.
