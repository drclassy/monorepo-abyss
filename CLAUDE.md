# CLAUDE.md — The Abyss Monorepo

# Location: D:\Devop\abyss-monorepo\CLAUDE.md

# Scope: Claude Code CLI entry point — applies to all Claude Code sessions in this monorepo

---

## Entry Point

You are operating inside The Abyss — an AI-native Turborepo monorepo owned by
Dr. Ferdi Iskandar (Classy). This file is your entry point. AGENTS.md is the
supreme authority. When this file conflicts with AGENTS.md, AGENTS.md wins.

---

## GUARD 1: Mandatory Context Initialization

CRITICAL: Read the entire `.agent/` folder before performing any task. Assume
context window resets at any moment. All state lives in `.agent/`.

Read in this exact order:

1. `.agent/CONTEXT.md` — Architecture and stack
2. `.agent/PROGRESS.md` — Current state of work
3. `.agent/HANDOFF.md` — Active plan and session instructions
4. `.agent/LESSONS.md` — Previously made mistakes to avoid
5. `.agent/DECISIONS.md` — Prior architectural decisions

After reading all five files, output:

> ✅ CONTEXT LOADED: [architecture state] · PROGRESS: [work state] · ACTIVE
> TASK: [session goal] · KNOWN RISKS: [relevant lessons]

Do not proceed until Chief confirms.

---

## JET Workflow Protocol

Every non-trivial task follows JET, but depth depends on Task Classification
(AGENTS.md §2.1).

| Phase | Name                                             | Gate           |
| ----- | ------------------------------------------------ | -------------- |
| J1    | Context — scan `.agent/`, repo, env vars         | Auto           |
| J2    | Validate — check `.cursor/rules/` + `AGENTS.md`  | Auto           |
| J3    | Diagnose — document findings in `HANDOFF.md`     | Auto           |
| J4    | Plan — write step-by-step plan + rollback        | Auto           |
| J5    | Risk Gate — classify task (A/B/C)                | Risk-based     |
| J6    | Execute — verifiable diffs only                  | Post-planning  |
| J7    | Verify — 100% tests pass or rollback             | Post-execution |
| J8    | Docs — update `.agent/` (sessions/ + HANDOFF.md) | Post-verify    |
| J9    | Commit — include Agent/Phase/Handoff trailer     | Post-docs      |

### Task Classification Quick Reference

Before any task, classify it:

| Class | Risk     | Examples                     | GO Required?              |
| ----- | -------- | ---------------------------- | ------------------------- |
| **A** | Minimal  | Read file, grep, typo fix    | ❌ No — auto-execute      |
| **B** | Standard | Component, API, bug fix      | ⚠️ Check SESSION_STATE.md |
| **C** | High     | DB migration, terraform, PHI | ✅ Yes — hard J5 gate     |

**Quick Heuristic:**

- Hanya baca? → **Class A** → Execute langsung, log 1 line
- Tulis code normal? → **Class B** → Plan di HANDOFF, execute, verify
- Sentuh DB/infra/PHI? → **Class C** → Full JET, tunggu Chief "GO"

---

## Absolute Prohibitions

- `terraform apply` — Chief only
- PHI/PII in any log, commit, fixture, or test data
- `rm -rf`, `git reset --hard`, or any force-delete without explicit approval
- Creating new repositories without direct current-session instruction
- Autonomous database migrations, drops, or truncations
- Pushing to remote branches without explicit approval
- Skipping J5

---

## NestJS Standards (Quick Reference)

Full rules in AGENTS.md §5. Summary:

- Module structure: `module/`, `controller/`, `service/`, `dto/`, `entities/`
- Validation via `class-validator` only — no plain interfaces
- Business logic in services only — controllers handle HTTP exclusively
- All DB operations via `packages/database` — no direct ORM calls in app code
- Healthcare endpoints require `@ApiOperation` Swagger decorator
- CQRS mandatory for `apps/platform/orchestrator/`
- PHI/PII fields require `@Exclude()` decorator

---

## Session Log Protocol

Every session that modifies code must update both:

1. `.agent/sessions/YYYY-MM-DD.md` — agent memory and audit trail

---

_Last updated: April 2026_
