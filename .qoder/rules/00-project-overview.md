# Rule: Project Overview

**Apply: Always** **Priority: Foundational context**

## Who we are

Sentra Artificial Intelligence builds AI systems for Indonesian healthcare. Our
north star is **clinical usefulness**, not benchmark performance. A model that
scores 95% on a public benchmark but cannot be deployed in an Indonesian RSUD
(Rumah Sakit Umum Daerah) is not useful to us.

## Decision principles (in priority order)

1. **Start with one clear problem.** Vague problems produce vague systems.
   Before writing code, name the user, the workflow, and the failure mode being
   prevented.
2. **Local-first.** Default to running on a clinician's machine, on an on-prem
   server, or in an Indonesian cloud region. Cloud-only solutions are a last
   resort and must be justified.
3. **Modular over monolithic.** Each capability is a package with its own
   interface. Apps compose packages; packages do not depend on apps.
4. **Separate prototype from production.** `prototypes/` is a learning lab;
   `apps/` and `services/` are accountable code. Never blur the boundary by
   promoting a prototype without a rewrite review.
5. **Auditable by default.** If a decision affects a clinician's choice, the
   reasoning, sources, and model version must be retrievable from logs.
6. **Avoid overengineering.** The simplest design that passes the tests and
   meets the safety bar wins.

## What "scalable" means here

Scalable does not mean "handles millions of requests per second" by default. It
means **the system can be deployed at a second hospital without a rewrite**.
Scaling is about replicability and operability, not raw throughput.

## What we don't do

- We do not build general-purpose chatbots.
- We do not build features that require uploading patient data to overseas LLM
  APIs.
- We do not promise diagnostic accuracy. We support clinicians; we do not
  replace them.
- We do not ship code that lacks a rollback path.

## Default assumptions when ambiguous

- Target user: an Indonesian general practitioner or specialist in an
  under-resourced setting.
- Network: intermittent connectivity; design for offline-first where feasible.
- Hardware: modest (mid-range workstation, not a GPU cluster).
- Language: Indonesian for clinician-facing UI; English for internal code and
  developer docs.
- Regulation: defer to Kementerian Kesehatan and BPJS Kesehatan rules; never
  assume FDA or EMA rules apply locally.
