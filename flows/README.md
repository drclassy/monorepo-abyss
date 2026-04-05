# Placeholder files for flows
# Add your Langflow JSON exports here

## Structure

```
definitions/
├── diagnosis-flow.json
├── rag-ingestion.json
└── clinical-evaluation.json
```

## How to Sync Flows

1. Export flow from Langflow UI
2. Download JSON file
3. Run:
   ```bash
   pnpm abyss sync-flow ~/Downloads/flow.json --name "my-flow"
   ```

4. Flow will be validated and copied to this directory

---

© 2026 Sentra AI
