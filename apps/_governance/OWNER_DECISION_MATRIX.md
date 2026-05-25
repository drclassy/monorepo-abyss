# Owner Decision Matrix

Date: 2026-05-25  
Status: Active governance clarification  
Scope: `apps/healthcare/**` owner-confirmed app boundary classification.

This matrix records owner decisions that supersede provisional appendix
classifications for the apps listed here.

It is governance documentation only. It does not refactor imports, enforce lint
rules, move app code, change package exports, change dependencies, or grant
permission to touch crown-jewel implementation.

## Owner Clarification Rule

`apps/` is a portfolio workspace, not a homogeneous application layer.

Independent app does not mean no crown-jewel usage. Independent app means the
app must not depend on internal monorepo paths, own or fork crown-jewel
algorithms, or directly write to core crown-jewel databases unless an owner
decision explicitly approves that access.

`Completely using jewel` does not mean the app owns the jewel algorithm. It
means the app is monorepo-bound and may consume approved jewel capabilities.
Algorithm ownership remains in crown-jewel packages unless explicitly
reclassified.

Allowed shape:

```text
app -> approved service/facade/core interface -> jewel
```

Forbidden shapes:

```text
app -> crown-jewel/src/internal/*
app copies/forks diagnosis/RAG/OCR/document-intelligence algorithms
app moves to standalone repo while carrying jewel internals
```

## Confirmed Healthcare App Decisions

| App                  | Path                                 | Owner decision                         | Governance classification                                     | Crown-jewel tier                       | Access mode                                | Future standalone repo | Owns crown-jewel logic? | Jewel dependency    | Notes                                                                                                                  |
| -------------------- | ------------------------------------ | -------------------------------------- | ------------------------------------------------------------- | -------------------------------------- | ------------------------------------------ | ---------------------- | ----------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `intelligenceboard`  | `apps/healthcare/intelligenceboard`  | confirmed monorepo-bound jewel surface | `internal-operator-app`                                       | `CJ-4 internal-core-access` controlled | `approved-internal-core-or-service-facade` | `No / not now`         | No                      | complete            | Completely using monorepo jewel. Do not mark as standalone candidate.                                                  |
| `sentra-assist`      | `apps/healthcare/sentra-assist`      | confirmed monorepo-bound client        | `monorepo-bound-client-app`                                   | `CJ-3 service-facade` by default       | `service-facade`                           | `No / not now`         | No                      | complete            | Completely using monorepo jewel. Escalate to CJ-4 only if current evidence requires controlled internal access.        |
| `primary-healthcare` | `apps/healthcare/primary-healthcare` | confirmed static website               | `standalone-product-app`                                      | `CJ-0 none`                            | `none`                                     | `Yes`                  | No                      | none                | Static website / app shell; no crown-jewel access by default.                                                          |
| `sentra-main`        | `apps/healthcare/sentra-main`        | confirmed static website               | `standalone-product-app`                                      | `CJ-0 none`                            | `none`                                     | `Yes`                  | No                      | none                | Static Sentra public/product website; clinical claims still need content review.                                       |
| `sidelab-project`    | `apps/healthcare/sidelab-project`    | confirmed independent                  | `standalone-product-app`                                      | `CJ-0 none` by default                 | `none`                                     | `Yes`                  | No                      | none                | Independent product/app by owner decision. Any medical data still requires ordinary healthcare safety review.          |
| `referralink`        | `apps/healthcare/referralink`        | pending confirmation                   | `standalone-product-with-crown-jewel-consumption` provisional | `CJ-2 sdk-api-client` provisional      | `sdk-api-client` provisional               | `Yes`                  | No                      | partial provisional | Keep pending until owner confirms whether it is pure referral workflow or consumes diagnosis/jewel through API/client. |

## Draft Manifest Location

Non-enforcing draft manifests live under:

```text
apps/_governance/manifests/drafts/
```

These are not per-app enforcement manifests. Final authority later should be a
reviewed `app.boundary.json` per app or a newer confirmed owner decision.

## Final Manifest Registry

Final owner-approved manifests currently exist for low-risk CJ-0 apps only:

| App                  | Final manifest                                         |
| -------------------- | ------------------------------------------------------ |
| `primary-healthcare` | `apps/healthcare/primary-healthcare/app.boundary.json` |
| `sentra-main`        | `apps/healthcare/sentra-main/app.boundary.json`        |
| `sidelab-project`    | `apps/healthcare/sidelab-project/app.boundary.json`    |
| `ferdiiskandar`      | `apps/corporate/ferdiiskandar/app.boundary.json`       |

## Implementation Constraints

For any future implementation mission:

- do not treat `intelligenceboard` or `sentra-assist` as standalone candidates
- do not move jewel logic into an app
- do not copy or fork diagnosis/CDSS/RAG/OCR/document-intelligence algorithms
- do not refactor imports based only on this matrix
- do not add lint enforcement until explicitly scoped
- do not modify `packages/sentra/**` unless Chief explicitly approves the exact
  crown-jewel scope
