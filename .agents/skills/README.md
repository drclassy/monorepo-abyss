# 🧠 Agent Skills Directory

This directory contains modular skills for AI agents working in The Abyss monorepo.

## Structure

```
skills/
├── db-migration/
│   ├── skill.md
│   └── templates/
├── fhir-validator/
│   ├── skill.md
│   └── schemas/
├── ci-cd-pipeline/
│   └── skill.md
├── security-scanner/
│   └── skill.md
└── component-generator/
    └── skill.md
```

## Creating a New Skill

1. Create a new folder in `skills/`
2. Add `skill.md` with:
   - Purpose
   - Input/Output specification
   - Usage examples
3. Register in `MCP-CONFIG.json`

## Skill Template

```markdown
# Skill: [Skill Name]

## Purpose
[What this skill does]

## Input
[Required inputs]

## Output
[Expected outputs]

## Usage
[How to invoke]

## Examples
[Example invocations]
```

---

© 2026 Sentra AI
