# Governance Compliance Standard
# Sentra Healthcare AI — All Projects

> Rules derived from real incidents. Each rule has a **Incident:** reference.
> For fix commands see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md).
> For pre-push gate see [CHECKLIST.md](./CHECKLIST.md).
> For automation run [validate.ps1](./validate.ps1).

---

## 1. Monorepo / Standalone Hybrid

**Rule:** If a project lives inside a monorepo BUT also has its own GitHub repo,
it must maintain a fully isolated `pnpm-lock.yaml` with no monorepo root overrides.

**Why:** pnpm detects the workspace root and injects root-level `overrides` into the
lockfile. When the repo is cloned standalone on GitHub, those root overrides don't
exist — `pnpm install --frozen-lockfile` fails with `ERR_PNPM_LOCKFILE_CONFIG_MISMATCH`.

> **Incident:** sentra-assist CI, Apr 2026. Commit 3c79f62 added `vite` and
> `@vitejs/plugin-react` overrides to package.json but lockfile was regenerated
> inside monorepo — root overrides polluted it. All CI jobs failed.

**Compliance:**
- Regenerate lockfile in isolated `/tmp/` context (outside monorepo)
- Verify lockfile `overrides:` section matches `package.json` pnpm.overrides **exactly**
- Run `validate.ps1` before every lockfile commit

---

## 2. Build Artifacts Must Not Be Tracked in Git

**Rule:** Auto-generated directories must be in `.gitignore` before the first build
is ever run on a project.

**Required `.gitignore` entries:**
```
# Build outputs
.output/
dist/
build/

# Auto-generated docs (TypeDoc, Storybook, etc.)
docs/api/
docs/storybook/

# Package manager
node_modules/

# WXT extension framework
.wxt/
```

**Why:** Auto-generated JS (TypeDoc, minified bundles) contains browser globals
(`window`, `document`, `localStorage`) that fail ESLint Node.js rules.
Once committed, they pollute CI lint runs permanently.

> **Incident:** sentra-assist CI, Apr 2026. 361 lint errors in `docs/api/assets/`
> — auto-generated TypeDoc JS files were committed and not ignored.
> Required retroactive eslint.config.mjs patch + .gitignore fix.

**Compliance:**
- Run `validate.ps1 -check gitignore` on new projects before first build
- Also add `docs/**` to ESLint ignores in `eslint.config.mjs`

---

## 3. Platform Line Ending Normalization

**Rule:** Every repo must have a `.gitattributes` file that normalizes line endings.

**Required `.gitattributes`:**
```
* text=auto eol=lf
*.ps1 text eol=crlf
*.bat text eol=crlf
*.cmd text eol=crlf
```

**Why:** Windows git defaults to `autocrlf=true` — Prettier (configured for LF)
will fail format checks on files that git converted to CRLF. This causes
Prettier blocking pre-push hooks even on files that are "clean", resulting
in multiple redundant format commits.

> **Incident:** sentra-assist Apr 2026. After activating classy-devkit hooks,
> `pnpm format` was run but pre-push hook kept failing Prettier check.
> Required `--no-verify` to push + 26-file format commit to normalize endings.

**Compliance:**
- Copy from `templates/.gitattributes` when bootstrapping
- Run `git add --renormalize .` after adding `.gitattributes` to existing repos

---

## 4. Lockfile Hygiene Protocol

**Rule:** pnpm.overrides in `package.json` must always be in sync with
the `overrides:` section of `pnpm-lock.yaml`.

**Protocol:**
1. Any change to `pnpm.overrides` in `package.json` → regenerate lockfile immediately
2. Regenerate in `/tmp/<project-name>-lockgen/` to avoid monorepo pollution
3. Verify override count before committing
4. Never accept lockfile from another agent without verifying override completeness

**Why:** Two separate incidents. First: missing vite + @vitejs/plugin-react overrides.
Second: Codegeex generated an incomplete lockfile with only 2 overrides and
`"^latest"` version strings instead of pinned versions.

> **Incident:** sentra-assist CI, Apr 2026. Remote pnpm-lock.yaml from Codegeex
> had only 3 lines with vague versions. Force-push required to replace with
> correct 10-override lockfile generated from /tmp/sa-lockgen3.

**Compliance:**
- Run `validate.ps1 -check lockfile` after any dependency changes
- Check: `grep "overrides:" pnpm-lock.yaml` must list same count as `package.json`

---

## 5. Agent Coordination

**Rule:** When multiple agents (Claude, Codegeex, Gemini) are working on the same
repo, each agent must check `.agent/HANDOFF.md` for current state before acting.

**Why:** Without coordination, agents produce competing fixes for the same issue.
The one that pushes last wins — but may have incomplete or incorrect output.

> **Incident:** sentra-assist Apr 2026. Claude and Codegeex both fixed the
> lockfile issue independently. Codegeex pushed first with an incomplete fix
> (2 overrides, wrong versions). Claude had to force-push to correct.

**Compliance:**
- Always write to `.agent/HANDOFF.md` before starting a fix
- Always read `.agent/HANDOFF.md` before generating a fix
- After completing: update `.agent/PROGRESS.md`

---

## What This System Does NOT Cover

This standard is intentionally scoped. The following are handled by **classy-devkit**:
- CI/CD workflow injection (ci.yml, auto-fix.yml, auto-merge.yml)
- Pre-push validation hooks (TypeScript, ESLint, Prettier)
- Security scanning (security-scan.yml)
- Dependency automation (Renovate)

Do not duplicate classy-devkit configuration here.

---

*Maintained by Classy — dr. Ferdi Iskandar*
*Last updated: April 2026*
