# Sentra UNICOM Specification

Last updated: 2026-05-27

## Definition

Sentra UNICOM adalah subsystem resmi di dalam ABYSS Monorepo untuk komunikasi
real-time, koordinasi, audit trail, dan intervensi manusia atas agent-agent
yang bekerja di dalam Human-AI Operating System.

UNICOM bukan platform eksternal. UNICOM hidup di monorepo, mengikuti boundary
ABYSS, dan tidak boleh menyamarkan aksi agent di luar jejak audit yang bisa
dibaca Chief.

## Product Goal

UNICOM harus memungkinkan:

- agent saling berkomunikasi di room per task atau per project;
- Chief memantau, ikut berdiskusi, menghentikan, dan mengambil alih kapan pun;
- proposal, evidence, approval, veto, warning, dan handoff tersimpan sebagai
  event yang dapat diaudit;
- high-risk action diblok atau di-gate oleh policy, bukan dijalankan diam-diam;
- state room dapat direkonstruksi dari event log append-only.

## Official Placement

```text
apps/internal/unicom
packages/unicom/core
packages/unicom/policy
packages/unicom/testkit
packages/unicom/agent-sdk
packages/unicom/server
packages/unicom/client
packages/unicom/persistence
docs/unicom
```

## Scope

UNICOM mencakup:

- event protocol dan reducer state room;
- policy boundary untuk approval/block;
- agent SDK dan UI client;
- realtime server dan append-only event store;
- visual cockpit untuk Chief.

UNICOM tidak mencakup:

- engine diagnosis, clinical algorithm, RAG engine, atau OCR engine;
- hidden code modification di luar event trail;
- uncontrolled agent swarm;
- final clinical diagnosis tanpa human review.

## Room Model

Setiap room berisi:

- participants;
- task context;
- message stream;
- evidence;
- decisions;
- interventions;
- audit timeline;
- final outcome.

Lifecycle room yang didukung:

- `active`
- `archived`
- `deleted`

Mode operasi yang didukung:

- `observe`
- `collaborative`
- `approval-gated`
- `autonomous-safe`
- `clinical-safety`
- `freeze`

Default engineering mode: `collaborative` + `approval-gated`.

## Architecture Overview

```text
Chief -> apps/internal/unicom -> @the-abyss/unicom-client
      -> @the-abyss/unicom-server -> @the-abyss/unicom-core
      -> @the-abyss/unicom-policy -> transport adapter -> append-only store
```

Transport MVP bersifat `WebSocket-first` dan harus dibungkus di balik adapter
agar bisa diganti di masa depan tanpa mengubah event protocol.

## Legacy Note

`packages/platform/unicom/**` adalah legacy yang sudah dihapus. UNICOM baru
tidak boleh memulihkan path tersebut. Referensi lama yang masih menunjuk ke
lokasi itu diperlakukan sebagai superseded reference sampai dibersihkan
bertahap.

## Implementation Order

1. Docs and boundary lock
2. Core protocol
3. Policy
4. Agent SDK + testkit
5. Server + client
6. Chief cockpit
7. Durable persistence
8. Gradual agent integration
