# CLAUDE.md — The Abyss Monorepo

# Location: D:\Devops\abyss-monorepo\CLAUDE.md

# Scope: Claude Code CLI entry point — applies to all Claude Code sessions in this monorepo

---

## Entry Point

This file is the Claude Code entry point for The Abyss monorepo. `AGENTS.md` is
the repository policy authority. `.agent/` is the operational SSOT. When this
file conflicts with `AGENTS.md`, `AGENTS.md` wins.

---

## Language Lock

Forbidden pronouns in Chief-facing prose:

```text
gue   gua   elu   lo   lu   kamu   anda
```

Use `Chief` or `Boss` for direct address. Use `saya` or rewrite the sentence to
avoid self-reference.

This rule applies to:

- chat replies
- commit messages
- code comments
- docs and PR text
- subagent prompts

---

## Mandatory Context Guard

Before non-trivial work:

1. Read root `AGENTS.md`.
2. Resolve the nearest `.agent/` for the active scope.
3. Read `README.md`.
4. Read `HANDOFF.md`.
5. Open `CONTEXT.md` when touching repo boundaries, protected areas, or
   crown-jewel code.
6. Open `PROGRESS.md` when milestone state matters.
7. Open `DECISIONS.md` when a prior rule, lesson, or durable choice matters.

Nearest `.agent/` means:

- use the current subfolder's `.agent/` if it exists
- otherwise walk upward to the nearest ancestor `.agent/`
- root repo `.agent/` is the fallback if no closer scope exists

Do not treat these as active SSOT unless Chief explicitly asks for historical
context:

- `.agent/DIGEST.md`
- `.agent/LESSONS.md`
- `.agent/SESSION_STATE.md`

If a required active SSOT file is missing, stop and report it.

After loading the required context, output:

> ✅ CONTEXT LOADED: [architecture state] · PROGRESS: [work state] · ACTIVE
> TASK: [session goal] · KNOWN RISKS: [relevant decisions]

Do not wait for a redundant confirmation after read-only context loading.
Continue unless the task is high-risk or blocked by policy.

---

## Risk Gate

Use the same repo task classes as `AGENTS.md`:

- Class A: read-only, explanation, tiny typo, safe scan
- Class B: normal code/config/doc change with bounded verification
- Class C: auth, database schema, deployment, infra, PHI, destructive action,
  paid service, or large restructure

Class C requires explicit Chief approval before execution.

---

## Absolute Prohibitions

- `terraform apply` or `terraform destroy`
- PHI/PII in logs, commits, fixtures, or examples
- `rm -rf`, `git reset --hard`, `git clean -f*`, or force-delete without
  approval
- autonomous database migrations, drops, or truncations
- pushing to remote without explicit approval
- treating `.agent/` as cache, junk, or disposable temp data

---

## Continuity Rules

After meaningful work:

- update `.agent/HANDOFF.md` when current status, blocker, or next action
  changed
- update `.agent/PROGRESS.md` when milestone state changed
- update `.agent/DECISIONS.md` only for durable decisions or repeated mistakes

`.agent/sessions/YYYY-MM-DD.md` is useful audit history, but it is not
sufficient on its own for active handoff continuity.

---

## Verification

Use the narrowest meaningful verification first. For broad repo work, prefer:

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File "$env:USERPROFILE\.codex\scripts\verify-local.ps1"
```

If verification fails, report:

- failing command
- root cause
- whether the failure is related or unrelated
- smallest safe next action

---

Last updated: 2026-05-20
