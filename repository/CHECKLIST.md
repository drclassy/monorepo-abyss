# Pre-Push Compliance Checklist
# Sentra Healthcare AI — All Projects

> Run this before every `git push`. All boxes must be checked.
> For automation: run `validate.ps1`. For fixes: see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md).

---

## Section A — Build Artifacts

- [ ] `.gitignore` contains `dist/`
- [ ] `.gitignore` contains `.output/`
- [ ] `.gitignore` contains `build/`
- [ ] `.gitignore` contains `docs/api/`
- [ ] `.gitignore` contains `docs/storybook/`
- [ ] `.gitignore` contains `node_modules/`
- [ ] `.gitignore` contains `.wxt/` (WXT projects only)
- [ ] `git status` shows no staged files from `docs/api/`, `dist/`, or `.output/`

---

## Section B — Lockfile Integrity

- [ ] `pnpm-lock.yaml` exists in project root
- [ ] `grep "overrides:" pnpm-lock.yaml` returns at least one result
- [ ] Override count in `pnpm-lock.yaml` matches `pnpm.overrides` count in `package.json`
- [ ] Lockfile was regenerated in `/tmp/` (not inside monorepo root) if any override was changed

---

## Section C — Line Ending Normalization

- [ ] `.gitattributes` exists in project root
- [ ] `.gitattributes` contains `* text=auto eol=lf`
- [ ] `.gitattributes` contains `*.ps1 text eol=crlf`

---

## Section D — ESLint Coverage

- [ ] `eslint.config.mjs` has `docs/**` in the `ignores` array
- [ ] `eslint.config.mjs` has `.output/**` in the `ignores` array
- [ ] `pnpm lint` exits with code 0

---

## Section E — Format Gate

- [ ] `pnpm format` produces no file changes (run twice to confirm idempotent)
- [ ] `git status` is clean after format run

---

## Section F — Agent Coordination

- [ ] `.agent/HANDOFF.md` is up to date with current session plan
- [ ] `.agent/PROGRESS.md` reflects completed work
- [ ] No other agent has an open task on this file/branch (check `.agent/HANDOFF.md` owner field)

---

## Section G — Commit Hygiene

- [ ] Commit message follows Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`)
- [ ] No `.env.local`, credentials, or PHI/PII in staged files
- [ ] Commit trailer present: `Agent: Claude · Phase: Execution · Handoff: [session-id]`

---

## Quick Pass (run validate.ps1)

```powershell
# From any project root:
../../../repository/validate.ps1

# Or target-specific:
../../../repository/validate.ps1 -check gitignore
../../../repository/validate.ps1 -check lockfile
../../../repository/validate.ps1 -check gitattributes
../../../repository/validate.ps1 -check eslint
```

---

*Maintained by Claudesy — dr. Ferdi Iskandar*
*Last updated: April 2026*
