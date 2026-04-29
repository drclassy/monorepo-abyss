import type { SymphonyResult } from '../contracts'

import {
  buildCriticalAlertCards,
  buildDispositionCards,
  buildMustNotMissCards,
  buildShadowCards,
  buildTopHypothesisCards,
} from './cds-hooks-card-policy'
import type {
  SymphonyCdsHookCard,
  SymphonyCdsHookResponse,
} from './cds-hooks-contract'

export type {
  SymphonyCdsHookCard,
  SymphonyCdsHookResponse,
} from './cds-hooks-contract'

export function mapSymphonyResultToCdsHooksResponse(
  result: SymphonyResult,
): SymphonyCdsHookResponse {
  const cards: SymphonyCdsHookCard[] = [
    ...buildCriticalAlertCards(result),
    ...buildMustNotMissCards(result),
    ...buildTopHypothesisCards(result),
    ...buildDispositionCards(result),
    ...buildShadowCards(result),
  ]

  return { cards }
}
