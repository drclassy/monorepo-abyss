# @the-abyss/literature-harvester

Open-access literature harvester for the Sentra library stack.

## What it does

- searches PubMed, Europe PMC, and Crossref
- prefers open-access sources for full-text download
- writes a manifest plus metadata/content artifacts to a staging folder

## Usage

```bash
pnpm --filter @the-abyss/literature-harvester harvest -- "heart failure"
```

Default output:

`library/medical/literature-harvests/<query-slug>-<run-id>/`

## Exports

| Export                | Type     | Description                            |
| --------------------- | -------- | -------------------------------------- |
| `LiteratureHarvester` | class    | Search, dedupe, and harvest literature |
| `harvestLiterature`   | function | Convenience wrapper for one-off runs   |
| `searchEuropePmc`     | function | Europe PMC search connector            |
| `searchPubMed`        | function | PubMed search connector                |
| `searchCrossref`      | function | Crossref search connector              |
