# Rule: TypeScript and React Conventions

**Apply: Specific Files — `*.ts`, `*.tsx`, `*.mts`, `tsconfig*.json`,
`package.json`**

## TypeScript baseline

- Node 20 LTS minimum, ESM by default.
- `tsconfig.json` has:
  ```json
  {
    "compilerOptions": {
      "strict": true,
      "noUncheckedIndexedAccess": true,
      "noImplicitOverride": true,
      "exactOptionalPropertyTypes": true,
      "moduleResolution": "bundler",
      "target": "ES2022"
    }
  }
  ```
- `any` is forbidden. Use `unknown` and narrow.
- Discriminated unions over enums.
- Validate any data crossing a boundary with `zod`.

```ts
import { z } from 'zod'

const PatientContext = z.object({
  ageYears: z.number().int().min(0).max(120),
  weightKg: z.number().positive().max(300),
  sex: z.enum(['male', 'female']),
  comorbidities: z.array(z.string()).default([]),
})
export type PatientContext = z.infer<typeof PatientContext>
```

## React

- Functional components + hooks only. No class components.
- Component files use `PascalCase.tsx`. One component per file unless tightly
  coupled.
- Props are typed inline or with a named type, never `any`:

```tsx
type DosageCardProps = {
  recommendation: ClinicalRecommendation
  onAccept: () => void
  onReject: (reason: string) => void
}

export function DosageCard({
  recommendation,
  onAccept,
  onReject,
}: DosageCardProps) {
  // ...
}
```

- Server components by default in Next.js. Mark client components with
  `"use client"` only when needed (state, effects, browser APIs).
- Avoid `useEffect` for derived state. Compute during render.
- Lift state up only as far as it needs to go. Prefer composition over
  prop-drilling.

## Styling

- Tailwind utility classes only. No CSS-in-JS, no global stylesheets except
  `globals.css` for resets and tokens.
- Design tokens come from `packages/ui-brand/`. Never hardcode hex values or
  pixel sizes in app code.
- Use `cn()` helper for conditional classes:

```tsx
import { cn } from "@sentra/ui-brand";

<button className={cn(
  "px-4 py-2 rounded-md",
  variant === "primary" && "bg-sentra-blue-600 text-white",
  disabled && "opacity-50 cursor-not-allowed",
)}>
```

## State and data fetching

- Server state: React Query (`@tanstack/react-query`) or Next.js server
  components.
- Client state: `useState`, `useReducer`, or Zustand for cross-component.
- No Redux unless the user explicitly requests it — usually a smell of
  over-architecting.
- All API calls go through `packages/api-client/`, which handles auth, retries,
  and Zod validation.

## Error handling

- Error boundaries at the route level, not per component.
- API errors surface as discriminated unions, not exceptions:

```ts
type Result<T> = { ok: true; data: T } | { ok: false; error: ApiError }
```

- Never silently swallow a clinical-data fetch error. Show a clinician-readable
  message and log it.

## Forbidden

- `any` (use `unknown`, then narrow).
- `as` casts except at validated boundaries.
- `// @ts-ignore` (use `// @ts-expect-error` with a reason if absolutely
  needed).
- Inline `style={{}}` (use Tailwind classes).
- `console.log` outside of `scripts/` and tests.
- Inline data fetching in components — use React Query or server components.
- HTML `<form>` in artifacts (causes hydration issues; use button onClick
  handlers).

## Tests

- `vitest` for unit tests. `playwright` for E2E.
- Component tests use `@testing-library/react`.
- Test files colocated: `Foo.tsx` → `Foo.test.tsx`.
- Test names describe behavior, not implementation:
  `renders disclaimer when confidence is low`.

## Accessibility

- Every interactive element has a clear role and accessible name.
- Color contrast meets WCAG AA. Use Sentra design tokens which are
  pre-validated.
- Never disable focus outlines without providing an alternative.
- Clinician-facing UIs are tested with keyboard-only navigation.
