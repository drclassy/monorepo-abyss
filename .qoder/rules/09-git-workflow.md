# Rule: Git Workflow

**Apply: Model Decision — when proposing commits, branches, PR descriptions, or
git operations**

## Branch naming

Pattern: `<type>/<scope>-<short-description>`

```
feat/clinical-pediatric-dose-calculator
fix/ocr-rotation-edge-case
chore/upgrade-tailwind-to-v4
docs/runbook-on-prem-deployment
refactor/agent-tool-registry
```

Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`.

Branches never touch `main` directly. Always go through PR.

## Conventional commits

```
feat(clinical-core): add pediatric paracetamol dose calculator

- Uses Kemenkes Formularium Nasional 2024 dosing table
- Returns ClinicalRefusal when weight < 3kg or > 80kg
- 94% line coverage with property tests

Refs: ADR-0017
```

- Subject ≤ 72 chars, imperative mood, lowercase after the colon.
- Body explains _why_ and surfaces non-obvious decisions.
- Reference ADRs, issues, or specs when relevant.

Scopes match top-level monorepo folders or package names: `clinical-core`,
`agents`, `rag`, `ocr`, `ui-brand`, `clinical-web`, etc.

## PR conventions

PR description template:

```markdown
## What

One paragraph describing the change.

## Why

The user-facing or system-level reason for the change.

## How

The technical approach, including trade-offs and alternatives considered.

## Risks

Anything that could go wrong, and how to roll back.

## Verification

- [ ] Unit tests added/updated
- [ ] Integration tests pass locally
- [ ] Coverage meets target (clinical-core: 90%)
- [ ] No PHI in logs, fixtures, or examples
- [ ] Docs updated (if user-facing)
- [ ] Audit log emitted (if clinical path)
```

## Size

- Aim for PRs under 400 changed lines.
- A PR over 1000 lines must be split or explicitly justified.
- Large refactors are staged: prepare → migrate → cleanup, each a separate PR.

## Review rules

- `packages/clinical-core/`: requires a reviewer with clinical-code
  authorization.
- `services/api-gateway/` (auth, routing): requires a security-aware reviewer.
- `infra/`: requires an operations reviewer.

The AI agent does not bypass these. If a change touches a protected area, the AI
agent flags it in the PR description.

## Forbidden operations

- `git push --force` to `main`, `release/*`, or any branch with an open PR. Use
  `--force-with-lease` only on your own feature branch.
- `git rebase` of pushed commits that others may have based work on.
- `git commit --no-verify` to skip hooks. Pre-commit hooks exist for a reason.
- Committing `.env`, `.env.local`, or any file containing secrets. The
  pre-commit `gitleaks` hook catches most of these; do not work around it.
- Committing files under `patient-data/`, `phi/`, or `clinical-data/raw/`. These
  paths are in `.gitignore` and `.qoderignore`.

## When the AI agent makes commits

- One logical change per commit. "Fix various issues" is not a logical change.
- Run the lint/format/type-check loop before proposing a commit.
- The commit message follows conventional commits format.
- If multiple files were touched, the message scope is the most-affected
  package.

## Releases

- Versioning: SemVer per package.
- Release tag: `clinical-core@v0.4.2`, scoped to package.
- Changelogs auto-generated from conventional commits, then human-edited for
  clarity.
- Production releases require a clinical-safety sign-off when
  `packages/clinical-core/` is in the diff.
