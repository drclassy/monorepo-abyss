# Troubleshooting Guide
# Sentra Healthcare AI — All Projects

> Real errors, real fixes. Every entry here happened in production CI.
> For the underlying rules see [STANDARD.md](./STANDARD.md).
> For the pre-push gate see [CHECKLIST.md](./CHECKLIST.md).

---

## Error 1: ERR_PNPM_LOCKFILE_CONFIG_MISMATCH

**Full error:**
```
ERR_PNPM_LOCKFILE_CONFIG_MISMATCH: The current "overrides" configuration
doesn't match the value found in the lockfile
```

**When it occurs:** `pnpm install --frozen-lockfile` in CI, or `pnpm install` locally after
a `package.json` change adds new `pnpm.overrides` entries.

**Root cause:** `pnpm-lock.yaml` was generated (or last committed) before the new override
entries were added to `package.json`. The lockfile snapshot and current config are out of sync.

**Incident references:** sentra-assist Apr 2026 — commits 3c79f62, 06a39c6.

**Fix:**

```bash
# 1. Create isolated temp directory (OUTSIDE the monorepo)
mkdir -p /tmp/sa-lockgen
cp /path/to/project/package.json /tmp/sa-lockgen/

# 2. Generate clean lockfile
cd /tmp/sa-lockgen
pnpm install --no-frozen-lockfile
# Note: WXT postinstall errors are safe to ignore — lockfile still generates

# 3. Copy back
cp /tmp/sa-lockgen/pnpm-lock.yaml /path/to/project/pnpm-lock.yaml

# 4. Verify override count
grep "overrides:" /path/to/project/pnpm-lock.yaml
# Must match pnpm.overrides count in package.json

# 5. Commit
cd /path/to/project
git add pnpm-lock.yaml
git commit -m "fix(ci): regenerate pnpm-lock.yaml — sync overrides"
```

**Do NOT:** regenerate the lockfile from inside the monorepo root — root `overrides` will
pollute the lockfile and cause mismatch when the project is cloned standalone.

---

## Error 2: ESLint Fails on Auto-Generated Files

**Full error (sample):**
```
d:\...\docs\api\assets\search.js
  1:1  error  'window' is not defined  no-undef
  1:1  error  'document' is not defined  no-undef
  ... (361 errors total)
```

**When it occurs:** After running TypeDoc (or any doc generator) without `docs/api/`
in `.gitignore`. The generated JS files contain browser globals that ESLint flags as
undefined in Node.js mode.

**Root cause:** Auto-generated files were committed to git. ESLint has no exclude rule
for `docs/`. Once committed, CI lint runs on every push.

**Incident reference:** sentra-assist CI Apr 2026. 361 errors in `docs/api/assets/`.

**Fix — Step 1: Add ESLint ignore**

In `eslint.config.mjs`, add `'docs/**'` to the ignores array:

```javascript
{
  ignores: [
    '.output/**',
    '.wxt/**',
    'node_modules/**',
    'docs/**',        // ← ADD THIS
  ],
},
```

**Fix — Step 2: Add .gitignore entry**

```
# Auto-generated TypeDoc API documentation
docs/api/
```

**Fix — Step 3: Remove already-committed files**

```bash
git rm -r --cached docs/api/
git add .gitignore eslint.config.mjs
git commit -m "fix(lint): exclude auto-generated docs from ESLint and git"
```

---

## Error 3: Pre-Push Hook Fails — Path Resolution on Windows

**Full error:**
```
bash: \.git/hooks/pre-push.ps1: No such file or directory
```

**When it occurs:** After installing classy-devkit hooks via `generate.ps1` on Windows.
The bash wrapper uses a hardcoded literal backslash path that is invalid in bash.

**Root cause:** Hook template wrote `"\.git/hooks/pre-push.ps1"` — bash interprets `\.git`
as a relative path from root, not the repo root.

**Fix:**

Edit `.git/hooks/pre-push` (the bash wrapper):

```bash
#!/usr/bin/env bash
GIT_HOOKS_DIR="$(git rev-parse --git-dir)/hooks"
if command -v pwsh &> /dev/null; then
    pwsh -NoProfile -ExecutionPolicy Bypass -File "$GIT_HOOKS_DIR/pre-push.ps1" "$@"
elif command -v powershell &> /dev/null; then
    powershell -NoProfile -ExecutionPolicy Bypass -File "$GIT_HOOKS_DIR/pre-push.ps1" "$@"
else
    bash "$GIT_HOOKS_DIR/pre-push.sh" "$@"
fi
```

---

## Error 4: Prettier Pre-Push Loop (CRLF on Windows)

**Symptom:** `pnpm format` runs and reformats files. Files are committed.
Pre-push hook runs Prettier check again — still fails. Loop repeats indefinitely.

**Root cause:** Windows git `autocrlf=true` converts LF → CRLF after checkout. Prettier
(configured for LF) reformats to LF. Git re-normalizes to CRLF. Prettier sees CRLF as
a diff again. Without `.gitattributes`, this loop never terminates.

**Incident reference:** sentra-assist Apr 2026. Required 26-file format commit +
`--no-verify` to escape.

**Fix — Permanent:**

Create `.gitattributes` in project root:

```
* text=auto eol=lf
*.ps1 text eol=crlf
*.bat text eol=crlf
*.cmd text eol=crlf
```

Then renormalize the entire working tree:

```bash
git add --renormalize .
git commit -m "chore: normalize line endings via .gitattributes"
```

**Fix — Emergency (escape the loop):**

```bash
git push --no-verify
# Then immediately add .gitattributes and renormalize
```

---

## Error 5: Incomplete Lockfile from External Agent

**Symptom:** CI passes locally but fails with override mismatch. Git log shows lockfile
was modified by an external agent (Codegeex, Copilot, etc.).

**What a broken lockfile looks like:**

```yaml
lockfileVersion: '9.0'
overrides:
  vite: ^latest        ← WRONG: not pinned
  '@vitejs/plugin-react': ^latest   ← WRONG: only 2 of 9 overrides
```

**Root cause:** External agent generated lockfile without installing all dependencies,
or used approximate versions instead of pinned resolutions.

**Incident reference:** sentra-assist Apr 2026. Codegeex-generated lockfile had 3 lines
and `"^latest"` version strings. Force-push required.

**Fix:**

Regenerate from `/tmp/` following Error 1 fix procedure. **Never accept a lockfile
from an external agent without verifying:**

1. `grep "overrides:" pnpm-lock.yaml` returns correct count
2. All versions are pinned (no `^`, `~`, or `latest`)
3. `pnpm install --frozen-lockfile` succeeds locally

---

## Error 6: classy-devkit Script Not Found

**Full error:**
```
pwsh : Cannot find path '...\bootstrap.ps1' because it does not exist.
```

**Root cause:** classy-devkit README documents `bootstrap.ps1` but the actual entry
point script is `generate.ps1`.

**Fix:**

```powershell
# Correct command — use generate.ps1, not bootstrap.ps1
pwsh -File D:\Devop\classy-devkit\generate.ps1 -target D:\Devop\path\to\project -stack NODE
```

**Stacks available:** `NODE`, `PYTHON`, `GO`, `DOTNET`

---

*Maintained by Classy — dr. Ferdi Iskandar*
*Last updated: April 2026*
