# Commit Convention

> **Last updated:** 2026-05-13
> **Maintained by:** Ferdi Iskandar / Engineering Team

---

This repository follows [Conventional Commits](https://www.conventionalcommits.org/) to maintain a clear, machine-readable, and human-friendly commit history.

---

## Format

```
<type>(optional-scope): <short summary>

<body>

<footer>
```

| Section     | Required | Description                                             |
| ----------- | -------- | ------------------------------------------------------- |
| **type**    | Yes      | One of the allowed types below                          |
| **scope**   | Optional | Component, module, or area affected                     |
| **summary** | Yes      | Imperative mood, no period, max ~72 characters          |
| **body**    | Optional | Detailed explanation of what changed and why            |
| **footer**  | Optional | References to issues, breaking changes, or deprecations |

---

## Allowed Types

| Type       | Description                 | When to Use                                       |
| ---------- | --------------------------- | ------------------------------------------------- |
| `feat`     | New functionality           | User-facing feature, new endpoint, new component  |
| `fix`      | Bug fix                     | Defect resolution, regression fix                 |
| `docs`     | Documentation updates       | README, guides, comments, knowledge base content  |
| `refactor` | Non-functional code change  | Restructuring without behavior change             |
| `test`     | Test updates                | New tests, test fixes, test coverage improvements |
| `perf`     | Performance improvements    | Speed, memory, bundle size optimizations          |
| `chore`    | Tooling, infra, maintenance | Dependency bumps, CI config, build scripts        |

---

## Breaking Changes

Breaking changes must be indicated in the commit message with a `!` after type/scope and a `BREAKING CHANGE:` footer:

```
feat(api)!: remove legacy /api/chat endpoint

BREAKING CHANGE: The /api/chat route has been removed.
All consumers must migrate to /api/abby.
```

---

## PR Title Convention

Pull request titles should mirror the commit message summary:

```
feat(abby): add media-kit to knowledge base
```

Not:

```
Added some stuff for Abby
```

---

## Changelog Integration Rules

| Type       | In Changelog | Default Section |
| ---------- | ------------ | --------------- |
| `feat`     | Yes          | Features        |
| `fix`      | Yes          | Bug Fixes       |
| `perf`     | Yes          | Performance     |
| `revert`   | Yes          | Reverts         |
| `docs`     | No           | —               |
| `style`    | No           | —               |
| `refactor` | No           | —               |
| `test`     | No           | —               |
| `chore`    | No           | —               |

Messages with `BREAKING CHANGE:` appear in the Breaking Changes section.

---

## Good vs. Bad Examples

### Good

```
feat(abby): add contact-and-collaboration endpoint to knowledge base

Added routing logic for collaboration inquiries. Abby now asks
about the visitor's intent and directs them to the appropriate
contact channel.

Closes #45
```

```
fix(api): validate empty message payload in /api/abby

Previously, sending an empty message object would cause a 500
error. Now returns 400 with a descriptive message.
```

### Bad

```
fixed stuff
```

```
update
```

```
feat: big changes

changed a lot of things including the API, the UI, and the config
files. hope this works.
```

<!-- branding: meticulously crafted by Classy — commit conventions that bring clarity and consistency to collaborative development -->
