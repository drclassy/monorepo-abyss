import {
  type SymphonyAssessmentInput,
  type SymphonyDiagnosticHypothesis,
  type SymphonyResult,
  type SymphonyVitalsInput,
} from '@sentra/nada'

export interface DiagnosisSagaInput {
  patientId: string
  symptoms: string[]
  vitalSigns?: Record<string, number>
  organizationId: string
  requestId: string
  requestedAt?: string
}

export interface DiagnosisCdssResult {
  primaryDiagnosis: string[]
  differentials: string[]
  recommendations: string[]
  confidence: number
  symphony: SymphonyResult
}

const ALLOWED_VITAL_KEYS = [
  'systolicBp',
  'diastolicBp',
  'heartRate',
  'respiratoryRate',
  'temperatureC',
  'spo2',
  'glucoseMgDl',
  'capillaryRefillSec',
] as const satisfies readonly (keyof SymphonyVitalsInput)[]

export function mapDiagnosisInputToSymphonyInput(
  input: DiagnosisSagaInput,
  now: () => string = () => new Date().toISOString()
): SymphonyAssessmentInput {
  const requestedAt = input.requestedAt ?? now()
  const vitalsSnapshot = buildVitalsSnapshot(input.vitalSigns, requestedAt)
  const chiefComplaint = input.symptoms.length > 0 ? input.symptoms.join('; ') : undefined

  return {
    metadata: {
      requestId: input.requestId,
      requestedAt,
      caller: 'system',
    },
    patientContext: {
      encounterId: `enc-${input.requestId}`,
      patientRef: input.patientId,
    },
    vitals: vitalsSnapshot ? [vitalsSnapshot] : [],
    ...(chiefComplaint !== undefined ? { chiefComplaint } : {}),
  }
}

export function mapSymphonyResultToCdssResult(result: SymphonyResult): DiagnosisCdssResult {
  const hypotheses = result.nativeHypotheses ?? []
  const top = hypotheses[0]
  const primary = top ? [top.diagnosisName] : []
  const differentials = hypotheses
    .slice(1)
    .filter((h: SymphonyDiagnosticHypothesis) => h.category !== 'deferred')
    .map((h: SymphonyDiagnosticHypothesis) => h.diagnosisName)
  const confidence = top?.confidence ?? 0

  return {
    primaryDiagnosis: primary,
    differentials,
    recommendations: [...result.metadata.rationale],
    confidence,
    symphony: result,
  }
}

function buildVitalsSnapshot(
  vitalSigns: Record<string, number> | undefined,
  observedAt: string
): SymphonyVitalsInput | undefined {
  if (!vitalSigns) return undefined
  const snapshot: SymphonyVitalsInput = { observedAt }
  let assigned = false

  for (const key of ALLOWED_VITAL_KEYS) {
    const value = vitalSigns[key]
    if (typeof value === 'number' && Number.isFinite(value)) {
      snapshot[key] = value
      assigned = true
    }
  }

  return assigned ? snapshot : undefined
}
