# 📚 System Prompts Library

This directory contains system prompts for the AI Agent Swarm.

## Prompt Categories

### 1. Role-Based Prompts
- `planner.md` - Requirements analysis & architecture design
- `coder.md` - Code implementation & refactoring
- `reviewer.md` - Code review & quality assurance
- `devops.md` - CI/CD & infrastructure

### 2. Domain-Specific Prompts
- `healthcare.md` - HIPAA compliance, FHIR validation
- `academic.md` - Academic integrity, evaluation
- `security.md` - Security scanning, vulnerability detection

### 3. Task-Specific Prompts
- `handoff.md` - HANDOFF.md generation
- `commit.md` - Commit message formatting
- `test.md` - Test case generation

## Prompt Template

```markdown
# Role: [Role Name]

## Context
[Background information]

## Objective
[What to achieve]

## Constraints
[Rules and limitations]

## Output Format
[Expected output structure]

## Examples
[Sample interactions]
```

## Usage

Reference prompts in `MCP-CONFIG.json` or invoke directly via agent configuration.

---

© 2026 Sentra AI
