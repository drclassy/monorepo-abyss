# AGENTS.md — infrastructure

<!-- IaC & GitOps. Chief-only execution for destructive Terraform. -->
<!-- Last updated: 2026-04-12 | Owner: Chief | Projects: Sentra / The Abyss -->

---

## Monorepo root (SSOT)

Read the root [`AGENTS.md`](../AGENTS.md) first. **Root wins** on any conflict.

---

## Scope

This directory (`terraform/`, `docker/`, `argocd/`) defines **GCP
provisioning**, containers, and **GitOps** delivery for The Abyss.

---

## Hard gates (from root `AGENTS.md`)

- **`terraform apply`** and **`terraform destroy`** are **Chief-only**. Do not
  run from an agent session unless Chief explicitly authorizes.
- Align changes with **ADR** and safety review when touching production paths.

---

## Conventions

- Prefer **idempotent** modules and documented variables.
- **No secrets** in Git — use secret managers and CI-injected values.
- Document rollbacks and blast radius in `HANDOFF.md` / ADRs when scope is
  broad.

---

## Required Workflow (from root)

For every real task: (1) Read SSOT. (2) Read relevant code, docs, tests, config.
(3) Write brief notes before implementation. (4) Make the smallest complete
change. (5) Run the smallest relevant verification. (6) Recheck scope and diff.
(7) Report only after verification.

Hard gates: No SSOT read = do not implement. No verification = do not claim done.

---

## Git Safety (from root)

Allowed: `git status --short`, `git diff --stat`, `git diff`, `git log --oneline -n 10`.
Forbidden unless explicitly requested: `git reset`, `git clean`, `git push --force`, rewriting history.

---

_Confirm with:_ ✅ AGENTS.md read. Reading `.agent/` now.
