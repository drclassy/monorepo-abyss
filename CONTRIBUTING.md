# Contributing to The Abyss

Thank you for your interest in contributing to The Abyss monorepo!

## 📋 TABLE OF CONTENTS

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)

---

## 🎯 CODE OF CONDUCT

- Be respectful and inclusive
- Follow Avvcenna+ Workflow (HANDOFF.md, GO-Gate)
- Maintain traceability in all work
- Prioritize security and compliance

---

## 🚀 GETTING STARTED

### 1. Fork and Clone

```bash
git clone https://github.com/Avvcenna+/abyss-monorepo.git
cd abyss-monorepo
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Setup Environment

```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

### 4. Start Development

```bash
pnpm dev
```

---

## 📝 DEVELOPMENT WORKFLOW

### For AI Agents

1. **Read** [.agents/AGENTS.md](.agents/AGENTS.md)
2. **Create HANDOFF.md**
   ```bash
   pnpm abyss init-task "Your task title"
   ```
3. **Wait for GO approval**
   ```bash
   pnpm abyss go .agent/sessions/SESSION-... --by "Chief"
   ```
4. **Implement changes** following domain guidelines
5. **Run verification**
   ```bash
   pnpm lint
   pnpm test
   pnpm typecheck
   ```
6. **Commit with trailers**

   ```bash
   git commit -m "feat: your change

   Description of what changed

   Agent: your-agent
   Phase: 1
   Handoff: .agent/sessions/SESSION-.../HANDOFF.md"
   ```

### For Humans

1. Create feature branch
   ```bash
   git checkout -b feature/my-feature
   ```
2. Make changes
3. Follow HANDOFF.md workflow (recommended)
4. Commit and push
5. Create Pull Request

---

## ✍️ COMMIT GUIDELINES

### Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
Agent: <name>
Phase: <number>
Handoff: <path>
```

### Types

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Test additions or changes
- `chore:` Maintenance tasks
- `ci:` CI/CD changes
- `perf:` Performance improvements

### Examples

```bash
feat(healthcare): implement FHIR patient validation

- Add FhirValidator class
- Integrate with referralink-api
- Add unit tests

Agent: coder-agent
Phase: 3
Handoff: .agent/sessions/SESSION-2026-03-30-fhir/HANDOFF.md
```

```bash
fix(database): resolve Prisma client generation issue

Fixed missing Prisma client export in package.json

Agent: fix-agent
Phase: 2
```

---

## 🔀 PULL REQUEST PROCESS

### 1. Create PR

- Use descriptive title
- Link related issues
- Fill out PR template

### 2. Status Checks

All PRs must pass:

- ✅ CI build
- ✅ Tests
- ✅ Lint
- ✅ Security scan
- ✅ GO-Gate validation

### 3. Code Review

- At least 1 approval required
- CODEOWNERS review for sensitive areas
- Address all review comments

### 4. Merge

- Squash and merge for feature branches
- Rebase and merge for bug fixes
- Delete branch after merge

---

## 📚 ADDITIONAL RESOURCES

- [README.md](README.md) — Project overview
- [.agents/AGENTS.md](.agents/AGENTS.md) — Agent steering
- [docs/templates/HANDOFF.md](docs/templates/HANDOFF.md) — HANDOFF template
- [CHANGELOG.md](CHANGELOG.md) — Version history

---

## 🙏 THANK YOU!

Your contributions make The Abyss better for everyone.

---

© 2026 Sentra Artificial Intelligence
