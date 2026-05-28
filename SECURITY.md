# Security policy

ABYSS contains healthcare-adjacent software, governance assets, and sensitive
development surfaces. Report suspected security or privacy issues privately.

## How to report

Send reports to `drferdiiskandar@sentrahai.com`.

Include:

- affected path, package, app, or workflow
- what you observed
- likely impact
- steps to reproduce or validate
- sanitized evidence only

If you are unsure whether something is security-sensitive, report it privately
first.

## What not to post publicly

Do not include any of the following in public issues, pull requests,
screenshots, logs, attachments, or demo artifacts:

- secrets, API keys, tokens, passwords, or raw credentials
- PHI, patient data, MRNs, DOBs, or clinical screenshots
- production access details or internal-only operational information
- raw dumps or generated artifacts that contain sensitive content

Use redacted evidence and sanitized repro steps whenever collaboration is
needed.

## What to expect after reporting

Maintainers will review reports privately and, as appropriate:

- acknowledge receipt
- triage the affected scope and severity
- ask for more sanitized detail if needed
- coordinate a fix and disclosure path

Do not open a public issue first for suspected security, privacy, or sensitive
data-handling problems.

## Operational reminders

- Local hooks and CI scans help catch secret and PHI exposure, but they are not
  a substitute for careful handling.
- If an AI-generated artifact contains sensitive content, do not upload it.
  Regenerate it from sanitized inputs or redact it before sharing.
