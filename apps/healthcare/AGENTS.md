# Healthcare Domain Steering

**Domain:** Clinical Systems and Patient Data
**Compliance Level:** STRICT (HIPAA/GDPR)
**Revision:** 2026.04.06

## Domain Overview

The Healthcare domain handles all mission-critical clinical applications that interact with patient health information (PHI) and clinical decision workflows.

### Applications
- `primary-healthcare`: Community health center (Puskesmas) dashboard.
- `sentra-assist`: Browser-integrated clinical decision support.
- `referralink`: AI-powered medical referral systems.

## Compliance and Security

### HIPAA Protocols
- Personally Identifiable Information (PII) must never be logged in cleartext.
- All PHI data must be encrypted at rest and in transit.
- Audit logging is mandatory for every read/write operation on patient data.

### Interoperability
- All clinical data schemas must align with the FHIR R4 standard via @the-abyss/fhir-engine.

## Technical Standards

### Architecture
- Must utilize Server-Side Rendering (SSR) for sensitive data presentation.
- Validation: Zod for all API input/output.
- Error Handling: Global Sentry integration with PII scrubbing.

### Testing Strategy

| Test Type | Target Coverage | Requirement |
|-----------|-----------------|-------------|
| Unit Tests | 85% | Required |
| Security Audits | OWASP Top 10 | Required |
| E2E Tests | Patient Safety | Required |

---
© 2026 Sentra Healthcare AI
