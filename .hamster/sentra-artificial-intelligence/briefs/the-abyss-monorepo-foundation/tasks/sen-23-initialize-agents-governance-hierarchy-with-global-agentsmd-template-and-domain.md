---
id: "b97fb66e-43d2-42bc-a1f1-b5011292cf20"
entity_type: "task"
entity_id: "c6c45ee6-a661-424b-acff-38a7d143e08f"
title: "Initialize .agents/ governance hierarchy with global AGENTS.md template and domain-specific steering files - Notes"
status: "todo"
priority: "high"
display_id: "SEN-23"
parent_task_id: "d542ab02-573d-4839-8b82-827e49146e15"
brief_id: "524e2de2-084c-4fc6-a0dc-1cd379f06b52"
updated_at: "2026-03-31T21:26:27.268372+00:00"
synced_at: "2026-04-05T17:06:54Z"
---

## Summary

Create the full `.agents/` governance hierarchy including the global AGENTS.md steering document, domain-specific AGENTS.md files for all five app domains, and scaffold subdirectories for skills, prompts, and MCP configuration.

## Implementation Approach

1. Author `.agents/AGENTS.md` with four mandatory sections:

- **Claudesy Workflow**: Every change requires a HANDOFF.md with Diagnosis, Proposed Architecture, Approval, Timeline, and Proof-of-Verification
- **GO-Gating**: Changes proceed only after explicit approval string is present in HANDOFF.md
- **Immutable Audit Trail**: Every AI-generated commit must include `Agent:`, `Phase:`, and `Handoff:` trailers
- **No Blind Scaffolding**: Agents must query repository structure via MCP before generating code

1. Author `apps/healthcare/AGENTS.md` — inherits global rules + adds HIPAA compliance mandate, FHIR-only protocol rule, restricted import policy (must use packages/fhir-engine)
2. Author `apps/academic/AGENTS.md` — inherits global rules + educational context constraints
3. Author `apps/incubator/AGENTS.md` — inherits global rules + prototype/experimental isolation rules
4. Author `apps/internal/AGENTS.md` — inherits global rules + internal tooling conventions
5. Author `apps/orchestrator/AGENTS.md` — inherits global rules + LLM/Langflow integration rules
6. Create `.agents/skills/README.md` with skill registration format (YAML front-matter: name, description, triggers, examples)
7. Create `.agents/skills/example-skill.md` as a demonstrative template
8. Create `.agents/prompts/README.md` explaining prompt library structure and Phase 2 roadmap
9. Create `.agents/prompts/scaffolding/.gitkeep` as placeholder
10. Create `.agents/mcp/README.md` describing planned MCP server configuration
11. Create `.agents/mcp/config.example.json` with schema stub for Phase 2

## Acceptance Criteria

- `.agents/AGENTS.md` contains all four global governance mandates in structured sections
- Domain AGENTS.md files exist for all five apps/[domain]/ directories
- `apps/healthcare/AGENTS.md` explicitly calls out HIPAA and FHIR requirements
- `.agents/skills/README.md` and `example-skill.md` exist with skill format documentation
- `.agents/prompts/README.md` and `.agents/mcp/README.md` exist with Phase 2 notes
- All files are Git-tracked

## Technical Constraints

- AGENTS.md files must use consistent headings: ## Global Rules, ## Domain-Specific Rules, ## Prohibited Actions
- Healthcare AGENTS.md must be explicit about HIPAA and FHIR mandate
- Skills use YAML front-matter format for future Phase 2 tooling
- mcp/config.example.json must include commented schema for Phase 2 fields

## Code Patterns to Follow

- GO-Gate CI job validates HANDOFF.md using `iskandar-gatekeeper validate-handoff` — AGENTS.md global rules must align with what the validator checks
- Commit trailers Agent:/Phase:/Handoff: are the audit trail mechanism
- `.agents/` is owned by @platform-team — note this in mcp/README.md

## Relevant Files

### Files to Create

- `.agents/AGENTS.md` — Global AI agent steering rules
- `.agents/skills/README.md` — Skill registration format documentation
- `.agents/skills/example-skill.md` — Demonstrative skill template
- `.agents/prompts/README.md` — Prompt library structure documentation
- `.agents/mcp/README.md` — MCP server configuration documentation
- `.agents/mcp/config.example.json` — MCP config schema stub
- `apps/healthcare/AGENTS.md` — Healthcare domain steering rules (HIPAA + FHIR)
- `apps/academic/AGENTS.md` — Academic domain steering rules
- `apps/incubator/AGENTS.md` — Incubator domain steering rules
- `apps/internal/AGENTS.md` — Internal tooling domain steering rules
- `apps/orchestrator/AGENTS.md` — Orchestrator domain steering rules## Details

**Scope**: All content under .agents/ (global AGENTS.md, skills/README.md + example, prompts/README.md + scaffolding placeholder, mcp/README.md + config.example.json) AND domain-specific AGENTS.md files inside each apps/[domain]/ directory.

**Out of Scope**: Actual CI/CD enforcement logic for GO-Gate (sibling: CI/CD Governance Pipeline), HANDOFF.md template (separate subtask in this parent task), root README.md and CONTRIBUTING.md (sibling: Developer Documentation & Onboarding), implementation of MCP server or agent skills (Phase 2 scope).

**Constraints**: All AGENTS.md files must use consistent section headings: ## Global Rules, ## Domain-Specific Rules, ## Prohibited Actions, The global rules section must explicitly define the four core mandates: Claudesy Workflow, GO-Gating, Immutable Audit Trail, No Blind Scaffolding, Healthcare AGENTS.md must call out HIPAA compliance and FHIR mandate explicitly, Skills in .agents/skills/ should follow YAML front-matter format for Phase 2 tooling compatibility, config.example.json in .agents/mcp/ must include a commented schema noting planned Phase 2 fields

**Patterns**: GO-Gate enforcement in CI validates HANDOFF.md against .agents/ rules using iskandar-gatekeeper validate-handoff command, Domain-specific AGENTS.md files exist at apps/[domain]/AGENTS.md per the architectural monograph, .agents/ directory is owned by @platform-team per CODEOWNERS governance, Healthcare domain requires FHIR protocol usage — apps/healthcare/ cannot import non-healthcare/non-shared packages without architectural approval, Commit trailers must include Agent:, Phase:, and Handoff: fields for AI-generated changes

## Acceptance Criteria

- [ ] `.agents/AGENTS.md` exists and contains all four global governance mandates (Claudesy Workflow, GO-Gate, Audit Trail, No Blind Scaffolding) in structured sections
- [ ] Domain-specific AGENTS.md files exist for all five domains: apps/healthcare/, apps/academic/, apps/incubator/, apps/internal/, apps/orchestrator/
- [ ] `apps/healthcare/AGENTS.md` explicitly references HIPAA compliance requirements and FHIR protocol mandate
- [ ] `.agents/skills/README.md` and `.agents/skills/example-skill.md` exist and demonstrate the skill registration format
- [ ] `.agents/prompts/README.md` and `.agents/mcp/README.md` exist with clear purpose descriptions and Phase 2 integration notes
- [ ] All files are committed and tracked by Git (not excluded by .gitignore)

## Context

| Field | Value |
|-------|-------|
| category | development |
| complexity | 5 |

