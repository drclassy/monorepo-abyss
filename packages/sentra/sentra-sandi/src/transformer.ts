// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import type { FhirResource } from './types'

/**
 * `FhirTransformer` is a **modernization placeholder**.
 *
 * It does NOT implement real FHIR ↔ internal-domain transformation.
 * Each method below throws explicitly so that callers cannot mistake a
 * cast-only no-op for a working conversion.
 *
 * Why it still exists: the surface is preserved during modernization so the
 * package can later be promoted into a real validation/normalization layer
 * (see docs/specs/aadi-v2/011-2026-04-29-fhir-engine-modernization-spec.md).
 *
 * AADI V2 interop mapping authority remains in `@sentra/nada`. Do not
 * reintroduce reasoning-driven mapping here.
 */
export class FhirTransformer {
  /**
   * @throws — FHIR-to-internal transformation is not implemented in this package.
   *
   * Reason: an internal-domain model is not the responsibility of this package.
   * Consumers that want a domain shape should map directly from `SymphonyResult`
   * (in `@sentra/nada`) or from validated FHIR resources themselves.
   */
  toInternal<T = unknown>(_resource: FhirResource): T {
    throw new Error(
      'FhirTransformer.toInternal() is not implemented. This package does not own ' +
        'FHIR-to-internal-domain mapping; map from SymphonyResult or from validated ' +
        'resources directly.'
    )
  }

  /**
   * @throws — internal-to-FHIR construction is not implemented in this package.
   *
   * Reason: building FHIR resources from internal data is reasoning-adjacent
   * and currently lives in `@sentra/nada` interop adapters
   * (`mapSymphonyResultToFhirBundle()` / `mapSymphonyResultToCdsHooksResponse()`).
   */
  toFhir<T extends FhirResource>(_data: Record<string, unknown>): T {
    throw new Error(
      'FhirTransformer.toFhir() is not implemented. AADI V2 interop bundle/CDS ' +
        'mapping authority remains in @sentra/nada.'
    )
  }

  /**
   * @throws — FHIR version normalization is not implemented in this package.
   *
   * Reason: this package does not yet declare or own a multi-version conversion
   * strategy. Until Task 5 (R5 target prep) lands a version seam, calling
   * `normalize()` would silently misrepresent the package's capability.
   */
  normalize(_resource: FhirResource): FhirResource {
    throw new Error(
      'FhirTransformer.normalize() is not implemented. Multi-version FHIR ' +
        'normalization is out of scope for the current modernization baseline.'
    )
  }
}
