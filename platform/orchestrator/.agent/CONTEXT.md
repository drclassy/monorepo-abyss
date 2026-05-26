# CONTEXT.md — orchestrator
<!-- Static. Update only when stack or architecture changes. -->
<!-- Last updated: 2026-04-10 -->

## Project Identity

| Field | Value |
|-------|-------|
| Name | Orchestrator |
| Package | `@the-abyss/orchestrator` |
| Path | `platform/orchestrator/` |
| Purpose | Central AI coordination layer — LangFlow workflow execution, task routing, runtime contracts |
| Owner | Dr. Ferdi Iskandar (Chief) |
| Status | Active — critical infrastructure |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js / TypeScript (tsx) |
| AI Coordination | `@the-abyss/langflow-client` |
| Database | `@the-abyss/database` |
| Types | `@the-abyss/shared-types` |
| No frontend | Backend only |

## Architecture Notes

The orchestrator is the most critical non-UI component in the monorepo. It coordinates AI workflow execution across all divisions. Breaking changes here propagate to all consumers.

Entry point: `src/index.ts` — this is the public interface. Breaking changes require BREAKING CHANGE: footer in commit message, shared-types update, and Chief review.

## Hard Constraints

- No UI dependencies — backend/Node.js only
- No silent error handling — all errors must be explicit
- No PII in logs or error messages
- Breaking changes to `src/index.ts` interface require BREAKING CHANGE: commit footer + DECISIONS.md entry + Chief review
- Do not modify shared packages from within this app without Chief approval
