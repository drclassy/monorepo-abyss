---
id: "bf889514-6dff-4bec-815d-6aa1938ebb8b"
entity_type: "task"
entity_id: "92affbfb-4430-473d-965e-9f8feb9be49f"
title: "Author CONTRIBUTING.md with branch, commit, and PR conventions, and add .editorconfig - Notes"
status: "todo"
priority: "high"
display_id: "SEN-10"
parent_task_id: "11a2dca9-4210-4c08-a839-2fc6c4712321"
brief_id: "524e2de2-084c-4fc6-a0dc-1cd379f06b52"
updated_at: "2026-03-31T21:24:58.894286+00:00"
synced_at: "2026-04-05T17:06:54Z"
---

## Summary

Author `CONTRIBUTING.md` with the full development workflow and add `.editorconfig` for IDE-agnostic formatting rules.

## Implementation Approach

1. Draft CONTRIBUTING.md: Branch Naming section (with examples for all three patterns), Commit Convention (format + annotated example), PR Process (6-step numbered sequence), Testing Requirements (coverage thresholds), HANDOFF.md reference note.
2. Include concrete example commit showing all fields.
3. State that `pnpm lint`, `pnpm test`, and `pnpm format` must pass before opening a PR.
4. Draft `.editorconfig` with `root=true`, universal `[*]` section, language-specific overrides for JS/TS/JSON/YAML, and tab override for Makefiles.
5. Verify `.editorconfig` indent settings align with the Prettier config.

## Acceptance Criteria

- CONTRIBUTING.md documents branch naming conventions with examples for all three patterns.
- CONTRIBUTING.md documents the commit message format including PHASE/DOMAIN fields and optional Agent/Phase/Handoff trailer.
- CONTRIBUTING.md documents the complete PR process as a numbered sequence ending with squash-merge.
- CONTRIBUTING.md states testing requirements (>80% unit coverage, integration tests for cross-package changes).
- `.editorconfig` exists at the repository root with LF line endings, 2-space indent for JS/TS/JSON/YAML, tabs for Makefiles.
- `.editorconfig` settings are consistent with the Prettier configuration.

## Technical Constraints

- Branch naming patterns must match what is enforced by CI/CD branch protection.
- `.editorconfig` indent settings must align with Prettier config to avoid conflicts.
- CONTRIBUTING.md must render correctly on GitHub.

## Files to Create

- `CONTRIBUTING.md` — Development workflow: branches, commits, PRs, testing requirements.
- `.editorconfig` — IDE-agnostic formatting rules.## Details

**Scope**: CONTRIBUTING.md documenting branch naming, commit format, PR workflow, and testing requirements. .editorconfig for IDE-agnostic formatting rules.

**Out of Scope**: Husky hook configuration (belongs to CI/CD or TypeScript & Code Quality sibling tasks). CODEOWNERS governance (belongs to CI/CD sibling task). ESLint and Prettier configuration themselves (TypeScript & Code Quality sibling task). HANDOFF.md template content (Directory Scaffolding sibling task).

**Implementation**: 1. Draft CONTRIBUTING.md sections: Branch Naming (with examples for all three patterns), Commit Convention (format spec + annotated example commit), PR Process (numbered 6-step workflow), Testing Requirements (coverage thresholds and test categories), and a HANDOFF.md reference note.
2. Include a concrete commit message example demonstrating all fields.
3. Include a note that `pnpm lint`, `pnpm test`, and `pnpm format` must all pass before a PR is opened.
4. Draft .editorconfig with root=true, a universal [*] section (charset=utf-8, end_of_line=lf, insert_final_newline=true, trim_trailing_whitespace=true), a [*.{js,ts,tsx,jsx}] section (indent_style=space, indent_size=2), a [*.{json,yaml,yml}] section (indent_style=space, indent_size=2), and a [Makefile] section (indent_style=tab).
5. Verify .editorconfig indentation settings align with the Prettier config (2 spaces, LF).

**Constraints**: Branch naming patterns in CONTRIBUTING.md must exactly match what is enforced by any branch protection rules defined in the CI/CD sibling task., .editorconfig indent settings must be consistent with the Prettier configuration (2 spaces, LF line endings) to avoid conflicts., CONTRIBUTING.md must be in standard Markdown and render correctly on GitHub.

**Relevant Files**: create: `CONTRIBUTING.md` - Development workflow guide: branch naming, commit convention, PR process, testing requirements.; create: `.editorconfig` - IDE-agnostic formatting rules for consistent line endings, indentation, and charset.

## Acceptance Criteria

- [ ] CONTRIBUTING.md documents branch naming conventions with examples for feature/, bugfix/, and chore/ patterns.
- [ ] CONTRIBUTING.md documents the commit message format including PHASE/DOMAIN fields and the optional Agent/Phase/Handoff trailer.
- [ ] CONTRIBUTING.md documents the complete PR process as a numbered sequence ending with squash-merge.
- [ ] CONTRIBUTING.md states the testing requirements: >80% unit coverage, integration tests for cross-package changes.
- [ ] .editorconfig is present at the repository root with correct rules for LF line endings, 2-space indentation for JS/TS/JSON/YAML, and tabs for Makefiles.
- [ ] .editorconfig settings are consistent with the Prettier configuration (no conflicting indent or line-ending rules).

## Context

| Field | Value |
|-------|-------|
| category | documentation |
| complexity | 3 |

