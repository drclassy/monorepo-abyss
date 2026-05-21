---
name: problems-terminal-diagnostics
description: >-
  Use when debugging Cursor IDE Problems diagnostics, TypeScript/ESLint errors,
  terminal build or test failures, or when Chief attaches @problems / @terminal
  context. Guides read_lints usage, root-cause diagnosis, and app-scoped
  verification before claiming completion.
---

# Problems + Terminal Diagnostics

## When to use

- Chief reports errors visible in Cursor **Problems**.
- Chief shares **terminal** output from `pnpm`, `next`, `vitest`, `node`, or app scripts.
- Chief uses `@problems`, `@terminal`, or equivalent context attachments.
- A code/config edit may have changed TypeScript, ESLint, build, or test diagnostics.

## Facts

- The agent does not receive live Problems panel updates in the background.
- `read_lints` returns IDE-style diagnostics for selected paths when available.
- Empty `read_lints` output is useful evidence, not proof that build/test/typecheck passed.
- App scripts live in `package.json`; verify from the current file before running commands.

## Workflow (in order)

1. If Chief did not attach Problems/terminal text and the failing location is unclear, ask once for `@problems`, `@terminal`, or pasted lines.
2. Map symptoms to concrete files, lines, command names, and failing scripts.
3. Separate signal types:
   - IDE diagnostics: TypeScript, ESLint, extension diagnostics
   - Terminal failures: build, test, runtime, package manager, script output
4. State the likely root cause, affected files, smallest safe fix, and verification command before editing when diagnosis is the main task.
5. Make the smallest change that addresses the diagnosed failure.
6. After TypeScript/JavaScript/CSS-covered edits, call `read_lints` on touched files or a narrow folder when available.
7. Run relevant app-scoped verification:

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

8. Report actual evidence and remaining risk. Do not claim success from reasoning alone.

## App-Specific Guardrails

- Reply in Bahasa Indonesia and address Chief as `Chief in Command`.
- Keep changes inside the requested scope.
- Do not revert unrelated dirty files.
- If `pnpm build` is blocked by the runtime guard, check for an active `next dev` process before changing build config.
- For dependency/security issues, prefer app-scoped checks such as `pnpm security:deps`.

## Prompt template for Chief (copy-paste)

```text
@problems @terminal

Analisis error ini. Jangan edit file dulu. Tunjukkan penyebab, file terdampak, perbaikan minimal, dan perintah verifikasi.
```

## Output shape

Use this shape:

- Symptom
- Root cause hypothesis
- Files
- Minimal fix
- Verification
- Residual risk
