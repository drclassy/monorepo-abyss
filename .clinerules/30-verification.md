# Verification Rules

## Always Verify

After code changes, run the smallest relevant verification command.

## Preferred Commands

Use the commands available in package.json or repo docs. Common examples:

- pnpm build
- pnpm typecheck
- pnpm test
- pnpm lint
- npm run build
- npm run typecheck
- npm test

## Report Format

After verification, report:

1. Command run
2. Pass/fail
3. Error summary if failed
4. Files changed
5. Any remaining risk

## No False Confidence

Do not claim success if verification was not run. If verification cannot be run,
explain why and provide manual verification steps.
