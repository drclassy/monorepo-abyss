# Global ABYSS Guardrails for Roo/ZooCode

## Always Protect

- `packages/sentra/**`
- clinical decision logic
- diagnosis engine contracts
- secrets and environment files
- PHI or patient-like data
- database migrations
- generated artifacts
- lockfiles unless dependency work is explicitly approved

## Always Prefer

- small scoped changes
- one package at a time
- read-only audit before implementation
- verification commands
- explicit rollback plan

## Never Assume

- SATUSEHAT dependency
- BPJS dependency
- cloud-only architecture
- Vertex AI as default stack
- external APIs unless explicitly scoped
