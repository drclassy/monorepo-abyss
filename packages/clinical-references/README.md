# @the-abyss/clinical-references

`@the-abyss/clinical-references` adalah package sibling untuk reference-heavy clinical assets yang mendukung SYMPHONY tanpa membuat core engine menjadi gemuk.

## Boundary

- Package ini adalah read-only reference layer, bukan decision engine.
- `@the-abyss/symphony` tetap menjadi canonical clinical reasoning engine.
- `traffic-light` tetap hidup di SYMPHONY dan hanya akan mengonsumsi output ternormalisasi dari package ini pada fase berikutnya.

## Scope v1

- Public contracts untuk DDI, dosage, epidemiology priors, dan pharmacotherapy.
- Resolver stub yang deterministik dan eksplisit bila data belum dikonfigurasi.
- Tiny synthetic fixtures untuk test shape dan wiring.

## Not In Scope

- Logic farmakologi nyata.
- Dataset besar seperti 173K DDI pairs.
- Ingestion eksternal, DB, SQL, atau sinkronisasi ke source pihak ketiga.
- Ketergantungan ke `@the-abyss/symphony`.

## Provenance and Licensing

- Jangan commit dataset besar atau reference artifact pihak ketiga tanpa license review dan attribution review yang eksplisit.
- Default provenance v1 memakai placeholder:
  - `sourceName: "pending-license-review"`
  - `version: "draft-v1"`
  - `licensedForRepoDistribution: false`

## Roadmap

- Phase 7b: scaffold contracts + stubs + tiny synthetic fixtures.
- Phase 7c: SYMPHONY `traffic-light` mengonsumsi output ternormalisasi dari package ini.
- Phase 7d: loader/adapters reference resmi setelah licensing dan provenance dikunci.
