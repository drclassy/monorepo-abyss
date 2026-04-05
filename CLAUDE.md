# The Abyss Monorepo — Project Context
<!-- Updated: April 2026 | Scope: abyss-monorepo specific rules & technical specs -->

## WHAT
Monorepo for Sentra Healthcare AI & The Abyss infrastructure platform.
PNPM workspace + Turbo repo. 2 interconnected products: `apps/` (healthcare AI) + `engine/` (infra platform).

## TECH STACK
- **Language**: TypeScript (strict mode), Python 3.x
- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Node.js, Express/FastAPI
- **Database**: PostgreSQL, Redis (port 6379 for tests)
- **AI**: Google Cloud / Vertex AI (`asia-southeast1` Jakarta)
- **Infra**: Docker, Railway, GCP Secret Manager
- **Package Manager**: `pnpm` ONLY (never npm/yarn)
- **Build Orchestration**: Turbo

## COMMANDS

```powershell
# Development
pnpm dev                    # Start all apps
pnpm -w run dev             # From monorepo root

# Testing & Verification
pnpm test                   # Run all tests
pnpm lint                   # ESLint across workspace
pnpm typecheck              # TypeScript strict check
pnpm build                  # Must pass before any commit

# Package Management
pnpm -w add <pkg>           # Add to workspace root
pnpm add <pkg> --filter <app> # Add to specific app
```

## DESIGN TOKENS (Sentra Healthcare AI)

| Token | Value | Usage |
|-------|-------|-------|
| `--color-accent` | `#eb5939` | Primary actions, highlights |
| `--color-audrey` | `#C4956A` | Secondary accents, warm tones |
| `--color-teal` | `#6B9B8A` | Success states, healthcare cues |
| `--color-text` | `#b7ab98` | Primary text (warm parchment) |
| `--color-bg` | `#0d0d0d` | Near-black background |
| `--font-primary` | `Inter` | Body & UI text |
| `--font-mono` | `JetBrains Mono` | Code, terminals |

Token files: `configs/design/website/`

## PROJECT STRUCTURE

```
abyss-monorepo/
├── apps/              # Deployable applications
│   ├── sentra/        # Sentra Healthcare AI (Next.js)
│   └── ...            # Other apps
├── engine/            # Infrastructure platform core
├── packages/          # Shared packages
│   ├── config-typescript/   # TS config presets
│   ├── config-eslint/       # ESLint config presets
│   └── ...            # UI components, utils
├── configs/           # Design tokens, shared configs
│   └── design/website/      # Brand design tokens
├── tooling/           # Dev tools, scripts
├── flows/             # Workflow definitions
├── infrastructure/    # IaC, Docker, deployment
├── .github/           # CI/CD, Claudesy-PR module
└── docs/              # Project documentation
```

## CODING STANDARDS

### TypeScript
- **Strict mode** — no `any`, use proper types or `unknown`
- ES modules only — never CommonJS (`require`)
- Functional components only — no class components
- Zod validation for ALL external input
- Co-locate styles with Tailwind — no inline `style={}`
- Max line length: 100 characters, 2-space indent

### General
- Conventional Commits: `feat(scope): description`
- Branch naming: `feat/`, `fix/`, `chore/`, `docs/`
- NEVER commit: `.env`, credentials, API keys, PII, patient data
- No `console.log` in production — use logger abstraction
- Fix existing file before creating new one

## PHI & DATA PRIVACY (NON-NEGOTIABLE)

- **NO PII** in logs, errors, git history, or test fixtures
- Healthcare AI outputs affecting clinical decisions MUST include confidence scores
- All patient data handled per ITE Law + PDPRI 2024
- Flag any compliance-relevant change immediately
- PHI protection at all layers — validate + encrypt

## MCP SERVERS (Active)

| Server | Purpose |
|--------|---------|
| Pieces | LTM search, Materials, Workspace timeline |
| Context7 | Up-to-date library docs |
| Notion | Project knowledge base |
| Linear | Issue tracking & sprint management |
| Vercel | Deployment status |
| Sentry | Error monitoring |

**Rule**: Use CLI tools (`gh`, `gcloud`, `pnpm`) over MCP when single command suffices.

## GOTCHAS

- Config packages (`config-typescript`, `config-eslint`) MUST exist in `packages/`
- `pnpm -w` flag required for workspace root commands
- Vertex AI quota: check `asia-southeast1` (Jakarta) regional first
- Sentra test suite requires local Redis on port 6379
- Windows Defender may block `.ps1` — run `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`
- NEVER use `process.env` directly in React — import from `lib/config.ts`
- PowerShell path separator `\` vs Python `/` — use `pathlib.Path`
- **SHELL**: PowerShell 7.6 (`pwsh`) ONLY — NEVER `bash`, `sh`, or `powershell` 5.x

## VERIFICATION CHECKLIST

Before declaring success, ensure:
```
[ ] pnpm build → success (0 errors)
[ ] pnpm lint → no violations
[ ] pnpm typecheck → pass
[ ] pnpm test → all passing
[ ] No PHI/PII exposed
[ ] Conventional commit format
[ ] PR linked to issue
```
