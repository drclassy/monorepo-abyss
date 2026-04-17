# CONTEXT.md — The Abyss (Monorepo Root)
<!-- Static. Update only when stack or architecture changes. -->
<!-- Last updated: 2026-04-13 -->

## Project Identity

| Field | Value |
|-------|-------|
| Name | The Abyss |
| Type | AI-native Turborepo monorepo |
| Author | Dr. Ferdi Iskandar (Avvcenna+) |
| Email | ferdi@sentra.ai |
| License | UNLICENSED (private) |
| Engine | Node ≥22, pnpm ≥9 |
| Build | Turborepo v2 |
| Root path | D:\Devop\abyss-monorepo\ |

## Ecosystem Map

| Division | Path | Purpose | Compliance |
|----------|------|---------|------------|
| platform | `apps/platform/` | Core infrastructure — orchestrator + portal | High |
| healthcare | `apps/healthcare/` | Patient-facing clinical apps | **Highest — PHI/PII strict** |
| academic | `apps/academic/` | Clinical education and evaluation | Medium |
| community | `apps/community/` | Public tools and Avvcenna+ brand | Standard |
| coorporate | `apps/coorporate/` | Sentra brand and DevOps portal | Standard |
| prototype | `apps/prototype/` | Experimental sandbox — agent-hermes | Low |
| packages | `packages/` | Shared libraries — widest blast radius | High |
| infrastructure | `infrastructure/` | IaC — Chief-only execution | **Critical** |
| flows | `flows/` | LangFlow AI workflow definitions | Medium |

## NestJS Applications

| App | Path | Pattern | Notes |
|-----|------|---------|-------|
| orchestrator | `apps/platform/orchestrator/` | CQRS mandatory | Saga Engine |
| sentra-portal | `apps/platform/sentra-portal/` | Standard REST | Clinical Dashboard |
| referralink | `apps/healthcare/referralink/` | Standard REST | PHI compliance |
| sentra-assist | `apps/healthcare/sentra-assist/` | Standard REST | PHI compliance |
| sentra-main | `apps/healthcare/sentra-main/` | Standard REST | PHI compliance |

## Shared Packages

| Package | Path | Purpose |
|---------|------|---------|
| database | `packages/database/` | Prisma ORM — all apps route through here |
| ai-core | `packages/ai-core/` | Shared AI utilities |
| design-token | `packages/design-token/` | UI token system |
| shared-types | `packages/shared-types/` | Cross-app TypeScript types |

## Documentation Systems

| System | Path | Purpose |
|--------|------|---------|
| Agent memory | `.agent/` (per project) | Per-session context, progress, lessons, decisions, sessions/ |
| ADR | `docs/adr/` | Architectural decision records |
| Cursor rules | `.cursor/rules/` | IDE-scoped coding rules |
| Specs | `docs/specs/phase-4/` | Technical blueprints |

## CI/CD Pipeline

GitHub Actions: `.github/workflows/ci.yml`
Sequence: verify → build → test → lint → security → flows
Security scan mandatory before any healthcare PR merge.

## Hard Constraints

- `terraform apply` — Chief only, never agent-executed
- PHI/PII — absolute prohibition in logs, commits, fixtures, test data
- Security scan — must pass before any healthcare PR
- JET Protocol J5 — hard gate, no execution before explicit "GO"
- Session logs — `.agent/sessions/` must be updated every session
- All DB operations — must route through `packages/database`, no direct ORM in app code
