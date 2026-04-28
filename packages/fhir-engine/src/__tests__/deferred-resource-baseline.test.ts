/**
 * Pre-promotion baseline for the three deferred resource families.
 *
 * Locks the current rejection behavior so that promotion to "supported"
 * cannot happen silently — every transition out of `DEFERRED_RESOURCE_TYPES`
 * must update both the validator branch and these tests.
 *
 * Plan: docs/superpowers/plans/2026-04-29-fhir-engine-resource-validation-implementation.md
 *
 * NOTE: Once a resource is promoted (Tasks 2–4), its baseline test in this
 * file is removed and replaced by a positive validator.test.ts case.
 */
import { describe, expect, it } from 'vitest'

import { DEFERRED_RESOURCE_TYPES, FhirValidator } from '../index'

describe('deferred resource baseline (pre-promotion)', () => {
  it('Condition is currently in DEFERRED_RESOURCE_TYPES', () => {
    expect((DEFERRED_RESOURCE_TYPES as readonly string[])).toContain('Condition')
  })

  it('RiskAssessment is currently in DEFERRED_RESOURCE_TYPES', () => {
    expect((DEFERRED_RESOURCE_TYPES as readonly string[])).toContain('RiskAssessment')
  })

  it('DiagnosticReport is currently in DEFERRED_RESOURCE_TYPES', () => {
    expect((DEFERRED_RESOURCE_TYPES as readonly string[])).toContain('DiagnosticReport')
  })

  it('Condition is rejected with deferred-pointer error', () => {
    const result = new FhirValidator().validate({
      resourceType: 'Condition',
      id: 'cond-deferred-1',
    } as never)
    expect(result.valid).toBe(false)
    expect(result.errors[0]).toContain('Unsupported resource type: Condition')
    expect(result.errors[0]).toContain('@the-abyss/symphony')
  })

  it('RiskAssessment is rejected with deferred-pointer error', () => {
    const result = new FhirValidator().validate({
      resourceType: 'RiskAssessment',
      id: 'risk-deferred-1',
    } as never)
    expect(result.valid).toBe(false)
    expect(result.errors[0]).toContain('Unsupported resource type: RiskAssessment')
    expect(result.errors[0]).toContain('@the-abyss/symphony')
  })

  it('DiagnosticReport is rejected with deferred-pointer error', () => {
    const result = new FhirValidator().validate({
      resourceType: 'DiagnosticReport',
      id: 'dr-deferred-1',
    } as never)
    expect(result.valid).toBe(false)
    expect(result.errors[0]).toContain('Unsupported resource type: DiagnosticReport')
    expect(result.errors[0]).toContain('@the-abyss/symphony')
  })
})
