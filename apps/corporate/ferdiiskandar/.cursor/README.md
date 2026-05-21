# Cursor — Ferdiiskandar App

Architected and built by dr Classy

This directory contains app-local Cursor configuration for:

`D:\Devops\abyss-monorepo\apps\corporate\ferdiiskandar`

Cursor best-practice baseline used here:

- Keep persistent instructions in small project rules instead of one overloaded file.
- Use `.mdc` frontmatter with `description`, `globs`, and `alwaysApply`.
- Keep always-on rules limited to identity, communication, scope, and repo safety.
- Scope technical rules with `globs` so the agent loads relevant context only when needed.
- Keep `AGENTS.md` as the highest-density project contract and use `.cursor/rules` as Cursor-specific routing.
- Keep hooks fail-open and advisory; hooks should not block local work or mutate source files.

## Rules

| Rule                                                                                         | Purpose                                                               |
| -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| [`00-ferdiiskandar-operating-contract.mdc`](./rules/00-ferdiiskandar-operating-contract.mdc) | Always-on communication, JET, scope, and repository boundary contract |
| [`10-architecture-boundaries.mdc`](./rules/10-architecture-boundaries.mdc)                   | App/module ownership, import direction, and integration separation    |
| [`20-next-react-typescript.mdc`](./rules/20-next-react-typescript.mdc)                       | Next.js, React, TypeScript, and test conventions                      |
| [`30-editorial-design-system.mdc`](./rules/30-editorial-design-system.mdc)                   | Editorial visual language and UI/content direction                    |
| [`40-problems-terminal-diagnostics.mdc`](./rules/40-problems-terminal-diagnostics.mdc)       | Problems, terminal, `read_lints`, and verification workflow           |
| [`50-verification-and-diff-hygiene.mdc`](./rules/50-verification-and-diff-hygiene.mdc)       | Verification, diff hygiene, rollback, and reporting                   |
| [`60-security-dependencies-and-data.mdc`](./rules/60-security-dependencies-and-data.mdc)     | Secrets, dependency, privacy, and external integration rules          |

## Skills

- [`problems-terminal-diagnostics`](./skills/problems-terminal-diagnostics/SKILL.md)
  Use for IDE Problems, terminal failures, build/test errors, or Chief-provided `@problems` / `@terminal` context.

## Hooks

- [`hooks.json`](./hooks.json) registers `postToolUse` for monorepo-root usage.
- [`post-tool-use-diagnostics-reminder.mjs`](./hooks/post-tool-use-diagnostics-reminder.mjs) emits advisory context after write-style tools so the agent refreshes diagnostics when relevant.

## Maintenance

- Add a new rule only when it has a distinct trigger or file scope.
- Prefer updating `AGENTS.md` for durable project policy and `.agent/*` for operational handoff.
- Do not store secrets, scratch logs, model keys, or machine-local credentials in `.cursor`.
