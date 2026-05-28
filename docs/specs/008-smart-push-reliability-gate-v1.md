# 008 — Smart push reliability gate v1

> **Status:** Approved for planning
> **Version:** v1.0
> **Date:** 2026-05-27
> **Author:** Bang

---

## Context

ABYSS needs a push path that feels calm, automatic, and reliable. The current
repo already has a solid `pre-commit` gate for secrets, PHI, and staged-file
hygiene, but it does not yet provide a complete end-to-end push reliability
system across local push, GitHub pull requests, protected-branch merges, and
documentation standards.

The desired operator experience is simple:

1. Make changes.
2. Commit as usual.
3. Push as usual.
4. Let the system stop problems early, clearly, and automatically.

This specification defines a professional three-layer gate for ABYSS:

- `pre-commit` for very fast staged-file checks
- `pre-push` for branch-aware, path-aware smart verification
- `PR/merge` for full protected-branch enforcement through GitHub

---

## Objectives

### Primary objectives

- Catch obvious problems before code leaves the workstation.
- Keep local feedback fast enough that contributors do not fight the hook.
- Make protected-branch merges reliable and predictable.
- Align local checks with GitHub-required checks as closely as practical.
- Keep healthcare-sensitive and crown-jewel surfaces visible but review-first.

### Secondary objectives

- Add the minimum documentation expected in a professional GitHub repository.
- Clarify which AI-related files are tracked, ignored, or automation-excluded.
- Make the gate output concise, readable, and operator-friendly.

---

## Non-goals

- Do not create a new top-level governance system.
- Do not run a full monorepo build and test suite on every local push by
  default.
- Do not hide crown-jewel code from Git.
- Do not ignore all AI-related files indiscriminately.
- Do not treat local generated artifacts as canonical documentation.
- Do not replace GitHub rulesets or branch protection with custom local logic.

---

## 1. System overview

### 1.1 Layer 1 — `pre-commit`

`pre-commit` remains the ultra-fast gate. It should stay limited to staged-file
checks only:

- secret scanning
- PHI scanning
- formatting
- lint-staged fixes
- basic staged-file hygiene

This layer must finish quickly and should never expand into heavy repo-wide
verification.

### 1.2 Layer 2 — `pre-push`

`pre-push` is the smart local verification layer. It runs automatically on every
`git push` and should classify the pushed changes before deciding what to run.

Expected behavior:

- docs-only changes → light docs gate
- workflow/governance changes → governance gate
- ordinary code changes → affected verification only
- crown-jewel review-first changes → warn clearly and escalate verification
  requirements without silently bypassing risk

This layer must fail early and explain why with short `PASS`, `WARN`, and
`BLOCK` output sections.

### 1.3 Layer 3 — `PR/merge`

Protected branches must use GitHub as the final hard gate:

- no direct push
- required status checks
- required review
- CODEOWNERS review where applicable
- up-to-date branch requirement before merge
- merge-queue support when enabled

GitHub remains the final authority for whether code is allowed to land.

---

## 2. Branch policy

### 2.1 Working branches

Working branches may allow direct push, but every push still runs local
`pre-push`.

### 2.2 Protected branches

Protected branches must not accept direct pushes. They must require pull
requests and GitHub enforcement.

### 2.3 Branch authority normalization

Before full rollout, ABYSS must normalize its branch authority. The current repo
state observed during planning is inconsistent:

- local branch in use: `master`
- CI workflow triggers currently checked in repo: `main`, `develop`
- locally known remote default branch metadata: `origin/abyss-core`

The rollout must not hardcode a false branch model. A single protected-branch
truth must be chosen first and then reflected in:

- GitHub rulesets or branch protection
- workflow triggers
- local push-gate policy
- contributor documentation

---

## 3. Smart verification behavior

### 3.1 Docs-only gate

When pushed changes are documentation-only, the local gate should stay light.
Typical checks:

- confirm file scope is docs-only
- confirm no forbidden secrets or PHI entered docs
- confirm documentation diffs are visible and reviewable

### 3.2 Governance gate

When pushed changes affect governance or release-control surfaces, the gate
should add governance checks. These surfaces include:

- `AGENTS.md`
- `.agent/**` when curated for commit
- `.github/**`
- `.husky/**`
- `tooling/governance/**`
- root policy documents such as `CONTRIBUTING.md` and `SECURITY.md`

### 3.3 Code gate

When pushed changes affect code, the gate should verify the changed scope rather
than the entire monorepo by default. The implementation should determine the
nearest workspace or package roots from changed files and run targeted checks for
those areas first.

### 3.4 Crown-jewel policy

`packages/sentra/**` remains review-first territory. These paths must stay
tracked in Git, but automation should not casually rewrite or treat them as
ordinary low-risk surfaces.

The push gate should make crown-jewel changes highly visible in output and
should require stronger verification than routine workspace edits.

---

## 4. Required documentation pack

ABYSS should maintain a minimum GitHub-standard documentation set:

- `README.md`
- `CONTRIBUTING.md`
- `SECURITY.md`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `.github/ISSUE_TEMPLATE/`
- `.github/CODEOWNERS`
- a short repo-specific push and PR guide

This pack should stay minimal, practical, and actively maintained.

---

## 5. AI and `.gitignore` policy

### 5.1 Tracked and protected

These stay tracked:

- source code
- SSOT and governance files
- GitHub workflow and template files
- canonical docs
- authoritative AI instructions and governance references

### 5.2 Ignored and automation-excluded

These should be ignored and excluded from automation by default:

- caches
- logs
- temporary files
- generated AI artifacts
- local AI transcripts
- local-only config with secrets or machine-specific state
- disposable screenshots, reports, and outputs that are not SSOT

### 5.3 Tracked but automation-excluded by default

These stay visible in Git but should be treated as review-first:

- `packages/sentra/**`
- healthcare-sensitive logic
- other crown-jewel paths explicitly classified by repo policy

---

## 6. File and ownership model

The rollout should reuse existing repo structure:

- `.husky/` for local Git hooks
- `tooling/governance/agent/scripts/` for reusable local logic
- `.github/workflows/` for CI and protected-branch enforcement support
- `docs/guides/` for operator guidance
- root docs for contribution and security standards

No new top-level folder is required.

---

## 7. Operator experience

The terminal output should feel quiet, clear, and professional:

- short section headers
- explicit scope summary
- deterministic pass/fail wording
- no noisy stack traces unless a tool actually crashes
- exact next action when blocked

Preferred status language:

- `PASS` — safe to continue
- `WARN` — allowed to continue but requires attention
- `BLOCK` — push must stop

---

## 8. GitHub enforcement requirements

The GitHub side of the system should support:

- protected-branch-only hard enforcement
- required pull request checks
- merge queue compatibility when enabled
- `merge_group` workflow support for queue execution
- CODEOWNERS-aware review routing
- security review surfaces already present in the repo

Repository settings outside Git-tracked files, such as rulesets and branch
protection, must be documented clearly because they are part of the real system
even when they are configured in the GitHub UI.

---

## 9. Acceptance criteria

The system is acceptable only when all of the following are true:

- `pre-commit` remains fast and focused on staged-file hygiene.
- `pre-push` runs automatically on every push.
- `pre-push` classifies changed scope and does not default to full-monorepo
  heavy verification on every push.
- protected branches are merge-gated by GitHub, not trust alone.
- contributor-facing docs explain the local and GitHub gate behavior clearly.
- crown-jewel surfaces remain tracked and visible, but review-first.
- noisy AI and local generated artifacts are ignored and automation-excluded by
  policy.
- local and GitHub gate behavior use the same branch authority model.

---

## 10. Verification

Verification for rollout should include:

1. a docs-only push scenario
2. a workflow/governance change scenario
3. an ordinary code change scenario
4. a crown-jewel-path visibility scenario
5. a protected-branch PR check scenario
6. a merge-queue readiness check if merge queue is enabled

The final implementation report must distinguish:

- what was verified locally
- what was verified in GitHub workflow files
- what still requires manual GitHub repository settings

---

## 11. Out of scope for v1

- server-side custom GitHub Apps
- fully dynamic branch protection managed by code inside this repo
- blanket automation edits across crown-jewel packages
- new repo-wide architecture changes unrelated to push reliability
- broad documentation rewrites outside the minimum standard pack

---

## Final summary

Smart push reliability for ABYSS means:

- fast hygiene at commit time
- smart affected verification at push time
- strict GitHub enforcement at merge time
- clear documentation
- explicit branch authority
- disciplined handling of AI-generated and crown-jewel surfaces

The system should feel almost invisible when work is healthy and immediately
useful when work is not.
