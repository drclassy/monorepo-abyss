# Smart push reliability gate v1 implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an automatic smart-blocking push system for ABYSS that keeps local feedback fast, enforces strict PR and merge quality on protected branches, adds the minimum professional GitHub docs pack, and clarifies `.gitignore`, crown-jewel, and AI-artifact policy.

**Architecture:** The rollout keeps the existing `pre-commit` gate, adds a path-aware `pre-push` decision layer, and aligns protected-branch enforcement with GitHub workflows and documented repository settings. Reusable logic lives under `tooling/governance/agent/scripts/`, local hooks stay in `.husky/`, canonical contributor instructions live in tracked docs, and GitHub-only enforcement steps are documented where they cannot be expressed purely in repo files.

**Tech Stack:** Git hooks, shell launcher in `.husky/`, Node.js script(s) under repo tooling, pnpm scripts, GitHub Actions workflows, Markdown docs, `.gitignore`, GitHub issue forms, GitHub templates, ruleset and branch-protection documentation.

---

## Baseline documents (must read before implementing)

1. [`AGENTS.md`](../../../AGENTS.md)
2. [`.agent/README.md`](../../../.agent/README.md)
3. [`.agent/HANDOFF.md`](../../../.agent/HANDOFF.md)
4. [`docs/specs/008-smart-push-reliability-gate-v1.md`](../../specs/008-smart-push-reliability-gate-v1.md)
5. [`README.md`](../../../README.md)
6. [`.gitignore`](../../../.gitignore)
7. [`.husky/pre-commit`](../../../.husky/pre-commit)
8. [`.github/workflows/ci.yml`](../../../.github/workflows/ci.yml)
9. [`.github/workflows/reusable-verify.yml`](../../../.github/workflows/reusable-verify.yml)
10. [`.github/PULL_REQUEST_TEMPLATE.md`](../../../.github/PULL_REQUEST_TEMPLATE.md)
11. [`.github/CODEOWNERS`](../../../.github/CODEOWNERS)
12. [`package.json`](../../../package.json)

---

## Scope check

### In scope

- Add automatic local `pre-push` smart verification.
- Keep the current `pre-commit` gate intact unless a targeted improvement is
  required.
- Add the minimum standard GitHub documentation pack.
- Add or refine reusable repo scripts for push gating.
- Align workflow support with protected-branch PR and merge enforcement.
- Document the manual GitHub ruleset or branch-protection settings required to
  complete the system.
- Re-check `.gitignore` with explicit AI-artifact and crown-jewel policy.

### Explicitly out of scope

- Rewriting the whole CI system from scratch.
- Broad refactors outside push reliability and contributor standards.
- Automated edits across `packages/sentra/**` beyond policy and visibility.
- Secret-management, database, auth, Docker, Terraform, or deployment changes.

---

## Critical rollout gate

Before workflow branch filters are finalized, confirm the actual protected and
default branch authority for this repository. The current planning baseline is
inconsistent:

- active local branch observed: `master`
- checked-in workflow branches observed: `main`, `develop`
- locally known remote default branch metadata observed: `origin/abyss-core`

Implementation may safely build the hook, docs, policy file, and workflow
support structure first, but must not claim branch-enforcement completion until
this branch authority is normalized.

---

## File structure plan

### Create

- `CONTRIBUTING.md`
- `SECURITY.md`
- `.github/ISSUE_TEMPLATE/bug-report.yml`
- `.github/ISSUE_TEMPLATE/feature-request.yml`
- `.github/ISSUE_TEMPLATE/config.yml`
- `docs/guides/007-smart-push-and-merge.md`
- `tooling/governance/agent/scripts/pre-push-gate.mjs`
- `tooling/governance/agent/scripts/push-gate-lib.mjs`
- `tooling/governance/agent/push-gate.policy.json`
- `.husky/pre-push`

### Modify

- `package.json`
- `.github/workflows/ci.yml`
- `.github/workflows/reusable-verify.yml`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `.gitignore`
- `README.md`
- `.github/CODEOWNERS` only if the new docs or policy files need explicit owner routing

### Notes

- Keep reusable decision logic in `push-gate-lib.mjs` so the hook entry file
  stays small and readable.
- Keep the policy file data-only so branch names, docs-only patterns,
  governance patterns, crown-jewel patterns, and ignored AI artifact patterns
  are auditable without reading script internals.
- Keep GitHub UI-only steps documented in `docs/guides/007-smart-push-and-merge.md`.

---

## Best-practice implementation rules

- Fail fast on critical blockers.
- Prefer targeted package verification before root-wide verification.
- Show exact changed scope in local gate output.
- Keep hook entrypoints tiny; put real logic in reusable scripts.
- Do not duplicate branch and path patterns across many files without a clear
  reason.
- Add `merge_group` workflow support if protected branches will use merge queue.
- Treat manual GitHub ruleset configuration as part of the system, not an
  afterthought.

---

## Task 1: Normalize the policy surface

**Files:**
- Create: `tooling/governance/agent/push-gate.policy.json`
- Modify: `README.md`

- [ ] Define a JSON policy surface with these sections:
  - protected branch list
  - docs-only path patterns
  - governance path patterns
  - crown-jewel review-first path patterns
  - ignored AI-artifact path patterns
  - required local commands by scope
- [ ] Add a temporary branch-authority note in the policy or docs that marks
  branch finalization as pending until the actual protected branch set is
  confirmed.
- [ ] Add a short pointer in `README.md` to the new smart push guide so the
  behavior is discoverable.
- [ ] Keep the policy data-only and human-readable.

**Verification:**
- Run: `Get-Content tooling/governance/agent/push-gate.policy.json`
- Expected: JSON is readable, scoped, and does not hardcode unrelated repo behavior.

---

## Task 2: Build the reusable pre-push decision engine

**Files:**
- Create: `tooling/governance/agent/scripts/push-gate-lib.mjs`
- Create: `tooling/governance/agent/scripts/pre-push-gate.mjs`
- Modify: `package.json`

- [ ] Implement helper logic to:
  - determine current branch
  - read pushed refs from the `pre-push` hook input
  - determine changed files for the push range
  - classify the scope as docs-only, governance, ordinary code, or crown-jewel-involved
  - find nearest workspace roots or package names for changed files
- [ ] Implement output helpers that print concise `PASS`, `WARN`, and `BLOCK`
  sections.
- [ ] Implement command runners that execute only the relevant checks for the
  classified scope.
- [ ] Add package scripts for reusable invocation, such as:
  - `verify:push`
  - `verify:push:full`
  - `verify:governance`
- [ ] Keep the script deterministic and safe when no upstream branch exists.

**Verification:**
- Run: `node tooling/governance/agent/scripts/pre-push-gate.mjs --help`
- Expected: script prints supported modes or usage summary without crashing.
- Run: `node tooling/governance/agent/scripts/pre-push-gate.mjs --dry-run`
- Expected: script prints detected scope and planned commands without executing them.

---

## Task 3: Wire the automatic local hook

**Files:**
- Create: `.husky/pre-push`

- [ ] Add a tiny shell entrypoint that calls the Node-based pre-push gate.
- [ ] Preserve the same calm style already used by `.husky/pre-commit`.
- [ ] Ensure the hook exits non-zero on `BLOCK`.
- [ ] Ensure hook behavior is automatic on every `git push`.

**Verification:**
- Run: `Get-Content .husky/pre-push`
- Expected: hook is small, readable, and delegates to the reusable script.
- Run: `git push --dry-run`
- Expected: hook starts and shows gate output without attempting a real network push.

---

## Task 4: Add the minimum professional GitHub docs pack

**Files:**
- Create: `CONTRIBUTING.md`
- Create: `SECURITY.md`
- Create: `docs/guides/007-smart-push-and-merge.md`
- Create: `.github/ISSUE_TEMPLATE/bug-report.yml`
- Create: `.github/ISSUE_TEMPLATE/feature-request.yml`
- Create: `.github/ISSUE_TEMPLATE/config.yml`
- Modify: `.github/PULL_REQUEST_TEMPLATE.md`

- [ ] Write `CONTRIBUTING.md` with:
  - branch flow
  - local hook expectations
  - pre-push behavior summary
  - PR checklist summary
  - crown-jewel handling note
- [ ] Write `SECURITY.md` with:
  - reporting path
  - what not to post publicly
  - expected response framing
- [ ] Write `docs/guides/007-smart-push-and-merge.md` as the operator guide for:
  - what happens on commit
  - what happens on push
  - what happens on PR/merge
  - how docs-only and code changes differ
  - what is still configured manually in GitHub
- [ ] Add GitHub issue forms for bug report and feature request.
- [ ] Tighten the PR template so it explicitly asks for:
  - objective
  - changed scope
  - local verification
  - manual verification when relevant
  - screenshots if UI changed

**Verification:**
- Run: `git diff --stat`
- Expected: docs and template changes are scoped to the new standard pack.
- Run: `pnpm format:check`
- Expected: Markdown and YAML templates pass formatting checks.

---

## Task 5: Align GitHub workflow support with protected-branch enforcement

**Files:**
- Modify: `.github/workflows/ci.yml`
- Modify: `.github/workflows/reusable-verify.yml`
- Optional modify: `.github/CODEOWNERS`

- [ ] Add `merge_group` support if protected branches will use merge queue.
- [ ] Ensure CI continues to support PR validation and protected-branch push validation.
- [ ] Ensure the documented required checks map cleanly to real workflow job names.
- [ ] If needed, align outdated branch filters after branch authority is confirmed.
- [ ] Keep job naming stable enough for GitHub required-status-check settings.

**Verification:**
- Run: `Get-Content .github/workflows/ci.yml`
- Expected: workflow supports the intended GitHub events and clear job naming.
- Run: `Get-Content .github/workflows/reusable-verify.yml`
- Expected: reusable verify remains the source of truth for required gate jobs.

---

## Task 6: Re-check `.gitignore` and AI artifact policy

**Files:**
- Modify: `.gitignore`
- Modify: `tooling/governance/agent/push-gate.policy.json`
- Modify: `docs/guides/007-smart-push-and-merge.md`

- [ ] Review current AI, editor, session, report, and generated-artifact rules.
- [ ] Keep authoritative governance and AI instruction files tracked.
- [ ] Keep noisy generated AI artifacts ignored and automation-excluded.
- [ ] Keep crown-jewel areas tracked and visible, not ignored.
- [ ] Remove or refine any ignore rule that would conflict with the approved
  policy or the new tracked documentation pack.

**Verification:**
- Run: `git status --short`
- Expected: newly created tracked docs are visible; generated local-only artifacts remain ignored.
- Run: `git check-ignore -v <sample-path>`
- Expected: sample generated AI artifact paths and local-only paths resolve to the intended ignore rules.

---

## Task 7: End-to-end local and repository verification

**Files:**
- Verify only

- [ ] Test a docs-only change path with the pre-push gate in dry-run or real hook mode.
- [ ] Test a governance-file change path with the pre-push gate.
- [ ] Test a code-path change classification with the pre-push gate.
- [ ] Run local repo checks required by the changed scope.
- [ ] Recheck diff scope and confirm no unrelated files were touched.
- [ ] Document any remaining GitHub-UI-only steps that cannot be verified from the repo alone.

**Verification commands:**
- `pnpm governance:agents-check`
- `pnpm format:check`
- `pnpm typecheck -- --pretty false`
- `pnpm build`
- `pnpm test`
- `git diff --stat`
- `git diff --name-status`

**Expected result:** local gate behavior is proven, repo docs are present, workflow support is updated, and any GitHub settings still needing manual confirmation are explicitly listed.

---

## Risk register

1. **Branch authority mismatch**
   Current branch naming is inconsistent across local state, remote metadata, and
   checked-in workflows. Mitigation: do not finalize enforcement claims until a
   single protected branch truth is chosen.

2. **Hook performance drift**
   A heavy pre-push hook will be bypassed or resented. Mitigation: keep
   classification path-aware and affected-scope-first.

3. **Workflow and ruleset mismatch**
   GitHub required checks can fail if workflow names or events do not line up.
   Mitigation: keep job names stable and document the required GitHub settings.

4. **Over-ignoring AI surfaces**
   Blanket AI ignores can hide important governance files. Mitigation: separate
   authoritative AI files from noisy generated artifacts.

5. **Crown-jewel accidental normalization**
   Treating `packages/sentra/**` like ordinary low-risk surfaces weakens review
   discipline. Mitigation: keep them tracked, visible, and review-first in docs
   and policy.

---

## Exit criteria

This plan is complete only when:

- automatic `pre-push` exists and runs locally
- scope classification is path-aware
- contributor docs and GitHub templates are in place
- workflow support matches the intended protected-branch gate model
- `.gitignore` and AI artifact policy match the approved design
- remaining manual GitHub settings are documented clearly
- local verification evidence exists for the implemented changes

---

## Execution note

Implementation should proceed in this order:

1. policy file
2. reusable script and hook
3. docs pack
4. workflow support
5. `.gitignore` cleanup
6. end-to-end verification

Do not claim full branch-enforcement completion until the protected-branch
authority mismatch is resolved.
