# Security Policy

This repository contains healthcare-adjacent software and governance assets.
Treat secrets, PHI, patient identifiers, and credentials as sensitive at all
times.

## Reporting

If you suspect a secret leak, PHI exposure, or unsafe data handling issue,
report it privately to `drferdiiskandar@sentrahai.com`.

Do not include secrets, PHI, patient data, or raw credentials in public issues,
pull requests, screenshots, logs, or repro artifacts.

## Repository protections

- `.husky/pre-commit` blocks commits on secret findings and potential PHI
  findings, then runs `pnpm exec lint-staged` on the staged files.
- `.github/workflows/security-scan.yml` runs dependency audit and secret
  detection in CI.

## Contributor expectations

- Remove or redact sensitive values before committing or pushing.
- Keep patient data out of issues, PR text, fixtures, screenshots, and logs.
- If a generated artifact contains sensitive data, regenerate it from sanitized
  inputs before sharing it.
