# dr Ferdi Iskandar Founder Website + Abby AI Assistant

> Editorial public website for dr Ferdi Iskandar, with an integrated AI assistant named Abby.

[![Status](https://img.shields.io/badge/status-active-brightgreen?style=flat-square)](.)
[![Version](https://img.shields.io/badge/version-0.1.0-orange?style=flat-square)](.)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![Next.js](https://img.shields.io/badge/next.js-15.5.15-black?style=flat-square&logo=next.js&logoColor=white)](.)
[![React](https://img.shields.io/badge/react-19.x-149eca?style=flat-square&logo=react&logoColor=white)](.)
[![Node](https://img.shields.io/badge/node-%3E%3D22.x-339933?style=flat-square&logo=node.js&logoColor=white)](.)

---

## Table of Contents

- [Overview](#overview)
- [Core Surfaces](#core-surfaces)
- [Architecture](#architecture)
- [Routes](#routes)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Knowledge Base](#knowledge-base)
- [AI Boundaries](#ai-boundaries)
- [Verification](#verification)
- [Roadmap](#roadmap)
- [License](#license)

---

## Overview

This repository contains the website application for dr Ferdi Iskandar. The site is intentionally structured as a founder dossier rather than a generic personal landing page: an editorial homepage, curated public routes, and an integrated AI assistant named Abby.

Abby helps visitors understand:

- who dr Ferdi Iskandar is
- his medical and hospital leadership journey
- his thinking about AI and healthcare
- his writings, speaking profile, works, and collaboration surfaces

The primary AI experience is centered on Abby, while a secondary chat endpoint remains available for the earlier guide flow.

---

## Core Surfaces

### 1 — Editorial Founder Website

The public website is designed as a structured reading experience rather than a simple brochure.

| Field                | Value                                                                        |
| -------------------- | ---------------------------------------------------------------------------- |
| **Primary audience** | Public visitors, media, partners, healthcare leaders, event organizers       |
| **Primary surface**  | Editorial homepage + public route set                                        |
| **Design language**  | Founder dossier, publication-grade hierarchy, institutional editorial layout |
| **Goal**             | Explain dr Ferdi Iskandar clearly and credibly                               |

---

### 2 — Abby AI Assistant

Abby is the personal AI assistant for dr Ferdi Iskandar's website.

| Field                | Value                                       |
| -------------------- | ------------------------------------------- |
| **Name**             | Abby                                        |
| **Role**             | Personal AI assistant for dr Ferdi Iskandar |
| **Default language** | Bahasa Indonesia                            |
| **Knowledge source** | Markdown files in `content/abby/`           |
| **Primary API**      | `/api/abby`                                 |

Abby is designed to feel warm, professional, concise, and reliable. Responses are normalized to plain text, and the assistant is positioned as a guide to dr Ferdi Iskandar's public profile, work, and collaboration surfaces rather than as a clinical decision engine.

---

### 3 — Secondary Chat Endpoint

The app still exposes a legacy chat endpoint.

| Field        | Value                                |
| ------------ | ------------------------------------ |
| **Route**    | `/api/chat`                          |
| **Provider** | NVIDIA API                           |
| **Status**   | Secondary                            |
| **Purpose**  | Earlier guide-style interaction path |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│              PUBLIC FOUNDER DOSSIER SITE            │
│      homepage · about · works · notes · speaking    │
└─────────────────────────────────────────────────────┘

  CONTENT LAYER
  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
  │ content/abby/*.md│  │ src/config/*.json│  │ system prompt .md │
  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘
           │                     │                     │
           └──────────────┬──────┴──────────────┬──────┘
                          ▼                     ▼
                ┌────────────────────────────────────┐
                │         ABBY KNOWLEDGE LAYER       │
                │ prompt + persona + relationship    │
                └────────────────┬───────────────────┘
                                 │
                                 ▼
                ┌────────────────────────────────────┐
                │            API: /api/abby          │
                │ rate limit · provider switch       │
                │ timeout · upstream error mapping   │
                └────────────────┬───────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
          ┌──────────────────┐      ┌──────────────────┐
          │ DeepSeek provider│      │ OpenAI provider  │
          └──────────────────┘      └──────────────────┘

  LEGACY LAYER
  ┌────────────────────────────────────────────────────┐
  │ API: /api/chat  ->  NVIDIA provider (legacy path) │
  └────────────────────────────────────────────────────┘
```

---

## Routes

| Route          | Type        | Purpose                      |
| -------------- | ----------- | ---------------------------- |
| `/`            | Public page | Editorial homepage           |
| `/about`       | Public page | Full founder profile         |
| `/works`       | Public page | Selected systems and works   |
| `/notes`       | Public page | Writing / notes surface      |
| `/speaking`    | Public page | Speaking profile             |
| `/cv`          | Public page | CV and credentials surface   |
| `/api/abby`    | API         | Main Abby assistant endpoint |
| `/api/chat`    | API         | Legacy chat endpoint         |
| `/robots.txt`  | Generated   | Robots metadata              |
| `/sitemap.xml` | Generated   | Sitemap metadata             |

---

## Prerequisites

| Dependency | Version           | Purpose         |
| ---------- | ----------------- | --------------- |
| Node.js    | `>=22.0.0`        | Runtime         |
| pnpm       | workspace-managed | Package manager |
| Next.js    | `15.5.15`         | App framework   |
| React      | `19.x`            | UI runtime      |

Within the monorepo, this app lives at:

```txt
apps/corporate/ferdiiskandar
```

---

## Installation

### 1 — From the monorepo root

```bash
pnpm install
pnpm --filter @the-abyss/ferdiiskandar dev
```

### 2 — From the app directory

```bash
cd apps/corporate/ferdiiskandar
pnpm dev
```

### 3 — Build locally

```bash
pnpm build
```

Important:

- `pnpm build` is protected by `scripts/next-runtime-guard.mjs`
- build will be blocked if `next dev` is still active in the same app workspace

---

## Configuration

Environment variables come from `.env.example`.

```env
# AI Provider selection: "deepseek" (default) or "openai"
AI_PROVIDER=deepseek

# DeepSeek (required when AI_PROVIDER=deepseek)
DEEPSEEK_API_KEY=
DEEPSEEK_BASE_URL=https://api.deepseek.com
ABBY_MODEL=deepseek-chat

# OpenAI (required when AI_PROVIDER=openai)
# OPENAI_API_KEY=
# ABBY_MODEL=gpt-4o-mini

# Legacy — used only by /api/chat (ChatGuide). Not required for Abby.
NVIDIA_API_KEY=
```

### Provider behavior

| Mode                   | Endpoint    | Notes                   |
| ---------------------- | ----------- | ----------------------- |
| `AI_PROVIDER=deepseek` | `/api/abby` | Default Abby provider   |
| `AI_PROVIDER=openai`   | `/api/abby` | Alternate Abby provider |
| `NVIDIA_API_KEY`       | `/api/chat` | Legacy only             |

---

## API Reference

| Endpoint    | Method | Description                     |
| ----------- | ------ | ------------------------------- |
| `/api/abby` | `POST` | Main Abby conversation endpoint |
| `/api/chat` | `POST` | Legacy chat endpoint            |

### Example — POST `/api/abby`

```json
// Request
{
  "message": "Siapa dr Ferdi Iskandar?",
  "visitorMode": "public_visitor",
  "history": []
}

// Response
{
  "reply": "dr Ferdi Iskandar adalah dokter, pemimpin rumah sakit, dan founder yang membangun karya di persimpangan healthcare, leadership, dan artificial intelligence."
}
```

### `/api/abby` operational behavior

- rate limit per IP
- provider switching via env
- request validation
- timeout protection
- upstream auth / rate-limit / service error mapping
- plain-text output normalization

### `/api/chat` operational behavior

- NVIDIA-backed legacy path
- request validation
- timeout protection
- separate API key requirement

---

## Knowledge Base

Abby reads structured content from `content/abby/` and merges it with `src/prompts/abby.system-prompt.md`.

Current knowledge files:

- `personal-profile.md`
- `professional-journey.md`
- `speaking-profile.md`
- `thought-leadership.md`
- `projects-and-works.md`
- `media-kit.md`
- `contact-and-collaboration.md`
- `faq.md`

Supporting configuration:

- `src/config/abby.config.json`
- `src/config/abby.persona.json`
- `src/config/abby.relationship.json`
- `src/config/abby.knowledge-index.json`

---

## AI Boundaries

Abby is not a diagnosis engine and should not be represented as one.

| Boundary                               | Current Rule                 |
| -------------------------------------- | ---------------------------- |
| **Medical diagnosis**                  | Not allowed                  |
| **Personal treatment advice**          | Not allowed                  |
| **Clinical decision replacement**      | Not allowed                  |
| **Website guidance**                   | Primary purpose              |
| **Public profile explanation**         | Allowed                      |
| **General educational health context** | Allowed, non-diagnostic only |

The site currently represents:

- a founder website
- an AI-guided public profile experience
- a knowledge-driven assistant surface

It does not represent:

- an approved medical device
- a clinical triage system
- an EMR workflow engine

---

## Verification

Primary commands currently used in this app:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm security:deps
```

Current test coverage includes:

- sitemap contract
- site metadata contract
- site content contract
- next runtime guard behavior
- smoke tooling baseline

---

## Roadmap

| Target | Focus                                          | Status  |
| ------ | ---------------------------------------------- | ------- |
| v0.1.x | Founder dossier stabilization                  | Active  |
| v0.1.x | Abby knowledge refinement                      | Active  |
| v0.1.x | Public route hardening                         | Active  |
| Later  | Abby UX and visitor guidance refinement        | Planned |
| Later  | Founder content expansion across public routes | Planned |

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
  <sub>Founder website · Abby AI assistant · Editorial public surface · 2026</sub>
</div>
