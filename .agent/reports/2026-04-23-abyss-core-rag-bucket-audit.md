# Abyss-Core RAG Bucket Audit — 2026-04-23

## Scope

Tujuan audit ini adalah memisahkan perubahan `abyss-core` menjadi bucket yang
benar-benar siap dipisah secara non-destruktif untuk lintasan Sentra RAG Engine.

## Ready To Separate Now

Path di bawah ini dinilai cukup murni sebagai bucket RAG dan aman dimasukkan ke
manifest pemisahan. Pada eksekusi sesi ini, launcher/script yang sebelumnya
tercecer di root sudah dikonsolidasikan ke `tooling/scripts/rag/`.

- `library/`
- `packages/ai-core/src/hybrid-brain.ts`
- `packages/ai-core/src/knowledge/`
- `packages/ai-core/src/ocr/`
- `packages/sentra-rag/`
- `packages/vector-store/`
- `packages/vertex-rag/`
- `tooling/scripts/rag/`

## RAG-Adjacent But Not Ready

Path berikut memang terkait RAG, tetapi masih bercampur dengan concern lain
atau menjadi file global/workspace, jadi belum aman dimasukkan ke bucket siap
pisah:

- `.env.example`
- `conductor/agent-registry.yaml`
- `packages/ai-core/package.json`
- `packages/ai-core/src/index.ts`

## Explicitly Excluded From RAG Bucket

Path ini berada di area `ai-core`, tetapi bukan ownership RAG yang murni:

- `packages/ai-core/prompts/`
- `packages/ai-core/src/providers/`

## Notes

- `packages/vector-store/` dimasukkan penuh karena seluruh diff aktifnya berada
  pada domain embedding, pgvector, dan ingestion PDF medis.
- `library/` saat ini hanya berisi `knowledge_index.json`, sehingga aman
  dipisahkan sebagai artefak RAG dan tidak memicu review ukuran file besar.
- Bucket ini bersifat non-destruktif: belum ada reset, checkout, atau revert.
- File mixed/global sengaja ditahan untuk pass terpisah agar cleanup tidak
  merusak lintasan lain.
