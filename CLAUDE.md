# CLAUDE.md — The Abyss Monorepo

**Location:** `D:\Devops\abyss-monorepo\CLAUDE.md`  
**Scope:** Claude Code CLI entry point for this monorepo.

---

## Policy Authority

`AGENTS.md` is the repository policy authority.

This file exists only to direct Claude Code to the correct monorepo rulebook. It
must not duplicate, weaken, or override `AGENTS.md`.

If this file conflicts with `AGENTS.md`, `AGENTS.md` wins.

---

## Required Startup Behavior

Before any non-trivial work in this repository:

1. Read root `AGENTS.md`.
2. Follow the applicable nearest `AGENTS.md` if a nested one exists.
3. Use `.agent/` only as defined by `AGENTS.md`.
4. Continue using the workflow, boundaries, verification rules, and final report
   format defined in `AGENTS.md`.

Do not treat this file as an independent operating contract.

---

## Rule

For all repo behavior, safety boundaries, language style, verification,
continuity, risk gates, and definition of done:

> Refer to `AGENTS.md`.

---

Last updated: 2026-05-25
