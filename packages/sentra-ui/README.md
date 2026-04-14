# @the-abyss/ui

Shared React component library for the Abyss monorepo. Built on Radix UI primitives with Tailwind CSS v4 utility classes. Used by `sentra-dashboard` and other frontend apps.

## Install

```bash
pnpm add @the-abyss/ui
```

## Usage

```typescript
import { Button, Card, Input, Badge, cn } from '@the-abyss/ui'

export function MyForm() {
  return (
    <Card className={cn('p-4', isActive && 'border-blue-500')}>
      <Input placeholder="Enter value" />
      <Button variant="default">Submit</Button>
      <Badge variant="secondary">Draft</Badge>
    </Card>
  )
}
```

## Exports

| Export | Description |
|--------|-------------|
| `cn` | `clsx` + `tailwind-merge` utility for conditional class names |
| `Button` | Radix-based button with variant support |
| `Card`, `CardHeader`, `CardContent`, `CardFooter` | Card layout components |
| `Input` | Styled text input |
| `Label` | Accessible form label (Radix) |
| `Badge` | Status badge with variants |
| Radix primitives | `@radix-ui/react-slot`, `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-label` |
| Lucide icons | Full `lucide-react` icon set re-exported |
