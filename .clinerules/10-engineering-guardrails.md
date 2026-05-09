# Sentra Engineering Guardrails

## Scope Discipline

- Implement only the requested task.
- Do not perform opportunistic refactors.
- Do not rename public APIs, folders, packages, or exported types unless
  explicitly requested.
- Do not change formatting across unrelated files.

## Architecture Boundaries

- Keep package boundaries clean.
- Avoid circular dependencies.
- Keep infrastructure, product logic, UI, AI logic, OCR, RAG, database writes,
  and external integrations separated unless the task explicitly requires
  integration.
- Prefer typed contracts/interfaces between modules.

## Dependency Policy

- Do not add dependencies by default.
- If a dependency is necessary, explain:
  - why existing code cannot solve it,
  - package name,
  - expected benefit,
  - risk,
  - rollback path.

## TypeScript / React Rules

- Prefer explicit types at module boundaries.
- Avoid `any` unless justified.
- Keep components small and composable.
- Follow existing Tailwind/design token conventions.
- Do not introduce global CSS unless scoped and justified.

## Healthcare AI Safety

- AI output must remain clinical decision support, not final diagnosis.
- Do not assume SATUSEHAT, BPJS, external government APIs, or cloud-only
  architecture unless explicitly requested.
- Separate diagnosis reasoning, epidemiology signal, RAG context, explanation,
  and human review layers.
