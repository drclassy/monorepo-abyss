# Changesets

This directory is managed by
[Changesets](https://github.com/changesets/changesets).

## How to add a changeset

When making a change that should be released, run:

```bash
pnpm changeset
```

This will ask you:

1. Which packages changed
2. Whether it's a `major` / `minor` / `patch` bump
3. A short description of the change

A `.md` file will be created in this directory. Commit it with your PR.

## Release flow

1. Contributor opens PR with code changes + changeset file
2. PR merged to `master`
3. GitHub Actions automatically opens a **"chore(release): version packages"**
   PR
4. Chief reviews and merges the version PR
5. GitHub Release is created automatically with CHANGELOG

## UNICOM packages version together

All `@the-abyss/unicom-*` packages are in a `fixed` group — they always release
as the same version. A change to any UNICOM package bumps all of them together.
