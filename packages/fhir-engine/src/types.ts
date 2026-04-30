// Copyright 2026 Sentra. All rights reserved. Proprietary and confidential.
import { z } from 'zod'

export const FhirPatientSchema = z.object({
  resourceType: z.literal('Patient'),
  id: z.string().optional(),
  identifier: z
    .array(
      z.object({
        system: z.string(),
        value: z.string(),
      })
    )
    .optional(),
  name: z
    .array(
      z.object({
        family: z.string(),
        given: z.array(z.string()),
      })
    )
    .optional(),
  gender: z.enum(['male', 'female', 'other', 'unknown']).optional(),
  birthDate: z.string().optional(),
  address: z
    .array(
      z.object({
        line: z.array(z.string()).optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        postalCode: z.string().optional(),
        country: z.string().optional(),
      })
    )
    .optional(),
  telecom: z
    .array(
      z.object({
        system: z.enum(['phone', 'fax', 'email', 'pager', 'url']),
        value: z.string(),
        use: z.enum(['home', 'work', 'temp', 'old', 'mobile']).optional(),
      })
    )
    .optional(),
})

export const FhirObservationSchema = z.object({
  resourceType: z.literal('Observation'),
  id: z.string().optional(),
  status: z.enum([
    'registered',
    'preliminary',
    'final',
    'amended',
    'corrected',
    'cancelled',
    'entered-in-error',
  ]),
  code: z.object({
    coding: z.array(
      z.object({
        system: z.string(),
        code: z.string(),
        display: z.string(),
      })
    ),
    text: z.string().optional(),
  }),
  subject: z
    .object({
      reference: z.string(),
    })
    .optional(),
  effectiveDateTime: z.string().optional(),
  valueQuantity: z
    .object({
      value: z.number(),
      unit: z.string(),
      system: z.string(),
      code: z.string(),
    })
    .optional(),
  valueString: z.string().optional(),
  valueBoolean: z.boolean().optional(),
  referenceRange: z
    .array(
      z.object({
        low: z.object({ value: z.number(), unit: z.string() }).optional(),
        high: z.object({ value: z.number(), unit: z.string() }).optional(),
        text: z.string().optional(),
      })
    )
    .optional(),
})

/**
 * Shared building blocks for the deferred-resource expansion family.
 * Kept file-local (not exported) so they cannot be misused as a public profile
 * registry — they exist only to keep the new schemas consistent.
 */
const CodeableConceptSchema = z.object({
  coding: z
    .array(
      z.object({
        system: z.string(),
        code: z.string(),
        display: z.string().optional(),
      })
    )
    .optional(),
  text: z.string().optional(),
})

const ReferenceSchema = z.object({
  reference: z.string(),
})

export const FhirConditionSchema = z.object({
  resourceType: z.literal('Condition'),
  id: z.string().optional(),
  clinicalStatus: CodeableConceptSchema,
  verificationStatus: CodeableConceptSchema.optional(),
  category: z.array(CodeableConceptSchema).optional(),
  code: CodeableConceptSchema,
  subject: ReferenceSchema,
  encounter: ReferenceSchema.optional(),
})

const RiskAssessmentPredictionSchema = z.object({
  outcome: CodeableConceptSchema.optional(),
  probabilityDecimal: z.number().optional(),
  qualitativeRisk: CodeableConceptSchema.optional(),
  rationale: z.string().optional(),
})

export const FhirRiskAssessmentSchema = z.object({
  resourceType: z.literal('RiskAssessment'),
  id: z.string().optional(),
  status: z.enum([
    'registered',
    'preliminary',
    'final',
    'amended',
    'corrected',
    'cancelled',
    'entered-in-error',
  ]),
  subject: ReferenceSchema,
  occurrenceDateTime: z.string().optional(),
  encounter: ReferenceSchema.optional(),
  prediction: z.array(RiskAssessmentPredictionSchema).optional(),
})

export const FhirDiagnosticReportSchema = z.object({
  resourceType: z.literal('DiagnosticReport'),
  id: z.string().optional(),
  status: z.enum([
    'registered',
    'partial',
    'preliminary',
    'modified',
    'final',
    'amended',
    'corrected',
    'appended',
    'cancelled',
    'entered-in-error',
    'unknown',
  ]),
  code: CodeableConceptSchema,
  subject: ReferenceSchema.optional(),
  effectiveDateTime: z.string().optional(),
  result: z.array(ReferenceSchema).optional(),
  conclusion: z.string().optional(),
})

export type FhirPatient = z.infer<typeof FhirPatientSchema>
export type FhirObservation = z.infer<typeof FhirObservationSchema>
export type FhirCondition = z.infer<typeof FhirConditionSchema>
export type FhirRiskAssessment = z.infer<typeof FhirRiskAssessmentSchema>
export type FhirDiagnosticReport = z.infer<typeof FhirDiagnosticReportSchema>
export type FhirResource =
  | FhirPatient
  | FhirObservation
  | FhirCondition
  | FhirRiskAssessment
  | FhirDiagnosticReport
  | Record<string, unknown>

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  resourceType: string
}

/**
 * Resource types this package currently validates.
 *
 * Adding to this list requires:
 *   1. a Zod schema for the resource
 *   2. validator branch coverage
 *   3. a test in validator.test.ts
 *   4. a README support-matrix update
 */
export const SUPPORTED_RESOURCE_TYPES = [
  'Patient',
  'Observation',
  'Condition',
  'RiskAssessment',
  'DiagnosticReport',
] as const
export type SupportedResourceType = (typeof SUPPORTED_RESOURCE_TYPES)[number]

/**
 * Resource types explicitly declared out of scope for the current modernization
 * baseline. The list is empty after the resource-validation expansion plan
 * (Tasks 2–4) promoted Condition, RiskAssessment, and DiagnosticReport into
 * the supported matrix. Future deferrals must update both this const and the
 * validator branch / README support table together.
 */
export const DEFERRED_RESOURCE_TYPES = [] as const
export type DeferredResourceType = (typeof DEFERRED_RESOURCE_TYPES)[number]
