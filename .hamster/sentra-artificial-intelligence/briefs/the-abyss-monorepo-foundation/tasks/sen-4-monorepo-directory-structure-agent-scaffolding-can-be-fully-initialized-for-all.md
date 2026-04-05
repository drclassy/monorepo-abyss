---
id: "e594f1ed-c9f4-4ec5-acc8-822bafa1ecb4"
entity_type: "task"
entity_id: "d542ab02-573d-4839-8b82-827e49146e15"
title: "Monorepo Directory Structure & Agent Scaffolding can be fully initialized for all domains and AI workflows - Notes"
status: "todo"
priority: "high"
display_id: "SEN-4"
brief_id: "524e2de2-084c-4fc6-a0dc-1cd379f06b52"
updated_at: "2026-03-31T21:21:03.956479+00:00"
synced_at: "2026-04-05T17:06:54Z"
---

## The complete monorepo directory structure and AI agent governance scaffolding can be initialized so every team member and AI agent navigates the workspace without ambiguity.

Without a well-structured directory topology and agent steering files, AI agents produce "blind" code generation that violates organizational conventions — a blocker for Phase 2 Claudesy Workflow. This task creates the physical skeleton of The Abyss: every domain directory, every shared package stub, and every governance template needed for human and AI collaboration.

## Experience

A developer cloning the repository immediately sees a clear, documented structure. Every major directory has a README. AI agents find `.agents/AGENTS.md` with their operational constraints. Engineers creating new tasks find `docs/templates/HANDOFF.md` ready to fill in. The first Architecture Decision Record is committed, starting the institutional memory trail.

## Interaction

1. Complete directory tree is created and verified against `pnpm-workspace.yaml` scopes
2. `.gitkeep` files are generated for all empty directories — nothing is lost on clone
3. Minimal `package.json` stubs created for all 10 workspace packages using `@the-abyss/[name]` convention
4. README.md files authored for `apps/`, `packages/`, `infrastructure/`, `flows/`, `tooling/`
5. `.agents/` hierarchy scaffolded: `skills/`, `prompts/`, `mcp/` — matching organizational blueprint structure
6. Global `.agents/AGENTS.md` created with Claudesy Workflow rules, GO-Gate constraints, immutable audit trail requirements
7. `apps/healthcare/AGENTS.md` created with HIPAA-specific domain rule placeholders
8. `docs/templates/HANDOFF.md` created with YAML frontmatter schema for Phase 2 iskandar-gatekeeper validation
9. First ADR committed: `docs/adr/0001-monorepo-strategy.md` — documenting the monorepo adoption rationale## Details

**User Capability**: Any team member or AI agent navigating the repository immediately understands the structural layout, finds the correct location for new code, and has access to governance templates (AGENTS.md, HANDOFF.md) for Phase 2 integration.

**Business Value**: A clearly scaffolded directory structure with README markers and agent steering files enables AI agents to autonomously locate workspace structure without guessing — a prerequisite for Phase 2 Claudesy Workflow. Without this scaffolding, agents produce "blind" code generation that violates organizational conventions.

**Functional Requirements**:
- Complete directory tree created and version-controlled (`.gitkeep` files for empty directories)
- Full `apps/` structure: `healthcare/` (referralink-api, aadi), `academic/` (clinical-simulator), `incubator/` (edge-ai-prototype), `internal/` (sentratorium-web, design-system), `orchestrator/` (langflow-gateway)
- Full `packages/` structure matching organizational blueprint: `config-typescript`, `config-eslint`, `database`, `ui`, `ai-core`, `langflow-client`, `vector-store`, `fhir-engine`, `iskandar-gatekeeper`, `shared-types`
- `infrastructure/` structure: `docker/`, `terraform/`, `argocd/`, `kubernetes/`
- `flows/` structure: `definitions/`, `components/`, `tests/`
- `tooling/` structure: `abyss-cli/`, `generators/`
- `docs/` structure: `adr/`, `sentratorium/sessions/`, `guides/`, `architecture/`
- `.agents/` full structure per organizational blueprint: `skills/` (with per-skill subdirs containing `SKILL.md`, `scripts/`, `references/`), `prompts/`, `mcp/`, `AGENTS.md`, `README.md`
- `apps/healthcare/AGENTS.md` with HIPAA-specific domain rules (Phase 2 placeholder)
- Global `.agents/AGENTS.md` template with Claudesy Workflow rules, GO-Gate constraints, and immutable audit trail requirements
- `docs/templates/HANDOFF.md` execution plan template with YAML frontmatter fields: diagnosis, proposed architecture, approval, execution timeline, proof-of-verification
- `docs/adr/0001-monorepo-strategy.md` — first ADR documenting monorepo adoption rationale
- Minimal `package.json` stubs in every workspace package (name, version, placeholder scripts)
- README.md files in each major section explaining purpose, domain rules, and onboarding notes

**Data Model & Structure**:
- `.agents/skills/[skill-name]/SKILL.md` — YAML frontmatter (name, version, domain, description) + imperative instructions
- `.agents/skills/[skill-name]/scripts/` — executable automation files
- `.agents/skills/[skill-name]/references/` — dense technical context documents
- `.agents/mcp/config.json` — MCP server configuration scaffold (integrated with Nx build pipeline task)
- `docs/adr/NNNN-title.md` — ADR format: Decision, Rationale, Consequences, Alternatives Considered

**Technical Approach**:
- Bash script or `find` command to add `.gitkeep` files: `find . -type d -empty -not -path "./.git/*" -exec touch {}/.gitkeep \;`
- Each `package.json` stub uses `@the-abyss/[name]` naming convention
- AGENTS.md follows the 4-level hierarchy defined in organizational blueprint: Global → Domain → Skill → MCP
- HANDOFF.md template must include machine-readable YAML frontmatter for Phase 2 iskandar-gatekeeper validation

**User Workflows**:
1. Full Stack Engineer verifies directory tree from `pnpm-workspace.yaml` scopes
2. Engineer runs `.gitkeep` generation script to preserve all empty directories
3. Engineer creates README.md files for each major section
4. Engineer creates `.agents/AGENTS.md` global steering template with Claudesy Workflow rules
5. Engineer creates `apps/healthcare/AGENTS.md` with HIPAA domain-specific placeholder rules
6. Engineer creates `.agents/skills/` scaffold with example skill directory structure
7. Engineer creates `docs/templates/HANDOFF.md` with full YAML frontmatter schema
8. Engineer commits first ADR (`docs/adr/0001-monorepo-strategy.md`)
9. Engineer validates: `git status` shows all directories tracked; `find .agents -type f` shows all files present

**Scope - INCLUDED**:
- All directory creation and `.gitkeep` markers
- Minimal `package.json` stubs for all workspace packages
- README.md files for `apps/`, `packages/`, `infrastructure/`, `flows/`, `tooling/`
- `.agents/AGENTS.md` global template
- `apps/healthcare/AGENTS.md` domain-specific placeholder
- `.agents/skills/` scaffold (structure only — no actual skills implemented)
- `.agents/mcp/config.json` scaffold
- `docs/templates/HANDOFF.md` template
- `docs/adr/0001-monorepo-strategy.md` first ADR

**Scope - EXCLUDED**:
- Actual skill content implementation (Phase 2)
- Full MCP server implementation (Phase 2)
- iskandar-gatekeeper package implementation (Phase 2)
- Application-level code (Phase 3+)
- `packages/config-typescript/` and `packages/config-eslint/` actual content (handled by "TypeScript & Code Quality Standards")

**Success Criteria**:
- `git status` shows zero untracked directories (all empty dirs have `.gitkeep`)
- Every listed workspace directory exists and has either a `.gitkeep` or actual content
- `pnpm install` still resolves all package stubs after scaffolding
- `.agents/AGENTS.md` contains Claudesy Workflow rules and GO-Gate constraints
- `docs/templates/HANDOFF.md` contains YAML frontmatter with all required fields
- `docs/adr/0001-monorepo-strategy.md` is committed and readable
- `find .agents/skills -type d` shows the expected skill directory structure

**Constraints & Considerations**:
- `.agents/` structure must match the organizational blueprint exactly (skills/, prompts/, mcp/) — deviations block Phase 2
- HANDOFF.md template must include machine-readable frontmatter for iskandar-gatekeeper Phase 2 validation
- Healthcare AGENTS.md must reference HIPAA compliance as a domain constraint even as a placeholder
- `packages/fhir-engine/` must be present in the scaffolding (organizational blueprint-defined package)

## Context

| Field | Value |
|-------|-------|
| dependencyRationale | Repository & pnpm Workspace can be initialized as the monorepo foundation |
| testStrategy | Run `git status` — zero untracked directories. Run `find . -type d -empty -not -path "./.git/*"` — returns no results (all empty dirs have `.gitkeep`). Verify `pnpm install` still succeeds after scaffolding all package stubs. Check `.agents/AGENTS.md` contains Claudesy Workflow and GO-Gate sections. Check `docs/templates/HANDOFF.md` contains YAML frontmatter with diagnosis, approval, and proof-of-verification fields. Verify `docs/adr/0001-monorepo-strategy.md` exists and is accessible. |

