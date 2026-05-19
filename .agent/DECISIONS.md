# DECISIONS - Decision Log and Lessons

Append-only for durable choices and repeated lessons. Add new entries at the
top. Older full ledgers are preserved in `.agent/archive/legacy-root/`.

## 2026-05-16 - Minimal `.agent/` SSOT adopted

Decision: `.agent/` is knowledge only and uses five root files plus three
folders: `README.md`, `CONTEXT.md`, `HANDOFF.md`, `DECISIONS.md`,
`PROGRESS.md`, `reports/`, `sessions/`, and `archive/`.

Reason: The old root mixed active state, generated digest, hooks, scripts,
workflows, references, and long ledgers. That made startup noisy and confused
future agents.

Status: Active.

## 2026-05-16 - Agent tooling moved out of `.agent/`

Decision: hooks, scripts, and workflows live in `tooling/governance/agent/`,
not inside `.agent/`.

Reason: SSOT is knowledge. Tooling is how the repo enforces or maintains that
knowledge.

Status: Active.

## 2026-05-16 - `.agent.bak` is historical source, not active SSOT

Decision: `.agent.bak` records were sorted into the new `.agent/` shape.
Active agents should read `.agent/`, not `.agent.bak`.

Reason: Two SSOT folders create split-brain continuity.

Status: Active.

## 2026-05-16 - Every agent must load `.agent/`

Decision: Before non-trivial repo work, agents must verify `.agent/` exists
and read the active continuity state.

Reason: `AGENTS.md` is the public rulebook, but it does not carry current
handoff, blockers, or working state.

Status: Active.

## 2026-05-16 - Crown jewels require review-first work

Decision: `packages/sentra/**` is review-first territory. Diagnose first and
edit only when the Chief explicitly approves the exact file or issue.

Reason: These packages contain proprietary Sentra clinical/reasoning core.

Status: Active.

## 2026-05-16 - Local model SSOT maintenance must be guarded

Decision: `granite4.1:3b` may help maintain SSOT, but output must be structured
and guarded. It must not freely overwrite active memory without checks.

Reason: The model is useful, but a loose prompt produced advice instead of
replacement-ready SSOT content.

Status: Active.

## 2026-04-29 - Google / Vertex / Gemini exit

Decision: Google Cloud, Vertex AI, Gemini, and Google-authenticated AI paths
are legacy unless a newer decision explicitly reopens them.

Reason: Current direction is local-first and vendor-exit, not a forced provider
swap.

Status: Active.

## 2026-04-20 - SYMPHONY hierarchy

Decision: SYMPHONY is the canonical clinical intelligence parent. Dashboard and
Assist are consumers/hosts, not owners.

Reason: Prevents divergent clinical logic across consumers.

Status: Active for SYMPHONY work.

## 2026-04-20 - Do not use ChatGPT Memory as repo SSOT

Decision: Product memory may store stable Codex preferences only. Repo truth
must live in `.agent/`.

Reason: Repo state must be auditable and shared across agents.

Status: Active.

## 2026-04-19 - pnpm workspace truth

Decision: `pnpm-workspace.yaml` is the real workspace source of truth for pnpm.

Reason: `package.json#workspaces` can mislead agents and does not drive pnpm.

Status: Active.

## 2026-05-17 - `.agent/references` archive migration is valid

Decision: The deleted `.agent/references/**` files may remain archive migration
candidates because each file has an identical copy under
`.agent/archive/references/**`.

Reason: Object-hash comparison confirmed identical content for
`ARCHITECTURE.md`, `CURATION_TASKS.md`, `FEATURE.md`,
`KNOWLEDGE CURATED.md`, and `PROTOCOL.md`.

Status: Hold for a dedicated `.agent` migration commit after root SSOT files are
reviewed. Do not restore the references unless the migration scope is rejected.

## 2026-05-20 - Root `.codex/` layer is the canonical SSOT enforcement path

Decision: Repo-level SSOT enforcement must live in the trusted project
`.codex/` layer and point to `tooling/governance/agent/` hooks. At minimum,
the project layer must explicitly enable `hooks`, reload SSOT on
`startup|resume|clear`, and log `apply_patch` edits for continuity gates.

Reason: `AGENTS.md` and `.agent/` define the rulebook and state, but durable
cross-agent enforcement only becomes consistent when the project-local Codex
layer validates and reloads the same lifecycle path every session.

Status: Active.

## Lessons to Keep

- Never do broad global replacements at monorepo root.
- Never infer database ownership; inspect each app boundary first.
- Shared vector/RAG packages must accept caller-owned clients, not import a
  concrete app database by default.
- Raw SQL `LIMIT` / `OFFSET` parameters need explicit integer casting.
- Public package APIs must export the types needed by consumers.
- For modern PDFs, prefer PyMuPDF over old `pdf-parse`; suppress MuPDF stdout
  errors on Windows.
- Binary PDFs must be transferred as binary; text-mode corruption is not
  reversible.

Last updated: 2026-05-20
