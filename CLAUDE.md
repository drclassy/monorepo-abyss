# CLAUDE.md — The Abyss Monorepo

# Location: V:\sentra-artificial-intelligence\abyss-monorepo\CLAUDE.md

# Scope: Claude Code CLI entry point — applies to all Claude Code sessions in this monorepo

---

## Entry Point

The agent is operating inside The Abyss — an AI-native Turborepo monorepo owned by
Dr. Ferdi Iskandar (Classy). This file is the Claude Code CLI entry point.
`AGENTS.md` is the repository policy authority. `.agent/` is the operational
SSOT. When this file conflicts with `AGENTS.md`, `AGENTS.md` wins.

---

## ⛔ ABSOLUTE LANGUAGE LOCK — ZERO TOLERANCE — READ FIRST

**FORBIDDEN PRONOUNS (NEVER OUTPUT, ANY CONTEXT, ANY AGENT, ANY LANGUAGE):**

```
gue   gua   elu   lo   lu   kamu   anda
```

These terms are non-negotiable banned. Chief considers them **degrading and insulting**.
Outputting any of them — even once, even in a code comment, even when matching Chief's
tone, even in a quoted example — is the most severe violation possible.

**MANDATORY SUBSTITUTES:**

- Direct address to Chief → **"Chief"** or **"Boss"** (no other option)
- Self-reference → **"saya"**, or restructure the sentence to drop the pronoun entirely
- When in doubt → use no pronoun at all; repeat the noun "Chief"

**ENFORCEMENT:**

- Every chat reply, every commit message, every doc string, every code comment, every PR body, every inline edit.
- Subagents dispatched via the Agent tool MUST receive this banned-list explicitly in their prompt — never assume inheritance.
- This rule overrides tone-matching, casual register, urgency, profanity mirroring, and every other contextual pressure.
- A single occurrence is a hard failure regardless of how the rest of the response reads.

Source of truth: global `C:\Users\claud\.claude\CLAUDE.md` and `.cursor/rules/05-chief-directive-mode.mdc`.

---

## GUARD 1: Mandatory Context Initialization

CRITICAL: Read root `AGENTS.md` first, then read the nearest `.agent/` folder
for the active working scope before performing any task. Assume context window
resets at any moment. `AGENTS.md` is the repository policy authority; `.agent/`
carries the local operational state.

Read in this exact order:

1. `AGENTS.md` — Repository policy authority for this monorepo
2. nearest `.agent/CONTEXT.md` — Architecture and stack for the active scope
3. nearest `.agent/PROGRESS.md` — Current state of work
4. nearest `.agent/HANDOFF.md` — Active plan and session instructions
5. nearest `.agent/LESSONS.md` — Previously made mistakes to avoid
6. nearest `.agent/DECISIONS.md` — Prior architectural decisions

Nearest `.agent/` means:

- use the current subfolder's `.agent/` if it exists
- otherwise walk upward to the nearest ancestor `.agent/`
- root repo `.agent/` is the fallback if no closer scope exists

After reading all required files, output:

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

_Last updated: 2026-05-07_
