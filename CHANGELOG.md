# 📝 CHANGELOG

All notable changes to The Abyss monorepo will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] — 2026-05-28

### 🎉 First Public Release

Initial open-source release of The Abyss — Healthcare AI Platform
Infrastructure.

### Added

#### UNICOM Agent Coordination Subsystem (`packages/unicom/` — `0.1.0`)

- `@the-abyss/unicom-core` — Typed agent coordination protocol, room state
  reducer, Zod-validated event contracts
- `@the-abyss/unicom-policy` — Policy engine with approve/block/human-approval
  gates for evidence, destructive ops, crown-jewel access, clinical boundaries
- `@the-abyss/unicom-server` — Socket.IO-backed coordination server with room
  management and append-only event broadcasting
- `@the-abyss/unicom-client` — TypeScript client library for connecting to
  UNICOM server
- `@the-abyss/unicom-agent-sdk` — Agent launcher with `codex-unicom-launcher`
  and `claude-code-unicom-launcher` CLI binaries
- `@the-abyss/unicom-persistence` — Append-only Postgres event store scaffold
- `@the-abyss/unicom-testkit` — Fake transport and in-memory store for
  deterministic agent testing

#### Platform Services (`packages/platform/`)

- `@the-abyss/database` — PostgreSQL schema with Prisma ORM and multi-tenancy
  support
- `@the-abyss/document-ingestion` — Multi-format document parser (JATS XML, PDF,
  Markdown) with OCR quality gates and source hashing
- `@the-abyss/langflow-client` — TypeScript client for programmatic LangFlow
  flow execution
- `@the-abyss/literature-harvester` — Open-access literature crawling, JATS
  ingestion, and knowledge registry

#### Clinical Knowledge (`packages/clinical/`)

- `@the-abyss/clinical-references` — Clinical knowledge registry with citation
  sources and supersession support

#### Shared Infrastructure (`packages/shared/`)

- `@the-abyss/shared-types` — Common TypeScript types across all packages
- `@the-abyss/sentra-ui` — React component library with Tailwind CSS
- `@the-abyss/design-token` — Design system tokens (spacing, typography, color)

#### Tooling (`packages/tooling/`)

- `@the-abyss/config-eslint` — Shared ESLint configuration for all workspace
  packages
- `@the-abyss/config-typescript` — Shared TypeScript base configuration

#### Governance & Infrastructure

- `AGENTS.md` — Root policy authority and operating contract
- `.agent/` — Operational SSOT for continuity, handoff, and current state
- `flows/` — LangFlow definitions for healthcare, academic, and platform
  workflows
- `infrastructure/` — Docker, Terraform, and ArgoCD deployment assets
- `docs/` — ADRs, guides, specs, UNICOM protocol docs, legal templates

### Infrastructure

- pnpm 9.15.0 workspace with Turborepo 2.9.x build orchestration
- TypeScript 5.9.x strict configuration across all packages
- Vitest test suite for all packages
- Husky pre-commit gates (secret scan, PHI scan, Prettier)
- Renovate for automated dependency management
- Changesets for future versioning and GitHub Releases

---

## [Unreleased]

<!-- New changes go here, managed by Changesets -->

---

[0.1.0]: https://github.com/drclassy/monorepo-abyss/releases/tag/v0.1.0
