# Repository Guidelines

## Monorepo Authority
Root [`AGENTS.md`](../../../../AGENTS.md) is the monorepo SSOT and repository policy authority.
If anything here conflicts with root governance, root wins.

## Project Structure & Module Organization
This repository is a Vite + React + TypeScript app with a small Node API layer.

- `src/` contains the UI, pages, hooks, and shared components.
- `src/sections/` holds page sections for the main landing experience.
- `src/components/ui/` contains reusable shadcn-style UI primitives.
- `api/` contains Hono-style server routes, middleware, and boot logic.
- `db/` stores schema, seed data, and migration helpers.
- `contracts/` defines shared types, constants, and error shapes.
- `public/` stores static assets such as logos and images.
- `blueprint/` and `doc/` contain design references, token exports, and supporting material.

## Build, Test, and Development Commands
Use the scripts in `package.json`:

- `npm run dev` starts the Vite dev server.
- `npm run build` builds the client and outputs `api/boot.ts` into `dist/` with runtime packages left external, so production must include `node_modules`.
- `npm run preview` serves the production build locally.
- `npm run lint` runs ESLint across the repo.
- `npm run check` runs TypeScript project checks.
- `npm test` runs Vitest in CI mode.
- `npm run format` formats the codebase with Prettier.
- `npm run db:generate`, `npm run db:migrate`, and `npm run db:push` manage Drizzle migrations.

## Coding Style & Naming Conventions
This project uses TypeScript, React 19, ESLint, and Prettier.

- Follow Prettier defaults here: 2-space indentation, semicolons, double quotes, and LF line endings.
- Use `PascalCase` for React components, `camelCase` for functions and hooks, and `kebab-case` for file names when creating route-like assets.
- Keep reusable UI in `src/components/` and feature-specific logic close to the page or section that uses it.
- Prefer the `@/` alias for app imports when it improves readability.

## Testing Guidelines
Vitest is configured for server-side tests under `api/**/*.test.ts` and `api/**/*.spec.ts`.

- Name tests after behavior, not implementation details.
- Keep tests focused on route handlers, validation, auth helpers, and other logic that can run in Node.
- Run `npm test` before opening a PR, and run `npm run check` when changing shared types or API contracts.

## Commit & Pull Request Guidelines
Git history is not available in this workspace, so use short, imperative commit messages such as `feat: add contact validation` or `fix: handle empty session`.

- Keep PRs scoped to one logical change.
- Include a clear summary, test notes, and screenshots for visible UI changes.
- Mention any config, env, or migration impact explicitly.

## Security & Configuration Tips
- Copy `.env.example` to `.env` before local development.
- Do not commit secrets, generated database files, or build output in `dist/`.
