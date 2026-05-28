# Contributing to The Abyss

Use this guide for day-to-day contribution flow in ABYSS. Keep changes small,
use `pnpm`, and prefer the smallest relevant verification before you push.

## Before you start

- Use `pnpm`, not `npm` or `yarn`, unless a package explicitly proves otherwise.
- Read [`AGENTS.md`](AGENTS.md), [`.agent/README.md`](.agent/README.md), and
  [`.agent/HANDOFF.md`](.agent/HANDOFF.md) before repo-wide work.
- Keep scope tight. Do not mix feature work with unrelated cleanup.
- Do not commit secrets, credentials, PHI, patient data, or local-only machine
  state.
- Treat `packages/sentra/**` as crown-jewel review-first territory. Do not edit
  it without explicit approval.

## Branch flow

Work on a non-protected working branch, push that branch, and open a pull
request for shared review.

Branch authority normalization is still pending. During planning, ABYSS showed
mixed branch signals across local state, workflow triggers, and remote metadata.
Until that is normalized, do not assume `master`, `main`, `develop`, or
`abyss-core` is the final protected-branch truth.

Practical default:

- Use task-focused branches such as `feat/*`, `fix/*`, `docs/*`, or `chore/*`.
- Avoid direct pushes to any branch that may become protected.
- Treat GitHub pull requests as the required path for shared work.

## What happens at commit

Commit-time checks should stay fast and focused on staged files only. The commit
gate is expected to handle staged-file hygiene such as:

- secret scanning
- PHI scanning
- formatting
- lint-staged fixes

If the commit hook blocks, fix the staged scope first instead of forcing the
commit through.

Before you commit:

- review `git diff --staged`
- confirm the staged files match the intended task scope
- run the smallest relevant local verification when the change obviously needs
  it

## What happens at push

ABYSS is standardizing on a three-layer reliability model:

1. `pre-commit` for staged-file hygiene
2. `pre-push` for path-aware local verification
3. GitHub PR and merge checks for protected-branch enforcement

The push gate should classify the change before deciding what to run:

- docs-only changes should stay light
- governance changes should receive extra scrutiny
- ordinary code changes should run targeted verification
- crown-jewel changes should stay visible and review-first

If push is blocked, read the gate output and fix the specific reason. Do not
solve a narrow blocker by widening the change.

## AI artifacts and sensitive surfaces

Use plain judgment here:

- Keep canonical source code, tracked docs, templates, and governance
  instructions in Git.
- Keep disposable AI transcripts, local reports, caches, temporary outputs, and
  machine-specific state out of commits unless the repo explicitly classifies
  them as canonical.
- If an AI-assisted change touches healthcare-sensitive or crown-jewel logic,
  treat it as higher review risk, not lower.
- Regenerate or redact AI-generated artifacts before sharing them if they might
  contain sensitive content.

## Pull requests and merge

Use the pull request template and keep the description factual. Every pull
request should state:

- the objective
- the exact scope
- the local verification actually run
- manual verification when relevant
- screenshots or recordings when UI changed

Review expectations:

- required checks must pass
- CODEOWNERS review applies where configured
- crown-jewel paths need explicit approval
- sensitive data must stay out of the PR body, logs, and screenshots

GitHub is the final merge gate for protected branches. Branch authority
normalization is still pending, so final protected-branch rollout and required
check mapping are not complete yet.

## Useful commands

Run the smallest command that proves the change:

```bash
pnpm format:check
pnpm typecheck -- --pretty false
pnpm build
pnpm test
git diff --stat
git diff --name-status
```

## Related docs

- [README.md](README.md)
- [SECURITY.md](SECURITY.md)
- [docs/guides/007-smart-push-and-merge.md](docs/guides/007-smart-push-and-merge.md)
