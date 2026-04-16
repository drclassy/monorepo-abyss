# Audit Scan Inventory — 2026-04-15

**Mission:** Pre-Push Monorepo Safety Audit
**Repo:** abyss-monorepo
**Agent:** Claude Opus 4.6 (1M)
**Chief:** Dr. Ferdi Iskandar (Avvcenna+)
**Classification:** JET Class C (git-tracking mutation)

---

## Scope Boundaries

**Audited:** Monorepo root + all `apps/*` (non-submodule) + `packages/*`
**Excluded from audit (submodules — separate repos):**
- `apps/academic/academic-solutions/` (submodule)
- `apps/coorporate/ferdiiskandar/` (submodule)
- `apps/healthcare/sentra-assist/` (submodule)

**Known non-issues (documented, not flagged):**
- `apps/platform/sentra-portal/.git-monorepo-excluded` — renamed nested `.git` folder, intentional
- `apps/prototype/agent-hermes/vendor/hindsight/setup-hooks.sh` — CRLF issue, vendor file

---

## Category A — Secrets & Environment Files

### Tracked in git
| Path | Status |
|------|--------|
| `apps/prototype/agent-hermes/.env.example` | ✅ Safe (example) |
| `apps/healthcare/sentra-dashboard/.env.example` | ✅ Safe (example) |

### Untracked on disk (sensitive — NOT in git, but present)
| Path | Notes |
|------|-------|
| `apps/community/avvcenna+-memory/.claude/settings.local.json` | ⚠️ Contains LIVE `MISTRAL_API_KEY` + `XAI_API_KEY` — already ignored by child `.gitignore:54` (`/.claude/`). **Action: rotate keys, not a git issue.** |
| `.claude/settings.local.json` | EXEMPTED by policy, verified no secrets, 154 bytes |
| `.claude/settings.json` | EXEMPTED; exists on disk (1322 bytes); currently UNTRACKED — Chief can `git add` if desired |

**Category A: 0 real leaks tracked. Clean.**

---

## Category B — AI Local Configs

### Tracked
- `.claude/settings.local.json` — EXEMPTED per monorepo policy

### Disk-only (correctly un-tracked)
- `.claude/settings.json` (root) — exists, untracked, negation active
- Various per-package `.claude/settings.local.json` — ignored by child gitignores

---

## Category C — Build Artifacts
| Pattern | Tracked count |
|---------|----|
| `node_modules/` | 0 ✅ |
| `dist/` | 0 ✅ |
| `build/` | 0 ✅ |
| `.next/` | 0 ✅ |
| `.turbo/` | 0 ✅ |
| `*.tsbuildinfo` | 0 ✅ |

---

## Category D — Runtime & Temp
All clean — 0 tracked `*.log`, `.DS_Store`, `Thumbs.db`, `*.swp`, etc.

---

## Category E — Test Coverage
All clean — 0 tracked `coverage/`, `.nyc_output/`, `playwright-report/`, `.jest-cache/`.

---

## Category F — IDE & Editor
- `.idea/` — 0 tracked
- `.vscode/extensions.json` — intentional (team tooling)
- `.vscode/settings.json` — 0 tracked

---

## Category G — Local Databases
| Path | Status |
|------|--------|
| `apps/community/daf-website/prisma/dev.db` | 🟡 Tracked (44KB SQLite, dev fixture) — preserved via negation in new `.gitignore` |
| Other `*.db`, `*.sqlite` | 0 tracked ✅ |

---

## Category H — Docker & Infrastructure
All clean — 0 tracked `docker-compose.override.yml`, `terraform.tfstate*`, `*.tfvars`, `.docker/secrets/`.

---

## Red Flag Scan Summary

**Real secret value scan** (patterns: `sk-ant-*`, `xai-*`, `AKIA*`, `-----BEGIN PRIVATE KEY-----`, `ghp_*`):
- 11 matches in `apps/prototype/agent-hermes/vendor/` — all TEST FIXTURES / DOCS EXAMPLES (hindsight, hermes-core vendored modules)
- 1 match in `apps/community/avvcenna+-transformer/website/public/slack-logo-icon.jpg` — JPEG binary bytes coincidentally match regex (false positive)

**No real secret values in non-vendor tracked files.**

---

## Filename Token Scan (Test 5)

20+ files match `(secret|password|token|api.?key)` in path — ALL are feature code (auth flows, telemedicine tokens, api-key guards, reset-password routes). **Zero secrets; this is expected feature nomenclature.**

---

## Summary Stats

| Metric | Value |
|--------|-------|
| `.gitignore` files found | 42 |
| Tracked files scanned | ~1,589 |
| Real secrets in tracked files | **0** |
| `.env*` tracked (non-example) | 0 |
| Key/cert files tracked | 0 |
| Credential files tracked | 0 |
| EXEMPTED paths verified | 4/4 (`.agent/`, `.claude/settings.json` path, `.cursor/rules/`, `pnpm-lock.yaml`) |
| Clearance | **SAFE TO PUSH** |

---

*Raw investigation artifacts: see companion files `audit-gitignore-patches.md`, `audit-clearance.md`, `remediation.sh`.*
