# Abyss-Core Runtime RAG Bucket Audit — 2026-04-23

## Scope

Audit ini memisahkan bucket runtime RAG utama dari `abyss-core` menjadi subset
yang siap di-commit tanpa membawa package yang masih gagal build atau domain
yang ownership-nya bercampur.

## Ready To Separate Now

Subset berikut dinilai sehat dan koheren sebagai runtime RAG package bucket:

- `packages/sentra-rag/`
- `packages/vector-store/`
- `library/knowledge_index.json`

## Verification Snapshot

- `pnpm --filter @the-abyss/vector-store test` PASS (5/5)
- `pnpm --filter @the-abyss/vector-store typecheck` PASS
- `pnpm --filter @the-abyss/sentra-rag typecheck` PASS

## Held Back As Not Ready

Path berikut sengaja ditahan dari commit bucket runtime ini:

- `packages/vertex-rag/`
- `packages/ai-core/src/hybrid-brain.ts`
- `packages/ai-core/src/knowledge/`
- `packages/ai-core/src/ocr/`

## Why Held Back

- `packages/vertex-rag/` masih gagal build karena error lintas-package dan
  type issues yang belum terisolasi dari package lain.
- `packages/ai-core/src/hybrid-brain.ts` + `knowledge/` + `ocr/` lebih dekat ke
  domain Melinda/AI-core daripada bucket runtime RAG murni, sehingga perlu pass
  terpisah agar ownership tidak kabur.

## Notes

- `library/` saat ini hanya berisi `knowledge_index.json`, bukan corpus PDF
  besar, sehingga aman dibawa dalam commit runtime RAG.
- Bucket ini fokus pada engine lokal (`sentra-rag`) + shared vector runtime
  (`vector-store`) + index metadata corpus.
