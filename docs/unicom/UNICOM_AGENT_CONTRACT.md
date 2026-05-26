# UNICOM Agent Contract

Last updated: 2026-05-27

## Agent Responsibilities

Setiap agent yang terhubung ke UNICOM wajib:

1. register identity dan capability;
2. join room secara eksplisit;
3. membaca objective, scope, non-scope, dan constraints task;
4. mengirim initial understanding sebelum aksi yang bermakna;
5. mengirim evidence untuk aksi yang mengubah state kerja;
6. meminta approval untuk aksi berisiko;
7. tidak mengirim completion claim tanpa evidence.

## Supported Agent Roles

- orchestrator
- builder
- tester
- quality
- git-summarizer
- research
- ui
- clinical-safety-reviewer
- documentation
- deployment-reviewer

## Required Capabilities

Capability bersifat deklaratif dan audit-friendly, misalnya:

- `room-read`
- `room-write`
- `task-decompose`
- `code-edit`
- `verification-run`
- `policy-review`
- `handoff`
- `approval-request`
- `completion-report`

## Completion Contract

Completion claim harus menyertakan:

- ringkasan hasil;
- daftar `evidenceIds`;
- verification summary;
- scope yang disentuh;
- residual risk bila ada.

Tanpa evidence yang terhubung, policy wajib memblok claim tersebut.
