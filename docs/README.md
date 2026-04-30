# Docs index

This folder contains the repo's active documentation and a separate archive for
historical material.

## Active folders

| Folder | Purpose |
| --- | --- |
| `docs/adr/` | Architectural decision records that remain part of the active governance trail. |
| `docs/blueprint/` | Bootstrap and repo-pattern guidance for new workstreams. |
| `docs/guides/` | Operator-facing guides and onboarding documents that are still relevant. Start at `docs/guides/README.md`. |
| `docs/specs/` | Canonical product and integration specs that remain in active use. Start at `docs/specs/README.md`. |
| `docs/templates/` | Reusable templates for new guides, specs, and handoff documents. |

## Archive

Historical or no-longer-primary material now lives under `docs/archive/`.
Keep it for auditability, but do not add new working documents there unless the
material is explicitly archival.

See `docs/archive/README.md` for the archive map.

## Writing rules

- Use sentence case for titles and headings.
- Prefer lowercase kebab-case for new file names.
- Put canonical, living documentation in the active folders above.
- Move completed handoff bundles, one-off research notes, and obsolete
  handbook/export artifacts into `docs/archive/`.
- Keep links descriptive and update internal paths when documents are moved.

## Where new docs go

- New architectural decisions: `docs/adr/`
- New operational or onboarding guides: `docs/guides/`
- New canonical specifications: `docs/specs/`
- New reusable templates: `docs/templates/`

If a document is only useful as historical evidence after a task closes, place
it in `docs/archive/` instead of the active root.

## Local working docs

Agent-specific execution notes and temporary planning bundles may live under
`docs/superpowers/` locally, but they are not part of the pushed documentation
surface by default.
