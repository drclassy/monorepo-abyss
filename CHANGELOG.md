# 📝 CHANGELOG

All notable changes to The Abyss monorepo will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- Initial monorepo structure with pnpm workspace
- Turborepo configuration for build orchestration
- Claudesy Workflow integration (HANDOFF.md, GO-Gate)
- Core packages:
  - `@the-abyss/database` — Prisma schema with multi-tenancy
  - `@the-abyss/langflow-client` — Langflow SDK
  - `@the-abyss/ui` — Shadcn UI components
  - `@the-abyss/ai-core` — Multi-model consensus
  - `@the-abyss/fhir-engine` — FHIR R4 validation
  - `@the-abyss/vector-store` — Vector search (RAG)
  - `@the-abyss/iskandar-gatekeeper` — GO-Gate validator
  - `@the-abyss/shared-types` — Shared TypeScript types
- Abyss CLI with commands:
  - `init-task` — Create task sessions
  - `go` — Add GO approval
  - `sync-flow` — Sync Langflow definitions
  - `create app` — Scaffold new applications
  - `status` — Check monorepo health
- CI/CD pipelines:
  - `ci.yml` — Main CI with GO-Gate validation
  - `auto-fix.yml` — Auto-fix CI failures
  - `security-scan.yml` — Security scanning
- Domain steering documents:
  - Healthcare (HIPAA, FHIR R4)
  - Academic
  - Internal
  - Incubator (R&D)
  - Orchestrator
- Infrastructure as Code:
  - Docker multi-stage builds
  - Docker Compose for local development
  - Terraform AWS configuration
  - ArgoCD application template
- Documentation:
  - HANDOFF.md template
  - AGENTS.md global steering
  - Session logging in .agent/sessions
  - Architecture Decision Records

### Changed
- N/A

### Deprecated
- N/A

### Removed
- N/A

### Fixed
- N/A

### Security
- GO-Gate CI/CD validation
- Iskandar Gatekeeper for approval enforcement
- CODEOWNERS for domain-specific access control

---

## [0.0.1] - 2026-03-30

### Added
- Initial release
- Foundation structure
- Core packages and tooling

---

**Unreleased:** [Compare changes](https://github.com/Claudesy/abyss-monorepo/compare/main...develop)

---

© 2026 Sentra Artificial Intelligence
