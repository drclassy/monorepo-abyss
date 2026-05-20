// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
/**
 * FHIR version strategy metadata for `@sentra/sandi`.
 *
 * This file is a minimal **seam**, not a multi-version conversion framework.
 * It exists so consumers and future contributors can read, in one place, the
 * package's honest version posture instead of inferring it from prose.
 *
 * Spec: docs/specs/aadi-v2/011-2026-04-29-fhir-engine-modernization-spec.md
 */

/** The FHIR version this package is modernizing toward. */
export const FHIR_TARGET_VERSION = 'R5' as const

/**
 * The FHIR version shape currently reflected by the Zod schemas.
 *
 * Not a marketing claim of "R4 support" — it's a transition slice. The
 * schemas are intentionally narrow and do not exercise the full R4
 * resource set.
 */
export const FHIR_CURRENT_SHAPE = 'R4-transition-slice' as const

/**
 * Where in the R4→R5 modernization curve the package sits.
 *
 *   - `pre-modernization`: legacy R4-only utility (historical state)
 *   - `bounded-transition`: small honest schema slice, R5 target declared (current)
 *   - `r5-target-ready`:    R5-specific elements landing behind a version seam
 *   - `r5-primary`:         schemas/validators are R5-first, R4 is compat-only
 */
export type VersionStrategyPhase =
  | 'pre-modernization'
  | 'bounded-transition'
  | 'r5-target-ready'
  | 'r5-primary'

export const VERSION_STRATEGY_PHASE: VersionStrategyPhase = 'bounded-transition'

/**
 * Aggregated metadata for tooling and tests.
 *
 * Shape locked so that bumping a phase or rewriting target version is a
 * single deliberate edit reviewed by the modernization plan.
 */
export interface FhirVersionStrategy {
  readonly target: typeof FHIR_TARGET_VERSION
  readonly currentShape: typeof FHIR_CURRENT_SHAPE
  readonly phase: VersionStrategyPhase
}

export const FHIR_VERSION_STRATEGY: FhirVersionStrategy = {
  target: FHIR_TARGET_VERSION,
  currentShape: FHIR_CURRENT_SHAPE,
  phase: VERSION_STRATEGY_PHASE,
}
