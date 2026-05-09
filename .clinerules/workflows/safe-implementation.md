# Safe Implementation

Use this workflow for any non-trivial code change.

If any local workflow instruction conflicts with repository policy, follow
`AGENTS.md` as the highest authority.

## Step 1: Inspect

Read the relevant files and identify the current implementation pattern.

## Step 2: Plan

Create a short plan with:

- objective,
- scope,
- non-scope,
- files to change,
- risks,
- rollback plan.

Do not edit files yet.

## Step 3: Ask Approval

Ask Chief in Command to approve the plan before implementation.

## Step 4: Implement

Apply the smallest safe change. Avoid unrelated refactors.

## Step 5: Verify

Run the most relevant verification command from package.json.

If verification fails, stop and explain the failure before making further
changes.

## Step 6: Report

Summarize:

- what changed,
- files changed,
- verification result,
- risks,
- next step.
