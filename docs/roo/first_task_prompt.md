# First Safe Task Prompt

Use this after installing the pack.

```text
Use Sentra Search mode.

Mission:
ABYSS-PACKAGE-CLEANUP-READINESS-001

Objective:
Analyze cleanup readiness for `packages/shared` only.

Scope:
- Read package.json files
- Find import/reference usage
- Find docs/config references
- Identify orphan candidates
- Identify verification commands

Non-scope:
- Do not edit files
- Do not rename files/folders
- Do not touch packages/sentra/**
- Do not modify lockfiles
- Do not modify clinical logic
- Do not run destructive commands

Output:
1. Summary
2. Evidence table
3. Risk classification
4. Recommended next action
5. One safe next command
```
