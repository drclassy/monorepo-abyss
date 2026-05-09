# Audit Before Push

Use this workflow before pushing changes to GitHub.

## Step 1: Check Git State

Run:

```bash
git status
```

Summarize changed, staged, and untracked files.

## Step 2: Review Diff

Inspect the diff and identify:

- intended changes,
- unintended changes,
- risky files,
- secrets or credentials risk,
- unrelated modifications.

## Step 3: Verify

Run the available verification commands:

- typecheck,
- build,
- tests,
- lint,
- depending on package.json.

## Step 4: Commit Readiness Report

Provide:

- Summary of changes
- Risk assessment
- Verification result
- Suggested commit message
- Whether it is safe to push

Do not commit or push without explicit approval.

---

# Tips dan Trik Harian

## Prompt kecil untuk mulai task

```md
Chief in Command requests a safe scoped implementation.

Task: [isi task]

Rules:

- Start in Plan Mode.
- Do not edit files yet.
- Inspect only relevant files.
- Give a minimal plan.
- Mention verification command.
- Wait for approval.
```

## Prompt untuk debugging

`@problems @terminal`

Analyze this error.

Do not edit files yet. Find the root cause first. Show:

1. likely cause,
2. affected files,
3. smallest safe fix,
4. verification command.

## Prompt untuk refactor

Refactor only the requested module.

Constraints:

- No public API rename unless necessary.
- No unrelated formatting.
- No new dependency.
- Preserve existing tests.
- Add or update tests only if required.
- Run verification after changes.

## Prompt untuk mencegah Cline kebablasan

Stop after each major step and ask for approval. Do not continue automatically
if:

- more than 3 files need changes,
- dependency needs to be added,
- config files need editing,
- verification fails,
- architecture boundary is unclear.

## Model Strategy untuk Pro

| Task                     | Model             | Reasoning  |
| ------------------------ | ----------------- | ---------- |
| Baca file, jelaskan repo | gpt-5.2 / gpt-5.4 | Low/Medium |
| Edit kecil               | gpt-5.2           | Medium     |
