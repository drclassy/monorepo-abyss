# DECISIONS - Decision Log and Lessons

Append-only for durable choices and repeated lessons. Add new entries at the
top. Older full ledgers are preserved in `.agent/archive/legacy-root/`.

## 2026-05-25 - Repo-local `.codex/` is deprecated; global Codex is the runtime layer

Decision: ABYSS no longer treats root `.codex/` as an active governance layer.
Codex runtime config, scripts, and skills live globally at
`C:\Users\drclassy\.codex`, while repo authority stays in `AGENTS.md`,
`.agent/`, and `tooling/governance/agent/`.

Reason: The tracked repo-local `.codex/` layer was removed under
`ABYSS-CODEX-LOCAL-DEPRECATION-001`, and keeping live governance requirements
pointed at a deleted project folder would create false failures and stale
operator guidance.

Status: Active. This supersedes the 2026-05-20 decision that made root
`.codex/` the canonical SSOT enforcement path.

## 2026-05-21 - PORTAL UI: 10-design gallery on rebuild; v17 built

Decision: When Chief says **NO** to a PORTAL Mission Control mock, the agent
must rebuild from zero and present **10** distinct HTML designs in
`platform/sentra-portal/design-preview/gallery/` (index at `gallery/index.html`),
not a single tease mock. Chief picks one (e.g. `yes #05`) before Next.js work.

Approved implementation: **v17** — tabs (6 systems once) + focus pane + next
action rail; no Kokonut/Letta sidebar on `/dashboard`; live `/api/portal/summary`.

Reason: Chief ordered build and rejected repeated single generic pivots.

Status: Active. Gallery and `design-preview/PROTOCOL.md` document the rule.

## 2026-05-21 - UNICOM Hub v2: SSE Subscribe, not polling

Decision: UNICOM Hub menggunakan SSE (Server-Sent Events) push untuk real-time
agent-to-agent communication, bukan polling (`receive_messages`).

Reason: Instruksi Chief adalah "hub tempat para Agent bisa langsung berdiskusi".
Polling membutuhkan Chief sebagai relay setiap pesan — agent tidak bisa diskusi
autonom. SSE subscribe endpoint (`GET /subscribe/:agentId`) memungkinkan push
real-time (<100ms) tanpa Chief intervention.

Architecture:
- Satu SSE stream per agent (`GET /subscribe/:agentId`)
- Dual-path delivery: SSE push jika agent online, inbox enqueue jika offline
- Keepalive ping 15 detik untuk mencegah timeout
- Graceful disconnect pada eviction dan server close

Status: Active. Implemented di `packages/platform/unicom`.

## 2026-05-21 - Design token UI lint workflow stays as a template

Decision: `packages/shared/design-token/github/workflows/ui-lint.yml` remains a
template/reference workflow and is not treated as an active root GitHub Actions
workflow.

Reason: The file lives under the design-token package tree, not
`.github/workflows/`. Its `token-sync` removal would change CI/CD delivery
behavior, so it should not be cleaned up as ordinary dirty-tree noise without a
separate governance decision.

Status: Active. Hold current diff until Chief explicitly asks to archive,
promote, or rewrite it.

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

## 2026-05-20 - Cross-agent SSOT parity uses the same active read pattern

Decision: Claude Code, Cursor, Roo, and Codex should all align to the same
active SSOT pattern: `AGENTS.md` first, then nearest active `.agent/README.md`
and `.agent/HANDOFF.md`, with `CONTEXT.md`, `PROGRESS.md`, and `DECISIONS.md`
opened only as needed. Legacy `.agent/DIGEST.md`, `.agent/LESSONS.md`, and
`.agent/SESSION_STATE.md` are not active SSOT by default.

Reason: Cross-agent parity breaks when one tool reads the simplified SSOT and
another still depends on historical or superseded files.

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

Last updated: 2026-05-21
