# Test Fixtures

This directory holds test fixtures for `@the-abyss/document-ingestion`.

## Rules

- **No real patient documents.** Never commit PHI or clinical records.
- **No production PDFs.** Do not commit files from `library/medical/`.
- **No external downloads.** Fixtures must be self-contained and reproducible.

## Fixture Strategy

Tests in this package use in-memory mocks and mock factory functions rather than
real PDF files. This avoids:

- PHI leakage risk
- Large binary files in git
- Test fragility from external file changes

If integration tests against real PDFs are ever needed:
1. Create a separate integration test suite (e.g. `tests/integration/`)
2. Use files that contain **only synthetic, non-PHI content**
3. Get explicit Chief approval before adding any PDF to git

## Approved Synthetic Fixtures (future use)

When needed, generate minimal synthetic PDFs using:

```bash
# Install: pip install reportlab
python3 -c "
from reportlab.pdfgen import canvas
c = canvas.Canvas('fixture-digital.pdf')
c.drawString(100, 750, 'Synthetic test document. No PHI.')
c.save()
"
```

Store generated files here only if they are:
- 100% synthetic
- Verified to contain zero PHI
- Committed with explicit Chief approval
