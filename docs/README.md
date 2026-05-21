# Docs index

This folder contains the repo's active documentation. Historical execution
notes and agent session records belong under `.agent/`, not `docs/`.

## Repo-wide entrypoints

- Root repo overview: `README.md`
- Current executive repo snapshot: `SENTRA_CURRENT_STATE.md`
- Current audit baseline: `ABYSS_CURRENT_STATUS_REPORT.md`

## Active folders

| Folder | Purpose |
| --- | --- |
| `docs/adr/` | Architectural decision records that remain part of the active governance trail. |
| `docs/blueprint/` | Bootstrap and repo-pattern guidance for new workstreams. |
| `docs/guides/` | Operator-facing guides and onboarding documents that are still relevant. Start at `docs/guides/README.md`. |
| `docs/guides/implementation-plans/` | Numbered implementation plans still used as execution references. |
| `docs/handbook/` | Active local handbook pages used by the handbook launcher tooling. |
| `docs/legal/` | Reusable legal document templates. |
| `docs/specs/` | Canonical product and integration specs that remain in active use. Start at `docs/specs/README.md`. |
| `docs/specs/aadi-v2/` | Numbered AADI V2 and FHIR modernization specs. |
| `docs/specs/clinical-trajectory-v1/` | Clinical Trajectory source documents retained as product context. |
| `docs/templates/` | Reusable templates for new guides, specs, and handoff documents. |

Other retained folders currently present on disk:

- `docs/architecture/` for older architecture-specific reference material.
- `docs/roo/` for retained Roo and workflow reference material.

## Writing rules

- Use sentence case for titles and headings.
- Prefer lowercase kebab-case for new file names.
- Put canonical, living documentation in the active folders above.
- Move completed handoff bundles and one-off research notes into `.agent/`
  session or report records instead of `docs/`.
- Keep links descriptive and update internal paths when documents are moved.

## Where new docs go

- New architectural decisions: `docs/adr/`
- New operational or onboarding guides: `docs/guides/`
- New canonical specifications: `docs/specs/`
- New reusable templates: `docs/templates/`

If a document is only useful as historical evidence after a task closes, keep it
under `.agent/` instead of the active docs tree.

## Local working docs

Agent-specific execution notes and temporary planning bundles belong under
`.agent/`, unless they are promoted into a numbered guide, spec, or
implementation plan.
