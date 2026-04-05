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
  status: z.enum(['registered', 'preliminary', 'final', 'amended', 'corrected', 'cancelled', 'entered-in-error']),
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

export type FhirPatient = z.infer<typeof FhirPatientSchema>
export type FhirObservation = z.infer<typeof FhirObservationSchema>
export type FhirResource = FhirPatient | FhirObservation | Record<string, unknown>

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  resourceType: string
}
