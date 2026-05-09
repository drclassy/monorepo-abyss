# @the-abyss/design-token

Design token registry untuk monorepo.

## Available token sets

- `./tokens.json` -> `packages/design-tokens/sentra-tokens.json`
- `./tokens.css` -> `packages/design-tokens/sentra-tokens.css`
- `./ferdi-editorial.json` ->
  `packages/design-tokens/ferdi-editorial-tokens.json`
- `./ferdi-editorial.css` -> `packages/design-tokens/ferdi-editorial-tokens.css`

## Ferdi editorial extraction

Token `ferdi-editorial` diekstrak dari
`apps/corporate/ferdiiskandar/app/globals.css` dengan cakupan:

- Light and dark palette
- Typography stacks and scale
- Radius, spacing, and layout breakpoints
- Motion and shadow system
- Component-level tokens (button, prompt box, chat)
