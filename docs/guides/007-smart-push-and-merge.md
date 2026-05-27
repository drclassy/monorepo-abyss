---
id: smart-push-and-merge
type: guide
status: active
owner: sentra-engineering
tags: [git, github, governance]
---

# Smart push and merge in The Abyss

This guide explains the ABYSS contribution path from commit to push to pull
request and merge.

## 2026 quick checklist

Use this as the default end-to-end path for calm, predictable GitHub pushes:

1. Create one short-lived branch for one scoped change.
2. Push to the working branch, never directly to the protected default branch.
3. Keep local auth stable with either `gh auth login` or SSH that has already
   passed `ssh -T git@github.com`.
4. Set local Git defaults that remove common friction:
   - `git config --global push.autoSetupRemote true`
   - `git config --global pull.rebase true`
   - `git config --global fetch.prune true`
5. Keep commit-time hooks fast and staged-file-focused only.
6. Let `pre-push` run the smallest relevant verification for the changed scope.
7. Use pull requests with required checks, required review, and CODEOWNERS for
   sensitive paths.
8. Use merge queue only when the protected branch is busy enough that frequent
   update-branch churn becomes a real cost.

## The three-layer gate

ABYSS is standardizing on a three-layer reliability model:

| Stage | What it does | Why it exists |
| --- | --- | --- |
| Commit | `pre-commit` checks staged files only for fast hygiene checks such as secrets, PHI, formatting, and lint-staged fixes. | Catch obvious problems without turning every commit into a heavy repo-wide run. |
| Push | `pre-push` classifies the changed scope and runs the smallest relevant local verification. | Stop likely problems before they leave the workstation. |
| PR and merge | GitHub enforces required checks, review, CODEOWNERS routing, and protected-branch rules. | Make landing changes on shared branches predictable and reviewable. |

GitHub is the final authority for protected-branch merges. Local hooks help,
but they are not the last word.

## One-time local setup

Choose one authentication path and make it boring:

- `HTTPS` for the least setup friction:
  - use `gh auth login`, or
  - use Git Credential Manager through a current Git for Windows install
- `SSH` if you prefer key-based auth and may also want SSH commit signing:
  - add the key to GitHub
  - verify once with `ssh -T git@github.com`

Recommended local defaults:

```powershell
git config --global push.autoSetupRemote true
git config --global pull.rebase true
git config --global fetch.prune true
```

These settings reduce three common sources of push pain:

- first push on a new branch with no upstream
- stale remote-tracking branches
- unnecessary local merge commits from routine pulls

Do not make `--force-with-lease` part of the default happy path. Reserve it for
intentional history rewrites on your own feature branch after operations such as
`rebase`, `commit --amend`, or controlled squashing.

## What happens at commit

Keep commit scope small and staged on purpose. The commit gate should stay
limited to staged-file hygiene:

- secret scanning
- PHI scanning
- formatting
- lint-staged fixes

If commit is blocked, fix the staged scope first. Do not use commit-time hooks
as a substitute for later targeted verification.

## What happens at push

The push gate is the smart local verification layer. It should classify the
change before deciding what to run.

### Docs-only changes

Docs-only pushes should stay light:

- confirm the scope is actually docs-only
- keep the diff readable and reviewable
- make sure no secrets, PHI, or sensitive screenshots slipped into docs

### Governance changes

Governance surfaces need extra scrutiny. Typical examples include:

- `AGENTS.md`
- curated `.agent/**` continuity files
- `.github/**`
- `.husky/**`
- `tooling/governance/**`
- root policy docs such as `CONTRIBUTING.md` and `SECURITY.md`

### Ordinary code changes

Ordinary code pushes should prefer affected verification over full-monorepo
verification by default.

### Crown-jewel changes

`packages/sentra/**` stays tracked in Git, but it is not ordinary low-risk
surface area. Treat it as review-first:

- expect higher visibility in gate output
- run stronger verification than routine docs or app copy edits
- do not treat AI assistance as permission to normalize risky edits

## AI artifact policy in plain language

Track the files that define the real system:

- source code
- canonical docs
- governance instructions
- GitHub templates and tracked policy files

Keep disposable local material out of commits unless the repo explicitly says it
belongs in version control:

- caches
- logs
- temporary files
- local AI transcripts
- generated AI artifacts
- disposable screenshots or reports
- machine-specific config with secrets or local state

If an AI-generated artifact may contain sensitive content, sanitize it before it
leaves your machine.

## What happens in pull requests and merge

Use the pull request template and keep it objective. Every PR should state:

- the objective
- the exact scope
- automated verification actually run
- manual verification when relevant
- screenshots or recordings when UI changed

Shared-branch expectations:

- no direct push to protected branches
- required status checks
- required review
- CODEOWNERS review where configured
- up-to-date branch before merge
- merge queue support when enabled

## GitHub minimum setup

The GitHub-side configuration is the real shared-branch safety net. For 2026,
the minimum practical setup is:

1. Protect the real default branch after branch authority is normalized.
2. Require pull requests before merge.
3. Require status checks before merge.
4. Require review, and require CODEOWNERS review on sensitive paths.
5. Keep required check job names unique across workflows so GitHub does not see
   ambiguous status names.
6. Prefer `rulesets` when available, especially when multiple protections need
   to layer cleanly across branches.
7. Consider signed commits as recommended, not mandatory, unless the repo is
   ready to enforce them operationally.
8. Enable merge queue only for high-traffic protected branches.

Good defaults when protections are turned on:

- block direct push to protected branches
- require conversation resolution before merge
- require branch to be up to date before merge when merge queue is not used
- require linear history if the repo wants a cleaner revert path

Treat GitHub settings outside the repo as part of the real system. If a rule
matters operationally, document it here or in the repo governance docs.

## Branch authority normalization is still pending

Final protected-branch rollout is not complete yet. During planning, the repo
showed inconsistent branch authority signals:

- active local branch observed: `master`
- checked-in workflow branches observed: `main`, `develop`
- locally known remote default branch metadata observed: `origin/abyss-core`

Until one branch model is chosen and reflected everywhere:

- this guide describes the intended reliability model
- final protected-branch names are not authoritative yet
- required-check mapping in GitHub remains a manual follow-up

## Manual GitHub settings still required

Some of the real merge gate lives in GitHub settings rather than tracked files.
To complete rollout, the repository still needs a confirmed GitHub-side setup
for:

- final protected and default branch authority
- branch protection or rulesets
- required status checks that match real workflow job names
- required review and CODEOWNERS enforcement
- merge queue, if the repo decides to enable it

## Repo-specific GitHub UI checklist

Observed on 2026-05-27 from the local clone:

- remote `origin` default branch: `master`
- current local branch: `master`
- current checked-in `ci.yml` branch filters: `main`, `develop`
- current `CODEOWNERS` ownership is effectively single-owner: `@drclassy`

Use the checklist below in GitHub UI so the repo becomes safer without
accidentally blocking normal work.

### Activate now

These are safe to enable immediately:

1. Confirm `master` is the repository default branch in GitHub.
2. Enable automatic branch deletion after merge.
3. Keep pull requests as the normal landing path for non-trivial changes.
4. Keep CODEOWNERS file tracked and visible, even if mandatory CODEOWNERS
   approval is not enabled yet.
5. If you want lower auth friction on the workstation, keep the repo on HTTPS
   and use GitHub CLI or Git Credential Manager.

### Activate after branch and workflow alignment

Do these only after the CI workflow that should gate `master` actually runs on
`master` pull requests and protected-branch updates:

1. Protect branch `master`.
2. Require a pull request before merging into `master`.
3. Require status checks before merging into `master`.
4. Use these exact required check names if `reusable-verify.yml` becomes the
   active protected-branch gate:
   - `CI / verify`
   - `CI / build (affected)`
   - `CI / test (affected)`
   - `CI / lint & format`
   - `CI / typecheck (affected)`
   - `CI / security (blocking audit)`
   - `CI / Langflow definitions`
5. Require conversation resolution before merge.
6. Require branch to be up to date before merge if merge queue is still off.
7. Require linear history if the repo wants a cleaner protected-branch history.

### Keep disabled for now

Do not enable these yet in the current observed repo state:

1. `Required approvals` or `Require review from Code Owners` on `master`, unless
   at least one additional reviewer or review team has write access. With the
   current single-owner CODEOWNERS shape, mandatory review can turn into a
   self-blocking process.
2. `Merge queue`, because the checked-in workflow state is not yet aligned for a
   queue-driven protected branch and no `merge_group` path is documented as the
   current authority.
3. `Require signed commits` as a hard branch rule, unless commit signing is
   already rolled out on every machine that pushes to this repo.

### One explicit cleanup before strict enforcement

Before turning on required checks for `master`, normalize these mismatches first:

1. The remote default branch is `master`.
2. `ci.yml` currently targets `main` and `develop`.
3. Required checks in GitHub must match real workflow job names that actually
   run on the latest `master` PR commit SHA.

If these three are not aligned first, GitHub branch protection can block merges
for configuration reasons rather than code quality reasons.

## Common push failures and the shortest safe fix

### No upstream branch

If the first push of a branch fails because no upstream exists:

- run `git push -u origin <branch-name>`, or
- set `push.autoSetupRemote=true` once so normal `git push` handles this
  automatically on future new branches

### Non-fast-forward or rejected push

If the remote branch moved first:

1. run `git fetch origin --prune`
2. rebase your branch onto the latest base or remote branch
3. push again

Do not jump straight to force-push unless you intentionally rewrote your own
branch history.

### Authentication failure

If GitHub suddenly rejects credentials:

- for `HTTPS`, re-run `gh auth login` or clear stale Windows Credential Manager
  entries
- for `SSH`, re-test with `ssh -T git@github.com`

### Required check mismatch

If GitHub says a required check is missing or failing even though CI looks
green, inspect:

- whether the required check name exactly matches the workflow job name
- whether the check ran on the latest commit SHA
- whether two workflows publish the same job name

GitHub treats duplicate job names and stale commit results as real blockers.

## Practical contributor checklist

1. Keep the change scoped.
2. Run the smallest relevant verification.
3. Push and read the gate output instead of guessing.
4. Open a PR with objective, scope, verification, and screenshots when needed.
