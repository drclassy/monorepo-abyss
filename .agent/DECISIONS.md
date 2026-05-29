# DECISIONS - Decision Log and Lessons

Append-only for durable choices and repeated lessons. Add new entries at the
top. Older full ledgers are preserved in `.agent/archive/legacy-root/`.

## 2026-05-30 - ABYSS Cursor permissions SSOT is repo Allowlist, not UI Auto-review

Decision: For ABYSS, agent shell/MCP approval policy is owned by tracked
`.cursor/permissions.json` (`approvalMode: allowlist` + `autoRun.block_instructions`).
User `~/.cursor/permissions.json` must stay minimal (machine-local blocks only)
so the monorepo file is the visible enforced policy in Cursor Settings.

Reason: Chief confirmed Settings UI is read-only under permissions enforcement.
That behavior is correct for healthcare/version-controlled policy. Duplicating
allowlists in the user file hid repo SSOT and bloated the UI allowlist.

Status: Active. Operator guide: `docs/guides/008-cursor-permissions-and-workflows.md`.
Template: `.cursor/permissions.user.example.json`.

## 2026-05-30 - Intelligenceboard CT wiring closure is complete but bounded

Decision: The Intelligenceboard CT adapter runtime wiring chain is considered
complete only for its approved scope: tracked adapter boundary, tracked
trajectory route baseline, additive `clinicalTrajectory` response wiring,
injectable route seam, and route contract test coverage.

Reason: The implementation chain now has a verified closure record plus clean
root verification. However, this does not authorize broad follow-up changes or
promote Intelligenceboard into clinical authority.

Status: Active. This closure does not declare Simphony complete, does not
declare a canonical 52-trajectory CT engine complete, and does not authorize
UI, Sentra Assist, shared-types, DB, or external-integration drift in the same
mission.

## 2026-05-30 - CT route boundary and hook lessons are now durable guardrails

Decision: Future agents must treat the Intelligenceboard trajectory route
tracking boundary and hook-normalized baseline lessons as durable guardrails.

Required rules:
- `git status clean` is insufficient when route files may still be ignored.
- Runtime route files must be tracked before runtime wiring.
- Root `.gitignore` must use scoped fail-closed unignore rules.
- App-local `.gitignore` may override root expectations.
- `lint-staged` may mutate staged TypeScript and Markdown files.
- Hook-normalized baselines require explicit approval when content changes.
- Never use `git add -f`, `git add .`, or `git add -A` as a shortcut for
  clinical/runtime file missions.

Reason: The CT mission chain repeatedly hit false-clean, ignored-route, and
hook-mutation traps before the approved path was stabilized and closed out.

Status: Active. Use the closure handoff doc as context and start any next CT
phase with a separate single-mission prompt.

## 2026-05-27 - Legacy platform UNICOM package is delete-confirmed

Decision: `packages/platform/unicom/**` is obsolete legacy and remains deleted.
Active runtime, workspace, hook, and portal surfaces must point only to the
ABYSS-native Sentra UNICOM foundation at `docs/unicom/**`, `packages/unicom/*`,
and `apps/internal/unicom`.

Reason: The new foundation shipped in commit `74ddc226`, and the follow-up
cleanup proved no active workspace, hook, or portal dependency required the old
package. The pre-commit hook now resolves `lint-staged` from the root config,
so cleanup no longer tries to read deleted legacy package metadata.

Status: Active. Historical specs, plans, and notes may retain legacy references
as archived context, but the package itself must not be restored without a new
explicit architecture decision.

## 2026-05-27 - Sentra UNICOM is now a monorepo-native subsystem

Decision: UNICOM is no longer treated as the legacy Hub package under
`packages/platform/unicom`. The official ABYSS-native structure is now:
`docs/unicom/**`, `packages/unicom/*`, and `apps/internal/unicom`.

Reason: Chief explicitly approved UNICOM as an internal ABYSS subsystem with a
Chief cockpit, typed protocol, policy gating, agent SDK, local realtime server,
client SDK, and append-only persistence scaffolding. Keeping the deleted legacy
Hub as the architecture anchor would preserve the wrong ownership and boundary
shape.

Status: Active. Legacy references to `packages/platform/unicom/**` are
superseded references and must not be restored as the primary foundation.

## 2026-05-26 - Repo architecture, not Git tracking, decides validity

Decision: Git tracking is not proof that a file, folder, package, app,
workflow, or infrastructure artifact is valid in ABYSS. Git records the final
accepted state after the repository architecture has been corrected.

Rule: An item is valid only when purpose, owner, allowed location, workspace or
workflow status, active reference, boundary safety, and relevant verification
can be explained. If any point cannot be proven, classify the item as
`ORPHAN_CANDIDATE` or the nearest explicit risk class such as
`STALE_ARTIFACT`, `ARCHITECTURE_REVIEW_REQUIRED`, or `BOUNDARY_RISK`.

Required resolution: every candidate must receive one final decision:
`KEEP_AND_COMMIT`, `FIX_AND_COMMIT`, `MOVE_OUT_OF_REPO`, or
`DELETE_OR_RESTORE`. Do not treat "tracked by Git" as a reason to keep
anything in the active repo.

Reason: ABYSS/Sentra requires clean architecture, crown-jewel isolation,
clinical-grade governance, infrastructure separation, and evidence-backed
verification. Old committed mistakes, prototypes, generated artifacts, stale
docs, misplaced packages, or harmful boundary violations remain invalid even if
Git tracks them.

Status: Active. This is a permanent ABYSS operating principle for cleanup,
audit, and architecture review.

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

Status: Active. Do not archive, promote, or rewrite this workflow template
without an explicit Chief decision for that file.

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

Status: Historical migration decision. Do not restore the references unless the
migration scope is explicitly rejected.

## 2026-05-20 - Root `.codex/` layer is the canonical SSOT enforcement path

Decision: Repo-level SSOT enforcement must live in the trusted project
`.codex/` layer and point to `tooling/governance/agent/` hooks. At minimum,
the project layer must explicitly enable `hooks`, reload SSOT on
`startup|resume|clear`, and log `apply_patch` edits for continuity gates.

Reason: `AGENTS.md` and `.agent/` define the rulebook and state, but durable
cross-agent enforcement only becomes consistent when the project-local Codex
layer validates and reloads the same lifecycle path every session.

Status: Superseded by the 2026-05-25 repo-local `.codex/` deprecation decision.

## 2026-05-20 - Cross-agent SSOT parity uses the same active read pattern

Decision: Claude Code, Cursor, Roo, and Codex should all align to the same
active SSOT pattern: `AGENTS.md` first, then nearest active `.agent/README.md`
and `.agent/HANDOFF.md`, with `CONTEXT.md`, `PROGRESS.md`, and `DECISIONS.md`
opened only as needed. Legacy `.agent/DIGEST.md`, `.agent/LESSONS.md`, and
`.agent/SESSION_STATE.md` are not active SSOT by default.

Reason: Cross-agent parity breaks when one tool reads the simplified SSOT and
another still depends on historical or superseded files.

Status: Active.

## 2026-05-30 - Cursor IDE hardening baseline (Mei 2026)

Decision: ABYSS shared Cursor config follows a four-rule team baseline
(`index.mdc`, `00/10/20/30`) plus repo skills, subagents, and a wired hook chain.
`hooks.json` runs `after-edit.mjs` → `post-tool-use.ps1` on `afterFileEdit`, and
`autofix-loop.mjs` on `stop` (max 5 loops, skips without recent edits).
`mcp.json.example` holds documented stubs only; secrets stay in gitignored
`.mcp.json` or Marketplace plugins. Cursor Automations are documented in
`docs/guides/007-cursor-automations.md` and configured in the Agents Window —
not committed as runtime secrets.

Reason: Align repo with Cursor 3.x best practice (skills, subagents, automations,
hooks) while keeping `AGENTS.md` as authority and avoiding team drift from
local-only tooling.

Status: Active.

## 2026-05-30 - kluster rules stay local-only

Decision: `.cursor/rules/kluster-code-verify.mdc` remains gitignored. It is an
optional per-workstation kluster plugin overlay, not part of the shared
four-rule Cursor baseline documented in `.cursor/README.md`.

Reason: Teammates without kluster should not inherit mandatory review rules that
are not in the tracked repo config.

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

Last updated: 2026-05-30
