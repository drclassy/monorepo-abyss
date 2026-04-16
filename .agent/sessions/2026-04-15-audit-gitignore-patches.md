# .gitignore Patches — 2026-04-15

**Session:** 2026-04-15-audit
**Files audited:** 42 `.gitignore` files across monorepo

---

## Summary Table

| File | Status | Action |
|------|--------|--------|
| `.gitignore` (root) | NEEDS_UPDATE → **APPLIED** | Full rewrite 88→149 lines |
| `apps/community/avvcenna+-memory/.gitignore` | ADEQUATE | No change — `/.claude/` rule at line 54 already covers secrets |
| `apps/healthcare/sentra-assist/.gitignore` | OUT_OF_SCOPE | Submodule — audit separately |
| `apps/platform/sentra-portal/.gitignore` | ADEQUATE | Inherits root |
| `apps/healthcare/sentra-main/.gitignore` | ADEQUATE | Inherits root |
| `apps/healthcare/sentra-dashboard/.gitignore` | ADEQUATE | Inherits root |
| `apps/community/daf-website/.gitignore` | ADEQUATE | Prisma migrations negation correct |
| `apps/community/avvcenna+-transformer/.gitignore` | ADEQUATE | — |
| `apps/prototype/agent-hermes/.gitignore` (+ 12 nested) | ADEQUATE | Python + multi-lang aware; vendor submodules own their gitignores |
| Others (29 files) | ADEQUATE | Inherit root, no over-ignores detected |

**Net result:** Only root `.gitignore` rewritten. All child gitignores left intact.

---

## Root `.gitignore` — Applied Changes

### Before (88 lines, duplicative + gaps)
Original file: mixed ordering, duplicated `.env`/`.idea`/`.vscode` across sections (lines 16-17 vs 69-73), no explicit secret patterns (`*.pem`, `*.key`, etc.), no infrastructure patterns, no explicit EXEMPTION negations, over-ignored `.vscode/` (line 33) without whitelist for `extensions.json`.

### After (149 lines, structured + explicit)
Sectioned structure:
1. Header + golden rule
2. Secrets & env (expanded with 15 explicit patterns)
3. AI config — local only
4. Dependencies
5. Build artifacts
6. Runtime & logs
7. OS files
8. IDE & editor (with `!.vscode/extensions.json` whitelist)
9. Test coverage
10. Database & local stores (with `!apps/community/daf-website/prisma/dev.db` negation)
11. Infrastructure & Docker
12. Temporary & misc (preserves `flows/.langflow/`, codacy pattern)
13. **Explicit EXEMPTIONS section** (load-bearing trailing negations)

### Key additions
```diff
+ *.pem, *.key, *.p12, *.pfx, *.cert, *.crt
+ secrets.{json,yaml,yml}
+ credentials.json, service-account*.json, firebase-adminsdk*.json, google-credentials*.json
+ *.gpg, *.asc
+ .claude/settings.local.json (explicit — was too broad before)
+ .continue/, .copilot/, .lingma/, .roo/, .windsurf/, .codex/
+ .parcel-cache/, .vercel/, .eslintcache, .stylelintcache
+ .jest-cache/, .pytest_cache/, test-results/, playwright-report/
+ *.sqlite, *.sqlite3, *.db (with dev.db negation)
+ vector-store/local/, chroma-data/, pinecone-cache/, embeddings-cache/
+ docker-compose.override.yml, .docker/secrets/, terraform.tfstate*, .terraform/, *.tfvars
+ !.vscode/extensions.json (whitelist)
+ !.env.example, !.env.*.example (whitelist)
+ !.tfvars.example (future-proofing)

LOAD-BEARING NEGATIONS (trailing):
+ !.agent/, !.agent/**
+ !.claude/settings.json
+ !.cursor/rules/, !.cursor/rules/**, !.cursor/README.md, !.cursor/index.mdc
+ !pnpm-lock.yaml
```

### Preserved from original
- `flows/.langflow/`
- `packages/database/prisma/*.db*`
- `.cursor/hooks/edit-log.txt`, `.cursor/hooks/*.log`
- `.github/instructions/codacy.instructions.md`
- `*.pdb`, `tmp/`, `temp/`

---

## Child `.gitignore` Review Notes

### `apps/community/avvcenna+-memory/.gitignore:54`
```
/.claude/
```
Correctly scopes `.claude/` ignore to THIS package only (leading `/`). Does not affect root `.claude/settings.json` (EXEMPTED). **Leave as-is.**

### `apps/prototype/agent-hermes/` (13 nested gitignores)
Vendor submodules (hindsight, hermes-core, mission-control) own their gitignores — don't modify cross-submodule files. **Leave as-is.**

---

## Verification After Apply

All 8 verification tests pass (see `audit-clearance.md` for details):
- ✅ Zero tracked `.env*` (non-example)
- ✅ Zero tracked `*.pem/*.key/*.p12/*.pfx/*.cert/*.crt`
- ✅ Zero tracked `node_modules`
- ✅ Zero tracked credential patterns
- ✅ `pnpm-lock.yaml` preserved
- ✅ `.agent/tasks/TASKS.json`, `.cursor/README.md`, `pnpm-lock.yaml` still tracked
- ✅ `check-ignore` confirms EXEMPTED paths not ignored

---

*Applied in commit: see commit trailer `Handoff: 2026-04-15-audit`*
