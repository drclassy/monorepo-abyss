# Decision Log

This document records major architectural and design decisions made during the development of Claudsy Memory.

## Decision: Hybrid Extraction Approach

**Date:** 2026-03-01  
**Context:** Need reliable fact extraction from conversational text  
**Options:** Pure regex, pure AI, hybrid  
**Chosen:** Hybrid (regex prefilter + Ollama)  
**Rationale:** Reliability with fallback, performance  
**Consequences:** More complex code, but robust

## Decision: Ebbinghaus Forgetting Curve

**Date:** 2026-03-05  
**Context:** Memory consolidation algorithm  
**Options:** Linear decay, exponential, Ebbinghaus  
**Chosen:** Ebbinghaus curve  
**Rationale:** Scientifically accurate memory decay  
**Consequences:** More realistic behavior

## Decision: SQLite with WAL

**Date:** 2026-03-10  
**Context:** Data storage for concurrent access  
**Options:** Files, SQLite, PostgreSQL  
**Chosen:** SQLite with WAL mode  
**Rationale:** Local deployment, concurrent access  
**Consequences:** No external dependencies
