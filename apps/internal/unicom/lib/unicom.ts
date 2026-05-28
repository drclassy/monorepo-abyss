'use client'

import { createUnicomClient } from '@the-abyss/unicom-client'
import type {
  UnicomDecision,
  UnicomEvent,
  UnicomEvidence,
  UnicomIntervention,
  UnicomRoomState,
} from '@the-abyss/unicom-core'

export const chiefActor = {
  type: 'human' as const,
  id: 'chief',
  displayName: 'Chief',
  role: 'chief',
  capabilities: ['approve', 'intervene', 'redirect'],
}

export function getUnicomBaseUrl(): string {
  return process.env.NEXT_PUBLIC_UNICOM_BASE_URL?.trim() || 'http://127.0.0.1:4327'
}

export function getUnicomClient() {
  return createUnicomClient({ baseUrl: getUnicomBaseUrl(), socketUrl: getUnicomBaseUrl() })
}

export function formatEventLabel(event: UnicomEvent): string {
  return event.type.replaceAll('.', ' ').replaceAll('_', ' ')
}

export function humanTime(value?: string): string {
  if (!value) {
    return '--'
  }
  return new Date(value).toLocaleString()
}

export function decisionList(
  state: UnicomRoomState & { decisionsList?: unknown[] }
): UnicomDecision[] {
  const live = Object.values(state.decisions).sort((left, right) =>
    left.createdAt.localeCompare(right.createdAt)
  )
  if (live.length > 0) {
    return live
  }

  return [...((state.decisionsList as UnicomDecision[] | undefined) ?? [])].sort((left, right) =>
    left.createdAt.localeCompare(right.createdAt)
  )
}

export function evidenceList(
  state: UnicomRoomState & { evidenceList?: unknown[] }
): UnicomEvidence[] {
  const live = Object.values(state.evidence).sort((left, right) =>
    left.createdAt.localeCompare(right.createdAt)
  )
  if (live.length > 0) {
    return live
  }

  return [...((state.evidenceList as UnicomEvidence[] | undefined) ?? [])].sort((left, right) =>
    left.createdAt.localeCompare(right.createdAt)
  )
}

export function interventionList(
  state: UnicomRoomState & { interventionsList?: unknown[] }
): UnicomIntervention[] {
  if (state.interventions.length > 0) {
    return [...state.interventions].sort((left, right) =>
      left.createdAt.localeCompare(right.createdAt)
    )
  }

  return [...((state.interventionsList as UnicomIntervention[] | undefined) ?? [])].sort(
    (left, right) => left.createdAt.localeCompare(right.createdAt)
  )
}
