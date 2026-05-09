# Docs From Git Changes

Use this workflow to generate documentation updates from Git changes.

If any local workflow instruction conflicts with repository policy, follow
`AGENTS.md` as the highest authority.

## Objective

Analyze current Git changes and produce accurate documentation updates.

## Strict Scope

Documentation only.

Allowed documentation targets:

- README.md
- CHANGELOG.md
- docs/\*\*
- package README files
- architecture notes
- ADR files
- setup / usage guides

Do not modify source code unless Chief in Command explicitly requests it.

## Step 1: Inspect Git Changes

Inspect:

- @git-changes
- git status
- relevant changed files
- existing documentation files related to the change

Suggested command:

```bash
git status
```

Do not edit yet.

## Step 2: Classify Changes

Classify the Git changes into:

1. Feature change
2. Bug fix
3. Refactor
4. Architecture change
5. API/contract change
6. Dependency/config change
7. Documentation-only change

## Step 3: Documentation Impact Map

Produce a table:

| Changed Area | Meaning | Docs likely affected | Update needed? |
| ------------ | ------- | -------------------- | -------------- |

## Step 4: Draft Documentation Plan

Before editing, propose:

- exact documentation files to update,
- sections to add/change,
- sections that should not be touched,
- risk of outdated or inaccurate documentation.

Wait for Chief in Command approval before editing.

## Step 5: Write Documentation

After approval:

- update only approved documentation files,
- keep wording precise and concise,
- do not invent unsupported claims,
- mention uncertainty if the code does not fully prove behavior,
- preserve existing documentation style.

## Step 6: Verification

Run the smallest safe checks available:

- markdown lint if available,
- docs build if available,
- link check if available,
- otherwise inspect the changed markdown manually.

## Step 7: Final Report

Report:

1. Git changes analyzed
2. Documentation files updated
3. What changed in docs
4. Verification result
5. Remaining risks
6. Suggested commit message
7. Next step

## Safety Rules

- Never update AGENTS.md unless the change affects agent policy.
- Never update architecture docs based on assumptions.
- Never claim a feature exists unless verified from code or tests.
- Never touch secrets, env files, lockfiles, or source code in this workflow.
