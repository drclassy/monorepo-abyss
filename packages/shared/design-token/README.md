# Sentra Design System v1.0

Monorepo-ready implementation of the Sentra Artificial Intelligence 2026 brand
system.

## Packages

```txt
packages/
  design-token/   # @sentra/design-token: colors, typography, logo path, CSS variables, Tailwind preset
  sentra-ui/      # @sentra/ui: React UI primitives using the Sentra brand tokens
examples/
  next-tailwind/  # Minimal Next.js/Tailwind integration examples
```

## Install in Abyss Monorepo

Copy both folders into your repository:

```txt
abyss-monorepo/
  packages/
    design-token/
    sentra-ui/
```

Then add the packages to an app:

```bash
pnpm add @sentra/design-token @sentra/ui --filter <your-app-name>
```

For workspace usage, ensure root `pnpm-workspace.yaml` includes:

```yaml
packages:
  - 'apps/**'
  - 'packages/**'
```

## Global CSS

Import these once in `app/layout.tsx`, `app/globals.css`, or your app
entrypoint:

```ts
import '@sentra/design-token/css'
import '@sentra/ui/styles'
```

## Tailwind

Use the preset from `@sentra/design-token/tailwind`:

```ts
import sentraTailwindPreset from '@sentra/design-token/tailwind'

export default {
  presets: [sentraTailwindPreset],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    '../../packages/sentra-ui/src/**/*.{ts,tsx}',
  ],
}
```

## Basic Usage

```tsx
import { SentraLogo, SentraButton, SentraCard } from '@sentra/ui'

export function Header() {
  return (
    <SentraCard variant="dark">
      <SentraLogo tone="light" />
      <SentraButton>Open Intelligence Board</SentraButton>
    </SentraCard>
  )
}
```
