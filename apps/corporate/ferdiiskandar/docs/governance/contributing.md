# Contributing Guide

> **Last updated:** 2026-05-13
> **Maintainer:** Ferdi Iskandar
> **Applies to:** `apps/corporate/ferdiiskandar`

---

## Welcome

Thank you for your interest in contributing to the dr Ferdi Iskandar founder website and Abby AI assistant. This guide covers everything you need to get started — from environment setup to pull request best practices.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Pull Request Requirements](#pull-request-requirements)
- [Branch Protection & Merge Strategy](#branch-protection--merge-strategy)
- [Documentation Standards](#documentation-standards)
- [Security Guidelines](#security-guidelines)
- [Code of Conduct](#code-of-conduct)
- [Getting Help](#getting-help)

---

## Prerequisites

| Tool    | Version                   | Installation                               |
| ------- | ------------------------- | ------------------------------------------ |
| Node.js | `>=22.0.0`                | [nodejs.org](https://nodejs.org/) or `nvm` |
| pnpm    | `>=9.0.0`                 | `corepack enable` or `npm i -g pnpm`       |
| Git     | Latest                    | [git-scm.com](https://git-scm.com/)        |
| IDE     | Any (VS Code recommended) | —                                          |

---

## Local Development Setup

### 1. Clone and install

```bash
# If working from the monorepo root
git clone <repo-url>
cd <repo-root>
pnpm install

# If working from the app directory
cd apps/corporate/ferdiiskandar
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` and add required values:

```env
# AI Provider: "deepseek" (default) or "openai"
AI_PROVIDER=deepseek

# DeepSeek credentials (if AI_PROVIDER=deepseek)
DEEPSEEK_API_KEY=your-key-here
DEEPSEEK_BASE_URL=https://api.deepseek.com
ABBY_MODEL=deepseek-chat

# NVIDIA credentials (legacy /api/chat only, optional)
NVIDIA_API_KEY=your-key-here
```

> **Important:** Never commit `.env.local` or any file containing secrets.

### 3. Run development server

```bash
pnpm dev
```

The app will be available at `http://localhost:3000`.

### 4. Verify setup

```bash
pnpm typecheck       # TypeScript type checking
pnpm lint            # ESLint
pnpm test            # Run Vitest
pnpm knip            # Dead-code detection
```

All commands should pass without errors before opening a pull request.

---

## Development Workflow

### Git Flow

1. **Create a branch** from `main` (or `develop` if your team uses it):

   ```bash
   git checkout -b feat/add-contact-form
   ```

2. **Make focused, small changes.** Each branch should address one concern or feature.

3. **Run quality gates before committing:**

   ```bash
   pnpm lint
   pnpm typecheck
   pnpm test
   ```

4. **Commit using [Conventional Commits](https://www.conventionalcommits.org/):**

   ```bash
   git add .
   git commit -m "feat(abby): add contact routing logic for collaboration inquiries"
   ```

5. **Push and open a Pull Request:**
   ```bash
   git push origin feat/add-contact-form
   ```

### Branch Naming Convention

| Prefix      | Use Case                       | Example                            |
| ----------- | ------------------------------ | ---------------------------------- |
| `feat/`     | New feature                    | `feat/contact-routing-form`        |
| `fix/`      | Bug fix                        | `fix/abby-rate-limit-race`         |
| `docs/`     | Documentation update           | `docs/update-abby-knowledge-base`  |
| `refactor/` | Code restructuring             | `refactor/extract-abby-middleware` |
| `chore/`    | Maintenance, tooling           | `chore/update-dependencies`        |
| `test/`     | Test additions or improvements | `test/add-abby-boundary-tests`     |

---

## Coding Standards

### Language & Framework

- **TypeScript** with strict mode enabled (`"strict": true` in `tsconfig.json`)
- **React 19** with App Router conventions
- **No Tailwind CSS** — use the existing custom CSS system with `.fi-*` scoped classes in `app/globals.css`
- **No CSS-in-JS libraries** unless explicitly approved

### Import Conventions

```typescript
// Named imports preferred
import { useSmoothScroll } from '@/lib/use-smooth-scroll'
import { AbbyWidget } from '@/components/AbbyWidget'

// Avoid default imports for shared modules
// ✅ Good
import { type NextRequest } from 'next/server'

// ❌ Avoid
// import NextRequest from 'next/server'
```

### React Best Practices

- Prefer **Server Components** by default (no `'use client'` directive unless interactivity is required)
- **Client Components** must declare `'use client'` at the top of the file
- Keep components small and single-responsibility
- Avoid unnecessary global state; prefer props and server-side data fetching
- Use `use memo` and `useCallback` only when profiling shows a benefit

### CSS Standards

- All UI classes use the `.fi-` prefix (Ferdi Iskandar)
- Follow existing section organization in `app/globals.css`
- New styles should be added in logical sections, not appended at the end
- Use CSS custom properties for reusable values
- Avoid inline styles except for dynamic values computed at runtime

### Framer Motion

- Used sparingly for key moments (hero, transitions, loading states)
- All animations must respect `prefers-reduced-motion`
- Prefer CSS animations where possible; use Framer Motion for complex sequences only

---

## Testing Requirements

### Test Runner

- **Vitest** (`^2.1.0`) with jsdom environment
- **@testing-library/jest-dom** for DOM assertions

### Test Conventions

| Requirement        | Details                                        |
| ------------------ | ---------------------------------------------- |
| Test file location | Same directory as source, or `tests/` mirror   |
| Test file naming   | `{module}.test.ts` or `{module}.test.tsx`      |
| Test structure     | `describe` → `it`/`test` → `expect`            |
| Coverage threshold | **80%** lines, functions, branches, statements |

### Running Tests

```bash
pnpm test            # Run once
pnpm test:watch      # Watch mode during development
pnpm test:coverage   # With coverage report
```

### Adding Tests for New Features

- Write tests **before** or alongside feature code (TDD encouraged)
- Focus on behavior, not implementation details
- Mock external services (AI providers, APIs) at the network or module level
- Include edge cases: empty input, malformed data, timeout scenarios

---

## Pull Request Requirements

### Before Opening a PR

- [ ] All tests pass (`pnpm test`)
- [ ] TypeScript type checking passes (`pnpm typecheck`)
- [ ] Linting passes with zero warnings (`pnpm lint`)
- [ ] Dead-code check passes (`pnpm knip`)
- [ ] No secrets or credentials in code or comments
- [ ] No unrelated changes in the same PR

### PR Description Template

```markdown
## Summary

One-paragraph summary of what this PR does and why.

## Changes

- [ ] Component/feature added
- [ ] Bug fix
- [ ] Documentation update
- [ ] Refactor
- [ ] Test coverage

## Testing

- [ ] Unit tests added/updated
- [ ] Manual testing performed
- [ ] No regressions in existing tests

## Screenshots / Demos

<!-- If applicable -->
```

### PR Review Process

1. **Self-review** — Author reviews own diff before requesting review
2. **Code review** — At least one approving review required
3. **CI checks** — All automated checks must pass
4. **Merge** — Squash merge preferred; rebase merge for multi-commit feature branches

---

## Branch Protection & Merge Strategy

| Branch         | Protection                                                        | Merge Method             |
| -------------- | ----------------------------------------------------------------- | ------------------------ |
| `main`         | Required: passing CI, at least 1 approval, no unresolved comments | Squash merge             |
| `develop`      | Required: passing CI                                              | Squash merge             |
| Feature/bugfix | Optional review encouraged                                        | Squash merge into parent |

---

## Documentation Standards

- **Code comments:** Explain _why_, not _what_. Avoid redundant comments like `// Import React`
- **README updates:** If the feature changes user-facing behavior, update `README.md`
- **Knowledge base:** If the change affects Abby's knowledge or behavior, update `content/abby/` files
- **Changelog:** Significant changes should be noted in `CHANGELOG.md`
- **Design docs:** Architectural changes should be documented in `docs/specs/` or `docs/plans/`

---

## Security Guidelines

- Never commit secrets, API keys, tokens, or credentials
- Use environment variables for all runtime configuration
- Validate and sanitize all user inputs, especially in API routes
- Report security vulnerabilities privately (see [SECURITY.md](SECURITY.md))
- Run `pnpm security:deps` regularly and before major releases

---

## Getting Help

- **Questions about codebase:** Open a GitHub Discussion
- **Bug reports:** Open a GitHub Issue with reproduction steps
- **Security concerns:** See [SECURITY.md](SECURITY.md) reporting process
- **Feature requests:** Open a GitHub Issue with use case and expected behavior

---

<!-- branding: meticulously crafted by Classy — developer documentation built with precision, clarity, and care for every contributor -->
