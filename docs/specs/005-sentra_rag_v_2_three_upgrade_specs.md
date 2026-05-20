# Sentra RAG V2 — Three Upgrade Specifications

## Executive Direction

Sentra RAG V2 tidak perlu meniru RAGFlow secara penuh. Fokus utama Sentra adalah menjadi **clinical-safe, Indonesia-aware, local-first RAG engine** yang ringan, modular, auditable, dan aman untuk konteks kesehatan Indonesia.

Prioritas upgrade:

1. **Grounded Citation Layer** — setiap jawaban bisa dilacak ke dokumen, halaman, dan chunk.
2. **Lightweight Hybrid Retrieval** — gabungan pgvector + PostgreSQL full-text search + reranker sederhana.
3. **Parser Gateway** — parser tidak lagi hardcoded ke LiteParse, tetapi memakai interface provider.

---

# SPEC 1 — Grounded Citation Layer

## Objective

Membuat setiap jawaban Sentra RAG dapat menunjukkan sumber yang jelas:

> Jawaban ini berasal dari dokumen apa, halaman berapa, chunk mana, dan kutipan relevan apa.

Tujuan utama:

- Mengurangi hallucination.
- Meningkatkan kepercayaan dokter.
- Mendukung clinical audit.
- Membuat output lebih regulasi-friendly.
- Menjadi fondasi sebelum hybrid retrieval dan parser lebih kompleks.

---

## Scope

Yang dikerjakan:

| Komponen | Fungsi |
|---|---|
| `CitationMetadata` | Menyimpan identitas sumber dokumen, halaman, chunk, parser, dan versi dokumen. |
| `RetrievedChunkWithCitation` | Menyatukan isi chunk, skor retrieval, metode retrieval, dan metadata citation. |
| `AnswerCitation` | Citation final yang ditampilkan di output jawaban. |
| Citation formatter | Mengubah metadata internal menjadi format yang mudah dibaca. |
| Grounded answer contract | Format output standar untuk jawaban RAG dengan citation dan confidence. |
| Prompt grounding rule | Membatasi LLM agar menjawab berdasarkan konteks yang tersedia. |

---

## Non-Scope

Tidak dikerjakan dalam spec ini:

| Tidak Termasuk | Alasan |
|---|---|
| GraphRAG | Terlalu besar untuk tahap awal. |
| OCR/table extraction | Masuk Parser Gateway dan parser provider tahap lanjut. |
| Elasticsearch | Tidak diperlukan untuk Sentra RAG V2 tahap ini. |
| Diagnosis engine / clinical reasoning core | Jangan menyentuh crown-jewel clinical logic. |
| Auto final diagnosis | Sentra RAG tetap clinical decision support, bukan pengganti dokter. |

---

## Data Contracts

### `CitationMetadata`

```ts
export interface CitationMetadata {
  documentId: string;
  documentTitle: string;
  sourcePath?: string;
  pageNumber?: number;
  chunkId: string;
  chunkIndex: number;
  headingPath?: string[];
  charStart?: number;
  charEnd?: number;
  parserProvider?: string;
  documentVersion?: string;
  sourceHash?: string;
}
```

### `RetrievedChunkWithCitation`

```ts
export interface RetrievedChunkWithCitation {
  content: string;
  score: number;
  retrievalMethod: "vector" | "keyword" | "hybrid";
  citation: CitationMetadata;
}
```

### `AnswerCitation`

```ts
export interface AnswerCitation {
  citationId: string;
  documentTitle: string;
  pageNumber?: number;
  chunkId: string;
  excerpt: string;
  relevanceScore?: number;
}
```

### `GroundedRagAnswer`

```ts
export interface GroundedRagAnswer {
  answer: string;
  citations: AnswerCitation[];
  confidence: "high" | "medium" | "low";
  limitations?: string[];
}
```

---

## Functional Requirements

### 1. Chunk metadata must preserve citation identity

Every stored chunk should include at minimum:

```ts
documentId
_documentTitle
chunkId
chunkIndex
sourceHash
parserProvider
```

Preferred additional fields:

```ts
pageNumber
headingPath
charStart
charEnd
documentVersion
sourcePath
```

### 2. Retrieval must return citation-aware chunks

Retrieval output should not return plain text chunks only. It must return:

```ts
content
score
retrievalMethod
citation
```

### 3. Answer generation must be grounded

Prompt rule:

```txt
Answer only from the provided context.
If the context is insufficient, say that the available documents do not provide enough information.
Do not create unsupported clinical claims.
Every important claim should be traceable to citation metadata.
```

### 4. Final answer must include citation array

Example response:

```json
{
  "answer": "Dokumen menyebutkan bahwa pasien dengan gejala hiperglikemia perlu evaluasi lanjutan.",
  "citations": [
    {
      "citationId": "CIT-001",
      "documentTitle": "Panduan Klinis Diabetes.pdf",
      "pageNumber": 12,
      "chunkId": "chunk_0034",
      "excerpt": "Pasien dengan gejala hiperglikemia perlu...",
      "relevanceScore": 0.87
    }
  ],
  "confidence": "medium",
  "limitations": [
    "Dokumen tidak mencantumkan data laboratorium pasien secara lengkap."
  ]
}
```

---

## Acceptance Criteria

| Check | Criteria |
|---|---|
| Citation metadata available | Every retrieved chunk has `documentId`, `documentTitle`, `chunkId`, and `chunkIndex`. |
| Final response citation | Final RAG answer includes `citations[]`. |
| Unsupported answer behavior | If context is insufficient, model must say information is insufficient. |
| Clinical safety | No final diagnosis claim without cited support. |
| Backward compatibility | Existing RAG flow still works with fallback metadata. |
| Formatter test | Citation formatter has unit tests. |
| Contract test | `GroundedRagAnswer` and citation contract are type-tested. |

---

## Verification Commands

```bash
pnpm typecheck
pnpm test
pnpm build
```

If package-specific:

```bash
pnpm --filter <rag-package-name> test
pnpm --filter <rag-package-name> build
```

---

# SPEC 2 — Lightweight Hybrid Retrieval

## Objective

Meningkatkan akurasi retrieval Sentra RAG dengan menggabungkan:

| Retrieval | Fungsi |
|---|---|
| `pgvector` | Semantic similarity search. |
| PostgreSQL full-text search | Keyword, exact term, ICD, obat, lab marker, dan singkatan. |
| Simple reranker | Menggabungkan hasil vector dan keyword menjadi ranking akhir. |

Tujuan utama: menangkap istilah klinis yang membutuhkan exact match tanpa menambah dependency berat seperti Elasticsearch.

---

## Scope

Yang dikerjakan:

| Komponen | Fungsi |
|---|---|
| `VectorRetriever` | Semantic retrieval menggunakan pgvector. |
| `KeywordRetriever` | Keyword retrieval menggunakan PostgreSQL full-text search. |
| `HybridRetriever` | Menggabungkan hasil vector dan keyword. |
| `HybridReranker` | Mengurutkan ulang hasil berdasarkan skor gabungan dan rule klinis sederhana. |
| Retrieval metadata | Menandai hasil sebagai `vector`, `keyword`, atau `hybrid`. |
| Configurable weighting | Bobot vector/keyword dapat diatur. |

---

## Non-Scope

Tidak dikerjakan:

| Tidak Termasuk | Alasan |
|---|---|
| Elasticsearch | Terlalu berat untuk tahap ini. |
| RAGFlow replacement | Sentra tetap memakai PostgreSQL-first architecture. |
| Tensor retrieval | Belum perlu. |
| GraphRAG | Masuk fase jauh setelah retrieval stabil. |
| LLM reranker | Lebih mahal, lebih lambat, dan belum perlu. |
| External API dependency | Sentra tetap local-first. |

---

## Retrieval Architecture

```txt
User Query
   ↓
Query Normalizer
   ↓
┌──────────────────────┬──────────────────────┐
│ VectorRetriever       │ KeywordRetriever      │
│ pgvector cosine       │ PostgreSQL full-text  │
└──────────────────────┴──────────────────────┘
   ↓
Hybrid Merge
   ↓
Simple Reranker
   ↓
Top-K RetrievedChunkWithCitation[]
   ↓
LLM Answer + Citation
```

---

## Data Contracts

### `RetrievalQuery`

```ts
export interface RetrievalQuery {
  query: string;
  topK?: number;
  filters?: {
    category?: string;
    documentId?: string;
    documentType?: string;
  };
  mode?: "vector" | "keyword" | "hybrid";
}
```

### `RetrievalResult`

```ts
export interface RetrievalResult {
  content: string;
  score: number;
  vectorScore?: number;
  keywordScore?: number;
  combinedScore: number;
  retrievalMethod: "vector" | "keyword" | "hybrid";
  citation: CitationMetadata;
}
```

---

## Scoring Strategy

Default scoring:

```ts
combinedScore = vectorScore * 0.65 + keywordScore * 0.35;
```

Keyword-heavy mode:

```ts
combinedScore = vectorScore * 0.45 + keywordScore * 0.55;
```

Keyword-heavy mode should trigger when query contains:

- ICD-10 code.
- Drug name.
- Lab marker.
- Capitalized medical abbreviation.
- Diagnosis code.
- Numeric clinical value.
- Specific medical term requiring exact match.

Examples:

```txt
E11.9
HbA1c
SGOT
SGPT
metformin
ceftriaxone
DHF
TB
GFR
```

---

## PostgreSQL Full-Text Requirement

Add search vector column:

```sql
search_vector tsvector
```

Add GIN index:

```sql
CREATE INDEX rag_chunks_search_idx
ON rag_chunks
USING GIN (search_vector);
```

Populate search vector:

```sql
to_tsvector('simple', content)
```

Use `'simple'` configuration first because medical terms, drug names, codes, and abbreviations should not be damaged by aggressive stemming.

---

## Reranker Rules

Initial reranker should be rule-based.

Boost:

| Factor | Effect |
|---|---|
| Exact keyword match | Increase score. |
| ICD/code match | Strong increase. |
| Drug/lab marker match | Increase score. |
| Same document category | Increase score. |
| Citation metadata complete | Small increase. |

Penalize:

| Factor | Effect |
|---|---|
| Duplicate chunk | Deduplicate. |
| Very short irrelevant chunk | Lower score. |
| Low vector and low keyword score | Drop. |
| Missing citation metadata | Lower score. |

---

## Acceptance Criteria

| Check | Criteria |
|---|---|
| Vector retrieval works | Existing pgvector search remains functional. |
| Keyword retrieval works | Exact terms such as ICD-10, drug names, and lab markers are retrievable. |
| Hybrid mode works | Vector and keyword results are merged. |
| Reranking works | Duplicate and weak results are filtered or lowered. |
| Citation preserved | Every result still carries citation metadata. |
| No Elasticsearch | No Elasticsearch dependency is added. |
| Local-first | No external retrieval service is required. |
| Configurable weighting | Vector/keyword weights are configurable. |

---

## Verification Commands

```bash
pnpm typecheck
pnpm test
pnpm build
```

If database migration is added:

```bash
pnpm db:migrate
pnpm db:generate
```

If retrieval tests exist:

```bash
pnpm test -- retrieval
```

---

# SPEC 3 — Parser Gateway

## Objective

Membuat ingestion Sentra RAG tidak tergantung langsung pada LiteParse.

Target utamanya adalah interface:

```ts
DocumentParserProvider
```

Dengan begitu, Sentra bisa memakai parser berbeda di masa depan tanpa rewrite ingestion pipeline.

---

## Scope

Yang dikerjakan:

| Komponen | Fungsi |
|---|---|
| `DocumentParserProvider` | Interface utama parser. |
| `LiteParseProvider` | Wrapper untuk LiteParse sebagai default parser. |
| `ParserRegistry` | Memilih provider berdasarkan input dan config. |
| `ParsedDocument` contract | Output standar dari semua parser. |
| Capability metadata | Menandai support PDF, OCR, table extraction, image, layout-aware. |
| Fallback strategy | Jika parser gagal, error harus jelas dan tidak silent corruption. |

---

## Non-Scope

Tidak dikerjakan:

| Tidak Termasuk | Alasan |
|---|---|
| Full OCR implementation | Tahap provider berikutnya. |
| Full table-aware parser | Tahap provider berikutnya. |
| RAGFlow integration langsung | Hanya siapkan adapter slot. |
| Replace LiteParse | LiteParse tetap default. |
| Cloud parser dependency | Hindari vendor lock-in. |
| Medical reasoning | Ini hanya ingestion layer. |

---

## Parser Architecture

```txt
Document File
   ↓
Parser Gateway
   ↓
Parser Registry
   ↓
Selected Parser Provider
   ↓
ParsedDocument
   ↓
Chunker
   ↓
Embedding
   ↓
Vector Store + Citation Metadata
```

---

## Core Interface

### `DocumentParserProvider`

```ts
export interface DocumentParserProvider {
  id: string;
  displayName: string;

  supports(input: DocumentParserInput): boolean;

  parse(input: DocumentParserInput): Promise<ParsedDocument>;

  capabilities: ParserCapabilities;
}
```

---

## Input Contract

```ts
export interface DocumentParserInput {
  filePath: string;
  fileName: string;
  mimeType: string;
  documentId: string;
  documentTitle?: string;
  options?: {
    preserveLayout?: boolean;
    extractTables?: boolean;
    enableOcr?: boolean;
    languageHints?: string[];
  };
}
```

---

## Output Contract

### `ParsedDocument`

```ts
export interface ParsedDocument {
  documentId: string;
  documentTitle: string;
  parserProvider: string;
  sourceHash: string;
  pages: ParsedPage[];
  metadata: {
    mimeType: string;
    pageCount?: number;
    parsedAt: string;
    documentVersion?: string;
  };
  warnings?: ParserWarning[];
}
```

### `ParsedPage`

```ts
export interface ParsedPage {
  pageNumber: number;
  text: string;
  blocks?: ParsedBlock[];
}
```

### `ParsedBlock`

```ts
export interface ParsedBlock {
  blockId: string;
  type: "paragraph" | "heading" | "table" | "image" | "list" | "unknown";
  text: string;
  bbox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence?: number;
}
```

### `ParserCapabilities`

```ts
export interface ParserCapabilities {
  pdfText: boolean;
  scannedPdf: boolean;
  ocr: boolean;
  tableExtraction: boolean;
  imageExtraction: boolean;
  layoutAware: boolean;
}
```

---

## Initial Providers

### 1. `LiteParseProvider`

Status: **Default now**

```ts
capabilities: {
  pdfText: true,
  scannedPdf: false,
  ocr: false,
  tableExtraction: false,
  imageExtraction: false,
  layoutAware: false
}
```

Use cases:

- PDF teks biasa.
- Panduan klinis.
- Dokumen akademik.
- Dokumen markdown-converted.

---

### 2. `OcrParserProvider`

Status: **Later**

```ts
capabilities: {
  pdfText: false,
  scannedPdf: true,
  ocr: true,
  tableExtraction: false,
  imageExtraction: false,
  layoutAware: false
}
```

Use cases:

- Scan surat rujukan.
- Scan resume medis.
- Foto dokumen.
- Hasil lab berbentuk scan.

---

### 3. `TableAwareParserProvider`

Status: **Later**

```ts
capabilities: {
  pdfText: true,
  scannedPdf: false,
  ocr: false,
  tableExtraction: true,
  imageExtraction: false,
  layoutAware: true
}
```

Use cases:

- Hasil lab.
- Tabel obat.
- Tabel guideline.
- Form klinis.

---

### 4. `RagflowParserAdapter`

Status: **Optional benchmark / external mode**

```ts
capabilities: {
  pdfText: true,
  scannedPdf: true,
  ocr: true,
  tableExtraction: true,
  imageExtraction: true,
  layoutAware: true
}
```

Important rule:

> RAGFlow adapter must not become a core dependency. It is only an optional adapter for benchmark or external mode.

---

## Parser Selection Rule

```ts
if (isTextBasedPdf(input)) {
  return LiteParseProvider;
}

if (isScannedPdf(input) && input.options?.enableOcr) {
  return OcrParserProvider;
}

if (input.options?.extractTables) {
  return TableAwareParserProvider;
}

if (externalBenchmarkModeEnabled) {
  return RagflowParserAdapter;
}

return LiteParseProvider;
```

---

## Acceptance Criteria

| Check | Criteria |
|---|---|
| Parser interface exists | `DocumentParserProvider` is available. |
| LiteParse wrapped | LiteParse runs through provider, not hardcoded directly in ingestion. |
| Standard output contract | All parser providers output `ParsedDocument`. |
| Capability detection | Providers expose parser capability metadata. |
| Fallback safe | Parser failure returns clear error or safe fallback, not silent corruption. |
| Citation compatible | Parsed output can produce page/chunk metadata for citations. |
| No external hard dependency | OCR/RAGFlow providers are not required dependencies. |
| Backward compatible | Existing ingestion still works. |

---

## Verification Commands

```bash
pnpm typecheck
pnpm test
pnpm build
```

Parser/ingestion focused:

```bash
pnpm test -- parser
pnpm test -- ingestion
```

---

# Recommended Execution Order

| Order | Spec | Reason |
|---|---|---|
| 1 | Grounded Citation Layer | Trust and audit foundation. |
| 2 | Lightweight Hybrid Retrieval | Better accuracy for clinical terms. |
| 3 | Parser Gateway | Future-proofing for OCR, tables, and external adapters. |

---

# Codex Mission Split

## Mission 1

```txt
SENTRA-RAG-V2-001 — Implement Grounded Citation Foundation
```

Expected output:

```txt
CitationMetadata
RetrievedChunkWithCitation
GroundedRagAnswer
citation formatter
prompt grounding rule
tests
```

---

## Mission 2

```txt
SENTRA-RAG-V2-002 — Implement Lightweight Hybrid Retrieval
```

Expected output:

```txt
VectorRetriever
KeywordRetriever
HybridRetriever
HybridReranker
PostgreSQL full-text index/migration
retrieval scoring config
tests
```

---

## Mission 3

```txt
SENTRA-RAG-V2-003 — Implement Parser Gateway Interface
```

Expected output:

```txt
DocumentParserProvider
LiteParseProvider
ParserRegistry
ParsedDocument contract
provider capability metadata
fallback behavior
tests
```

---

# Strategic Decision

Start with **Grounded Citation Layer**.

Reason:

- It improves trust immediately.
- It is technically realistic.
- It does not require infrastructure change.
- It protects the clinical safety posture.
- It becomes the foundation for hybrid retrieval and parser upgrades.

Do not start with GraphRAG.

Do not add Elasticsearch.

Do not replace Sentra RAG with RAGFlow.

Do not touch crown-jewel clinical reasoning unless explicitly scoped.

---

# Next Action

Create a focused Codex mission for:

```txt
SENTRA-RAG-V2-001 — Implement Grounded Citation Foundation
```

Mission must include:

- Objective.
- Scope.
- Non-scope.
- Constraints.
- File-level guidance.
- Required changes.
- Acceptance criteria.
- Verification commands.
- Independent audit checklist.
- Rollback plan.
