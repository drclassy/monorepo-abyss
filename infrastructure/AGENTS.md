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

_Confirm with:_ ✅ AGENTS.md read. Reading `.agent/` now.
