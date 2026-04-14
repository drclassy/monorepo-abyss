# CONTEXT.md — the-abyss (monorepo root)
<!-- Static. Update only when stack or architecture changes. -->
<!-- Last updated: 2026-04-10 -->

## Project Identity

| Field | Value |
|-------|-------|
| Name | The Abyss |
| Type | AI-native Turborepo monorepo |
| Author | Dr. Ferdi Iskandar (Claudesy) |
| Email | ferdi@sentra.ai |
| License | UNLICENSED (private) |
| Engine | Node ≥22, pnpm ≥9 |
| Build | Turborepo v2 |

## Ecosystem Map

| Division | Path | Purpose |
|----------|------|---------|
| healthcare | `apps/healthcare/` | Patient-facing clinical apps — highest compliance |
| academic | `apps/academic/` | Clinical education and evaluation |
| community | `apps/community/` | Public tools and Claudesy brand |
| coorporate | `apps/coorporate/` | Sentra brand and DevOps portal |
| orchestrator | `apps/orchestrator/` | AI coordination layer |
| prototype | `apps/prototype/` | Experimental sandbox |
| packages | `packages/` | Shared libraries — widest blast radius |
| infrastructure | `infrastructure/` | IaC — Chief-only execution |
| flows | `flows/` | LangFlow AI workflow definitions |

## Documentation Systems

| System | Path | Purpose |
|--------|------|---------|
| Agent memory | `.agent/sessions/` | Session logs and audit trail |
| ADR | `docs/adr/` | Architectural decision records |
| Agent memory | `.agent/` (per project) | Per-session context, progress, lessons |
| Cursor rules | `.cursor/rules/` | IDE-scoped coding rules |

## CI/CD

GitHub Actions: `.github/workflows/ci.yml`
Pipeline: verify → build → test → lint → security → flows

## Hard Constraints

- `terraform apply` — Chief only, never agent-executed
- Patient data (PHI/PII) — absolute prohibition in logs, commits, fixtures
- Security scan — must pass before any healthcare PR
- JET Protocol J5 hard gate — no execution before "GO"
- Session logs — `.agent/sessions/` must be updated
