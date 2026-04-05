---
id: "ea2baf61-86cd-4cb3-bd88-dc4f08d121b6"
entity_type: "task"
entity_id: "8143069d-676b-4e71-84d6-8e36b3d251c8"
title: "Configure and validate Turborepo remote cache provider for shared build artefacts - Notes"
status: "todo"
priority: "high"
display_id: "SEN-17"
parent_task_id: "8a613e82-cbcc-45af-b3b8-057235b03249"
brief_id: "524e2de2-084c-4fc6-a0dc-1cd379f06b52"
updated_at: "2026-03-31T21:25:43.174581+00:00"
synced_at: "2026-04-05T17:06:54Z"
---

## Summary

Configure a remote caching backend (Vercel Remote Cache or self-hosted equivalent) so build artefacts are shared across all developers and CI runners, eliminating redundant rebuilds for unchanged packages.

## Implementation Approach

1. Evaluate and select a remote cache provider (Vercel recommended for Phase 1 zero-ops simplicity)
2. Authenticate via `npx turbo login` + `npx turbo link` (Vercel path)
3. Add `"remoteCache": { "enabled": true }` to `turbo.json`
4. Document required env vars (`TURBO_TOKEN`, `TURBO_TEAM`) in `.env.example` with placeholders
5. Run a full build to populate the remote cache
6. Clear local cache and re-run to confirm remote cache hits
7. Document provider choice, authentication steps, and cache hit benchmarks in `docs/dev/turbo-guide.md`

## Acceptance Criteria

- Re-running `pnpm build` after clearing local cache shows all unchanged packages as "cache hit"
- `.env.example` contains `TURBO_TOKEN` and `TURBO_TEAM` with placeholder values and comments
- `turbo.json` contains `"remoteCache": { "enabled": true }` and is valid
- Incremental single-package build completes in under 30 seconds
- New developer can authenticate to remote cache using only `.env.example` guidance
- Provider and authentication procedure documented in `docs/dev/turbo-guide.md`

## Technical Constraints

- Credentials must NEVER be committed — only `.env.example` with placeholders
- Compatible with `turbo@2.x` remote cache API
- Cache must be scoped per team/project to prevent cross-project pollution
- `.turbo/` local directory must be in `.gitignore`

## Relevant Files

### Files to Create

- `.env.example` — Documents all required cache-related environment variables
- `docs/dev/turbo-guide.md` — Provider documentation and cache usage guide

### Files to Modify

- `turbo.json` — Add `remoteCache` block with `enabled: true`## Details

**Scope**: Select and configure a remote cache provider (Vercel or self-hosted), authenticate the connection, update turbo.json with the remoteCache block, document required environment variables in .env.example, and validate that cache hits are served from the remote cache on a clean run.

**Out of Scope**: Setting TURBO_TOKEN/TURBO_TEAM in GitHub Actions secrets (that is CI/CD Governance Pipeline's concern), defining the base task pipeline in turbo.json (subtask 1), Nx architectural boundary rules (subtask 3), and pnpm workspace setup (sibling task: Repository & pnpm Workspace).

**Implementation**: 1. Evaluate provider options and document the decision (Vercel Remote Cache recommended for Phase 1 zero-ops simplicity).
2. For Vercel: run `npx turbo login` to authenticate, then `npx turbo link` to associate the workspace.
3. Add `"remoteCache": { "enabled": true }` to `turbo.json` (the provider credentials are supplied via env vars at runtime, not hardcoded).
4. Add `TURBO_TOKEN` and `TURBO_TEAM` to `.env.example` with placeholder values and comments.
5. For self-hosted alternative: document `TURBO_API`, `TURBO_TOKEN` env vars and server setup steps in `docs/dev/turbo-guide.md`.
6. Run a full build to populate the remote cache: `pnpm build`.
7. Clear the local cache: `rm -rf node_modules/.cache/turbo` (or `turbo daemon clean`).
8. Re-run `pnpm build` and confirm every task reports "cache hit, replaying output" in the terminal.
9. Document the cache provider choice and hit rate benchmarks in `docs/dev/turbo-guide.md`.

**Constraints**: TURBO_TOKEN and TURBO_TEAM (or TURBO_API) must NEVER be committed to source control — only .env.example with placeholders., Remote cache must be compatible with turbo@2.x API., Cache artefacts must be scoped per team/project to prevent cross-project cache pollution., Local `.turbo` directory should be added to `.gitignore` to prevent accidental local cache commits., Build performance target: incremental change on a single package must complete in <30 seconds with remote cache hit on all unchanged packages.

**Relevant Files**: modify: `turbo.json` - Updated to include remoteCache block with enabled: true and provider-specific configuration.; create: `.env.example` - Root .env.example documenting TURBO_TOKEN, TURBO_TEAM (or TURBO_API for self-hosted) with placeholder values and explanatory comments.

## Acceptance Criteria

- [ ] After an initial full build, clearing local Turborepo cache and re-running `pnpm build` results in all unchanged packages reporting "cache hit, replaying output" with zero task re-execution.
- [ ] `.env.example` contains `TURBO_TOKEN` and `TURBO_TEAM` (or `TURBO_API`) with placeholder values and explanatory inline comments.
- [ ] `turbo.json` contains `"remoteCache": { "enabled": true }` and the configuration is syntactically valid.
- [ ] Build time for an incremental single-package change completes in under 30 seconds when the rest of the workspace has remote cache hits.
- [ ] A new developer following `.env.example` instructions can authenticate to the remote cache without additional verbal guidance.
- [ ] The selected provider and authentication procedure are documented in `docs/dev/turbo-guide.md`.

## Context

| Field | Value |
|-------|-------|
| category | development |
| complexity | 5 |

